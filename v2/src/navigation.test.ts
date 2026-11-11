import {expect,it} from 'vitest';
import {route,SPOTS,isHop} from './navigation';
it('connects every room location without routing through the coffee table',()=>{
 for(const from of Object.keys(SPOTS))for(const to of Object.keys(SPOTS)){
  const path=route(from,to);if(from!==to)expect(path.at(-1)).toBe(to);else expect(path).toEqual([]);
  let previous=from;for(const next of path){const a=SPOTS[previous],b=SPOTS[next];for(let t=0;t<=1;t+=.05){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;expect(x>735&&x<865&&y>665&&y<730).toBe(false);}previous=next;}
 }
 expect(isHop('windowFloor','window')).toBe(true);expect(isHop('center','sun')).toBe(false);
});
