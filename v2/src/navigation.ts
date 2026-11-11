export interface Point{x:number;y:number}
export const SPOTS:Record<string,Point>={
 center:{x:635,y:632},left:{x:405,y:620},bowls:{x:235,y:657},water:{x:325,y:657},
 frontLeft:{x:440,y:744},front:{x:680,y:744},right:{x:1100,y:700},frontRight:{x:950,y:744},
 sofa:{x:1050,y:660},sofaSeat:{x:1030,y:487},behind:{x:1060,y:520},hall:{x:845,y:538},
 windowFloor:{x:625,y:535},window:{x:620,y:416},sun:{x:515,y:587},hide:{x:1035,y:605},plant:{x:310,y:560},
};
const EDGES=[['center','left'],['left','bowls'],['bowls','water'],['water','left'],['left','frontLeft'],['frontLeft','front'],['front','frontRight'],['frontRight','right'],['right','sofa'],['sofa','hide'],['sofa','sofaSeat'],['center','windowFloor'],['center','sun'],['sun','left'],['sun','windowFloor'],['left','plant'],['windowFloor','window'],['windowFloor','hall'],['hall','behind'],['hall','sofa'],['behind','sofaSeat'],['center','front']];
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function route(from:string,to:string):string[]{
 if(!SPOTS[from]||!SPOTS[to])throw Error('Unknown room destination');
 const distances:Record<string,number>={[from]:0},previous:Record<string,string>={},pending=new Set(Object.keys(SPOTS));
 while(pending.size){const a=[...pending].reduce((best,k)=>(distances[k]??Infinity)<(distances[best]??Infinity)?k:best);pending.delete(a);if(a===to)break;if(!Number.isFinite(distances[a]))break;
   for(const [x,y]of EDGES){const b=x===a?y:y===a?x:null;if(!b||!pending.has(b))continue;const d=distances[a]+distance(SPOTS[a],SPOTS[b]);if(d<(distances[b]??Infinity)){distances[b]=d;previous[b]=a;}}
 }
 const result:string[]=[];let k=to;while(k!==from){result.unshift(k);k=previous[k];if(!k)throw Error('Unreachable destination');}return result;
}
export function isHop(a:string,b:string){return a==='window'||b==='window'||a==='sofaSeat'||b==='sofaSeat';}
