import {expect,it} from 'vitest';
import {newCat,purchase,readSave,SAVE_KEY} from './care';
import {event} from './journey';
import {gainedItems,bagCount} from './inventory';
it('starts with usable toys and treats in a separate validated save',()=>{const s=newCat();expect(SAVE_KEY).toBe('cozy-cat-apartment:v5');expect(readSave(JSON.stringify(s))).toEqual(s);expect(s.owned).toEqual(['wand','ball','box']);expect(s.treats.salmon).toBe(3);expect(bagCount(s)).toBe(6);});
it('purchases arrive exactly once and cannot overdraw hearts',()=>{const s=newCat(),n=purchase(s,'salmon');expect(n.treats.salmon).toBe(4);expect(n.hearts).toBe(3);expect(gainedItems(s,n)).toEqual(['+1 Salmon bites']);expect(purchase({...s,hearts:0},'laser').owned).not.toContain('laser');const f=purchase(s,'feather');expect(f.hearts).toBe(0);expect(gainedItems(f,purchase(f,'feather'))).toEqual([]);});
it('goals award real treats and the teaser once without replay farming',()=>{let s=newCat();for(const e of ['observe','ate','drank'] as const)s=event(s,e).state;expect(s.treats.stars).toBe(3);expect(s.owned.filter(i=>i==='feather')).toHaveLength(1);const before=s;for(const e of ['observe','ate','drank'] as const)s=event(s,e).state;expect(s.treats).toEqual(before.treats);expect(s.hearts).toBe(before.hearts);expect(gainedItems(before,s)).toEqual([]);});
