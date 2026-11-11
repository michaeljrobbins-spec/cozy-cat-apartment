import Phaser from 'phaser';
import {type Save,advanceClock,clockHands,complete,accepts,mood,clamp,tomorrow} from './care';
import {LAYOUT,Navigator,moveWithCollision,canStand,distance,roomAt,CAT_RADIUS,OWNER_RADIUS,type Point,type Fixture} from './world';
import {ApartmentArt} from './room';
import {installOwner,installCat,ownerKey,type Direction,type OwnerPose,type CatPose} from './sprites';
export type Tool='hands'|'brush'|'wand';
export interface Snapshot{owner:Point;cat:Point;ownerPose:OwnerPose;catPose:CatPose;ownerFrame:string;catFrame:string;clock:{minute:number;hour:number};minutes:number;room:string;zoom:number;left:number;top:number;width:number;height:number;seated:boolean;catBehavior:string;tool:Tool;pounces:number;ownerBusy:boolean;catDisplay:Point}
export interface Hooks{ready:()=>void;change:(s:Save)=>void;snapshot:(s:Snapshot)=>void;sound:(kind:string)=>void}
interface Resident{point:Point;sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;path:Point[];direction:Direction}
interface Timed{elapsed:number;duration:number;done:()=>void;kind:string}
interface Hop{from:Point;to:Point;elapsed:number;done:()=>void}
export class Home extends Phaser.Scene{
 state!:Save;activePlay=false;private hooks:Hooks;private art!:ApartmentArt;
 private owner!:Resident;private cat!:Resident;private ownerPose:OwnerPose='idle';private catPose:CatPose='sit';
 private ownerNav=new Navigator(LAYOUT,OWNER_RADIUS);private catNav=new Navigator(LAYOUT,CAT_RADIUS);
 private inputVector={x:0,y:0};private ownerTexture='';private saveElapsed=0;private snapshotElapsed=0;private footElapsed=0;
 private marker!:Phaser.GameObjects.Graphics;private effects!:Phaser.GameObjects.Graphics;private markerPoint?:Point;private markerLife=0;
 private ownerArrived?:()=>void;private catArrived?:()=>void;private ownerTask?:Timed;private catTask?:Timed;private tool:Tool='hands';
 private seat?:Fixture;private catSurface?:Fixture;private lap=false;private hop?:Hop;private jumpDisplay?:Point;
 private brainTime=0;private ownerIdle=0;private catRest=3000;private choice=0;private behavior='wandering';private reserved=false;
 private calmTime=0;private lastRub=-15000;private lastMeow=-15000;private expression='soft';
 private toy:Point={x:430,y:620};private toyUntil=0;private toyReady=0;private toyRevision=0;private consumedToy=0;private pounces=0;private pounce?:{from:Point;to:Point;elapsed:number};
 private sparkles:{x:number;y:number;life:number;color:number}[]=[];private lastRefusal=-3000;
 constructor(state:Save,hooks:Hooks){super('home');this.state=state;this.hooks=hooks;}
 create(){
  installOwner(this,this.state.owner);installCat(this,this.state.coat);this.ownerTexture=ownerKey(this.state.owner);this.art=new ApartmentArt(this,LAYOUT,this.state);
  this.owner=this.resident(this.ownerNav.nearest(this.state.ownerPosition),this.ownerTexture,'idle-down-0',2);
  this.cat=this.resident(this.catNav.nearest({x:560,y:624}),`cat-${this.state.coat}`,'soft-sit-down-0',1.65);
  this.marker=this.add.graphics().setDepth(4900);this.effects=this.add.graphics().setDepth(4901);this.animateOwner('idle');this.animateCat('sit');this.resize();this.scale.on('resize',()=>this.resize());this.hooks.ready();
 }
 private resident(point:Point,key:string,frame:string,scale:number):Resident{return {point:{...point},sprite:this.add.sprite(point.x,point.y,key,frame).setScale(scale).setOrigin(.5,.94),shadow:this.add.ellipse(point.x,point.y,31,12,0x584c37,.16),path:[],direction:'down'};}
 sync(state:Save){this.state=state;if(!this.owner)return;const key=ownerKey(state.owner);if(key!==this.ownerTexture){installOwner(this,state.owner);this.ownerTexture=key;this.owner.sprite.setTexture(key);this.animateOwner(this.ownerPose);}if(this.cat.sprite.texture.key!==`cat-${state.coat}`){installCat(this,state.coat);this.cat.sprite.setTexture(`cat-${state.coat}`);this.animateCat(this.catPose);}}
 private resize(){if(!this.owner)return;const c=this.cameras.main;c.setZoom(Math.max(this.scale.width/LAYOUT.width,this.scale.width<700?.9:1.03));c.setBounds(0,0,LAYOUT.width,LAYOUT.height);c.centerOn(this.owner.point.x,this.owner.point.y-110);}
 private animateOwner(pose:OwnerPose){this.ownerPose=pose;const key=`${this.ownerTexture}-${pose}-${this.owner.direction}`;if(this.owner.sprite.anims.currentAnim?.key!==key)this.owner.sprite.play(key);}
 private animateCat(pose:CatPose){this.catPose=pose;const key=`cat-${this.state.coat}-${this.expression}-${pose}-${this.cat.direction}`;if(this.cat.sprite.anims.currentAnim?.key!==key)this.cat.sprite.play(key);}
 setInput(x:number,y:number){this.inputVector={x,y};if(x||y){this.stand();if(!this.ownerTask)this.reserved=false;this.owner.path=[];this.ownerArrived=undefined;}}
 walkTo(point:Point){if(!this.owner||this.ownerTask)return;this.stand();this.reserved=false;this.ownerArrived=undefined;this.owner.path=this.ownerNav.path(this.owner.point,point);this.markerPoint=this.owner.path.at(-1);this.markerLife=1;}
 private goOwner(point:Point,done:()=>void){if(this.ownerTask)return;this.stand();this.owner.path=this.ownerNav.path(this.owner.point,point);this.ownerArrived=done;}
 private goCat(point:Point,done?:()=>void){if(this.hop)return;if(this.catSurface||this.lap){const from=this.catDisplay();this.catSurface=undefined;this.lap=false;this.animateCat('pounce');this.hop={from,to:{...this.cat.point},elapsed:0,done:()=>{this.jumpDisplay=undefined;this.goCat(point,done);}};return;}this.cat.path=this.catNav.path(this.cat.point,point);this.catArrived=done;}
 approach(id:string){
  if(!this.activePlay||this.ownerTask)return;
  if(id==='cat'){this.visitCat();return;}
  if(id==='brush'||id==='wand'){const tools=LAYOUT.fixtures.find(f=>f.id==='tools')!;this.goOwner(tools.approach,()=>{this.ownerTask={kind:'pickup',elapsed:0,duration:650,done:()=>{this.tool=id;this.hooks.sound('tool');}};});return;}
  const f=LAYOUT.fixtures.find(f=>f.id===id);if(!f)return;
  this.goOwner(f.approach,()=>this.useFixture(f));
 }
 interact(){if(!this.activePlay)return;if(this.seat){this.stand();return;}if(this.tool==='wand'){this.keyboardToy();return;}if(distance(this.owner.point,this.cat.point)<95){this.visitCat();return;}const f=this.nearestFixture();if(f&&distance(this.owner.point,f.approach)<110)this.approach(f.id==='tools'?'brush':f.id);}
 private nearestFixture(){return LAYOUT.fixtures.filter(f=>!['wall','plantTable'].includes(f.kind)).sort((a,b)=>distance(this.owner.point,a.approach)-distance(this.owner.point,b.approach))[0];}
 private useFixture(f:Fixture){
  if(f.id==='food'||f.id==='water'){
   this.owner.direction='up';this.ownerTask={kind:f.id,elapsed:0,duration:1450,done:()=>{
    this.state={...this.state,[f.id]:3};this.changed();this.art.build(this.state);this.hooks.sound('refill');this.burst({x:f.rect.x+f.rect.w/2,y:f.rect.y+16},0xe7cea0);
    const aside=this.freeNear({x:f.approach.x+64,y:f.approach.y+32},this.ownerNav);this.owner.path=this.ownerNav.path(this.owner.point,aside);
    if(mood(this.state)!=='overwhelmed')this.goCat(f.approach,()=>{this.cat.direction='up';this.startCatTask(f.id==='food'?'eat':'drink',2700,()=>{this.finish(f.id==='food'?'eat':'drink');this.art.build(this.state);});});
   }};return;
  }
  if(f.kind==='sofa'||f.kind==='chair'){
   this.tool='hands';this.seat=f;this.owner.direction='down';this.animateOwner('sit');this.behavior='coming for a lap';this.ownerIdle=0;return;
  }
  if(f.kind==='bench'){
   this.ownerTask={kind:'invite',elapsed:0,duration:900,done:()=>{if(!this.isSulking())this.goCat(f.approach,()=>this.mount(f));else this.refuse();}};return;
  }
  if(f.kind==='bed'){
   this.ownerTask={kind:'rest',elapsed:0,duration:1800,done:()=>{this.state=tomorrow(this.state);this.changed();this.hooks.sound('morning');}};return;
  }
  if(f.kind==='tools'){this.approach('brush');return;}
  this.ownerTask={kind:'pause',elapsed:0,duration:1000,done:()=>{this.hooks.sound('company');}};
 }
 private visitCat(){
  if(this.ownerTask)return;if(this.tool==='wand'){this.keyboardToy();return;}if(this.isSulking()){this.refuse();return;}
  this.reserved=true;this.cat.path=[];this.catTask=undefined;this.catArrived=undefined;if(this.catSurface){const from=this.catDisplay();this.catSurface=undefined;this.hop={from,to:{...this.cat.point},elapsed:0,done:()=>{this.jumpDisplay=undefined;this.animateCat('sit');}};}
  const target=this.freeNear({x:this.cat.point.x-48,y:this.cat.point.y+8},this.ownerNav);
  this.goOwner(target,()=>{
   if(this.isSulking()){this.reserved=false;this.refuse();return;}
   this.owner.direction=this.direction(this.cat.point.x-this.owner.point.x,this.cat.point.y-this.owner.point.y);this.cat.direction=this.direction(this.owner.point.x-this.cat.point.x,this.owner.point.y-this.cat.point.y);
   this.animateCat(this.tool==='brush'?'groom':'rub');this.behavior=this.tool==='brush'?'being brushed':'rubbing';this.hooks.sound('company');
   this.ownerTask={kind:this.tool==='brush'?'brush':'company',elapsed:0,duration:2600,done:()=>{this.finish(this.tool==='brush'?'brush':'company');this.reserved=false;this.catRest=5000;this.animateCat('sit');}};
  });
 }
 private startCatTask(kind:string,duration:number,done:()=>void){this.catTask={kind,duration,elapsed:0,done};this.behavior=kind==='rub'?'rubbing':kind;this.animateCat(kind==='drink'?'eat':kind==='sleep'?'sleep':kind==='rub'?'rub':'eat');this.hooks.sound(kind==='rub'?'company':kind);}
 private finish(activity:Parameters<typeof complete>[1],player=true){const result=complete(this.state,activity,player);this.state=result.state;this.changed();if(result.earned)this.burst(this.catDisplay(),0xdca48e,10);this.hooks.sound('complete');}
 private changed(){this.hooks.change(this.state);}
 private isSulking(){return mood(this.state)==='overwhelmed'||mood(this.state)==='wary';}
 private refuse(){if(this.time.now-this.lastRefusal<2000)return;this.lastRefusal=this.time.now;this.hooks.sound('refuse');this.reserved=false;this.behavior='sulking';this.goCat(this.freeNear({x:752,y:320},this.catNav),()=>{this.cat.direction='up';this.animateCat('sit');this.catRest=8000;});}
 private stand(){
  if(!this.seat)return;this.seat=undefined;this.ownerIdle=0;
  if(this.lap){const from=this.catDisplay();this.lap=false;this.hop={from,to:{...this.cat.point},elapsed:0,done:()=>{this.jumpDisplay=undefined;this.animateCat('sit');}};}
 }
 putDown(){if(this.ownerTask)return;this.tool='hands';this.toyUntil=0;this.pounces=0;}
 callCat(){if(this.lap){this.hooks.sound('company');return;}if(this.isSulking()){this.refuse();return;}this.hooks.sound('tool');this.catTask=undefined;this.goCat(this.freeNear({x:this.owner.point.x+48,y:this.owner.point.y+16},this.catNav));}
 aimToy(point:Point){
  if(this.tool!=='wand'||this.ownerTask||this.seat)return;if(!accepts(this.state,'play')){this.refuse();return;}
  const dx=point.x-this.owner.point.x,dy=point.y-this.owner.point.y,d=Math.hypot(dx,dy)||1,scale=Math.min(1,112/d);let to={x:this.owner.point.x+dx*scale,y:this.owner.point.y+dy*scale};
  if(!canStand(LAYOUT,to,CAT_RADIUS)||!this.catNav.clear(this.owner.point,to))to=this.freeNear(to,this.catNav);
  if(distance(to,this.owner.point)>150)return;
  this.toy=to;this.toyUntil=this.time.now+20000;this.toyReady=this.time.now+500;this.toyRevision++;
  if(!this.pounce&&!this.catTask){if(distance(this.cat.point,to)>85)this.goCat(to);else this.cat.path=[];}
 }
 keyboardToy(){const a=this.pounces*Math.PI*.7-.6;this.aimToy({x:this.owner.point.x+Math.cos(a)*85,y:this.owner.point.y+Math.sin(a)*65});}
 private freeNear(point:Point,nav:Navigator){return canStand(LAYOUT,point,nav.radius)?point:nav.nearest(point);}
 private mount(f:Fixture){
  if(!f.surface)return;const from={...this.cat.point};this.catSurface=f;this.animateCat('pounce');this.hop={from,to:f.surface,elapsed:0,done:()=>{this.jumpDisplay=undefined;this.animateCat('sleep');this.catRest=11000;this.behavior='window nap';this.startCatTask('sleep',7000,()=>this.finish('sleep',false));}};
 }
 private catDisplay():Point{if(this.jumpDisplay)return this.jumpDisplay;if(this.lap&&this.seat?.surface)return {x:this.seat.surface.x,y:this.seat.surface.y-17};return this.catSurface?.surface||this.cat.point;}
 private brain(dt:number,moving:boolean){
  this.ownerIdle=moving?0:this.ownerIdle+dt;this.brainTime+=dt;if(this.brainTime<600)return;this.brainTime=0;
  const feeling=mood(this.state);this.expression=feeling==='overwhelmed'?'flat':feeling==='wary'?'wary':'soft';
  if(this.catTask||this.hop||this.pounce||this.reserved||this.catArrived)return;
  if(this.isSulking()){
   this.behavior='sulking';if(distance(this.cat.point,this.owner.point)<145&&!this.cat.path.length)this.refuse();return;
  }
  if(this.seat){
   if(this.lap){this.behavior='lap';this.animateCat('sleep');return;}
   if(!this.cat.path.length){const near=this.freeNear({x:this.owner.point.x-40,y:this.owner.point.y},this.catNav);this.behavior='coming for a lap';this.goCat(near,()=>{
    if(!this.seat)return;const from={...this.cat.point},to={x:this.seat.surface!.x,y:this.seat.surface!.y-17};this.animateCat('pounce');this.hop={from,to,elapsed:0,done:()=>{this.jumpDisplay=undefined;this.lap=true;this.behavior='lap';this.animateCat('sleep');this.hooks.sound('company');}};
   });}return;
  }
  if(this.tool==='wand'&&this.toyUntil>this.time.now&&this.toyRevision>this.consumedToy){
   this.behavior='playing';if(this.catSurface){this.goCat(this.toy);return;}if(distance(this.cat.point,this.toy)<=92&&this.catNav.clear(this.cat.point,this.toy)&&this.time.now>this.toyReady){this.cat.path=[];this.cat.direction=this.direction(this.toy.x-this.cat.point.x,this.toy.y-this.cat.point.y);this.animateCat('pounce');this.pounce={from:{...this.cat.point},to:{...this.toy},elapsed:0};}else if(!this.cat.path.length)this.goCat(this.toy);return;
  }
  if(this.catSurface){this.catRest-=600;if(this.catRest<=0){const from=this.catDisplay();this.catSurface=undefined;this.hop={from,to:{...this.cat.point},elapsed:0,done:()=>{this.jumpDisplay=undefined;this.animateCat('sit');}};}return;}
  if(feeling==='hungry'||feeling==='thirsty'){
   const id=feeling==='hungry'?'food':'water',f=LAYOUT.fixtures.find(f=>f.id===id)!;
   if(this.state[id]&& !this.cat.path.length){this.goCat(f.approach,()=>{this.cat.direction='up';this.startCatTask(id==='food'?'eat':'drink',2800,()=>{this.finish(id==='food'?'eat':'drink',false);this.art.build(this.state);});});return;}
   if(!this.state[id]&&this.time.now-this.lastMeow>9000){this.lastMeow=this.time.now;this.hooks.sound('meow');this.burst(this.cat.point,0xe6ce9f,3);this.behavior='asking';}
  }
  const separation=distance(this.cat.point,this.owner.point),followDistance=this.state.personality==='Shy'?135:100;
  if((moving||this.ownerIdle<4500||feeling==='hungry'||feeling==='thirsty')&&separation>followDistance){
   this.behavior='following';const offsets:Record<Direction,Point>={up:{x:0,y:70},down:{x:0,y:-70},left:{x:70,y:0},right:{x:-70,y:0}},offset=offsets[this.owner.direction];this.goCat(this.freeNear({x:this.owner.point.x+offset.x,y:this.owner.point.y+offset.y},this.catNav));return;
  }
  if(!moving&&separation<100&&this.ownerIdle>700&&this.time.now-this.lastRub>10000&&!this.cat.path.length){
   this.lastRub=this.time.now;this.behavior='rubbing';this.goCat(this.freeNear({x:this.owner.point.x+23,y:this.owner.point.y+4},this.catNav),()=>{this.startCatTask('rub',2400,()=>{this.animateCat('sit');this.catRest=6000;});});return;
  }
  this.catRest-=600;if(this.catRest<=0&&!this.cat.path.length){this.choice++;this.catRest=6000;
   if(this.choice%4===0){const f=LAYOUT.fixtures.find(f=>f.id==='window-seat')!;this.goCat(f.approach,()=>this.mount(f));return;}
   const spots=[{x:304,y:688},{x:592,y:336},{x:912,y:656},{x:720,y:560},{x:336,y:464}];this.behavior='exploring';this.goCat(spots[this.choice%spots.length],()=>{this.animateCat(this.choice%2?'groom':'stretch');});
  }
 }
 private direction(dx:number,dy:number):Direction{return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}
 private followPath(actor:Resident,nav:Navigator,speed:number,dt:number){while(actor.path.length&&distance(actor.point,actor.path[0])<2)actor.path.shift();const next=actor.path[0];if(!next)return false;const d=distance(actor.point,next),step=Math.min(d,speed*dt/1000),dx=(next.x-actor.point.x)/d*step,dy=(next.y-actor.point.y)/d*step;actor.direction=this.direction(dx,dy);const moved=moveWithCollision(LAYOUT,actor.point,dx,dy,nav.radius);if(distance(moved,actor.point)<.1){actor.path=[];return false;}actor.point=moved;return true;}
 update(time:number,delta:number){
  if(!this.owner)return;const dt=Math.min(50,delta);this.art.update(time,dt,this.state);let moving=false;
  if(this.activePlay){
   this.state.minutes=advanceClock(this.state.minutes,dt/1000);
   if(this.ownerTask){this.ownerTask.elapsed+=dt;this.animateOwner(this.ownerTask.kind==='company'?'idle':'care');if(this.ownerTask.elapsed>=this.ownerTask.duration){const task=this.ownerTask;this.ownerTask=undefined;task.done();}}
   else if(this.seat)this.animateOwner('sit');else{
    const v=new Phaser.Math.Vector2(this.inputVector.x,this.inputVector.y);if(v.lengthSq()>0){v.normalize().scale(172*dt/1000);const p=moveWithCollision(LAYOUT,this.owner.point,v.x,v.y);moving=distance(p,this.owner.point)>.05;this.owner.point=p;this.owner.direction=this.direction(v.x,v.y);}else moving=this.followPath(this.owner,this.ownerNav,172,dt);
    this.animateOwner(moving?'walk':this.tool==='wand'&&this.toyUntil>time?'play':'idle');
    if(!moving&&!this.owner.path.length&&this.ownerArrived){const action=this.ownerArrived;this.ownerArrived=undefined;action();}
   }
   if(this.hop){const h=this.hop;h.elapsed+=dt;const t=Math.min(1,h.elapsed/700);this.jumpDisplay={x:Phaser.Math.Linear(h.from.x,h.to.x,t),y:Phaser.Math.Linear(h.from.y,h.to.y,t)-Math.sin(t*Math.PI)*32};if(t===1){this.hop=undefined;h.done();}}
   else if(this.pounce){const p=this.pounce;p.elapsed+=dt;const t=Math.min(1,p.elapsed/650),next={x:Phaser.Math.Linear(p.from.x,p.to.x,t),y:Phaser.Math.Linear(p.from.y,p.to.y,t)};this.cat.point=moveWithCollision(LAYOUT,this.cat.point,next.x-this.cat.point.x,next.y-this.cat.point.y,CAT_RADIUS);this.jumpDisplay={x:this.cat.point.x,y:this.cat.point.y-Math.sin(t*Math.PI)*16};if(t===1){this.pounce=undefined;this.jumpDisplay=undefined;this.consumedToy=this.toyRevision;this.pounces++;this.hooks.sound('pounce');this.burst(this.cat.point,0xe7c996);if(this.pounces>=3){this.pounces=0;this.finish('play');}this.animateCat('sit');}}
   else if(this.catTask){this.catTask.elapsed+=dt;if(this.catTask.elapsed>=this.catTask.duration){const task=this.catTask;this.catTask=undefined;task.done();this.reserved=false;this.catRest=5000;if(!this.lap&&!this.catSurface)this.animateCat('sit');}}
   else if(!this.lap&&!this.catSurface&&!this.reserved){const catMoving=this.followPath(this.cat,this.catNav,this.state.personality==='Playful'?134:112,dt);if(catMoving)this.animateCat('walk');else{if(this.catPose==='walk')this.animateCat('sit');if(this.catArrived&&!this.cat.path.length){const action=this.catArrived;this.catArrived=undefined;action();}}}
   this.brain(dt,moving);this.calmTime+=dt;if(this.calmTime>1000){this.calmTime=0;if(this.state.tension>0&&this.toyUntil<this.time.now){this.state.tension=clamp(this.state.tension-3);}}
   this.state.ownerPosition={...this.owner.point};this.saveElapsed+=dt;this.footElapsed+=dt;if(moving&&this.footElapsed>330){this.footElapsed=0;this.hooks.sound('step');}if(this.saveElapsed>5000){this.saveElapsed=0;this.changed();}
  }
  this.place(this.owner);this.place(this.cat);
  if(this.seat?.surface){this.owner.sprite.setPosition(this.seat.surface.x,this.seat.surface.y).setDepth(this.seat.rect.y+this.seat.rect.h+2);this.owner.shadow.setVisible(false);}else this.owner.shadow.setVisible(true);
  if(this.lap||this.catSurface||this.jumpDisplay){const p=this.catDisplay();this.cat.sprite.setPosition(p.x,p.y).setDepth(this.lap&&this.seat?this.seat.rect.y+this.seat.rect.h+3:this.catSurface?this.catSurface.rect.y+this.catSurface.rect.h+2:2000);this.cat.shadow.setVisible(false);}else this.cat.shadow.setVisible(true);
  const camera=this.cameras.main;camera.scrollX=Phaser.Math.Linear(camera.scrollX,this.owner.point.x-this.scale.width/2,.08);camera.scrollY=Phaser.Math.Linear(camera.scrollY,this.owner.point.y-90-this.scale.height/2,.08);
  this.drawEffects(dt);
  this.snapshotElapsed+=dt;if(this.snapshotElapsed>90){this.snapshotElapsed=0;this.hooks.snapshot({owner:{...this.owner.point},cat:{...this.cat.point},ownerPose:this.ownerPose,catPose:this.catPose,ownerFrame:String(this.owner.sprite.frame.name),catFrame:String(this.cat.sprite.frame.name),clock:clockHands(this.state.minutes),minutes:this.state.minutes,room:roomAt(LAYOUT,this.owner.point),zoom:camera.zoom,left:camera.worldView.x,top:camera.worldView.y,width:this.scale.width,height:this.scale.height,seated:!!this.seat,catBehavior:this.behavior,tool:this.tool,pounces:this.pounces,ownerBusy:!!this.ownerTask,catDisplay:this.catDisplay()});}
 }
 private burst(p:Point,color:number,count=6){for(let i=0;i<count;i++)this.sparkles.push({x:p.x+(Math.random()-.5)*30,y:p.y-40-Math.random()*15,life:1,color});}
 private drawEffects(dt:number){
  this.marker.clear();if(this.markerPoint&&this.markerLife>0){this.markerLife-=dt/900;this.marker.lineStyle(2,0xffefc7,this.markerLife*.7);this.marker.strokeEllipse(this.markerPoint.x,this.markerPoint.y,20,10);}
  const g=this.effects;g.clear();this.sparkles=this.sparkles.filter(s=>s.life>0);for(const s of this.sparkles){s.life-=dt/1200;if(!this.state.reducedMotion)s.y-=dt/65;g.fillStyle(s.color,s.life);g.fillRect(s.x,s.y,4,4);g.fillRect(s.x+1,s.y-2,2,8);}
  const hand={x:this.owner.point.x+(this.owner.direction==='left'?-22:22),y:this.owner.point.y-39};
  if(this.tool==='brush'){const stroke=this.ownerTask?.kind==='brush'?Math.sin(this.time.now/130)*7:0;g.fillStyle(0x846e4a);g.fillRect(hand.x,hand.y+stroke,4,20);g.fillStyle(0xb6b58e);g.fillRect(hand.x-6,hand.y-8+stroke,17,14);g.fillStyle(0x77835f);for(let i=0;i<4;i++)g.fillRect(hand.x-5+i*4,hand.y-9+stroke,2,5);}
  if(this.tool==='wand'){
   const toy=this.toyUntil>this.time.now?this.toy:{x:hand.x+35,y:hand.y+28};g.lineStyle(3,0x927149);g.lineBetween(hand.x,hand.y,hand.x+23,hand.y-26);g.lineStyle(1.5,0xb7a180);g.lineBetween(hand.x+23,hand.y-26,toy.x,toy.y);
   g.fillStyle(this.state.equipped.toy==='ribbon'?0xc18c85:0xa5ae82);g.fillRect(toy.x-4,toy.y-6,9,14);g.fillStyle(0xe5c99b);g.fillRect(toy.x-1,toy.y+6,3,7);
   if(this.pounces)for(let i=0;i<3;i++){g.fillStyle(i<this.pounces?0xe8bd88:0xece4c7);g.fillCircle(this.cat.point.x-10+i*10,this.cat.point.y-65,3);}
  }
  if(this.ownerTask?.kind==='food'||this.ownerTask?.kind==='water'){
   g.fillStyle(this.ownerTask.kind==='food'?0xd3b584:0x8fb6b1);g.fillRect(this.owner.point.x-10,this.owner.point.y-36,19,21);g.fillStyle(0xf2dbaa);g.fillRect(this.owner.point.x-8,this.owner.point.y-33,15,4);
   for(let i=0;i<4;i++){const y=this.owner.point.y-40-((this.time.now/50+i*7)%20);g.fillStyle(this.ownerTask.kind==='food'?0xc69a62:0xb0d1c8);g.fillRect(this.owner.point.x-4+i*3,y,3,4);}
  }
 }
 private place(a:Resident){a.sprite.setPosition(Math.round(a.point.x),Math.round(a.point.y)).setDepth(a.point.y);a.shadow.setPosition(a.point.x,a.point.y+1).setDepth(a.point.y-.1);}
 worldPoint(x:number,y:number){const r=this.game.canvas.getBoundingClientRect();return this.cameras.main.getWorldPoint((x-r.left)*this.scale.width/r.width,(y-r.top)*this.scale.height/r.height);}
 flush(){this.changed();}
}
export function startHome(parent:HTMLElement,state:Save,hooks:Hooks){const scene=new Home(state,hooks);const game=new Phaser.Game({type:Phaser.CANVAS,parent,width:parent.clientWidth,height:parent.clientHeight,scene:[scene],backgroundColor:'#e2dfd1',pixelArt:true,roundPixels:true,audio:{noAudio:true},scale:{mode:Phaser.Scale.RESIZE},banner:false});return {scene,game};}
