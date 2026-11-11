export interface Point{x:number;y:number}
export interface Rect extends Point{w:number;h:number}
export interface Fixture{id:string;kind:'sofa'|'bench'|'bookcase'|'table'|'bowls'|'tools'|'counter'|'bed'|'chair'|'wall'|'plantTable';rect:Rect;height:number;approach:Point;surface?:Point;room:string}
export interface Layout{width:number;height:number;bounds:Rect;fixtures:Fixture[];rooms:{name:string;rect:Rect}[];expanded:boolean}
export const TILE=32,OWNER_RADIUS=12,CAT_RADIUS=8;
// One visual scale: adult ~78 px tall, cat ~30 px body, two-seat sofa 160 px wide.
export const OWNER_SCALE=2,CAT_SCALE=.95;
export function createLayout():Layout{
 const fixtures:Fixture[]=[
 {id:'sofa',kind:'sofa',rect:{x:128,y:272,w:160,h:64},height:32,approach:{x:208,y:368},surface:{x:208,y:288},room:'Living room'},
 {id:'window-seat',kind:'bench',rect:{x:192,y:160,w:160,h:48},height:24,approach:{x:272,y:240},surface:{x:272,y:176},room:'Living room'},
 {id:'bookshelf',kind:'bookcase',rect:{x:80,y:176,w:80,h:40},height:64,approach:{x:112,y:256},room:'Living room'},
 {id:'coffee-table',kind:'table',rect:{x:160,y:384,w:96,h:48},height:24,approach:{x:208,y:464},room:'Living room'},
 {id:'plant-table',kind:'plantTable',rect:{x:400,y:336,w:48,h:48},height:26,approach:{x:432,y:432},surface:{x:424,y:334},room:'Living room'},
 {id:'food',kind:'bowls',rect:{x:576,y:368,w:48,h:24},height:0,approach:{x:592,y:416},room:'Kitchen'},
 {id:'water',kind:'bowls',rect:{x:640,y:368,w:48,h:24},height:0,approach:{x:656,y:416},room:'Kitchen'},
 {id:'tools',kind:'tools',rect:{x:400,y:192,w:48,h:40},height:24,approach:{x:432,y:272},room:'Living room'},
 {id:'kitchen-counter',kind:'counter',rect:{x:560,y:176,w:256,h:48},height:32,approach:{x:688,y:272},room:'Kitchen'},
 {id:'kitchen-table',kind:'table',rect:{x:752,y:336,w:80,h:64},height:26,approach:{x:784,y:432},room:'Kitchen'},
 {id:'bedroom-wall-west',kind:'wall',rect:{x:544,y:496,w:96,h:16},height:40,approach:{x:0,y:0},room:''},
 {id:'bedroom-wall-east',kind:'wall',rect:{x:736,y:496,w:160,h:16},height:40,approach:{x:0,y:0},room:''},
 {id:'bedroom-wall-side',kind:'wall',rect:{x:528,y:512,w:16,h:224},height:40,approach:{x:0,y:0},room:''},
 {id:'nook-chair',kind:'chair',rect:{x:112,y:560,w:64,h:64},height:28,approach:{x:144,y:672},surface:{x:144,y:576},room:'Reading nook'},
 {id:'nook-books',kind:'bookcase',rect:{x:272,y:528,w:96,h:40},height:64,approach:{x:320,y:608},room:'Reading nook'},
 {id:'nook-plant',kind:'plantTable',rect:{x:416,y:608,w:48,h:48},height:24,approach:{x:432,y:688},surface:{x:440,y:608},room:'Reading nook'},
 {id:'bed',kind:'bed',rect:{x:752,y:560,w:112,h:144},height:24,approach:{x:688,y:640},surface:{x:808,y:608},room:'Bedroom'},
 {id:'bedside-plant',kind:'plantTable',rect:{x:576,y:560,w:48,h:48},height:24,approach:{x:656,y:592},surface:{x:600,y:560},room:'Bedroom'},
 {id:'bedroom-books',kind:'bookcase',rect:{x:576,y:672,w:96,h:40},height:56,approach:{x:688,y:688},room:'Bedroom'},
 ];
 return {width:960,height:800,bounds:{x:64,y:144,w:832,h:592},expanded:true,fixtures,rooms:[
 {name:'Living room',rect:{x:64,y:144,w:464,h:352}},
 {name:'Kitchen',rect:{x:528,y:144,w:368,h:352}},
 {name:'Reading nook',rect:{x:64,y:496,w:464,h:240}},
 {name:'Bedroom',rect:{x:544,y:528,w:352,h:208}},
 ]};
}
export const LAYOUT=createLayout();
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
  const visible=this.cells.filter(p=>distance(p,from)<96&&this.clear(from,p));
  const start=visible.length?visible.reduce((a,b)=>distance(a,from)<distance(b,from)?a:b):this.nearest(from),goal=this.nearest(to),startKey=this.key(start),goalKey=this.key(goal);
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

export const WINDOW={x:176,y:40,w:256,h:88};
export const PANES=[{x:184,y:48,w:112,h:30},{x:308,y:48,w:116,h:30},{x:184,y:88,w:112,h:30},{x:308,y:88,w:116,h:30}];
export function plantAnchor(f:Fixture):Point{return {x:f.rect.x+f.rect.w/2,y:f.rect.y+f.rect.h/2-f.height};}
export const ROOM_DESTINATIONS:Record<string,Point>={'Living room':{x:368,y:464},Kitchen:{x:688,y:304},'Reading nook':{x:336,y:656},Bedroom:{x:688,y:624}};
export const REST_SPOTS=[{x:336,y:464},{x:112,y:464},{x:432,y:560},{x:688,y:624},{x:784,y:272}];
