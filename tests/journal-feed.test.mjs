import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const script = await readFile(new URL('../docs/journal-feed.js', import.meta.url), 'utf8');
async function render(fetch) {
  const dom = new JSDOM('<div class="advice-grid" data-journal-latest><a href="kitchen-cost.html">Existing</a></div><section data-journal-section hidden><div data-journal-latest></div></section>', {url:'https://arthomey.ru/',runScripts:'outside-only'});
  dom.window.fetch=fetch;dom.window.AbortSignal.timeout=()=>undefined;
  await dom.window.eval(script);return dom;
}
test('published feed updates cards safely and reveals the articles section', async()=>{
 const dom=await render(async()=>({ok:true,json:async()=>[{title:'<img src=x onerror=alert(1)>',excerpt:'A useful article',url:'https://arthomey.ru/journal/new/'}]}));
 assert.equal(dom.window.document.querySelector('h3').textContent,'<img src=x onerror=alert(1)>');
 assert.equal(dom.window.document.querySelectorAll('img').length,0);
 assert.equal(dom.window.document.querySelector('[data-journal-section]').hidden,false);
 assert.equal(dom.window.document.querySelector('h3 a').pathname,'/journal/new/');dom.window.close();
});
test('unavailable CMS and empty feed retain the existing articles', async()=>{
 for(const fetch of [async()=>{throw new Error('offline');},async()=>({ok:false}),async()=>({ok:true,json:async()=>[]})]){
  const dom=await render(fetch);assert.equal(dom.window.document.querySelector('[data-journal-latest]').textContent,'Existing');assert.equal(dom.window.document.querySelector('[data-journal-section]').hidden,true);dom.window.close();
 }
});
test('invalid or external article URLs cannot replace static links', async()=>{
 for(const url of ['javascript:alert(1)','https://other.example/journal/x','https://arthomey.ru/wp-admin/']){
  const dom=await render(async()=>({ok:true,json:async()=>[{title:'Unsafe',excerpt:'x',url}]}));assert.equal(dom.window.document.querySelector('[data-journal-latest]').textContent,'Existing');dom.window.close();
 }
});
