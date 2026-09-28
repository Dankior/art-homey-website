import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleRequest} from '../server/requests.mjs';
import {notifyRequest} from '../server/notifications.mjs';
import {normalizePhone} from '../docs/lead-validation.mjs';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of ['0000_safe_hellion.sql','0001_request_delivery.sql']) sqlite.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
  const db = {prepare(query) {const statement=sqlite.prepare(query);return {bind(...values) {return {
    async first() {return statement.get(...values) ?? null;},
    async run() {return statement.run(...values);},
    async all() {return {results:statement.all(...values)};},
  };}};}};
  return {db, sqlite, getDb:()=>db};
}
function lead(extra={}) {return {category:'kitchen',budget:'Нужна консультация',contact:'9060561819',name:'Тест',message:'Тестовый проект',consent:true,submissionId:crypto.randomUUID(),...extra};}
function request(body, headers={}) {return new Request('https://example.test/api/requests',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.test',...headers},body:JSON.stringify(body)});}

test('normalizes three Russian phone formats; rejects incomplete or unsupported numbers',()=>{
  for(const input of ['9060561819','8 (906) 056-18-19','+7 906 0561819']) assert.equal(normalizePhone(input),'+79060561819');
  for(const input of ['1234567','+7906056181','+790605618199','+19060561819','call 9060561819','']) assert.equal(normalizePhone(input),null);
});
test('valid lead is stored with normalized contact',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());
 const response=await handleRequest(request(lead()),deps);assert.equal(response.status,201);
 const {id}=await response.json();const row=deps.sqlite.prepare('SELECT * FROM requests WHERE id=?').get(id);
 assert.equal(row.contact,'+79060561819');assert.equal(row.category,'kitchen');assert.equal(row.message,'Тестовый проект');
});
test('incomplete phone, no consent, honeypot and invalid budget never reach storage',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());
 for(const patch of [{contact:'1234567'},{consent:false},{website:'spam'},{budget:'unknown'}, {name:'x'.repeat(81)}, {message:'x'.repeat(3001)}]) assert.equal((await handleRequest(request(lead(patch)),deps)).status,400);
 assert.equal(deps.sqlite.prepare('SELECT COUNT(*) n FROM requests').get().n,0);
});
test('malformed and oversized bodies are rejected',async()=>{
 const deps={getDb(){throw new Error('must not access DB');}};
 for(const [body,status] of [['{',400],['x'.repeat(17000),413]]) {
  const response=await handleRequest(new Request('https://example.test/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body}),deps);
  assert.equal(response.status,status);
 }
});
test('foreign origin and unsupported content types are rejected',async()=>{
 const deps={getDb(){throw new Error('must not access DB');}};
 assert.equal((await handleRequest(request(lead(),{Origin:'https://other.test'}),deps)).status,403);
 assert.equal((await handleRequest(request(lead(),{'Content-Type':'text/plain'}),deps)).status,415);
});
test('retries after response loss return the same ID without duplicate rows',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());const payload=lead();
 const [one,two]=await Promise.all([handleRequest(request(payload),deps),handleRequest(request(payload),deps)]);
 assert.equal((await one.json()).id,(await two.json()).id);
 assert.equal(deps.sqlite.prepare('SELECT COUNT(*) n FROM requests').get().n,1);
});
test('reuse of a submission key with different data is rejected',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());const payload=lead();await handleRequest(request(payload),deps);
 assert.equal((await handleRequest(request({...payload,message:'changed'}),deps)).status,409);
});
test('fourth new lead from one phone in an hour is rate limited; retries are allowed',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());const payload=lead();
 assert.equal((await handleRequest(request(payload),deps)).status,201);
 for(let i=0;i<2;i++) assert.equal((await handleRequest(request(lead()),deps)).status,201);
 assert.equal((await handleRequest(request(lead()),deps)).status,429);
 assert.equal((await handleRequest(request(payload),deps)).status,200);
});
test('missing database returns 503 without a false success',async()=>{
 assert.equal((await handleRequest(request(lead()),{getDb(){throw new Error('unavailable');}})).status,503);
});
test('notification failure does not discard saved request',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());
 const result=await handleRequest(request(lead()),{...deps,notify:async()=>{throw new Error('offline');}});
 assert.equal(result.status,201);assert.equal(deps.sqlite.prepare('SELECT COUNT(*) n FROM requests').get().n,1);
});
test('Telegram remains pending on failure and succeeds on a later attempt',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());
 const {id}=await (await handleRequest(request(lead()),deps)).json();
 const env={TELEGRAM_BOT_TOKEN:'test-token',TELEGRAM_CHAT_ID:'123'};
 assert.equal(await notifyRequest(deps.db,id,env,async()=>new Response(JSON.stringify({ok:false,parameters:{retry_after:90}}),{status:429})),false);
 let row=deps.sqlite.prepare('SELECT * FROM requests WHERE id=?').get(id);
 assert.equal(row.notified_at,null);assert.ok(row.notification_next_at>Date.now()+85000);assert.equal(row.notification_attempts,1);
 deps.sqlite.prepare('UPDATE requests SET notification_next_at=0 WHERE id=?').run(id);
 let sent;
 assert.equal(await notifyRequest(deps.db,id,env,async(_url,options)=>{sent=JSON.parse(options.body);return Response.json({ok:true,result:{message_id:1}});}),true);
 assert.ok(sent.text.includes('+79060561819'));assert.equal(sent.chat_id,'123');assert.equal(sent.allow_paid_broadcast,false);
 row=deps.sqlite.prepare('SELECT * FROM requests WHERE id=?').get(id);assert.ok(row.notified_at);assert.equal(row.notification_attempts,2);
 assert.equal(await notifyRequest(deps.db,id,env,()=>{throw new Error('duplicate send');}),false);
});
test('without Telegram configuration no outgoing request is attempted',async t=>{
 const deps=database();t.after(()=>deps.sqlite.close());const {id}=await (await handleRequest(request(lead()),deps)).json();
 assert.equal(await notifyRequest(deps.db,id,{},()=>{throw new Error('unexpected call');}),false);
 assert.equal(deps.sqlite.prepare('SELECT notification_attempts n FROM requests WHERE id=?').get(id).n,0);
});
