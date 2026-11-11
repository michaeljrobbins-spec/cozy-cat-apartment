export interface Point{x:number;y:number}
export interface Rect extends Point{w:number;h:number}
export interface Fixture{id:string;kind:'sofa'|'bench'|'bookcase'|'table'|'bowls'|'tools'|'counter'|'bed'|'chair'|'wall'|'plantTable'|'cabinet'|'fridge';rect:Rect;height:number;approach:Point;surface?:Point;room:string}
export interface Layout{width:number;height:number;bounds:Rect;fixtures:Fixture[];rooms:{name:string;rect:Rect}[];expanded:boolean}
export const TILE=32,OWNER_RADIUS=12,CAT_RADIUS=8;
// One visual scale: adult ~78 px tall, cat ~30 px body, two-seat sofa 160 px wide.
export const OWNER_SCALE=2,CAT_SCALE=.95;
export function createLayout():Layout{
 const fixtures:Fixture[]=[
 {id:'cabinet',kind:'cabinet',rect:{x:80,y:384,w:48,h:48},height:48,approach:{x:112,y:464},room:'Living room'},
 {id:'fridge',kind:'fridge',rect:{x:832,y:176,w:48,h:96},height:40,approach:{x:848,y:304},room:'Kitchen'},
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
// Navigation uses its own fine grid and a little clearance around solid objects.
const NAV_STEP=8,SKIN=1.5;
export class Navigator{
 private cells:Point[]=[];private index=new Map<string,Point>();private edges=new Map<string,string[]>();
 constructor(public layout:Layout,public radius=OWNER_RADIUS){
  for(let y=8;y<layout.height;y+=NAV_STEP)for(let x=8;x<layout.width;x+=NAV_STEP)if(canStand(layout,{x,y},radius+SKIN)){const p={x,y};this.cells.push(p);this.index.set(this.key(p),p);}
  for(const p of this.cells){const adjacent:string[]=[];for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){const q={x:p.x+dx,y:p.y+dy};if(this.index.has(this.key(q))&&this.clear(p,q))adjacent.push(this.key(q));}this.edges.set(this.key(p),adjacent);}
 }
 private key(p:Point){return `${p.x},${p.y}`;}
 nearest(p:Point){return this.cells.reduce((a,b)=>distance(a,p)<distance(b,p)?a:b);}
 path(from:Point,to:Point):Point[]{
  if(!canStand(this.layout,from,this.radius)||!canStand(this.layout,to,this.radius))return [];
  if(this.clear(from,to))return [{...to}];
  const candidates=this.cells.filter(p=>distance(p,from)<64&&this.clear(from,p));
  const goals=new Set(this.cells.filter(p=>distance(p,to)<40&&this.clear(p,to)).map(p=>this.key(p)));
  if(!candidates.length||!goals.size)return [];
  const start=candidates.reduce((a,b)=>distance(a,from)<distance(b,from)?a:b),startKey=this.key(start);
  const open=new Set([startKey]),scores=new Map([[startKey,0]]),previous=new Map<string,string>();
  while(open.size){let current=[...open].reduce((a,b)=>(scores.get(a)!+distance(this.index.get(a)!,to))<(scores.get(b)!+distance(this.index.get(b)!,to))?a:b);
   if(goals.has(current)){const result:Point[]=[{...to}];while(current!==startKey){result.unshift(this.index.get(current)!);current=previous.get(current)!;}result.unshift(start);return result;}
   open.delete(current);
   for(const key of this.edges.get(current)!){const score=scores.get(current)!+NAV_STEP;if(score<(scores.get(key)??Infinity)){scores.set(key,score);previous.set(key,current);open.add(key);}}
  }return [];
 }
 clear(a:Point,b:Point){const count=Math.ceil(distance(a,b)/2)||1;for(let i=0;i<=count;i++)if(!canStand(this.layout,{x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count},this.radius))return false;return true;}
}
// Never discard a waypoint before actually reaching it: small corner cuts can
// trap a cat against the next obstacle even when the planned route was valid.
export function routeStep(layout:Layout,from:Point,path:Point[],amount:number,radius:number):Point{
 let p={...from},left=amount;
 while(path.length&&left>0){const to=path[0],d=distance(p,to);if(d<.001){p={...to};path.shift();continue;}const step=Math.min(d,left);const next=moveWithCollision(layout,p,(to.x-p.x)/d*step,(to.y-p.y)/d*step,radius);if(distance(next,p)<.00001)break;left-=step;p=next;if(distance(p,to)<.001){p={...to};path.shift();}else if(step>=d)break;}
 return p;
}
export function roomAt(layout:Layout,p:Point){return layout.rooms.find(r=>contains(r.rect,p))?.name||'Hallway';}

export const WINDOW={x:176,y:40,w:256,h:88};
export const PANES=[{x:184,y:48,w:112,h:30},{x:308,y:48,w:116,h:30},{x:184,y:88,w:112,h:30},{x:308,y:88,w:116,h:30}];
export function plantAnchor(f:Fixture):Point{return {x:f.rect.x+f.rect.w/2,y:f.rect.y+f.rect.h/2-f.height};}
export const ROOM_DESTINATIONS:Record<string,Point>={'Living room':{x:368,y:464},Kitchen:{x:688,y:304},'Reading nook':{x:336,y:656},Bedroom:{x:688,y:624}};
export const REST_SPOTS=[{x:336,y:464},{x:112,y:464},{x:432,y:560},{x:688,y:624},{x:784,y:272}];
