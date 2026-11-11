export interface Point{x:number;y:number}
export interface Rect extends Point{w:number;h:number}
export interface Fixture{id:string;kind:'sofa'|'bench'|'bookcase'|'table'|'bowls'|'tools'|'counter'|'bed'|'chair'|'wall'|'plantTable';rect:Rect;height:number;approach:Point;surface?:Point;room:string}
export interface Layout{width:number;height:number;bounds:Rect;fixtures:Fixture[];rooms:{name:string;rect:Rect}[];expanded:boolean}
export const TILE=32,OWNER_RADIUS=13,CAT_RADIUS=10;
export function createLayout(expanded:boolean):Layout{
 const fixtures:Fixture[]=[
 {id:'sofa',kind:'sofa',rect:{x:640,y:352,w:224,h:128},height:64,approach:{x:752,y:528},surface:{x:752,y:384},room:'Living room'},
 {id:'window-seat',kind:'bench',rect:{x:352,y:208,w:224,h:64},height:32,approach:{x:464,y:304},surface:{x:464,y:224},room:'Living room'},
 {id:'bookshelf',kind:'bookcase',rect:{x:96,y:176,w:160,h:64},height:96,approach:{x:176,y:272},room:'Living room'},
 {id:'coffee-table',kind:'table',rect:{x:416,y:448,w:112,h:64},height:40,approach:{x:464,y:560},room:'Living room'},
 {id:'plant-table',kind:'plantTable',rect:{x:864,y:240,w:64,h:64},height:40,approach:{x:880,y:336},surface:{x:896,y:232},room:'Living room'},
 {id:'food',kind:'bowls',rect:{x:96,y:528,w:64,h:32},height:0,approach:{x:112,y:592},room:'Living room'},
 {id:'water',kind:'bowls',rect:{x:160,y:528,w:64,h:32},height:0,approach:{x:208,y:592},room:'Living room'},
 {id:'tools',kind:'tools',rect:{x:96,y:352,w:64,h:64},height:32,approach:{x:176,y:400},room:'Living room'},
 ];
 const rooms=[{name:'Living room',rect:{x:64,y:144,w:896,h:672}}];
 if(expanded){
  rooms[0].rect={x:64,y:144,w:928,h:704};
  rooms.push({name:'Kitchen',rect:{x:1024,y:144,w:832,h:496}},{name:'Reading nook',rect:{x:64,y:928,w:928,h:352}},{name:'Bedroom',rect:{x:1024,y:736,w:832,h:544}});
  const wall=(id:string,x:number,y:number,w:number,h:number)=>fixtures.push({id,kind:'wall',rect:{x,y,w,h},height:48,approach:{x:0,y:0},room:''});
  wall('divider-north',992,144,32,272);wall('divider-middle',992,544,32,416);wall('divider-south',992,1088,32,192);
  wall('nook-west',64,864,352,32);wall('nook-east',608,864,384,32);
  wall('bedroom-west',1024,672,320,32);wall('bedroom-east',1504,672,352,32);
  fixtures.push(
   {id:'kitchen-counter',kind:'counter',rect:{x:1120,y:176,w:608,h:64},height:48,approach:{x:1360,y:272},room:'Kitchen'},
   {id:'kitchen-table',kind:'table',rect:{x:1376,y:384,w:160,h:96},height:40,approach:{x:1456,y:528},room:'Kitchen'},
   {id:'nook-chair',kind:'chair',rect:{x:192,y:1024,w:96,h:96},height:40,approach:{x:240,y:1168},surface:{x:240,y:1056},room:'Reading nook'},
   {id:'nook-books',kind:'bookcase',rect:{x:416,y:960,w:160,h:64},height:88,approach:{x:496,y:1072},room:'Reading nook'},
   {id:'nook-plant',kind:'plantTable',rect:{x:704,y:1056,w:64,h:64},height:40,approach:{x:752,y:1168},surface:{x:736,y:1048},room:'Reading nook'},
   {id:'bed',kind:'bed',rect:{x:1536,y:832,w:160,h:256},height:40,approach:{x:1488,y:1008},surface:{x:1616,y:944},room:'Bedroom'},
   {id:'bedside-plant',kind:'plantTable',rect:{x:1728,y:864,w:64,h:64},height:40,approach:{x:1760,y:976},surface:{x:1760,y:856},room:'Bedroom'},
   {id:'bedroom-books',kind:'bookcase',rect:{x:1120,y:768,w:192,h:64},height:80,approach:{x:1200,y:880},room:'Bedroom'},
  );
 }
 return {width:expanded?1920:1024,height:expanded?1344:896,bounds:{x:64,y:144,w:expanded?1792:896,h:expanded?1136:672},fixtures,rooms,expanded};
}
export const LAYOUT=createLayout(false);
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const contains=(r:Rect,p:Point)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
export function canStand(layout:Layout,p:Point,radius=OWNER_RADIUS){
 const b=layout.bounds;if(p.x-radius<b.x||p.y-radius<b.y||p.x+radius>b.x+b.w||p.y+radius>b.y+b.h)return false;
 return !layout.fixtures.some(f=>p.x+radius>f.rect.x&&p.x-radius<f.rect.x+f.rect.w&&p.y+radius>f.rect.y&&p.y-radius<f.rect.y+f.rect.h);
}
export function moveWithCollision(layout:Layout,from:Point,dx:number,dy:number,radius=OWNER_RADIUS):Point{
 const p={...from};const steps=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4)||1;
 for(let i=0;i<steps;i++){if(canStand(layout,{x:p.x+dx/steps,y:p.y},radius))p.x+=dx/steps;if(canStand(layout,{x:p.x,y:p.y+dy/steps},radius))p.y+=dy/steps;}
 return p;
}
export class Navigator{
 private cells:Point[]=[];private index=new Map<string,Point>();
 constructor(public layout:Layout,public radius=OWNER_RADIUS){
  for(let y=16;y<layout.height;y+=TILE)for(let x=16;x<layout.width;x+=TILE)if(canStand(layout,{x,y},radius)){const p={x,y};this.cells.push(p);this.index.set(this.key(p),p);}
 }
 private key(p:Point){return `${p.x},${p.y}`;}
 nearest(p:Point){return this.cells.reduce((a,b)=>distance(a,p)<distance(b,p)?a:b);}
 path(from:Point,to:Point):Point[]{
  const start=this.nearest(from),goal=this.nearest(to),startKey=this.key(start),goalKey=this.key(goal);
  const open=new Set([startKey]),scores=new Map([[startKey,0]]),previous=new Map<string,string>();
  while(open.size){let current=[...open].reduce((a,b)=>(scores.get(a)!+distance(this.index.get(a)!,goal))<(scores.get(b)!+distance(this.index.get(b)!,goal))?a:b);
   if(current===goalKey){const result:Point[]=[];while(current!==startKey){result.unshift(this.index.get(current)!);current=previous.get(current)!;}result.unshift(start);if(canStand(this.layout,to,this.radius)&&this.clear(result.at(-1)!,to))result.push(to);return result;}
   open.delete(current);const p=this.index.get(current)!;
   for(const [dx,dy]of [[32,0],[-32,0],[0,32],[0,-32]]){const next={x:p.x+dx,y:p.y+dy},key=this.key(next);if(!this.index.has(key))continue;const score=scores.get(current)!+32;if(score<(scores.get(key)??Infinity)){scores.set(key,score);previous.set(key,current);open.add(key);}}
  }
  return [];
 }
 clear(a:Point,b:Point){const count=Math.ceil(distance(a,b)/4)||1;for(let i=0;i<=count;i++)if(!canStand(this.layout,{x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count},this.radius))return false;return true;}
}
export function roomAt(layout:Layout,p:Point){return layout.rooms.find(r=>contains(r.rect,p))?.name||'Hallway';}

export const WINDOW={x:336,y:40,w:288,h:88};
export const PANES=[{x:344,y:48,w:128,h:30},{x:484,y:48,w:132,h:30},{x:344,y:88,w:128,h:30},{x:484,y:88,w:132,h:30}];
export function plantAnchor(f:Fixture):Point{return {x:f.rect.x+f.rect.w/2,y:f.rect.y+f.rect.h/2-f.height};}
