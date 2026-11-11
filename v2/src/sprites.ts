import type Phaser from 'phaser';
import type { Pose } from './model';
export const POSES:Pose[]=['walk','sit','sleep','groom','stretch','pounce','hop','eat','drink','crouch','hide'];
export const EXPRESSIONS=['soft','flat','wary'] as const;
export type Expression=typeof EXPRESSIONS[number];
export const COLORS=[
 ['#d89355','#f4c68a','#9a613c','#ffe0ad'],['#90715a','#c9aa80','#5c4b40','#e3caa0'],
 ['#42464c','#f2e9d7','#282c31','#fff3dd'],['#e9dcc2','#ca8e58','#554a43','#f6ecd5'],
 ['#454b55','#707782','#2b3039','#8e949c'],['#dcc29b','#f2dfba','#a88d6f','#fff0cd'],
];
const W=64,H=48,FRAMES=8;
export function spriteSheet(coat:number):HTMLCanvasElement{
 const canvas=document.createElement('canvas');canvas.width=W*FRAMES;canvas.height=H*POSES.length*EXPRESSIONS.length;
 const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
 for(let expression=0;expression<3;expression++)for(let pose=0;pose<POSES.length;pose++)for(let frame=0;frame<FRAMES;frame++){
   ctx.save();ctx.translate(frame*W,(expression*POSES.length+pose)*H);drawPose(ctx,coat,POSES[pose],frame,EXPRESSIONS[expression]);ctx.restore();
 }
 return canvas;
}
// Each cell is rasterized from distinct pixel poses: separate limbs, head,
// spine, eyes, ears and jointed tail. Animation never scales a single flat cat.
function drawPose(c:CanvasRenderingContext2D,coat:number,pose:Pose,f:number,expression:Expression){
 const [fur,light,stripe,shine]=COLORS[coat],outline='#433e38';
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
 const poly=(points:number[][],color:string)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
 const tail=(points:number[][])=>{c.lineJoin='miter';c.lineCap='square';c.strokeStyle=outline;c.lineWidth=5;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.stroke();c.strokeStyle=fur;c.lineWidth=3;c.stroke();const [x,y]=points[points.length-1];r(x-1,y-1,3,3,stripe);};
 const head=(x:number,y:number,eyes:'open'|'closed'|'wide'='open',down=false)=>{
   const flat=expression==='flat',wary=expression==='wary';
   poly(flat?[[x-4,y+5],[x+2,y+3],[x+6,y+6],[x+12,y+6],[x+18,y+3],[x+23,y+5],[x+18,y+10],[x+18,y+16],[x+15,y+19],[x+2,y+19],[x-1,y+15],[x-1,y+10]]:[[x,y+6],[x,y-2],[x+3,y-2],[x+7,y+3],[x+12,y+3],[x+16,y-2],[x+19,y-2],[x+19,y+16],[x+16,y+19],[x+2,y+19],[x-1,y+15]],outline);
   poly(flat?[[x-2,y+5],[x+3,y+6],[x+6,y+8],[x+13,y+8],[x+19,y+5],[x+18,y+9],[x+17,y+15],[x+14,y+17],[x+3,y+17],[x,y+13],[x,y+9]]:[[x+1,y+6],[x+1,y+1],[x+6,y+5],[x+12,y+5],[x+17,y+1],[x+17,y+14],[x+14,y+17],[x+3,y+17],[x,y+13]],fur);
   if(!flat){r(x+2,y+2,2,3,'#d6a092');r(x+14,y+2,2,3,'#d6a092');}else{r(x-1,y+4,4,2,'#d6a092');r(x+15,y+4,4,2,'#d6a092');}
   r(x+1,y+13,16,3,light);r(x+5,y+16,8,2,shine);
   if(coat<2){r(x+7,y+4,2,4,stripe);r(x+11,y+4,2,3,stripe);r(x,y+10,3,2,stripe);r(x+15,y+10,3,2,stripe);}
   if(coat===2){poly([[x+8,y+9],[x+11,y+13],[x+14,y+16],[x+4,y+16]],light);}
   if(coat===3){r(x+1,y+5,5,6,stripe);r(x+13,y+4,4,5,light);}
   if(eyes==='closed'||(f===7&&pose==='sit')){r(x+3,y+10,4,1,outline);r(x+12,y+10,4,1,outline);}
   else{const h=eyes==='wide'?4:flat?1:wary?2:3;r(x+4,y+9,3,h,'#b6c08a');r(x+13,y+9,3,h,'#b6c08a');r(x+5,y+9,1,h,outline);r(x+14,y+9,1,h,outline);if(!wary){r(x+4,y+9,1,1,shine);r(x+13,y+9,1,1,shine);}}
   r(x+9,y+13,2,2,'#bc8179');if(!down)r(x+9,y+15,1,1,outline);
   r(x-3,y+13,5,1,'#e5dac4');r(x+16,y+13,6,1,'#e5dac4');
 };
 const phase=f%4; const swing=[-3,0,3,0][phase];
 if(pose==='sleep'||pose==='hide'){
   const breath=f<4?0:1;
   poly([[14,31-breath],[20,26-breath],[39,26-breath],[46,30],[48,39],[43,43],[18,43],[13,39]],outline);
   r(17,30-breath,25,11+breath,fur);r(22,28-breath,16,3,fur);r(19,39,23,2,light);r(21,31,3,5,stripe);r(28,29,3,5,stripe);
   head(35,23+breath,'closed',true);tail([[17,36],[12,40],[19,44],[36,44],[40,41]]);
   return;
 }
 if(pose==='walk'){
   const bob=f%4===1||f%4===3?0:-1;
   tail([[16,28+bob],[10,24+bob],[8+(f%4===1?1:0),14],[12,10+swing]]);
   const feet=[[22+swing,35,3,6],[40-swing,34,3,7],[18-swing,34,4,8],[45+swing,34,4,8]];
   feet.slice(0,2).forEach(([x,y,w,h])=>r(x,y+bob,w,h,stripe));
   poly([[16,25+bob],[21,21+bob],[39,22+bob],[46,27+bob],[47,35+bob],[18,37+bob]],outline);
   r(18,25+bob,26,10,fur);r(23,23+bob,15,3,fur);r(20,33+bob,23,3,light);
   feet.slice(2).forEach(([x,y,w,h])=>{r(x,y+bob,w,h,fur);r(x-1,y+h-1,6,2,light);});
   r(23,24+bob,3,5,stripe);r(30,24+bob,3,4,stripe);if(coat===3)r(34,26+bob,7,7,stripe);
   head(39,13+bob+(phase===2?1:0));return;
 }
 if(pose==='stretch'){
   const rise=[0,1,2,3,3,2,1,0][f];
   tail([[16,25-rise],[10,21-rise],[10,12-rise],[14,9-rise]]);
   poly([[14,27-rise],[19,23-rise],[30,27],[43,34],[49,36],[47,40],[28,38],[16,34]],outline);
   poly([[16,27-rise],[22,25-rise],[31,30],[44,36],[44,38],[28,36],[17,32]],fur);
   r(15,32-rise,4,10+rise,fur);r(40,38,16,3,light);head(40,24+Math.floor(rise/2),'closed');return;
 }
 if(pose==='pounce'||pose==='hop'){
   const reach=[0,2,5,8,8,5,2,0][f];
   tail([[15,27],[8,25],[4,20-reach/2],[7,16-reach/2]]);
   poly([[14,27],[21,22],[36,22],[44,28],[42,35],[17,35]],outline);r(17,25,24,8,fur);r(21,23,14,3,fur);r(22,26,3,5,stripe);
   r(15-reach/2,33,5,8-reach/2,fur);r(40,32,5+reach,4,fur);r(43+reach,33,6,3,light);
   head(39,13,pose==='pounce'?'wide':'open');return;
 }
 if(pose==='crouch'){
   tail([[17,34],[10,30],[6,30+swing],[3,34+swing]]);
   poly([[15,31],[22,28],[37,27],[45,31],[45,39],[15,40]],outline);r(18,31,26,7,fur);r(23,29,12,3,fur);r(17,38,31,3,light);head(37,22,'wide');return;
 }
 // Sitting has a tall chest and folded hind legs. Grooming lifts a paw to the face.
 const groom=pose==='groom',eat=pose==='eat'||pose==='drink';
 const tilt=groom?[0,1,2,1,0,-1,-2,-1][f]:eat?[0,1,2,2,1,0,1,0][f]:0;
 const tx=expression==='flat'?[6,10,5,12,4,11,5,9][f]:[9,10,11,12,12,11,10,9][f];
 tail([[20,37],[13,39],[9,35],[tx,28],[tx+3,25]]);
 poly([[18,39],[18,30],[22,24],[25,22],[27,17],[40,17],[43,27],[45,38],[42,43],[21,43]],outline);
 poly([[21,38],[20,31],[25,26],[28,20],[38,20],[41,28],[42,39],[39,41],[23,41]],fur);
 r(29,28,9,12,light);r(22,32,4,5,stripe);r(22,39,7,3,light);r(38,39,8,3,light);
 if(coat===2)r(28,27,11,12,light);if(coat===3)r(21,28,7,8,stripe);
 const hy=eat?22+tilt:8+tilt,hx=eat?39:28;
 head(hx,hy,groom&&f%4<2?'closed':'open',eat);
 if(groom){const py=[28,23,18,17,20,24,28,31][f];r(33,py,5,12,fur);r(33,py,5,3,light);if(f===2||f===3)r(39,23,2,3,'#d49c96');}
 if(eat){r(45,39,4,3,light);if(pose==='drink'&&f%3===1)r(53,40,2,3,'#d49c96');}
}
export function installSprites(scene:Phaser.Scene){
 for(let coat=0;coat<6;coat++){
   const key=`cat-${coat}`,canvas=spriteSheet(coat),texture=scene.textures.addCanvas(key,canvas)!;
   for(let e=0;e<3;e++)for(let p=0;p<POSES.length;p++)for(let f=0;f<8;f++)texture.add(`${EXPRESSIONS[e]}-${POSES[p]}-${f}`,0,f*W,(e*POSES.length+p)*H,W,H);
   for(const expression of EXPRESSIONS)for(const pose of POSES)scene.anims.create({key:`${key}-${expression}-${pose}`,frames:Array.from({length:8},(_,i)=>({key,frame:`${expression}-${pose}-${i}`})),frameRate:expression==='flat'&&pose==='sit'?10:pose==='walk'?10:pose==='pounce'||pose==='hop'?14:pose==='sleep'?2:pose==='sit'?3:6,repeat:-1});
 }
}
export function portrait(coat:number):string{const sheet=spriteSheet(coat),canvas=document.createElement('canvas');canvas.width=64;canvas.height=48;canvas.getContext('2d')!.drawImage(sheet,0,48,64,48,0,0,64,48);return canvas.toDataURL();}
