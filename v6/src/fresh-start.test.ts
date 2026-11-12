import {expect,it} from 'vitest';
import {eraseV6Save} from './fresh-start';
import {SAVE_KEY} from './care';
it('erases exactly the v6 save, retaining all earlier and unrelated data',()=>{const data=new Map<string,string>([[SAVE_KEY,'v6'],['unrelated','keep'],...Array.from({length:5},(_,i)=>[`cozy-cat-apartment:v${i+1}`,`keep ${i+1}`] as [string,string])]);eraseV6Save({getItem:k=>data.get(k)??null,removeItem:k=>{data.delete(k);}});expect(data.has(SAVE_KEY)).toBe(false);expect(data.size).toBe(6);expect(data.get('unrelated')).toBe('keep');for(let i=1;i<=5;i++)expect(data.get(`cozy-cat-apartment:v${i}`)).toBe(`keep ${i}`);});
it('reports blocked or ineffective deletion so the app can retain the current home',()=>{expect(()=>eraseV6Save({getItem:()=>'still here',removeItem:()=>{throw new Error('blocked');}})).toThrow('blocked');expect(()=>eraseV6Save({getItem:()=>'still here',removeItem:()=>{}})).toThrow('could not be erased');});
