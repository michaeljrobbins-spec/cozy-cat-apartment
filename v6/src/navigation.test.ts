import {expect,it} from 'vitest';
import {LAYOUT,Navigator,canStand,routeStep,distance,CAT_RADIUS,OWNER_RADIUS} from './world';
import {TOYS} from './play';
it('reaches water and every interaction approach from varied corners at real movement rates',()=>{
 for(const radius of [CAT_RADIUS,OWNER_RADIUS]){const nav=new Navigator(LAYOUT,radius),targets=LAYOUT.fixtures.filter(f=>f.kind!=='wall').map(f=>f.approach);let checked=0;
  for(let y=248;y<720;y+=58)for(let x=104;x<880;x+=73){const start={x:x+.3,y:y+.2};if(!canStand(LAYOUT,start,radius))continue;for(const goal of [LAYOUT.fixtures.find(f=>f.id==='water')!.approach,...(checked%8===0?targets:[])]){const path=nav.path(start,goal);expect(path.length,`${radius}: ${JSON.stringify(start)} to ${JSON.stringify(goal)}`).toBeGreaterThan(0);let p=start,steps=0;while(path.length&&steps++<1800){p=routeStep(LAYOUT,p,path,2.71,radius);expect(canStand(LAYOUT,p,radius)).toBe(true);}expect(distance(p,goal)).toBeLessThan(.01);expect(path).toHaveLength(0);}checked++;}
 }
});
it('does not cut solid corners or create paths to blocked destinations',()=>{const nav=new Navigator(LAYOUT,CAT_RADIUS);expect(nav.path({x:336,y:464},{x:200,y:300})).toEqual([]);const path=nav.path({x:300,y:330.1},{x:656,y:416});let previous={x:300,y:330.1};for(const p of path){expect(nav.clear(previous,p)).toBe(true);previous=p;}expect(Math.hypot(TOYS.wand.spot.x-402,TOYS.wand.spot.y-190)).toBeGreaterThan(150);});
