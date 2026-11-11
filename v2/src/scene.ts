import Phaser from 'phaser';
import {newCat,type Save,type Pose} from './model';
import {installSprites,type Expression} from './sprites';
import {drawApartment,WORLD,type DecorLayers} from './apartment';
import {SPOTS,route,distance,isHop,type Point} from './navigation';
export interface RoomSnapshot{x:number;y:number;pose:Pose;node:string;destination:string;frame:string;expression:Expression;zoom:number;scrollX:number;scrollY:number;width:number;height:number}
export interface RoomHooks{snapshot:(s:RoomSnapshot)=>void;ready:()=>void;change:(s:Save)=>void}
interface Leg{from:Point;to:Point;start:string;end:string;elapsed:number;duration:number;hop:boolean}
export class LivingRoom extends Phaser.Scene{
 state:Save=newCat();private hooks:RoomHooks;private art?:DecorLayers;
 private cat!:Phaser.GameObjects.Sprite;private shadow!:Phaser.GameObjects.Ellipse;
 private pose:Pose='stretch';private expression:Expression='soft';private node='center';private destination='center';
 private legs:string[]=[];private leg?:Leg;private rest=2200;private physical={...SPOTS.center};private lastSnapshot=0;
 private focus=true;private manualUntil=0;private chooseCount=0;
 constructor(hooks:RoomHooks){super('living-room');this.hooks=hooks;}
 create(){
  installSprites(this);this.art=drawApartment(this,this.state);
  this.shadow=this.add.ellipse(this.physical.x,this.physical.y+2,90,17,0x4a3f30,.17);
  this.cat=this.add.sprite(this.physical.x,this.physical.y,`cat-${this.state.coat}`,'soft-stretch-0').setOrigin(.5,.9).setScale(2.3);
  this.cat.setInteractive(new Phaser.Geom.Rectangle(8,7,52,39),Phaser.Geom.Rectangle.Contains);
  this.cat.play(`cat-${this.state.coat}-soft-stretch`);this.resize();
  this.scale.on('resize',()=>this.resize());
  this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{if(pointer.middleButtonDown())this.focus=false;});
  this.hooks.ready();
 }
 sync(state:Save){const changed=this.state.coat!==state.coat;this.state=state;if(!this.cat)return;if(changed)this.animate(this.pose,true);}
 private resize(){
  const c=this.cameras.main;const portrait=this.scale.width/this.scale.height<1.15;
  c.setZoom(portrait?this.scale.height/WORLD.height:Math.min(this.scale.width/WORLD.width,this.scale.height/WORLD.height));
  c.setBounds(0,0,WORLD.width,WORLD.height);
  c.centerOn(this.physical.x,400);
 }
 redraw(){if(this.cat)this.art=drawApartment(this,this.state,this.art);}
 private animate(pose:Pose,force=false){if(this.pose===pose&&!force&&this.cat.anims.isPlaying)return;this.pose=pose;this.cat.play(`cat-${this.state.coat}-${this.expression}-${pose}`);}
 private travel(to:string,pose:Pose='sit',rest=6500){
  this.destination=to;this.legs=route(this.node,to);this.arrivalPose=pose;this.arrivalRest=rest;this.nextLeg();
 }
 private arrivalPose:Pose='sit';private arrivalRest=6000;
 private nextLeg(){
  const next=this.legs.shift();if(!next){this.leg=undefined;this.animate(this.arrivalPose);this.rest=this.arrivalRest;return;}
  const to=SPOTS[next],hop=isHop(this.node,next);this.leg={from:{...this.physical},to,start:this.node,end:next,elapsed:0,duration:hop?740:distance(this.physical,to)/(this.state.personality==='Playful'?92:72)*1000,hop};
  this.cat.setFlipX(to.x<this.physical.x);this.animate(hop?'hop':'walk');
 }
 private think(){
  this.chooseCount++;
  // A complete first visit deliberately includes sunlight, the window, and a wash.
  if(this.chooseCount===1){this.travel('sun','stretch',4200);return;}
  if(this.chooseCount===2){this.travel('window','sit',9000);return;}
  const choices:[string,Pose,number][]=[['sun','sleep',11000],['window','sit',10000],['sofaSeat','groom',6500],['left','stretch',3500],['plant','sit',5000],['behind','walk',700],['center','groom',5500]];
  if(this.state.personality==='Shy')choices.push(['window','sleep',12000]);
  if(this.state.personality==='Playful')choices.push(['frontLeft','crouch',2500]);
  const choice=choices[Math.floor(Math.random()*choices.length)];this.travel(...choice);
 }
 update(_time:number,delta:number){
  if(!this.cat)return;const dt=Math.min(delta,60);
  if(this.leg){const leg=this.leg;leg.elapsed+=dt;const t=Math.min(1,leg.elapsed/Math.max(1,leg.duration));
   const eased=leg.hop?Phaser.Math.Easing.Sine.InOut(t):t;
   this.physical.x=Phaser.Math.Linear(leg.from.x,leg.to.x,eased);this.physical.y=Phaser.Math.Linear(leg.from.y,leg.to.y,eased);
   this.cat.setPosition(Math.round(this.physical.x),Math.round(this.physical.y)-(leg.hop?Math.sin(t*Math.PI)*60:0));
   if(t===1){this.node=leg.end;this.nextLeg();}
  }else{this.rest-=dt;if(this.rest<=0)this.think();}
  this.cat.setDepth(this.physical.y);this.shadow.setPosition(this.physical.x,this.physical.y+2).setDepth(this.physical.y-1).setAlpha(this.leg?.hop?.09:.16);
  if(this.art&&!this.state.reducedMotion)this.art.leaves.list.forEach((leaf,i)=>{(leaf as Phaser.GameObjects.Container).angle=Math.sin(this.time.now/2200+i)*.7;});
  const c=this.cameras.main;
  if(this.focus&&this.time.now>this.manualUntil){const target=Phaser.Math.Clamp(this.physical.x-this.scale.width/c.zoom/2,0,Math.max(0,WORLD.width-this.scale.width/c.zoom));c.scrollX=this.state.reducedMotion?target:Phaser.Math.Linear(c.scrollX,target,.025);}
  if(this.time.now-this.lastSnapshot>100){this.lastSnapshot=this.time.now;this.hooks.snapshot({x:this.physical.x,y:this.physical.y,pose:this.pose,node:this.node,destination:this.destination,frame:String(this.cat.frame.name),expression:this.expression,zoom:c.zoom,scrollX:c.scrollX,scrollY:c.scrollY,width:this.scale.width,height:this.scale.height});}
 }
 focusCat(){this.focus=true;this.manualUntil=0;}
 pan(dx:number){this.manualUntil=this.time.now+12000;this.cameras.main.scrollX-=dx/this.cameras.main.zoom;}
}
export function startRoom(parent:HTMLElement,state:Save,hooks:RoomHooks){
 const scene=new LivingRoom(hooks);scene.state=state;
 const game=new Phaser.Game({type:Phaser.CANVAS,parent,width:parent.clientWidth,height:parent.clientHeight,backgroundColor:'#e5d7ba',pixelArt:true,roundPixels:true,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true},banner:false});
 return {game,scene};
}
