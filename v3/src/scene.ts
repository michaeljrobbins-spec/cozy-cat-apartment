import Phaser from 'phaser';
import {type Save,advanceClock,clockHands} from './care';
import {LAYOUT,Navigator,moveWithCollision,canStand,distance,roomAt,CAT_RADIUS,OWNER_RADIUS,type Point,type Fixture} from './world';
import {ApartmentArt} from './room';
import {installOwner,installCat,ownerKey,type Direction,type OwnerPose,type CatPose} from './sprites';
export interface Snapshot{owner:Point;cat:Point;ownerPose:OwnerPose;catPose:CatPose;ownerFrame:string;catFrame:string;clock:{minute:number;hour:number};minutes:number;room:string;zoom:number;left:number;top:number;width:number;height:number;seated:boolean;catBehavior:string}
export interface Hooks{ready:()=>void;change:(s:Save)=>void;snapshot:(s:Snapshot)=>void;sound:(kind:string)=>void}
interface Resident{point:Point;sprite:Phaser.GameObjects.Sprite;shadow:Phaser.GameObjects.Ellipse;path:Point[];direction:Direction}
export class Home extends Phaser.Scene{
 state!:Save;activePlay=false;private hooks:Hooks;private art!:ApartmentArt;
 private owner!:Resident;private cat!:Resident;private ownerPose:OwnerPose='idle';private catPose:CatPose='sit';
 private ownerNav=new Navigator(LAYOUT,OWNER_RADIUS);private catNav=new Navigator(LAYOUT,CAT_RADIUS);
 private inputVector={x:0,y:0};private catRest=2700;private catChoice=0;private ownerTexture='';
 private saveElapsed=0;private snapshotElapsed=0;private footElapsed=0;private marker!:Phaser.GameObjects.Graphics;private markerPoint?:Point;private markerLife=0;
 constructor(state:Save,hooks:Hooks){super('home');this.state=state;this.hooks=hooks;}
 create(){
  installOwner(this,this.state.owner);installCat(this,this.state.coat);this.ownerTexture=ownerKey(this.state.owner);this.art=new ApartmentArt(this,LAYOUT,this.state);
  this.owner=this.resident(this.ownerNav.nearest(this.state.ownerPosition),this.ownerTexture,'idle-down-0',2);
  this.cat=this.resident(this.catNav.nearest({x:560,y:624}),`cat-${this.state.coat}`,'soft-sit-down-0',1.65);
  this.marker=this.add.graphics().setDepth(4900);this.animateOwner('idle');this.animateCat('sit');this.resize();this.scale.on('resize',()=>this.resize());this.hooks.ready();
 }
 private resident(point:Point,key:string,frame:string,scale:number):Resident{
  const shadow=this.add.ellipse(point.x,point.y,31,12,0x584c37,.16);const sprite=this.add.sprite(point.x,point.y,key,frame).setScale(scale).setOrigin(.5,.94);
  return {point:{...point},sprite,shadow,path:[],direction:'down'};
 }
 sync(state:Save){this.state=state;if(!this.owner)return;
  const key=ownerKey(state.owner);if(key!==this.ownerTexture){installOwner(this,state.owner);this.ownerTexture=key;this.owner.sprite.setTexture(key);this.animateOwner(this.ownerPose);}
  if(this.cat.sprite.texture.key!==`cat-${state.coat}`){installCat(this,state.coat);this.cat.sprite.setTexture(`cat-${state.coat}`);this.animateCat(this.catPose);}
 }
 private resize(){if(!this.owner)return;const c=this.cameras.main;c.setZoom(Math.max(this.scale.width/LAYOUT.width,this.scale.width<700?.9:1.03));c.setBounds(0,0,LAYOUT.width,LAYOUT.height);c.centerOn(this.owner.point.x,this.owner.point.y-110);}
 private animateOwner(pose:OwnerPose){this.ownerPose=pose;const key=`${this.ownerTexture}-${pose}-${this.owner.direction}`;if(this.owner.sprite.anims.currentAnim?.key!==key)this.owner.sprite.play(key);}
 private animateCat(pose:CatPose){this.catPose=pose;const key=`cat-${this.state.coat}-soft-${pose}-${this.cat.direction}`;if(this.cat.sprite.anims.currentAnim?.key!==key)this.cat.sprite.play(key);}
 setInput(x:number,y:number){this.inputVector={x,y};if(x||y)this.owner.path=[];}
 walkTo(point:Point){if(!this.owner)return;this.owner.path=this.ownerNav.path(this.owner.point,point);this.markerPoint=this.owner.path.at(-1);this.markerLife=1;}
 approach(id:string){const f=LAYOUT.fixtures.find(f=>f.id===id);if(f)this.walkTo(f.approach);}
 interact(){const fixture=this.nearestFixture();if(fixture)this.approach(fixture.id);}
 private nearestFixture(){return LAYOUT.fixtures.filter(f=>f.kind!=='wall').sort((a,b)=>distance(this.owner.point,a.approach)-distance(this.owner.point,b.approach))[0];}
 private direction(dx:number,dy:number):Direction{return Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}
 private followPath(actor:Resident,nav:Navigator,speed:number,dt:number){
  while(actor.path.length&&distance(actor.point,actor.path[0])<2)actor.path.shift();const next=actor.path[0];if(!next)return false;
  const d=distance(actor.point,next),step=Math.min(d,speed*dt/1000),dx=(next.x-actor.point.x)/d*step,dy=(next.y-actor.point.y)/d*step;
  actor.direction=this.direction(dx,dy);const moved=moveWithCollision(LAYOUT,actor.point,dx,dy,nav.radius);if(distance(moved,actor.point)<.1){actor.path=[];return false;}actor.point=moved;return true;
 }
 update(time:number,delta:number){
  if(!this.owner)return;const dt=Math.min(50,delta);this.art.update(time,dt,this.state);
  if(this.activePlay){
   this.state.minutes=advanceClock(this.state.minutes,dt/1000);let moving=false;
   const vector=new Phaser.Math.Vector2(this.inputVector.x,this.inputVector.y);if(vector.lengthSq()>0){vector.normalize().scale(172*dt/1000);const p=moveWithCollision(LAYOUT,this.owner.point,vector.x,vector.y);moving=distance(p,this.owner.point)>.05;this.owner.point=p;this.owner.direction=this.direction(vector.x,vector.y);}else moving=this.followPath(this.owner,this.ownerNav,172,dt);
   this.animateOwner(moving?'walk':'idle');
   const catMoving=this.followPath(this.cat,this.catNav,106,dt);if(catMoving)this.animateCat('walk');else{this.catRest-=dt;if(this.catPose==='walk')this.animateCat('sit');if(this.catRest<=0){const spots=[{x:304,y:688},{x:592,y:336},{x:912,y:656},{x:720,y:560},{x:336,y:464}];this.cat.path=this.catNav.path(this.cat.point,spots[this.catChoice++%spots.length]);this.catRest=6500;this.animateCat(['sit','groom','stretch','sleep'][this.catChoice%4] as CatPose);}}
   this.state.ownerPosition={...this.owner.point};this.saveElapsed+=dt;this.footElapsed+=dt;if(moving&&this.footElapsed>330){this.footElapsed=0;this.hooks.sound('step');}if(this.saveElapsed>5000){this.saveElapsed=0;this.hooks.change(this.state);}
  }
  this.place(this.owner);this.place(this.cat);
  const camera=this.cameras.main;camera.scrollX=Phaser.Math.Linear(camera.scrollX,this.owner.point.x-this.scale.width/2,.08);camera.scrollY=Phaser.Math.Linear(camera.scrollY,this.owner.point.y-90-this.scale.height/2,.08);
  this.marker.clear();if(this.markerPoint&&this.markerLife>0){this.markerLife-=dt/900;this.marker.lineStyle(2,0xffefc7,this.markerLife*.7);this.marker.strokeEllipse(this.markerPoint.x,this.markerPoint.y,20,10);}
  this.snapshotElapsed+=dt;if(this.snapshotElapsed>90){this.snapshotElapsed=0;this.hooks.snapshot({owner:{...this.owner.point},cat:{...this.cat.point},ownerPose:this.ownerPose,catPose:this.catPose,ownerFrame:String(this.owner.sprite.frame.name),catFrame:String(this.cat.sprite.frame.name),clock:clockHands(this.state.minutes),minutes:this.state.minutes,room:roomAt(LAYOUT,this.owner.point),zoom:camera.zoom,left:camera.worldView.x,top:camera.worldView.y,width:this.scale.width,height:this.scale.height,seated:false,catBehavior:'wandering'});}
 }
 private place(actor:Resident){actor.sprite.setPosition(Math.round(actor.point.x),Math.round(actor.point.y)).setDepth(actor.point.y);actor.shadow.setPosition(actor.point.x,actor.point.y+1).setDepth(actor.point.y-.1);}
 worldPoint(clientX:number,clientY:number){const r=this.game.canvas.getBoundingClientRect();return this.cameras.main.getWorldPoint((clientX-r.left)*this.scale.width/r.width,(clientY-r.top)*this.scale.height/r.height);}
 flush(){this.hooks.change(this.state);}
}
export function startHome(parent:HTMLElement,state:Save,hooks:Hooks){const scene=new Home(state,hooks);const game=new Phaser.Game({type:Phaser.CANVAS,parent,width:parent.clientWidth,height:parent.clientHeight,scene:[scene],backgroundColor:'#e2dfd1',pixelArt:true,roundPixels:true,audio:{noAudio:true},scale:{mode:Phaser.Scale.RESIZE},banner:false});return {scene,game};}
