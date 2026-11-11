import {expect,it} from 'vitest';
import {createLayout,Navigator,canStand,moveWithCollision,contains} from './world';
import {plantAnchor,PANES,WINDOW} from './world';
import {newCat,readSave,advanceClock,clockHands,clockText,tomorrow} from './care';
it('uses solid furniture for both movement and routing in both apartment layouts',()=>{
 for(const expanded of [false,true]){const l=createLayout(expanded),nav=new Navigator(l),start={x:368,y:624};
  for(const f of l.fixtures.filter(f=>f.kind!=='wall')){
   expect(canStand(l,f.approach),f.id).toBe(true);const path=nav.path(start,f.approach);expect(path.length,f.id).toBeGreaterThan(0);let from=start;
   for(const p of path){expect(nav.clear(from,p),f.id).toBe(true);expect(canStand(l,p)).toBe(true);from=p;}
  }
  const result=moveWithCollision(l,{x:600,y:400},400,0);expect(result.x).toBeLessThan(640);expect(canStand(l,result)).toBe(true);
 }
});
it('anchors every potted plant to its supporting tabletop, outside the sofa',()=>{
 const l=createLayout(true),sofa=l.fixtures.find(f=>f.id==='sofa')!;
 for(const f of l.fixtures.filter(f=>f.kind==='plantTable')){const p=plantAnchor(f);expect(contains({x:f.rect.x,y:f.rect.y-f.height,w:f.rect.w,h:f.rect.h},p)).toBe(true);expect(contains(sofa.rect,p)).toBe(false);}
});
it('masks exterior animation into four panes with gaps for mullions',()=>{
 expect(PANES).toHaveLength(4);for(const p of PANES){expect(contains(WINDOW,{x:p.x,y:p.y})).toBe(true);expect(contains(WINDOW,{x:p.x+p.w,y:p.y+p.h})).toBe(true);expect(contains(p,{x:478,y:65})).toBe(false);expect(contains(p,{x:400,y:83})).toBe(false);}
});
it('shares a smooth game clock between display, clock hands, day reset and save',()=>{
 const s=newCat();expect(clockText(s.minutes)).toBe('8:00 AM');expect(clockHands(s.minutes)).toEqual({minute:0,hour:240});expect(clockHands(advanceClock(480,5))).toEqual({minute:30,hour:242.5});expect(advanceClock(1320,999)).toBe(1320);expect(tomorrow({...s,minutes:1200}).minutes).toBe(480);
 s.owner={name:'Ari',hair:2,skin:3,outfit:1};s.minutes=732.25;expect(readSave(JSON.stringify(s))).toEqual(s);expect(()=>readSave(JSON.stringify({...s,owner:{...s.owner,hair:9}}))).toThrow();
});
