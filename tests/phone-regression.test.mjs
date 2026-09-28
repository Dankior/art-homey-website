import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
// Reproduce the actual input listener before changing it.
const source = await readFile(new URL('../docs/app.js',import.meta.url),'utf8');
const phoneSection=source.slice(0,source.indexOf('// Выпадающее меню'));
for (const value of ['9060561819','89060561819','+79060561819']) {
 test(`phone input preserves ${value}`,()=>{
  let onInput;
  const input={value,addEventListener(type,fn){if(type==='blur')onInput=fn;}};
  vm.runInNewContext(phoneSection,{document:{querySelectorAll:()=>[input]}});
  onInput();
  assert.equal(input.value,'+7 (906) 056-18-19');
 });
}
