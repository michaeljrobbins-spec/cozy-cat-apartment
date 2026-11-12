import type {Save} from './care';
import {guidance} from './guidance';
import {ROOM_OBJECTS} from './objects';
import {PROPS} from './props';
import {TOYS,type ToyId} from './play';
import {distance,type Point} from './world';
import {lightReady,windowReady} from './mystery';
export interface ActionContext{owner:Point;cat:Point;tool:string;toy:ToyId;view:string;seated:boolean;pourArmed:boolean;pourActive:boolean;playReady:boolean;busy?:string;walking?:string;catPose:string;behavior:string}
export interface Action{id:'approach'|'place-cushion'|'place-mat'|'adjust-curtain'|'pour'|'rescue'|'play'|'stand'|'put-down'|'wait';target:string;label:string;enabled:boolean;hold?:boolean}
const approach=(target:string,label:string):Action=>({id:'approach',target,label,enabled:true});
const action=(id:Action['id'],label:string,target='',hold=false):Action=>({id,label,target,enabled:true,hold});
/** World clicks, keyboard E and the owner's prompt all use these same actions. */
export function actionForObject(s:Save,c:ActionContext,id:string):Action{
 const m=s.mystery;
 if(id==='window-seat'&&m.kind==='sunbeam'&&!m.solved){
  if(c.tool==='cushion')return action('place-cushion','Place cushion on window seat',id);
  if(!m.cushion)return approach('cabinet','Get Window cushion from cabinet');
  if(!lightReady(m.shade))return c.tool==='curtain'?action('adjust-curtain','Draw curtain','curtain'):approach('curtain','Draw curtain beside window');
  return approach(id,`Invite ${s.name} onto the perch`);
 }
 if(id==='curtain'){
  if(m.kind==='sunbeam'&&!m.solved&&windowReady(m))return approach('window-seat',`Invite ${s.name} onto the perch`);
  if(lightReady(m.shade)&&!m.cushion)return approach('cabinet','Get Window cushion from cabinet');
  return c.tool==='curtain'?action('adjust-curtain','Draw curtain',id):approach(id,'Draw curtain beside window');
 }
 if(id==='water'&&m.kind==='rattle'&&!m.solved){
  if(c.tool==='mat')return action('place-mat','Place mat under water bowl',id);
  if(!m.mat)return s.owned.includes('felt')?approach('cabinet','Get Felt bowl mat from cabinet'):approach('phone','Order Felt bowl mat on phone');
  return c.pourArmed?action('pour',c.pourActive?'Release at the gold mark':'Hold to pour a quiet drink',id,true):approach(id,'Prepare a quiet drink');
 }
 if(id==='bed-clue'&&m.kind==='mouse'&&!m.solved){
  if(!m.clues.includes('bed'))return approach(id,'Look beneath the bedroom bed');
  if(c.tool!=='wand'||c.toy!=='wand')return approach('cabinet','Get Ribbon wand from cabinet');
  return action('rescue','Ease the mouse onto clear floor',id);
 }
 if(id==='cat'){
  if(!m.solved&&m.patience===0&&c.tool!=='hands')return action('put-down','Put tool down for reassurance');
  return approach(id,!m.solved&&m.patience===0?`Reassure ${s.name}`:c.tool==='brush'?`Brush ${s.name}`:`Spend time with ${s.name}`);
 }
 const labels:Record<string,string>={cabinet:'Open toy cabinet',fridge:'Read today’s fridge note',phone:'Use your phone',clock:'Read wall clock',food:'Fill food bowl',water:'Refresh water bowl',brush:'Pick up brush',sofa:'Sit on the sofa','nook-chair':'Sit in the reading nook',bed:'Settle in for the night',treat:'Offer a treat','window-seat':'Invite a window nap','discover-nook':'Search the nook bookshelf','discover-tin':'Open the kitchen tin'};
 if(id.startsWith('toy-'))return approach(id,`Pick up ${TOYS[id.slice(4) as ToyId].name}`);
 return approach(id,labels[id]||ROOM_OBJECTS.find(o=>o.id===id)?.label||'Look closely');
}
export function resolveAction(s:Save,c:ActionContext):Action|undefined{
 if(c.view!=='room')return;
 if(c.busy||c.walking)return {id:'wait',target:'',label:c.busy||`Walking to ${c.walking}…`,enabled:false};
 if(c.seated)return action('stand','Stand up');
 const m=s.mystery;
 if(!m.solved&&m.patience===0&&c.tool!=='hands')return action('put-down','Put tool down for reassurance');
 if(m.kind==='sunbeam'&&!m.solved&&windowReady(m)&&distance(c.owner,{x:272,y:240})<160)return actionForObject(s,c,'window-seat');
 if(c.pourArmed)return action('pour',c.pourActive?'Release at the gold mark':'Hold to pour a quiet drink','water',true);
 if(c.tool==='curtain')return actionForObject(s,c,'curtain');
 if(c.tool==='cushion')return action('place-cushion','Place cushion on window seat','window-seat');
 if(c.tool==='mat')return action('place-mat','Place mat under water bowl','water');
 if(c.tool==='brush')return actionForObject(s,c,'cat');
 if(c.tool==='wand'){
  if(m.kind==='mouse'&&!m.solved&&c.toy==='wand')return actionForObject(s,c,'bed-clue');
  return {...action('play',TOYS[c.toy].verb),enabled:c.playReady};
 }
 const clue=guidance(s,c.tool,c.catPose,c.behavior);
 if(clue?.target==='cat'&&distance(c.owner,c.cat)<120)return actionForObject(s,c,'cat');
 const goal=ROOM_OBJECTS.find(o=>o.id===clue?.target);
 if(goal&&distance(c.owner,goal.approach)<110)return actionForObject(s,c,goal.id);
 const near=ROOM_OBJECTS.filter(o=>distance(c.owner,o.approach)<80&&(!o.id.startsWith('toy-')||s.owned.includes(o.id.slice(4)))&&(!o.id.startsWith('discover-')||!s.adventure.discovered.includes(o.id.slice(9)))&&(o.id!=='moment'||!!s.adventure.active)&&(o.id!=='curtain'||m.kind==='sunbeam'&&!m.solved)&&(o.id!=='bed-clue'||m.kind==='mouse'&&!m.solved)).sort((a,b)=>distance(c.owner,a.approach)-distance(c.owner,b.approach)||(a.id in PROPS?-1:0)-(b.id in PROPS?-1:0))[0];
 if(near)return actionForObject(s,c,near.id);
 if(distance(c.owner,c.cat)<90)return actionForObject(s,c,'cat');
}
