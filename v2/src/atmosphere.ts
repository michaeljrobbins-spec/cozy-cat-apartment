import Phaser from 'phaser';
import {phase,type Save} from './model';
export class Atmosphere{
 private window:Phaser.GameObjects.Graphics;private air:Phaser.GameObjects.Graphics;private lighting:Phaser.GameObjects.Graphics;private warmth=0;
 constructor(scene:Phaser.Scene){this.window=scene.add.graphics().setDepth(2);this.lighting=scene.add.graphics().setDepth(1900);this.air=scene.add.graphics().setDepth(1950);}
 draw(time:number,delta:number,state:Save,bedtime:boolean){
  const t=state.reducedMotion?0:time,evening=phase(state)==='Evening',target=bedtime?1:evening?.75:phase(state)==='Afternoon'?.25:0;
  this.warmth=Phaser.Math.Linear(this.warmth,target,state.reducedMotion?1:Math.min(1,delta/2000));
  const glass=this.window;glass.clear();
  // Slow cloud drift and occasional little silhouettes beyond the window.
  glass.fillStyle(0xeee9d2,state.rain?.25:.7);
  const x=430+(t/400)%255;glass.fillRect(x,101,54,6);glass.fillRect(x+9,96,30,6);
  if(!state.rain){const birdX=430+(t/85)%350,birdY=158+Math.sin(t/1000)*8;glass.lineStyle(2,0x748e88,.7);glass.lineBetween(birdX,birdY,birdX+5,birdY+3);glass.lineBetween(birdX+5,birdY+3,birdX+10,birdY);}
  if(state.rain){
   for(let i=0;i<70;i++){const x=428+(i*47)%365,y=63+((i*29+t*(.035+(i%4)*.01))%287);if(x>602&&x<616||y>211&&y<227)continue;glass.lineStyle(i%5===0?2:1,0xe3e8dd,.25+(i%3)*.1);glass.lineBetween(x,y,x-3,y+10);}
  }else{glass.lineStyle(2,0xffffff,.08);glass.lineBetween(450,76,480,205);glass.lineBetween(650,75,710,207);}
  if(evening){glass.fillStyle(0xf3d29f,.35+.2*Math.sin(t/2500));glass.fillRect(740,213,6,9);glass.fillRect(507,253,6,9);}
  const light=this.lighting;light.clear();light.fillStyle(0x6b5872,this.warmth*.19);light.fillRect(0,0,1280,800);
  if(this.warmth>.05){for(let i=5;i>0;i--){light.fillStyle(0xffd39b,this.warmth*.022);light.fillCircle(1220,352,45+i*24);}light.fillStyle(0xffe7b7,this.warmth*.45);light.fillRect(1194,282,53,40);}
  // Dust motes follow a sunbeam; steam drifts from the cup on the low table.
  const air=this.air;air.clear();for(let i=0;i<23;i++){const x=470+(i*31+t/160)%420,y=300+(i*67+t/240)%400;air.fillStyle(0xffedb6,.12+Math.sin(t/1900+i)*.1);air.fillRect(Math.round(x),Math.round(y),i%5===0?3:2,2);}
  for(let i=0;i<3;i++){const y=664-((t/110+i*12)%35),x=833+Math.sin(t/1700+i)*3;air.fillStyle(0xffedce,.18);air.fillRect(Math.round(x),Math.round(y),3,7);}
  // Curtain highlights shift by one pixel, not a floating sheet of furniture.
  air.fillStyle(0xe4e4bf,.14);air.fillRect(388+Math.round(Math.sin(t/3800)),60,3,280);
 }
}
