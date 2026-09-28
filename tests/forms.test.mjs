import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {normalizePhone} from '../docs/lead-validation.mjs';
const root=new URL('../docs/',import.meta.url);
const app=await readFile(new URL('app.js',root),'utf8');
const leads=(await readFile(new URL('leads.js',root),'utf8')).replace("import {normalizePhone} from './lead-validation.mjs';",'');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function site(t,{mobile=false,reduced=false,page='index.html'}={}) {
 const dom=new JSDOM(await readFile(new URL(page,root),'utf8'),{url:'http://localhost/index.html',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());
 const w=dom.window;let intervals=0;
 w.matchMedia=q=>({matches:q.includes('reduce')?reduced:mobile,addEventListener(){}});
 w.IntersectionObserver=class{observe(){} unobserve(){}};
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.setInterval=()=>{intervals++;return intervals;};w.clearInterval=()=>{};
 w.normalizePhone=normalizePhone;
 const submissions=[];
 w.fetch=async(_url,options)=>{submissions.push(JSON.parse(options.body));return Response.json({id:crypto.randomUUID()},{status:201});};
 w.eval(app);w.eval(leads);
 return {w,doc:w.document,submissions,intervals:()=>intervals};
}
async function select(w,form,selector) {const el=form.querySelector(selector);el.checked=true;el.dispatchEvent(new w.Event('change',{bubbles:true}));await pause(220);}
async function submit(w,form) {form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await pause(20);}
function contact(form) {form.querySelector('[name=phone]').value='9060561819';form.querySelector('[name=consent]').checked=true;}

test('quiz confirmation hides inputs; a new request starts with empty answers',async t=>{
 const {w,doc,submissions}=await site(t);const form=doc.querySelector('#quizForm');
 await select(w,form,'[name=furniture][value="Кухня"]');await select(w,form,'[name=budget][value="До 150 000 ₽"]');contact(form);
 await submit(w,form);
 assert.equal(submissions.length,1);assert.equal(submissions[0].category,'kitchen');assert.equal(submissions[0].contact,'+79060561819');
 assert.equal(form.querySelector('[data-lead-success]').hidden,false);
 assert.equal(form.querySelector('[type=submit]').closest('fieldset').hidden,true);
 await submit(w,form);assert.equal(submissions.length,1);
 form.querySelector('[data-new-lead]').click();
 assert.equal(form.querySelector('[data-lead-success]').hidden,true);
 assert.equal(form.querySelector('[data-quiz-step]').hidden,false);
 assert.equal(form.querySelector('[name=furniture]:checked'),null);assert.equal(form.querySelector('[name=phone]').value,'');
 await select(w,form,'[name=furniture][value="Шкаф или гардеробная"]');await select(w,form,'[name=budget][value="От 500 000 ₽"]');contact(form);await submit(w,form);
 assert.equal(submissions[1].category,'storage');assert.equal(submissions[1].budget,'От 500 000 ₽');assert.notEqual(submissions[0].submissionId,submissions[1].submissionId);
});
test('network error preserves input and a retry keeps the same submission ID',async t=>{
 const {w,doc}=await site(t);const form=doc.querySelector('#ctaForm');contact(form);form.querySelector('[name=message]').value='Шкаф в нишу';
 const bodies=[];w.fetch=async(_url,options)=>{bodies.push(JSON.parse(options.body));if(bodies.length===1)throw new w.Error('Ошибка соединения');return Response.json({id:crypto.randomUUID()});};
 await submit(w,form);assert.equal(form.querySelector('[name=message]').value,'Шкаф в нишу');assert.ok(form.querySelector('.is-error'));assert.equal(form.querySelector('[type=submit]').disabled,false);
 await submit(w,form);assert.equal(bodies[0].submissionId,bodies[1].submissionId);assert.equal(form.querySelector('[data-lead-success]').hidden,false);
});
test('invalid phone never sends a request; corrected input can be sent',async t=>{
 const {w,doc,submissions}=await site(t);const form=doc.querySelector('#ctaForm');contact(form);form.querySelector('[name=phone]').value='+7906056181';
 await submit(w,form);assert.equal(submissions.length,0);
 form.querySelector('[name=phone]').value='8 (906) 056-18-19';form.querySelector('[name=phone]').dispatchEvent(new w.Event('input'));await submit(w,form);assert.equal(submissions.length,1);
});
test('back button cancels a pending automatic advance',async t=>{
 const {w,doc}=await site(t);const form=doc.querySelector('#quizForm');await select(w,form,'[name=furniture][value="Кухня"]');
 const budget=form.querySelector('[name=budget]');budget.checked=true;budget.dispatchEvent(new w.Event('change',{bubbles:true}));
 form.querySelectorAll('.quiz-back')[0].click();await pause(220);
 assert.equal(form.querySelector('[data-quiz-step]').hidden,false);
});
test('mobile menu receives focus and restores it on Escape',async t=>{
 const {w,doc}=await site(t,{mobile:true});const burger=doc.querySelector('#burgerBtn');burger.click();
 assert.equal(doc.activeElement.className,'hp-mobile-drawer__close');assert.equal(doc.querySelector('header').inert,true);
 doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(doc.activeElement,burger);assert.equal(doc.querySelector('.hp-mobile-drawer').hidden,true);assert.ok(!doc.querySelector('header').inert);
});
test('reduced motion disables carousel timers and every dot has a name',async t=>{
 const {doc,intervals}=await site(t,{reduced:true});assert.equal(intervals(),0);
 const dots=doc.querySelectorAll('.showcase__dot,.testimonials__dot,.slider__dot');assert.ok(dots.length);
 dots.forEach(dot=>assert.ok(dot.getAttribute('aria-label')));
});
for(const page of ['about.html','process.html','projects.html','materials.html','faq.html','privacy.html','warranty.html']) {
 test(`shared scripts initialize on ${page}`,async t=>{const {doc}=await site(t,{page});assert.ok(doc.querySelector('h1'));assert.ok(doc.querySelector('link[rel=canonical]'));});
}

test('after Back the same selected answer can continue without changing it',async t=>{
 const {w,doc}=await site(t);const form=doc.querySelector('#quizForm');
 await select(w,form,'[name=furniture][value="Кухня"]');
 form.querySelector('.quiz-back').click();
 const step=form.querySelector('[data-quiz-step]');
 assert.equal(step.querySelector('[name=furniture]:checked').value,'Кухня');
 const next=step.querySelector('.quiz-next');
 assert.ok(next,'A selected answer needs a way to continue after Back');assert.equal(next.disabled,false);
 next.click();assert.equal(form.querySelectorAll('[data-quiz-step]')[1].hidden,false);
});
