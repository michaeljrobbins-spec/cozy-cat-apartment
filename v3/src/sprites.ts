import type Phaser from 'phaser';
import type {Owner} from './care';
export const SKINS=['#f0c8a0','#dba77e','#b9825e','#8f5e44','#644333'];
export const HAIRS=[{name:'Chestnut crop',color:'#6a4632',style:0},{name:'Copper bob',color:'#ad633e',style:1},{name:'Dark curls',color:'#343339',style:2},{name:'Silver waves',color:'#a5a19a',style:3}];
export const OUTFITS=[{name:'Moss cardigan',color:'#84966c',shade:'#5d7453',pants:'#6a7161'},{name:'Terracotta overalls',color:'#b77e60',shade:'#8f5d49',pants:'#6d726a'},{name:'Blue linen',color:'#7e9baf',shade:'#597b91',pants:'#746c60'},{name:'Golden knit',color:'#c4a267',shade:'#a08353',pants:'#657164'}];
export const COAT_COLORS=[['#d39154','#f0c188','#8f5e3e'],['#94765b','#cbb08b','#5e5046'],['#464a50','#f2e7d3','#292e35'],['#e5d8bc','#c58b59','#544941'],['#454c57','#777d85','#2c313b'],['#dcc49d','#f3e1bb','#b29671']];
export type Direction='down'|'left'|'right'|'up';
export const DIRECTIONS:Direction[]=['down','left','right','up'];
export const OWNER_POSES=['idle','walk','care','sit','play'] as const;
export type OwnerPose=typeof OWNER_POSES[number];
export const CAT_POSES=['walk','sit','sleep','groom','stretch','pounce','eat','rub'] as const;
export type CatPose=typeof CAT_POSES[number];
export const EXPRESSIONS=['soft','wary','flat'] as const;
const ownerKey=(o:Owner)=>`owner-${o.hair}-${o.skin}-${o.outfit}`;
export {ownerKey};
function pen(c:CanvasRenderingContext2D){return {r:(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);},p:(points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}};}
function ownerFrame(c:CanvasRenderingContext2D,o:Owner,pose:OwnerPose,d:Direction,f:number){
 const {r,p}=pen(c),skin=SKINS[o.skin],hair=HAIRS[o.hair],outfit=OUTFITS[o.outfit],outline='#41443d',side=d==='left'||d==='right';
 if(d==='left'){c.translate(32,0);c.scale(-1,1);}
 const stride=pose==='walk'?[0,2,3,1,0,-2,-3,-1][f]:0,bob=pose==='walk'&&f%4===2?-1:0,sit=pose==='sit',care=pose==='care',play=pose==='play';
 // Boots and separately moving legs anchor the body to the floor.
 if(sit){r(9,34,6,7,outfit.pants);r(18,34,6,7,outfit.pants);r(9,40,7,3,outline);r(18,40,7,3,outline);}
 else{r(side?14:10,33,5,9+stride,outfit.pants);r(side?19:18,33,5,9-stride,outfit.pants);r(side?13:9,41+stride,7,3,outline);r(side?18:18,41-stride,7,3,outline);r(side?14:10,41+stride,5,1,'#9c947c');}
 const y=care?23:20+bob;
 p([[10,y],[22,y],[25,y+5],[24,35],[9,35],[8,y+5]],outline);r(10,y+2,13,12,outfit.color);r(10,y+10,13,4,outfit.shade);r(16,y+2,1,11,'#e0d4af');r(16,y+7,1,1,'#5e6651');
 if(d==='up'){r(10,y+2,13,12,outfit.color);r(13,y+2,7,3,outfit.shade);}
 if(care||play){const reach=care?[0,1,3,4,3,2,1,0][f]:[0,2,4,6,5,3,1,0][f];
  if(side){r(23,y+4,5+reach,5,outfit.shade);r(26+reach,y+4,3,4,skin);}else{r(6,y+7-reach,5,9,outfit.shade);r(23,y+7-reach,5,9,outfit.shade);r(6,y+14-reach,4,4,skin);r(24,y+14-reach,4,4,skin);}
 }else{r(6,y+4,4,10+Math.floor(stride/2),outfit.shade);r(23,y+4,4,10-Math.floor(stride/2),outfit.shade);r(6,y+13+Math.floor(stride/2),4,3,skin);r(23,y+13-Math.floor(stride/2),4,3,skin);}
 const hy=care?9:5+bob;
 p([[10,hy],[22,hy],[25,hy+4],[25,hy+13],[21,hy+17],[11,hy+17],[7,hy+12],[7,hy+5]],outline);r(10,hy+3,13,11,skin);r(12,hy+14,8,2,skin);
 r(9,hy,14,6,hair.color);r(7,hy+4,4,7,hair.color);r(22,hy+4,3,7,hair.color);r(12,hy-1,8,2,hair.color);
 if(hair.style===1){r(7,hy+8,4,11,hair.color);r(22,hy+8,4,11,hair.color);r(11,hy+4,7,3,hair.color);}if(hair.style===2){for(let i=0;i<5;i++){r(7+i*4,hy+(i%2?-2:0),5,5,hair.color);}r(7,hy+7,4,6,hair.color);}if(hair.style===3){r(8,hy+3,10,5,hair.color);r(20,hy+9,5,10,hair.color);r(9,hy+1,10,2,'#c5c1b5');}
 if(d==='up'){r(9,hy+5,14,9,hair.color);r(12,hy+13,8,3,hair.color);}
 else if(side){r(23,hy+9,3,4,skin);r(21,hy+8,2,2,outline);r(24,hy+14,2,1,'#9c6d54');}
 else{r(12,hy+9,2,2,outline);r(20,hy+9,2,2,outline);r(15,hy+14,4,1,'#a57860');r(10,hy+12,2,1,'#d48f76');r(22,hy+12,2,1,'#d48f76');}
}
function catFrame(c:CanvasRenderingContext2D,coat:number,pose:CatPose,d:Direction,f:number,expression:string){
 const {r,p}=pen(c),[fur,light,stripe]=COAT_COLORS[coat],ink='#43413a',side=d==='left'||d==='right',flat=expression==='flat';
 if(d==='left'){c.translate(48,0);c.scale(-1,1);}
 const swing=[-2,-1,1,2,2,1,-1,-2][f],walk=pose==='walk',sleep=pose==='sleep',stretch=pose==='stretch',rub=pose==='rub',groom=pose==='groom',pounce=pose==='pounce';
 if(sleep){const b=f<4?0:1;p([[11,23-b],[18,17-b],[33,17-b],[40,23],[39,33],[15,34],[9,29]],ink);r(13,23-b,23,9,fur);r(17,19-b,15,5,fur);r(14,30,22,3,light);r(15,21,3,6,stripe);r(21,19,3,5,stripe);r(28,25,11,7,light);r(31,27,5,1,ink);r(35,26,2,1,'#be8d84');r(9,28,4,6,fur);r(12,32,20,3,fur);return;}
 const bodyY=stretch?21:pounce?17:walk?17+(f%4===1?-1:0):16;
 const by=bodyY+(rub&&f%4<2?1:0);
 if(side){
  // Side locomotion has four distinct feet and a low, flexible spine.
  const length=stretch?26:pounce?25:22;
  p([[10,by],[16,by-4],[31,by-4],[36,by],[36,by+11],[11,by+11]],ink);r(12,by,24,9,fur);r(16,by-3,15,4,fur);r(13,by+8,22,3,light);
  const feet=[12+(walk?swing:0),18-(walk?swing:0),29-(walk?swing:0),34+(walk?swing:0)+(pounce?f%4:0)];feet.forEach((x,i)=>{r(x,by+8,i%2?3:4,stretch?4:8,fur);r(x,by+(stretch?11:15),4,2,light);});
  r(18,by-2,3,5,stripe);r(25,by-2,3,4,stripe);if(coat===3)r(26,by+3,7,6,stripe);
  const ty=flat?[0,3,-2,4,-3,3,-1,2][f]:swing;
  r(7,by+2,5,4,fur);r(4,by-4+ty,4,10,fur);r(4,by-7+ty,7,4,fur);r(8,by-7+ty,3,3,stripe);
  const hx=stretch?33:30,hy=stretch?by+1:by-10+(pose==='eat'?5+f%2:0);
  head(hx,hy,false);return;
 }
 const tailX=flat?[0,3,-3,2,-2,3,-3,0][f]:swing;
 r(22+tailX,5,4,11,fur);r(20+tailX,3,6,4,fur);r(20+tailX,3,3,3,stripe);
 p([[16,12],[29,12],[33,18],[33,29],[29,33],[16,33],[12,27],[12,19]],ink);r(15,16,15,15,fur);r(17,13,11,5,fur);r(15,28,15,4,light);
 if(coat!==2&&coat!==4){r(17,16,3,7,stripe);r(23,14,3,6,stripe);}if(coat===3)r(26,23,5,6,stripe);
 r(13+(walk?swing:0),28,5,8,fur);r(27-(walk?swing:0),28,5,8,fur);r(13+(walk?swing:0),34,5,2,light);r(27-(walk?swing:0),34,5,2,light);
 head(14,d==='up'?7:19+(pose==='eat'?f%2:0),d==='up');
 if(groom){const py=[31,27,24,22,24,27,30,31][f];r(19,py,5,7,light);}if(rub){r(12,27,3,6,fur);}
 function head(x:number,y:number,back=false){
  if(side){p(flat?[[x-3,y+3],[x+4,y],[x+7,y+4],[x+14,y+3],[x+17,y+6],[x+15,y+15],[x+2,y+16],[x-1,y+12]]:[[x,y+6],[x,y-2],[x+3,y-2],[x+7,y+3],[x+12,y+1],[x+15,y+4],[x+17,y+10],[x+14,y+15],[x+2,y+16],[x-1,y+12]],ink);r(x+1,y+5,14,9,fur);if(!flat){r(x+1,y+1,3,5,fur);r(x+2,y+2,1,3,'#d6a498');}r(x+8,y+11,8,4,light);r(x+15,y+9,2,2,'#bf8c82');r(x+10,y+7,2,pose==='groom'?1:expression==='wary'?2:3,ink);r(x+1,y+7,4,2,stripe);r(x+12,y+14,6,1,'#efe3c8');return;}
  p(flat?[[x-4,y+2],[x+3,y],[x+7,y+4],[x+13,y],[x+20,y+2],[x+17,y+10],[x+14,y+15],[x+2,y+15],[x-1,y+10]]:[[x,y+5],[x,y-3],[x+3,y-3],[x+7,y+2],[x+10,y+2],[x+14,y-3],[x+17,y-3],[x+17,y+11],[x+14,y+15],[x+2,y+15],[x-1,y+10]],ink);
  r(x+1,y+4,15,9,fur);r(x+4,y+12,9,2,light);if(!flat){r(x+1,y,3,5,fur);r(x+13,y,3,5,fur);r(x+2,y,1,3,'#d6a498');r(x+14,y,1,3,'#d6a498');}
  if(back){r(x+6,y+3,2,4,stripe);r(x+11,y+3,2,4,stripe);return;}
  if(coat===2)r(x+6,y+7,6,6,light);if(coat===3)r(x+1,y+5,5,4,stripe);
  const eyes=flat?1:expression==='wary'?2:3;r(x+4,y+7,2,eyes,ink);r(x+12,y+7,2,eyes,ink);r(x+8,y+11,2,2,'#bc8b81');r(x-3,y+11,6,1,'#e8dbc2');r(x+14,y+11,6,1,'#e8dbc2');
 }
}
function atlas(scene:Phaser.Scene,key:string,w:number,h:number,rows:string[],draw:(c:CanvasRenderingContext2D,row:number,f:number)=>void,rates:(row:string)=>number){
 if(scene.textures.exists(key))return;
 const canvas=document.createElement('canvas');canvas.width=w*8;canvas.height=h*rows.length;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;
 for(let row=0;row<rows.length;row++)for(let f=0;f<8;f++){c.save();c.translate(f*w,row*h);draw(c,row,f);c.restore();}
 const texture=scene.textures.addCanvas(key,canvas)!;
 rows.forEach((row,y)=>{for(let f=0;f<8;f++)texture.add(`${row}-${f}`,0,f*w,y*h,w,h);scene.anims.create({key:`${key}-${row}`,frames:Array.from({length:8},(_,i)=>({key,frame:`${row}-${i}`})),frameRate:rates(row),repeat:-1});});
}
export function installOwner(scene:Phaser.Scene,o:Owner){const rows=OWNER_POSES.flatMap(p=>DIRECTIONS.map(d=>`${p}-${d}`));atlas(scene,ownerKey(o),32,48,rows,(c,row,f)=>{const [p,d]=rows[row].split('-');ownerFrame(c,o,p as OwnerPose,d as Direction,f);},r=>r.startsWith('walk')?10:r.startsWith('idle')?2:6);}
export function installCat(scene:Phaser.Scene,coat:number){const rows=EXPRESSIONS.flatMap(e=>CAT_POSES.flatMap(p=>DIRECTIONS.map(d=>`${e}-${p}-${d}`)));atlas(scene,`cat-${coat}`,48,40,rows,(c,row,f)=>{const [e,p,d]=rows[row].split('-');catFrame(c,coat,p as CatPose,d as Direction,f,e);},r=>r.includes('walk')?10:r.includes('sleep')?2:r.includes('pounce')?12:5);}
export function ownerPortrait(o:Owner){const c=document.createElement('canvas');c.width=32;c.height=48;ownerFrame(c.getContext('2d')!,o,'idle','down',0);return c.toDataURL();}
export function catPortrait(coat:number){const c=document.createElement('canvas');c.width=48;c.height=40;catFrame(c.getContext('2d')!,coat,'sit','down',0,'soft');return c.toDataURL();}
