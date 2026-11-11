import Phaser from 'phaser';
import {clockHands,phase,CATALOG,type Save} from './care';
import {type Layout,type Fixture,WINDOW,PANES,plantAnchor} from './world';
export class ApartmentArt{
 private base:Phaser.GameObjects.Graphics;private furnishings:Phaser.GameObjects.Graphics[]=[];
 private exterior:Phaser.GameObjects.Graphics;private frame:Phaser.GameObjects.Graphics;private clock:Phaser.GameObjects.Graphics;private light:Phaser.GameObjects.Graphics;private dust:Phaser.GameObjects.Graphics;private maskShape:Phaser.GameObjects.Graphics;
 private roomLabels:Phaser.GameObjects.Text[]=[];private lastStyle='';private lastPhotos='';private warmth=0;
 constructor(private scene:Phaser.Scene,public layout:Layout,state:Save){
  this.base=scene.add.graphics().setDepth(-100);this.exterior=scene.add.graphics().setDepth(-40);this.frame=scene.add.graphics().setDepth(-30);this.clock=scene.add.graphics().setDepth(-20);this.light=scene.add.graphics().setDepth(5000);this.dust=scene.add.graphics().setDepth(5001);
  this.maskShape=scene.make.graphics({x:0,y:0},false);this.maskShape.fillStyle(0xffffff);for(const p of PANES)this.maskShape.fillRect(p.x,p.y,p.w,p.h);this.exterior.setMask(this.maskShape.createGeometryMask());
  this.build(state);
 }
 build(state:Save){
  for(const label of this.roomLabels)label.destroy();this.roomLabels=[];
  const g=this.base;g.clear();const r=(x:number,y:number,w:number,h:number,color:number,a=1)=>{g.fillStyle(color,a);g.fillRect(x,y,w,h);};
  r(0,0,this.layout.width,this.layout.height,0xe2dfd1);
  const b=this.layout.bounds;r(b.x-12,b.y-14,b.w+24,b.h+30,0x8b775b,.18);r(b.x,b.y,b.w,b.h,0xc8a47b);
  for(let y=b.y;y<b.y+b.h;y+=32)for(let x=b.x;x<b.x+b.w;x+=64){const xx=x+((y/32)%2?0:32);r(xx,y,64,1,0xac865f);r(xx,y+1,1,31,0xac865f);r(xx+8,y+14,24,1,0xe4c399,.4);r(xx+31,y+23,16,1,0xae875f,.3);}
  // North walls are visibly tall; the floor is a true two-dimensional walking surface.
  r(b.x,24,b.w,120,0xe3d4b4);r(b.x,24,b.w,8,0xf6e7c4);r(b.x,136,b.w,8,0x9b805b);r(b.x-24,24,24,b.h+120,0xc0ac88);r(b.x-24,24,24,8,0xeadbbe);r(b.x+b.w,24,24,b.h+120,0xb9a27f);
  for(let x=b.x+10;x<b.x+b.w;x+=28){r(x,37,1,92,0xc8b18c,.45);r(x+11,61,2,4,0xbca67c,.35);}
  r(b.x,b.y+b.h,b.w,12,0x8c7354);r(b.x,b.y+b.h+12,b.w,6,0xc6af88);
  const rug=CATALOG.find(i=>i.id===state.equipped.rug)?.color??0xa8af80;
  r(96,256,288,240,rug);r(103,263,274,226,0xe8d8b5);r(109,269,262,214,rug);
  for(let x=97;x<384;x+=10){r(x,251,3,5,0xe3d2ad);r(x,496,3,5,0xe3d2ad);}for(let x=124;x<366;x+=34){r(x,279,6,2,0xe7d8b5);r(x,470,6,2,0xe7d8b5);}
  r(336,b.y+b.h-43,96,27,0xb89a72);r(342,b.y+b.h-38,84,17,0xcbb28b);r(440,b.y+b.h-32,12,6,0x7b876d);r(458,b.y+b.h-32,12,6,0x7b876d);
  this.extraFloors(g);
  for(const old of this.furnishings)old.destroy();this.furnishings=[];
  for(const f of this.layout.fixtures){const fg=this.scene.add.graphics().setDepth(f.rect.y+f.rect.h);this.drawFixture(fg,f,state);this.furnishings.push(fg);}
  const phone=this.scene.add.graphics().setDepth(433);phone.fillStyle(0x465755);phone.fillRoundedRect(179,352,14,25,3);phone.fillStyle(0xa6c6b9);phone.fillRect(181,355,10,17);this.furnishings.push(phone);
  this.drawWindowFrame();this.lastStyle=JSON.stringify(state.equipped);this.lastPhotos=JSON.stringify(state.mystery.photos);
 }
 private extraFloors(g:Phaser.GameObjects.Graphics){
  g.fillStyle(0xdad8bd);g.fillRect(528,144,368,352);
  for(let y=144;y<496;y+=32)for(let x=528;x<896;x+=32){g.fillStyle((x/32+y/32)%2?0xe4e0c9:0xd0d3bc);g.fillRect(x+1,y+1,30,30);}
  g.fillStyle(0xbdb58f,.23);g.fillRect(544,528,352,208);
  g.fillStyle(0xc3b797);g.fillRect(96,536,352,168);g.lineStyle(3,0xe5d5b2);g.strokeRect(102,542,340,156);
  g.fillStyle(0xa3b091);g.fillRect(688,560,48,144);g.lineStyle(2,0xe6dbbd);g.strokeRect(693,565,38,134);
 }
 private drawFixture(g:Phaser.GameObjects.Graphics,f:Fixture,state:Save){
  const {x,y,w,h}=f.rect,z=f.height;
  const r=(a:number,b:number,c:number,d:number,col:number,alpha=1)=>{g.fillStyle(col,alpha);g.fillRect(a,b,c,d);};
  const ellipse=(cx:number,cy:number,ww:number,hh:number,col:number,a=1)=>{g.fillStyle(col,a);g.fillEllipse(cx,cy,ww,hh);};
  if(f.kind==='cabinet'){r(x,y-z,w,h+z,0x8b6c48);r(x+4,y-z+4,w-8,h+z-8,0xc6a97c);r(x+8,y-z+8,w-16,22,0x8c7150);r(x+8,y-z+35,w-16,29,0x8c7150);for(let yy=y-z+65;yy<y+h-6;yy+=6)r(x+8,yy,w-16,2,0x9d8058);r(x+18,y-z+14,13,8,0x82c7d0);r(x+18,y-z+43,12,14,0xd6b57e);r(x+5,y+h-4,5,9,0x6d5841);r(x+w-10,y+h-4,5,9,0x6d5841);return;}
  if(f.kind==='fridge'){r(x,y-z,w,h+z,0x929d88);r(x+3,y-z+3,w-6,h+z-8,0xdde2c9);r(x+5,y-z+42,w-10,2,0xabb69b);r(x+7,y-z+52,3,26,0x89957d);r(x+15,y-z+60,26,34,0xf9e9bb);r(x+24,y-z+57,8,6,0xc88875);for(let i=0;i<3;i++)r(x+19,y-z+69+i*6,15-i*2,1,0xb5ac82);for(let i=0;i<Object.keys(state.mystery.photos).length;i++){r(x+12+i*10,y-z+101,8,12,0xfcf2d6);r(x+13+i*10,y-z+102,6,7,[0x8db5ad,0x9eac7d,0xc79c7d][i]);}return;}
  if(f.kind==='wall'){r(x,y-z,w,h+z,0xbfb294);r(x,y-z,w,7,0xeee0bf);r(x,y+h-6,w,6,0x8c7959);return;}
  r(x+5,y+h-8,w,h>80?20:15,0x6c5843,.14);
  if(f.kind==='sofa'){
   r(x,y-z,w,19,0x7d8d70);r(x+5,y-z+4,w-10,12,0xa0af8f);
   r(x+12,y-z+20,w-24,h-25,0xb4c09f);r(x+16,y-z+24,w/2-20,h-33,0xc2caae);r(x+w/2+4,y-z+24,w/2-20,h-33,0xc2caae);
   r(x+10,y+h-z-5,w-20,z,0x90a27d);r(x+15,y+h-z+2,w-30,2,0xb5c39e);
   r(x,y-z+17,12,h+z-18,0x8a9d78);r(x+w-12,y-z+17,12,h+z-18,0x8a9d78);r(x+2,y-z+17,8,5,0xb7c2a0);r(x+w-10,y-z+17,8,5,0xb7c2a0);
   r(x+13,y+h-3,7,9,0x795f45);r(x+w-20,y+h-3,7,9,0x795f45);
   r(x+23,y-z+25,25,19,0xd2b58e);r(x+w-49,y-z+25,25,19,0xc5907e);return;
  }
  if(f.kind==='bench'){
   r(x,y-z,w,h,0xe8d1a6);r(x,y+h-z,w,z,0xb58e65);r(x+8,y+h-z+8,w-16,z-14,0xc7a477);r(x+12,y-z+6,w-24,h-12,CATALOG.find(i=>i.id===state.equipped.cushion)?.color??0xc2917b);r(x+17,y-z+10,w-34,3,0xe6c5a0);return;
  }
  if(f.kind==='table'||f.kind==='plantTable'){
   r(x+8,y+h-z,8,z,0x8b6849);r(x+w-16,y+h-z,8,z,0x8b6849);r(x,y-z,w,h,0xc19b6b);r(x+3,y-z+3,w-6,h-6,0xd3b37f);r(x,y+h-z,w,7,0xa68057);r(x+8,y-z+14,w-16,1,0xe2c28e);
   if(f.kind==='plantTable'){const a=plantAnchor(f);this.plant(g,a.x,a.y,state.equipped.plant==='palm'?0x5e8660:0x75905b);}
   else{r(x+18,y-z+11,39,28,0x8d9f81);r(x+21,y-z+13,33,23,0xe7d8b8);r(x+19,y-z+10,36,4,0x9aa78a);ellipse(x+w-24,y-z+24,17,14,0xece0c4);ellipse(x+w-24,y-z+22,12,8,0x9b7658);g.lineStyle(2,0xece0c4);g.strokeCircle(x+w-14,y-z+23,4);if(f.id==='coffee-table'){r(x+57,y-z+17,17,24,0xc3a47d);r(x+55,y-z+15,21,5,0x8a9c78);r(x+59,y-z+25,13,10,0xe7d9b9);r(x+63,y-z+27,5,6,0xb58a5b);}}return;
  }
  if(f.kind==='bookcase'){
   r(x,y-z,w,h+z,0x8b7051);r(x+5,y-z+5,w-10,h+z-10,0xac8e65);r(x+9,y-z+10,w-18,h+z-20,0x8b7453);
   const colors=[0x8d9d7c,0xb48067,0xcfb583,0x7b9690,0xa18b87],rows=Math.max(2,Math.floor((h+z-12)/32));
   for(let j=0;j<rows;j++){const yy=y-z+15+j*30;for(let i=0;i<Math.floor((w-20)/12);i++){const hh=16+(i%3)*3;r(x+11+i*12,yy+20-hh,9,hh,colors[(i+j)%5]);r(x+13+i*12,yy+22-hh,5,2,0xe8d7b5);}r(x+6,yy+22,w-12,4,0x715c42);r(x+6,yy+22,w-12,1,0xd0b28b);}r(x,y-z,w,5,0xd0b28b);return;
  }
  if(f.kind==='bowls'){
   r(x-3,y-3,w+6,h+6,0xc7b08a);ellipse(x+w/2,y+h/2+4,50,24,f.id==='water'?0x83a39b:0xb98d67);ellipse(x+w/2,y+h/2,44,20,f.id==='water'?(state.water?0x92c0bc:0x9ba998):(state.food?0x866249:0xa78b6a));
   if(f.id==='food'&&state.food)for(let i=0;i<8;i++)r(x+17+(i*9)%30,y+9+(i*3)%10,4,3,0xbe935f);
   if(f.id==='water'&&state.water)r(x+20,y+9,15,2,0xe1e8d0);return;
  }
  if(f.kind==='tools'){
   r(x,y-z,w,h,0x8e7553);r(x+3,y-z+3,w-6,h-6,0xc3ad85);r(x,y+h-z,w,z,0xa1845c);r(x+12,y-z+10,14,22,0xb8ba95);r(x+16,y-z+30,5,21,0x806b48);for(let i=0;i<4;i++)r(x+13+i*3,y-z+8,1,8,0x727c59);
   return;
  }
  if(f.kind==='counter'){
   r(x,y-z,w,h,0xc2c7ae);r(x+3,y-z+3,w-6,h-6,0xe5e0c7);r(x,y+h-z,w,z,0xa1ad8d);
   for(let xx=x+4;xx+43<x+w;xx+=48){r(xx,y+h-z+4,43,z-9,0xb5c1a1);r(xx+16,y+h-z+8,11,2,0x7e8c70);}
   r(x+16,y-z+8,68,30,0x9caea6);r(x+22,y-z+12,56,21,0x7c938b);r(x+48,y-z+3,5,13,0xd1d7c3);
   r(x+128,y-z+7,67,33,0x606d60);for(let i=0;i<4;i++)ellipse(x+145+i%2*32,y-z+16+Math.floor(i/2)*15,17,11,0x91a08b);
   r(x+w-43,y-z+15,24,20,0xc8ab80);r(x+w-40,y-z+19,18,2,0xe4caa2);return;
  }
  if(f.kind==='bed'){
   r(x-8,y-z-24,w+16,34,0x92734f);r(x-3,y-z-20,w+6,24,0xc1a277);r(x,y-z,w,h,0xe5dcc0);r(x+8,y-z+8,w-16,34,0xf3ead5);r(x+12,y-z+45,w-24,h-52,0x9da88a);r(x+12,y-z+50,w-24,10,0xc7cbb0);r(x,y+h-z,w,z,0xa08057);r(x+4,y+h-z+4,w-8,13,0xc2a47d);r(x+7,y+h-3,12,14,0x7c6548);r(x+w-19,y+h-3,12,14,0x7c6548);return;
  }
  if(f.kind==='chair'){
   r(x,y-z,w,19,0x8b9b79);r(x+5,y-z+4,w-10,12,0xb9c3a3);r(x+10,y-z+22,w-20,h-28,0xc4ceb0);r(x+9,y+h-z-5,w-18,z,0x9eae88);
   r(x,y-z+18,10,h+z-19,0x8fa37d);r(x+w-10,y-z+18,10,h+z-19,0x8fa37d);r(x+11,y+h-3,6,9,0x7b6548);r(x+w-17,y+h-3,6,9,0x7b6548);return;
  }
 }
 private plant(g:Phaser.GameObjects.Graphics,x:number,y:number,color:number){
  g.fillStyle(0xaf7f5c);g.fillRect(x-13,y-23,26,23);g.fillStyle(0xcf9f78);g.fillRect(x-16,y-26,32,7);g.fillStyle(0x6f7f4e);g.fillRect(x-2,y-69,4,45);
  for(let j=0;j<4;j++){g.fillStyle(color);g.fillRect(x-25+j*4,y-35-j*12,23-j*2,7);g.fillRect(x+2,y-42-j*12,23-j*2,7);}
 }
 private drawWindowFrame(){
  const g=this.frame;
  // Only frame rails are painted over the sky, never a full opaque pane rectangle.
  g.clear();g.lineStyle(8,0x8c7454);g.strokeRect(WINDOW.x-3,WINDOW.y-3,WINDOW.w+6,WINDOW.h+6);g.lineStyle(6,0xf1e4c2);g.strokeRect(WINDOW.x+3,WINDOW.y+3,WINDOW.w-6,WINDOW.h-6);g.fillStyle(0xf1e4c2);g.fillRect(PANES[0].x+PANES[0].w,43,12,82);g.fillRect(WINDOW.x+4,78,WINDOW.w-8,10);g.fillStyle(0xf5e5bf);g.fillRect(WINDOW.x-8,129,WINDOW.w+16,7);g.fillStyle(0xb3976d);g.fillRect(WINDOW.x-2,136,WINDOW.w+4,4);
 }
 update(time:number,delta:number,state:Save){
  if(this.lastStyle!==JSON.stringify(state.equipped)||this.lastPhotos!==JSON.stringify(state.mystery.photos))this.build(state);
  const t=state.reducedMotion?0:time,g=this.exterior;g.clear();g.fillStyle((state.rain||state.adventure.active?.kind==='storm')?0xa5b8b6:state.minutes>=1050?0xb49eaa:0xb1cfca);g.fillRect(WINDOW.x,WINDOW.y,WINDOW.w,WINDOW.h);
  for(let i=0;i<9;i++){const x=WINDOW.x+4+i*30,y=92+(i%3)*8;g.fillStyle(i%2?0x819e99:0x95b0a4);g.fillRect(x,y,29,45);g.fillStyle(0xd7d8b8);g.fillRect(x+6,y+8,4,5);g.fillRect(x+18,y+8,4,5);}
  const birdX=WINDOW.x-20+(t/38)%(WINDOW.w+40),birdY=60+Math.sin(t/850)*9;g.fillStyle(0x5f7d76);g.fillRect(Math.round(birdX),Math.round(birdY),4,2);g.fillRect(Math.round(birdX)-4,Math.round(birdY)+(Math.floor(t/180)%2?-2:2),4,2);g.fillRect(Math.round(birdX)+4,Math.round(birdY)+(Math.floor(t/180)%2?-2:2),4,2);
  if(state.adventure.active?.kind==='bird'||state.mystery.kind==='sunbeam'&&state.mystery.solved){const x=244,y=109;g.fillStyle(0x6d8279);g.fillRect(x-8,y-7,16,9);g.fillRect(x+3,y-12,8,8);g.fillStyle(0xe6c18a);g.fillRect(x+11,y-9,4,3);g.fillStyle(0xe4d7b8);g.fillRect(x-5,y-3,9,4);g.fillStyle(0x455e54);g.fillRect(x+8,y-11,2,2);g.fillRect(x-11,y-3,5,3);g.fillRect(x-4,y+2,2,4);g.fillRect(x+2,y+2,2,4);}
  if(state.rain||state.adventure.active?.kind==='storm'){g.lineStyle(1,0xe2e9dc,.45);for(let i=0;i<35;i++){const x=WINDOW.x+4+i*19%(WINDOW.w-8),y=44+(i*13+t/28)%80;g.lineBetween(x,y,x-2,y+7);}}
  this.drawClock(state.minutes);
  const light=this.light;light.clear();const target=state.minutes>990?Math.min(.24,(state.minutes-990)/1500):0;this.warmth=Phaser.Math.Linear(this.warmth,target,Math.min(1,delta/1500));light.fillStyle(0x655971,this.warmth);light.fillRect(0,0,this.layout.width,this.layout.height);
  if(state.minutes>1000){for(let i=5;i>0;i--){light.fillStyle(0xffd49b,.015*i);light.fillCircle(864,300,22+i*14);}}
  this.dust.clear();for(let i=0;i<16;i++){this.dust.fillStyle(0xffedb8,.14);this.dust.fillRect(176+(i*31+t/250)%270,180+(i*67+t/400)%410,2,2);}
 }
 private drawClock(minutes:number){
  const g=this.clock;g.clear();const x=832,y=86;g.fillStyle(0x92714f);g.fillCircle(x,y,29);g.fillStyle(0xf1e5c6);g.fillCircle(x,y,25);
  g.fillStyle(0x9b9c7e);for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillRect(Math.round(x+Math.sin(a)*21)-1,Math.round(y-Math.cos(a)*21)-1,2,2);}
  const hands=clockHands(minutes),hand=(degrees:number,length:number,width:number)=>{const rad=degrees*Math.PI/180;g.lineStyle(width,0x637259);g.lineBetween(x,y,Math.round(x+Math.sin(rad)*length),Math.round(y-Math.cos(rad)*length));};hand(hands.hour,13,3);hand(hands.minute,20,2);g.fillStyle(0x637259);g.fillCircle(x,y,3);
 }
}
