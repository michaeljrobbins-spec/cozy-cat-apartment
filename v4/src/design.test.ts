import {expect,it} from 'vitest';
import {LAYOUT,Navigator,canStand,moveWithCollision,plantAnchor,contains,ROOM_DESTINATIONS,OWNER_SCALE,CAT_SCALE} from './world';
import {newCat,readSave,clockHands} from './care';
import {routine,mayVisit,visitFinished,SOCIAL_SECONDS} from './behavior';
it('has a compact plan, two-seat sofa, and smaller cat at a consistent scale',()=>{
 expect(LAYOUT.bounds.w).toBeLessThan(900);expect(LAYOUT.bounds.h).toBeLessThan(650);expect(OWNER_SCALE).toBe(2);expect(CAT_SCALE).toBeLessThan(1.1);
 const sofa=LAYOUT.fixtures.find(f=>f.id==='sofa')!;expect(sofa.rect.w).toBeLessThanOrEqual(160);expect(sofa.rect.h).toBe(64);expect(sofa.height).toBeLessThan(40);
 const nav=new Navigator(LAYOUT);for(const point of [...Object.values(ROOM_DESTINATIONS),...LAYOUT.fixtures.filter(f=>f.kind!=='wall').map(f=>f.approach)]){expect(canStand(LAYOUT,point),JSON.stringify(point)).toBe(true);const path=nav.path({x:368,y:464},point);expect(path.length).toBeGreaterThan(0);let from={x:368,y:464};for(const p of path){expect(nav.clear(from,p)).toBe(true);from=p;}}
 const hit=moveWithCollision(LAYOUT,{x:320,y:304},-200,0);expect(hit.x).toBeGreaterThanOrEqual(300);expect(canStand(LAYOUT,hit)).toBe(true);
});
it('plants are supported by surfaces and independent routines last long enough to observe',()=>{
 for(const f of LAYOUT.fixtures.filter(f=>f.kind==='plantTable'))expect(contains({x:f.rect.x,y:f.rect.y-f.height,w:f.rect.w,h:f.rect.h},plantAnchor(f))).toBe(true);
 for(let i=0;i<20;i++)expect(routine(i,'Playful').seconds).toBeGreaterThanOrEqual(12);
 expect(SOCIAL_SECONDS.Shy).toBeGreaterThan(SOCIAL_SECONDS.Playful);expect(mayVisit(newCat(),20000,50000)).toBe(false);expect(visitFinished(13000,12000)).toBe(true);
});
it('uses its own validated save and shared clock',()=>{const s=newCat();expect(s.schema).toBe(4);expect(readSave(JSON.stringify(s))).toEqual(s);expect(()=>readSave(JSON.stringify({...s,schema:3}))).toThrow();expect(clockHands(485)).toEqual({minute:30,hour:242.5});});

import {thoughts,OBJECT_NAMES} from './signals';
it('makes the strongest needs visible without treating every movement as a social request',()=>{
 const s=newCat();expect(thoughts(s,'sit','groom')).toContain('food');s.tension=80;expect(thoughts(s,'sit','sulking')).toEqual(['space']);s.tension=0;s.needs={food:95,water:95,energy:95,comfort:95,play:95};expect(thoughts(s,'sit','explore')).toEqual([]);expect(thoughts(s,'sit','visiting')).toEqual(['attention']);expect(thoughts(s,'sleep','napping')).toEqual(['nap']);expect(OBJECT_NAMES.food).toBe('Food bowl');
});
