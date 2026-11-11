import Phaser from 'phaser';
import {Atmosphere} from './atmosphere';
import {newCat,complete,accepts,phase,mood,clamp,tomorrow,type Save,type Pose,type Activity} from './model';
import {installSprites,type Expression} from './sprites';
import {drawApartment,WORLD,type DecorLayers} from './apartment';
import {SPOTS,route,distance,isHop,type Point} from './navigation';
export interface RoomSnapshot{x:number;y:number;pose:Pose;node:string;destination:string;frame:string;expression:Expression;zoom:number;scrollX:number;scrollY:number;width:number;height:number;tool:Tool;brush:number;pounces:number;mood:string;night:boolean;toy:Point}
export type Tool='hands'|'brush'|'wand';
export type ObjectName='food'|'water'|'brush'|'wand'|'window'|'cat'|'treat';
export interface RoomHooks{snapshot:(s:RoomSnapshot)=>void;ready:()=>void;change:(s:Save)=>void;feedback?:(kind:string)=>void}
interface Leg{from:Point;to:Point;start:string;end:string;elapsed:number;duration:number;hop:boolean}
interface Task{activity:Activity;elapsed:number;duration:number;player:boolean}
export class LivingRoom extends Phaser.Scene{
 state:Save=newCat();private hooks:RoomHooks;private art?:DecorLayers;
 private cat!:Phaser.GameObjects.Sprite;private shadow!:Phaser.GameObjects.Ellipse;private effects!:Phaser.GameObjects.Graphics;private wand!:Phaser.GameObjects.Graphics;
 private pose:Pose='stretch';private expression:Expression='soft';private node='center';private destination='center';
 private legs:string[]=[];private leg?:Leg;private rest=2200;private physical={...SPOTS.center};private lastSnapshot=0;
 private focus=true;private manualUntil=0;private chooseCount=0;private arrivalPose:Pose='sit';private arrivalRest=6000;private arrived?:()=>void;private queued?:()=>void;
 private brushPoint?:Point;private task?:Task;private tool:Tool='hands';private brushCount=0;private lastBrush=-1000;private pounces=0;private toy={x:490,y:685};private toyActive=0;private toyReady=0;
 private atmosphere?:Atmosphere;private nightPending=false;private nightRunning=false;private footTime=0;private calmTime=0;private lastRefusal=-3000;private sniffTime=0;
 private leap?:{from:Point;to:Point;elapsed:number};private sparkles:{x:number;y:number;life:number;color:number}[]=[];
 constructor(hooks:RoomHooks){super('living-room');this.hooks=hooks;}
 create(){
  installSprites(this);this.art=drawApartment(this,this.state);
  this.shadow=this.add.ellipse(this.physical.x,this.physical.y+2,90,17,0x4a3f30,.17);
  this.cat=this.add.sprite(this.physical.x,this.physical.y,`cat-${this.state.coat}`,'soft-stretch-0').setOrigin(.5,.9).setScale(2.3);
  this.atmosphere=new Atmosphere(this);
  this.effects=this.add.graphics().setDepth(2100);this.wand=this.add.graphics().setDepth(2050);
  this.cat.play(`cat-${this.state.coat}-soft-stretch`);this.resize();
  this.scale.on('resize',()=>this.resize());this.bodyLanguage();this.hooks.ready();
 }
 sync(state:Save){const changed=this.state.coat!==state.coat,lighting=phase(state)!==phase(this.state)||state.rain!==this.state.rain||JSON.stringify(state.equipped)!==JSON.stringify(this.state.equipped);this.state=state;if(!this.cat)return;if(changed)this.animate(this.pose,true);if(lighting)this.redraw();this.bodyLanguage();}
 private resize(){
  const c=this.cameras.main;const portrait=this.scale.width/this.scale.height<1.15;
  c.setZoom(portrait?this.scale.height/WORLD.height:Math.min(this.scale.width/WORLD.width,this.scale.height/WORLD.height));c.setBounds(0,0,WORLD.width,WORLD.height);c.centerOn(this.physical.x,400);
 }
 redraw(){if(this.cat)this.art=drawApartment(this,this.state,this.art);}
 private animate(pose:Pose,force=false){if(this.pose===pose&&!force&&this.cat.anims.isPlaying)return;this.pose=pose;this.cat.play(`cat-${this.state.coat}-${this.expression}-${pose}`);}
 private travel(to:string,pose:Pose='sit',rest=6500,arrived?:()=>void){
  this.destination=to;this.legs=route(this.node,to);this.arrivalPose=pose;this.arrivalRest=rest;this.arrived=arrived;this.nextLeg();
 }
 private nextLeg(){
  if(this.queued){const next=this.queued;this.queued=undefined;this.legs=[];this.leg=undefined;this.arrived=undefined;next();return;}
  const next=this.legs.shift();if(!next){this.leg=undefined;this.animate(this.arrivalPose);this.rest=this.arrivalRest;const arrived=this.arrived;this.arrived=undefined;arrived?.();return;}
  const to=SPOTS[next],hop=isHop(this.node,next);this.leg={from:{...this.physical},to,start:this.node,end:next,elapsed:0,duration:hop?740:distance(this.physical,to)/(this.state.personality==='Playful'?92:72)*1000,hop};this.cat.setFlipX(to.x<this.physical.x);this.animate(hop?'hop':'walk');
 }
 private request(run:()=>void){if(this.task||this.leap)return;if(this.leg)this.queued=run;else run();}
 private think(){
  this.chooseCount++;
  const feeling=mood(this.state);
  if(feeling==='overwhelmed'||feeling==='wary'){this.travel('hide','hide',7000);return;}
  if(feeling==='sleepy'){this.travel('sun','sleep',14000,()=>this.begin('sleep',5000,false));return;}
  if(feeling==='thirsty'){this.travel('water',this.state.water?'drink':'sit',6500,()=>{if(this.state.water){this.cat.setFlipX(true);this.begin('drink',3300,false);}else this.hooks.feedback?.('meow');});return;}
  if(feeling==='hungry'){this.travel('bowls',this.state.food?'eat':'sit',6500,()=>{if(this.state.food){this.cat.setFlipX(true);this.begin('eat',3300,false);}else this.hooks.feedback?.('meow');});return;}
  if(feeling==='curious'){this.travel('frontLeft','crouch',5000);return;}
  if(this.node==='hide'){this.travel('sun','stretch',4000);return;}
  if(this.chooseCount===1){this.travel('sun','stretch',4200);return;}
  if(this.chooseCount===2){this.travel('window','sit',9000);return;}
  const choices:[string,Pose,number][]=[['sun','sleep',11000],['window','sit',10000],['sofaSeat','groom',6500],['left','stretch',3500],['plant','sit',5000],['behind','sit',1500],['center','groom',5500]];
  if(this.state.personality==='Shy')choices.push(['window','sleep',12000]);if(this.state.personality==='Playful')choices.push(['frontLeft','crouch',2500]);
  const choice=choices[Math.floor(Math.random()*choices.length)];this.travel(choice[0],choice[1],choice[2],choice[1]==='sleep'?()=>this.begin('sleep',6000,false):undefined);
 }
 interact(object:ObjectName){
  if(this.nightPending)return;
  this.focusCat();
  if(object==='treat'){this.offerTreat();return;}
  if(object==='brush'||object==='wand'){this.setTool(object);return;}
  if(object==='cat'){if(this.tool==='brush')this.stroke();else if(this.tool==='wand')this.moveToy(this.physical.x+65,this.physical.y+20);else this.request(()=>this.begin('company',1400));return;}
  if(object==='window'){this.request(()=>this.travel('window','sleep',14000,()=>this.begin('sleep',4500)));return;}
  if(object==='food'||object==='water'){
   this.state={...this.state,[object]:3};this.hooks.change(this.state);this.redraw();this.burst(object==='food'?210:310,647,0xeed6a0);this.hooks.feedback?.('refill');
   this.request(()=>this.travel(object==='food'?'bowls':'water',object==='food'?'eat':'drink',3000,()=>{this.cat.setFlipX(true);this.begin(object==='food'?'eat':'drink',3300);}));
  }
 }
 setTool(tool:Tool){this.tool=tool;this.brushCount=0;if(tool==='brush')this.brushPoint={x:this.physical.x+12,y:this.physical.y-52};if(tool==='hands'){this.toyActive=0;this.pounces=0;}else if(tool==='brush'&&accepts(this.state,'brush'))this.request(()=>{this.animate('sit');this.rest=10000;});this.hooks.feedback?.('tool');}
 stroke(){
  if(this.tool!=='brush'||this.leg||this.leap||this.task||this.time.now-this.lastBrush<190)return;
  this.lastBrush=this.time.now;if(!accepts(this.state,'brush')){this.refuse('brush');return;}
  this.brushCount++;this.animate('groom');this.rest=2500;this.burst(this.physical.x,this.physical.y-70,0xe9d7aa);this.hooks.feedback?.('brush');
  if(this.brushCount>=4){this.brushCount=0;this.begin('brush',1800);}
 }
 hoverBrush(x:number,y:number){this.brushPoint={x,y};}
 brushAt(x:number,y:number){this.brushPoint={x,y};if(distance({x,y},{x:this.physical.x,y:this.physical.y-40})<95)this.stroke();}
 moveToy(x:number,y:number){
  if(this.tool!=='wand')return;this.toy={x:Phaser.Math.Clamp(x,410,700),y:Phaser.Math.Clamp(y,580,720)};this.toyActive=this.time.now+16000;this.toyReady=this.time.now+550;this.focusCat();
  if(!accepts(this.state,'play')){this.refuse('play');return;}
  if(this.task||this.leap)return;
  if(distance(this.physical,this.toy)>170){const spot=['center','left','sun','frontLeft','front'].reduce((a,b)=>distance(SPOTS[a],this.toy)<distance(SPOTS[b],this.toy)?a:b);if(this.destination!==spot||!this.leg)this.request(()=>this.travel(spot,'crouch',8000));}
  else if(!this.leg)this.animate('crouch');
 }
 keyboardToy(){const points=[{x:540,y:640},{x:675,y:690},{x:460,y:610}];this.moveToy(points[this.pounces%points.length].x,points[this.pounces%points.length].y);}
 private offerTreat(){
  const id=Object.keys(this.state.treats).find(k=>this.state.treats[k]>0);
  if(!id){this.hooks.feedback?.('empty-jar');return;}
  if(!accepts(this.state,'brush')){this.refuse('company');return;}
  this.request(()=>this.travel('left','eat',3000,()=>{
   if(!(this.state.treats[id]>0))return;
   this.state={...this.state,treats:{...this.state.treats,[id]:this.state.treats[id]-1},needs:{...this.state.needs,comfort:clamp(this.state.needs.comfort+12)}};
   this.hooks.change(this.state);this.begin('company',2300,false);this.animate('eat');this.burst(this.physical.x+25,this.physical.y-25,0xe8c693);
  }));
 }
 settleIn(){this.setTool('hands');this.nightPending=true;}
 lookAt(x:number){this.manualUntil=this.time.now+20000;this.cameras.main.centerOn(x,400);}
 private begin(activity:Activity,duration:number,player=true){
  this.task={activity,duration,elapsed:0,player};this.animate(activity==='brush'?'groom':activity==='company'?(this.node==='hide'?'hide':'sit'):activity==='sleep'?'sleep':activity==='eat'?'eat':activity==='drink'?'drink':'crouch');this.hooks.feedback?.(activity);
 }
 private finish(activity:Activity,player=true){
  if(this.nightRunning&&activity==='sleep'){
   this.nightPending=false;this.nightRunning=false;this.state=tomorrow(this.state);this.hooks.change(this.state);this.redraw();this.bodyLanguage();this.animate('stretch');this.rest=3500;this.hooks.feedback?.('morning');return;
  }
  const oldPhase=phase(this.state),result=complete(this.state,activity,player);this.state=result.state;this.hooks.change(this.state);
  if(result.earned)this.burst(this.physical.x,this.physical.y-70,0xdba390,9);
  if(activity==='eat'||activity==='drink'||oldPhase!==phase(this.state))this.redraw();
  this.bodyLanguage();this.rest=activity==='sleep'?12000:3500;if(activity!=='sleep')this.animate(this.node==='hide'?'hide':activity==='eat'||activity==='drink'?'groom':'sit');
  this.hooks.feedback?.('complete');
 }
 private bodyLanguage(){
  if(!this.cat)return;const feeling=mood(this.state);const expression:Expression=feeling==='overwhelmed'?'flat':feeling==='wary'||feeling==='hungry'||feeling==='thirsty'?'wary':'soft';
  if(expression!==this.expression){this.expression=expression;this.animate(this.pose,true);}
 }
 private refuse(_activity:Activity){
  if(this.time.now-this.lastRefusal<2200)return;this.lastRefusal=this.time.now;this.toyActive=0;
  if(this.state.needs.energy>=28)this.state={...this.state,tension:clamp(this.state.tension+13)};
  this.hooks.change(this.state);this.bodyLanguage();this.hooks.feedback?.('refuse');
  const sleepy=this.state.needs.energy<28;this.request(()=>this.travel(sleepy?'sun':'hide',sleepy?'sleep':'hide',7000,sleepy?()=>this.begin('sleep',5000,false):undefined));
 }
 private burst(x:number,y:number,color:number,count=6){for(let i=0;i<count;i++)this.sparkles.push({x:x+(Math.random()-.5)*45,y:y+Math.random()*12,life:1,color});}
 update(_time:number,delta:number){
  if(!this.cat)return;const dt=Math.min(delta,60);
  if(this.nightPending&&!this.nightRunning&&!this.leg&&!this.leap&&!this.task){this.nightRunning=true;this.travel('window','sleep',15000,()=>this.begin('sleep',3000,false));}
  this.atmosphere?.draw(this.time.now,dt,this.state,this.nightPending);
  this.calmTime+=dt;this.sniffTime+=dt;this.footTime+=dt;if(this.pose==='walk'&&this.footTime>360){this.footTime=0;this.hooks.feedback?.('step');}
  if(this.calmTime>=1000){this.calmTime=0;const quiet=this.tool==='hands'||(this.tool==='brush'&&this.time.now-this.lastBrush>3000)||this.toyActive<this.time.now;
   if(quiet&&this.state.tension>0){this.state={...this.state,tension:clamp(this.state.tension-(this.pose==='sleep'?5:3))};this.hooks.change(this.state);this.bodyLanguage();}}
  if(this.sniffTime>15000){this.sniffTime=0;if(mood(this.state)==='hungry'||mood(this.state)==='thirsty'||this.state.personality==='Demanding')this.hooks.feedback?.('meow');}

  if(this.leap){const jump=this.leap;jump.elapsed+=dt;const t=Math.min(1,jump.elapsed/650);this.physical.x=Phaser.Math.Linear(jump.from.x,jump.to.x,t);this.physical.y=Phaser.Math.Linear(jump.from.y,jump.to.y,t);this.cat.setPosition(this.physical.x,this.physical.y-Math.sin(t*Math.PI)*48);
   if(t===1){this.leap=undefined;this.pounces++;this.burst(this.physical.x,this.physical.y-10,0xe9d6a5);this.hooks.feedback?.('pounce');this.toyActive=0;this.animate('sit');if(this.pounces>=3){this.pounces=0;this.finish('play');}this.rest=4500;}
  }else if(this.leg){const leg=this.leg;leg.elapsed+=dt;const t=Math.min(1,leg.elapsed/Math.max(1,leg.duration));const eased=leg.hop?Phaser.Math.Easing.Sine.InOut(t):t;
   this.physical.x=Phaser.Math.Linear(leg.from.x,leg.to.x,eased);this.physical.y=Phaser.Math.Linear(leg.from.y,leg.to.y,eased);this.cat.setPosition(Math.round(this.physical.x),Math.round(this.physical.y)-(leg.hop?Math.sin(t*Math.PI)*60:0));if(t===1){this.node=leg.end;this.nextLeg();}
  }else if(this.task){this.task.elapsed+=dt;if(this.task.elapsed>=this.task.duration){const task=this.task;this.task=undefined;this.finish(task.activity,task.player);}}
  else if(this.tool==='wand'&&this.toyActive>this.time.now&&accepts(this.state,'play')){
   if(distance(this.physical,this.toy)<185&&this.time.now>this.toyReady){this.animate('pounce');this.cat.setFlipX(this.toy.x<this.physical.x);this.leap={from:{...this.physical},to:{...this.toy},elapsed:0};}
   else if(distance(this.physical,this.toy)>=185)this.moveToy(this.toy.x,this.toy.y);
  }else{this.rest-=dt;if(this.rest<=0)this.think();}
  this.cat.setDepth(this.node==='hide'&&!this.leg?630:this.physical.y);this.shadow.setPosition(this.physical.x,this.physical.y+2).setDepth(this.physical.y-1).setAlpha(this.leg?.hop||this.leap?.09:.16);
  if(this.art&&!this.state.reducedMotion)this.art.leaves.list.forEach((leaf,i)=>{(leaf as Phaser.GameObjects.Container).angle=Math.sin(this.time.now/2200+i)*.7;});
  this.drawEffects(dt);
  const c=this.cameras.main;if(this.focus&&this.time.now>this.manualUntil){const target=this.physical.x-this.scale.width/2;c.scrollX=this.state.reducedMotion?target:Phaser.Math.Linear(c.scrollX,target,.025);}
  if(this.time.now-this.lastSnapshot>80){this.lastSnapshot=this.time.now;this.hooks.snapshot({x:this.physical.x,y:this.physical.y,pose:this.pose,node:this.node,destination:this.destination,frame:String(this.cat.frame.name),expression:this.expression,zoom:c.zoom,scrollX:c.worldView.x,scrollY:c.worldView.y,width:this.scale.width,height:this.scale.height,tool:this.tool,brush:this.brushCount,pounces:this.pounces,mood:mood(this.state),night:this.nightPending,toy:this.toy});}
 }
 private drawEffects(dt:number){
  const g=this.effects;g.clear();this.sparkles=this.sparkles.filter(p=>p.life>0);for(const p of this.sparkles){p.life-=dt/1100;if(!this.state.reducedMotion)p.y-=dt/40;g.fillStyle(p.color,p.life);g.fillRect(p.x,p.y,4,4);g.fillRect(p.x+1,p.y-2,2,8);}
  if(this.brushCount||this.pounces){const count=this.tool==='brush'?4:3,value=this.tool==='brush'?this.brushCount:this.pounces;for(let i=0;i<count;i++){g.fillStyle(i<value?0xe9c58e:0xf3e7c3,.9);g.fillCircle(this.physical.x-15+i*10,this.physical.y-105,3);}}
  if(this.tool==='brush'&&this.brushPoint){const b=this.brushPoint;g.fillStyle(0x8e7655);g.fillRect(b.x+5,b.y+7,4,25);g.fillStyle(0xc2b58e);g.fillRect(b.x-1,b.y-3,17,16);g.fillStyle(0x7c8864);for(let i=0;i<4;i++)g.fillRect(b.x+i*4,b.y-4,2,7);g.fillStyle(0xe6d1a7);g.fillRect(b.x+1,b.y+5,12,3);}
  const w=this.wand;w.clear();if(this.tool==='wand'){
   if(this.state.equipped.toy==='mouse'){w.fillStyle(0x9e998c);w.fillRect(this.toy.x-10,this.toy.y-6,20,12);w.fillStyle(0xc8aea0);w.fillRect(this.toy.x-6,this.toy.y-10,5,5);w.fillStyle(0x46473f);w.fillRect(this.toy.x+5,this.toy.y-3,2,2);w.lineStyle(2,0xb6aa94);w.lineBetween(this.toy.x-10,this.toy.y,this.toy.x-22,this.toy.y+9);return;}
   w.lineStyle(3,0x8b6d4b);w.lineBetween(this.toy.x+30,this.toy.y-55,this.toy.x+3,this.toy.y-18);w.lineStyle(1.5,0xbda682);w.lineBetween(this.toy.x+3,this.toy.y-18,this.toy.x,this.toy.y);w.fillStyle(this.state.equipped.toy==='ribbon'?0xcb8f8b:0xa3a479);w.fillRect(this.toy.x-4,this.toy.y-5,9,15);w.fillStyle(0xe1c58b);w.fillRect(this.toy.x-1,this.toy.y+6,3,7);
  }else{w.lineStyle(3,0x9e7f56);w.lineBetween(468,690,497,673);w.fillStyle(0xafb08a);w.fillRect(462,689,8,13);}
 }
 point(clientX:number,clientY:number){const bounds=this.game.canvas.getBoundingClientRect();return this.cameras.main.getWorldPoint((clientX-bounds.left)*this.scale.width/bounds.width,(clientY-bounds.top)*this.scale.height/bounds.height);}
 focusCat(){this.focus=true;this.manualUntil=0;}
 pan(dx:number){this.manualUntil=this.time.now+12000;this.cameras.main.scrollX-=dx/this.cameras.main.zoom;}
}
export function startRoom(parent:HTMLElement,state:Save,hooks:RoomHooks){const scene=new LivingRoom(hooks);scene.state=state;const game=new Phaser.Game({type:Phaser.CANVAS,parent,width:parent.clientWidth,height:parent.clientHeight,backgroundColor:'#e5d7ba',pixelArt:true,roundPixels:true,scene:[scene],scale:{mode:Phaser.Scale.RESIZE},audio:{noAudio:true},banner:false});return {game,scene};}
