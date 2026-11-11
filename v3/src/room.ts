import Phaser from 'phaser';
import {clockHands,phase,CATALOG,type Save} from './care';
import {type Layout,type Fixture,WINDOW,PANES,plantAnchor} from './world';
export class ApartmentArt{
 private base:Phaser.GameObjects.Graphics;private furnishings:Phaser.GameObjects.Graphics[]=[];
 private exterior:Phaser.GameObjects.Graphics;private frame:Phaser.GameObjects.Graphics;private clock:Phaser.GameObjects.Graphics;private light:Phaser.GameObjects.Graphics;private dust:Phaser.GameObjects.Graphics;private maskShape:Phaser.GameObjects.Graphics;
 private roomLabels:Phaser.GameObjects.Text[]=[];private lastStyle='';private warmth=0;
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
  r(284,378,328,220,0x947858,.16);r(280,372,328,220,rug);r(290,382,308,200,0xe7d5af);r(297,389,294,186,rug);
  for(let x=281;x<608;x+=10){r(x,367,3,5,0xe2d0a8);r(x,592,3,5,0xe2d0a8);}for(let x=314;x<580;x+=36){r(x,402,7,3,0xe6d8b6);r(x+8,555,7,3,0xe6d8b6);}
  // A welcome mat and small shoe pair make this feel like a lived-in home.
  r(336,b.y+b.h-58,160,38,0xae916d);r(342,b.y+b.h-53,148,28,0xc0a57e);r(344,b.y+b.h-52,143,2,0xdfc59d);r(514,b.y+b.h-37,16,7,0x77816a);r(536,b.y+b.h-37,16,7,0x77816a);
  if(this.layout.expanded)this.extraFloors(g);
  for(const old of this.furnishings)old.destroy();this.furnishings=[];
  for(const f of this.layout.fixtures){const fg=this.scene.add.graphics().setDepth(f.rect.y+f.rect.h);this.drawFixture(fg,f,state);this.furnishings.push(fg);}
  this.drawWindowFrame();this.lastStyle=JSON.stringify(state.equipped);
 }
 private extraFloors(g:Phaser.GameObjects.Graphics){
  g.fillStyle(0xdcd5bb);g.fillRect(1024,144,832,496);
  for(let y=144;y<640;y+=32)for(let x=1024;x<1856;x+=32){g.fillStyle((x/32+y/32)%2?0xe6dfc8:0xd0d1b9);g.fillRect(x+1,y+1,30,30);}
  g.fillStyle(0xb9b08b,.32);g.fillRect(1024,736,832,544);
  g.fillStyle(0xa9b198);g.fillRect(1344,912,144,256);g.lineStyle(4,0xe5d9b9);g.strokeRect(1351,920,130,240);
  g.fillStyle(0xc7b598);g.fillRect(112,976,688,256);g.lineStyle(5,0xebd5ae);g.strokeRect(120,984,672,240);
  const label=(text:string,x:number,y:number)=>{const t=this.scene.add.text(x,y,text,{fontFamily:'Georgia',fontSize:'17px',color:'#9b987f'}).setDepth(-70).setAlpha(.55);this.roomLabels.push(t);};
  label('the kitchen',1570,560);label('a quiet corner',480,1210);label('sweet dreams',1635,1220);
 }
 private drawFixture(g:Phaser.GameObjects.Graphics,f:Fixture,state:Save){
  const {x,y,w,h}=f.rect,z=f.height;
  const r=(a:number,b:number,c:number,d:number,col:number,alpha=1)=>{g.fillStyle(col,alpha);g.fillRect(a,b,c,d);};
  const ellipse=(cx:number,cy:number,ww:number,hh:number,col:number,a=1)=>{g.fillStyle(col,a);g.fillEllipse(cx,cy,ww,hh);};
  if(f.kind==='wall'){r(x,y-z,w,h+z,0xbfb294);r(x,y-z,w,7,0xeee0bf);r(x,y+h-6,w,6,0x8c7959);return;}
  r(x+5,y+h-8,w,h>80?20:15,0x6c5843,.14);
  if(f.kind==='sofa'){
   r(x,y-z,w,38,0x7c8b6c);r(x+8,y-z+5,w-16,29,0x9fab8b);r(x+18,y-z+38,w-36,h-43,0xb5bd9d);r(x+22,y-z+44,w/2-28,h-56,0xc1c6a7);r(x+w/2+4,y-z+44,w/2-28,h-56,0xc1c6a7);
   r(x+18,y+h-z-5,w-36,z,0x91a17f);r(x+25,y+h-z+2,w-50,3,0xb5c19b);r(x,y-z+29,21,h+z-30,0x8a9b78);r(x+w-21,y-z+29,21,h+z-30,0x8a9b78);r(x+3,y-z+29,15,8,0xb1bd98);r(x+w-18,y-z+29,15,8,0xb1bd98);r(x+20,y+h-7,9,14,0x775f46);r(x+w-29,y+h-7,9,14,0x775f46);
   r(x+34,y-z+49,41,31,0xd4b58b);r(x+w-76,y-z+50,40,30,0xc48d76);return;
  }
  if(f.kind==='bench'){
   r(x,y-z,w,h,0xe8d1a6);r(x,y+h-z,w,z,0xb58e65);r(x+8,y+h-z+8,w-16,z-14,0xc7a477);r(x+12,y-z+6,w-24,h-12,CATALOG.find(i=>i.id===state.equipped.cushion)?.color??0xc2917b);r(x+17,y-z+10,w-34,3,0xe6c5a0);return;
  }
  if(f.kind==='table'||f.kind==='plantTable'){
   r(x+8,y+h-z,8,z,0x8b6849);r(x+w-16,y+h-z,8,z,0x8b6849);r(x,y-z,w,h,0xc19b6b);r(x+3,y-z+3,w-6,h-6,0xd3b37f);r(x,y+h-z,w,7,0xa68057);r(x+8,y-z+14,w-16,1,0xe2c28e);
   if(f.kind==='plantTable'){const a=plantAnchor(f);this.plant(g,a.x,a.y,state.equipped.plant==='palm'?0x5e8660:0x75905b);}
   else{r(x+18,y-z+11,39,28,0x8d9f81);r(x+21,y-z+13,33,23,0xe7d8b8);r(x+19,y-z+10,36,4,0x9aa78a);ellipse(x+w-24,y-z+24,17,14,0xece0c4);ellipse(x+w-24,y-z+22,12,8,0x9b7658);g.lineStyle(2,0xece0c4);g.strokeCircle(x+w-14,y-z+23,4);if(f.id==='coffee-table'){r(x+57,y-z+30,19,25,0xc3a47d);r(x+55,y-z+27,23,6,0x8a9c78);r(x+60,y-z+37,13,11,0xe7d9b9);r(x+64,y-z+39,5,7,0xb58a5b);}}return;
  }
  if(f.kind==='bookcase'){
   r(x,y-z,w,h+z,0x8b6f4d);r(x+7,y-z+6,w-14,h+z-12,0xb59568);r(x+11,y-z+12,w-22,h+z-26,0x887250);
   const colors=[0x859774,0xb67d5c,0xc9af7c,0x748e88,0x9c8380];
   for(let shelf=0;shelf<3;shelf++){const yy=y-z+22+shelf*41;for(let i=0;i<Math.floor((w-24)/15);i++){const hh=20+(i%3)*4;r(x+14+i*15,yy+28-hh,11,hh,colors[(i+shelf)%5]);r(x+16+i*15,yy+30-hh,7,2,0xe5d3ac);}r(x+8,yy+30,w-16,5,0x6e573d);r(x+8,yy+30,w-16,2,0xd3b381);}r(x,y-z,w,6,0xd4b688);return;
  }
  if(f.kind==='bowls'){
   r(x-3,y-3,w+6,h+6,0xc7b08a);ellipse(x+w/2,y+h/2+4,50,24,f.id==='water'?0x83a39b:0xb98d67);ellipse(x+w/2,y+h/2,44,20,f.id==='water'?(state.water?0x92c0bc:0x9ba998):(state.food?0x866249:0xa78b6a));
   if(f.id==='food'&&state.food)for(let i=0;i<8;i++)r(x+17+(i*9)%30,y+9+(i*3)%10,4,3,0xbe935f);
   if(f.id==='water'&&state.water)r(x+20,y+9,15,2,0xe1e8d0);return;
  }
  if(f.kind==='tools'){
   r(x,y-z,w,h,0x8e7553);r(x+3,y-z+3,w-6,h-6,0xc3ad85);r(x,y+h-z,w,z,0xa1845c);r(x+12,y-z+10,14,22,0xb8ba95);r(x+16,y-z+30,5,21,0x806b48);for(let i=0;i<4;i++)r(x+13+i*3,y-z+8,1,8,0x727c59);
   g.lineStyle(3,0x957348);g.lineBetween(x+35,y-z+48,x+53,y-z+13);r(x+40,y-z+38,7,13,0xb0a97c);return;
  }
  if(f.kind==='counter'){
   r(x,y-z,w,h,0xc3c0a3);r(x+3,y-z+3,w-6,h-6,0xe3dec4);r(x,y+h-z,w,z,0x98a080);
   for(let xx=x+4;xx<x+w;xx+=64){r(xx,y+h-z+5,57,z-12,0xaeb493);r(xx+20,y+h-z+11,16,3,0x79846b);}
   r(x+26,y-z+7,87,44,0x9aa9a1);r(x+33,y-z+12,73,31,0x788e87);r(x+69,y-z+2,7,13,0xd6d6bd);r(x+186,y-z+8,112,47,0x5a6458);for(let i=0;i<4;i++)ellipse(x+210+i%2*48,y-z+20+Math.floor(i/2)*22,26,17,0x879280);
   r(x+w-96,y-z+15,60,30,0xc7a778);r(x+w-88,y-z+21,43,3,0x9f7c55);this.plant(g,x+w-145,y-z+32,0x7e925b);return;
  }
  if(f.kind==='bed'){
   r(x-8,y-z-24,w+16,34,0x92734f);r(x-3,y-z-20,w+6,24,0xc1a277);r(x,y-z,w,h,0xe5dcc0);r(x+8,y-z+8,w-16,50,0xf3ead5);r(x+12,y-z+61,w-24,h-68,0x9da88a);r(x+12,y-z+68,w-24,14,0xc7cbb0);r(x,y+h-z,w,z,0xa08057);r(x+4,y+h-z+4,w-8,13,0xc2a47d);r(x+7,y+h-3,12,14,0x7c6548);r(x+w-19,y+h-3,12,14,0x7c6548);return;
  }
  if(f.kind==='chair'){
   r(x,y-z,w,35,0x8c997b);r(x+6,y-z+5,w-12,25,0xb7bfa2);r(x+10,y-z+37,w-20,h-48,0xc4c9ac);r(x+10,y+h-z-8,w-20,z,0x9eac89);r(x,y-z+30,12,h+z-30,0x8b9c79);r(x+w-12,y-z+30,12,h+z-30,0x8b9c79);r(x+13,y+h-3,8,14,0x775f45);r(x+w-21,y+h-3,8,14,0x775f45);return;
  }
 }
 private plant(g:Phaser.GameObjects.Graphics,x:number,y:number,color:number){
  g.fillStyle(0xaf7f5c);g.fillRect(x-13,y-23,26,23);g.fillStyle(0xcf9f78);g.fillRect(x-16,y-26,32,7);g.fillStyle(0x6f7f4e);g.fillRect(x-2,y-69,4,45);
  for(let j=0;j<4;j++){g.fillStyle(color);g.fillRect(x-25+j*4,y-35-j*12,23-j*2,7);g.fillRect(x+2,y-42-j*12,23-j*2,7);}
 }
 private drawWindowFrame(){
  const g=this.frame;
  // Only frame rails are painted over the sky, never a full opaque pane rectangle.
  g.clear();g.lineStyle(8,0x8c7454);g.strokeRect(WINDOW.x-3,WINDOW.y-3,WINDOW.w+6,WINDOW.h+6);g.lineStyle(6,0xf1e4c2);g.strokeRect(WINDOW.x+3,WINDOW.y+3,WINDOW.w-6,WINDOW.h-6);g.fillStyle(0xf1e4c2);g.fillRect(473,43,10,82);g.fillRect(340,79,279,9);g.fillStyle(0xf5e5bf);g.fillRect(328,129,304,7);g.fillStyle(0xb3976d);g.fillRect(334,136,292,4);
 }
 update(time:number,delta:number,state:Save){
  if(this.lastStyle!==JSON.stringify(state.equipped))this.build(state);
  const t=state.reducedMotion?0:time,g=this.exterior;g.clear();g.fillStyle(state.rain?0xa5b8b6:state.minutes>=1050?0xb49eaa:0xb1cfca);g.fillRect(WINDOW.x,WINDOW.y,WINDOW.w,WINDOW.h);
  for(let i=0;i<9;i++){const x=340+i*34,y=92+(i%3)*8;g.fillStyle(i%2?0x819e99:0x95b0a4);g.fillRect(x,y,29,45);g.fillStyle(0xd7d8b8);g.fillRect(x+6,y+8,4,5);g.fillRect(x+18,y+8,4,5);}
  const birdX=WINDOW.x-20+(t/38)%(WINDOW.w+40),birdY=60+Math.sin(t/850)*9;g.fillStyle(0x5f7d76);g.fillRect(Math.round(birdX),Math.round(birdY),4,2);g.fillRect(Math.round(birdX)-4,Math.round(birdY)+(Math.floor(t/180)%2?-2:2),4,2);g.fillRect(Math.round(birdX)+4,Math.round(birdY)+(Math.floor(t/180)%2?-2:2),4,2);
  if(state.rain){g.lineStyle(1,0xe2e9dc,.45);for(let i=0;i<35;i++){const x=340+i*19%280,y=44+(i*13+t/28)%80;g.lineBetween(x,y,x-2,y+7);}}
  this.drawClock(state.minutes);
  const light=this.light;light.clear();const target=state.minutes>990?Math.min(.24,(state.minutes-990)/1500):0;this.warmth=Phaser.Math.Linear(this.warmth,target,Math.min(1,delta/1500));light.fillStyle(0x655971,this.warmth);light.fillRect(0,0,this.layout.width,this.layout.height);
  if(state.minutes>1000){for(let i=5;i>0;i--){light.fillStyle(0xffd49b,.015*i);light.fillCircle(904,275,22+i*14);}}
  this.dust.clear();for(let i=0;i<16;i++){this.dust.fillStyle(0xffedb8,.14);this.dust.fillRect(350+(i*41+t/250)%380,180+(i*67+t/400)%410,2,2);}
 }
 private drawClock(minutes:number){
  const g=this.clock;g.clear();const x=832,y=86;g.fillStyle(0x92714f);g.fillCircle(x,y,29);g.fillStyle(0xf1e5c6);g.fillCircle(x,y,25);
  g.fillStyle(0x9b9c7e);for(let i=0;i<12;i++){const a=i*Math.PI/6;g.fillRect(Math.round(x+Math.sin(a)*21)-1,Math.round(y-Math.cos(a)*21)-1,2,2);}
  const hands=clockHands(minutes),hand=(degrees:number,length:number,width:number)=>{const rad=degrees*Math.PI/180;g.lineStyle(width,0x637259);g.lineBetween(x,y,Math.round(x+Math.sin(rad)*length),Math.round(y-Math.cos(rad)*length));};hand(hands.hour,13,3);hand(hands.minute,20,2);g.fillStyle(0x637259);g.fillCircle(x,y,3);
 }
}
