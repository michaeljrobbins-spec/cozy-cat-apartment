import type {Save} from './care';
import {caseInfo,lightReady} from './mystery';
export interface DayStep{id:string;action:string;where:string;target:string;done:boolean;item?:string}
/** The fridge, phone and room route use the same actual saved prerequisites. */
export function daySteps(s:Save,tool:string=s.held.tool,toy=s.held.toy):DayStep[]{
 const m=s.mystery;
 if(m.kind==='sunbeam')return [
  {id:'take',action:'Take the Window cushion',where:'Toy cabinet beside the tea table',target:'cabinet',item:'sage',done:m.cushion||tool==='cushion'},
  {id:'place',action:'Place the cushion on the window seat',where:'Living room · below the big window',target:'window-seat',done:m.cushion},
  {id:'light',action:'Draw the curtain until “Light ready”',where:'Right side of the big window',target:'curtain',done:lightReady(m.shade)},
  {id:'invite',action:`Invite ${s.name} onto the perch`,where:'Window seat · use the nearby action',target:'window-seat',done:m.solved},
 ];
 if(m.kind==='rattle')return [
  {id:'take',action:s.owned.includes('felt')?'Take the Felt bowl mat':'Order the Felt bowl mat (4 hearts)',where:s.owned.includes('felt')?'Toy cabinet beside the tea table':'Owner’s phone · Orders',target:s.owned.includes('felt')?'cabinet':'phone',item:'felt',done:m.mat||tool==='mat'},
  {id:'place',action:'Place the mat under the water bowl',where:'Kitchen · bowl beside the food dish',target:'water',done:m.mat},
  {id:'pour',action:'Hold to pour; release at the gold mark',where:'Kitchen · prepare a drink at the water bowl',target:'water',done:m.solved},
 ];
 return [
  {id:'look',action:'Look beneath the bedroom bed',where:'Bedroom · lower right of the apartment',target:'bed-clue',done:m.clues.includes('bed')||m.solved},
  {id:'take',action:'Take the Ribbon wand',where:'Toy cabinet beside the tea table',target:'cabinet',item:'wand',done:tool==='wand'&&toy==='wand'||m.solved},
  {id:'rescue',action:'Ease the mouse out with gentle pulls',where:'Beneath the bed · tap the nearby action or E',target:'bed-clue',done:m.solved},
 ];
}
export function dayDirection(s:Save,tool:string=s.held.tool,toy=s.held.toy){
 const steps=daySteps(s,tool,toy),m=s.mystery;
 const want=m.solved?`${s.name}’s mystery is solved`:m.patience===0?`${s.name} needs reassurance`:m.kind==='sunbeam'?`${s.name} wants a soft, shaded perch`:m.kind==='rattle'?`${s.name} wants a quiet drink`:`${s.name} wants the missing mouse`;
 if(m.solved)return {target:'bed',label:'Day complete · Settle in for the night',text:'Bedroom bed · tap to walk there, or keep spending time together.',want,done:steps.length,total:steps.length};
 if(m.patience===0)return {target:'cat',label:tool==='hands'?`Reassure ${s.name}`:'Put your tool down, then reassure your cat',text:'Use Put down beside the owner, then tap your cat for quiet company.',want,done:steps.filter(x=>x.done).length,total:steps.length};
 const next=steps.find(x=>!x.done)!;
 return {target:next.target,label:next.action,text:next.where,item:next.item,want,done:steps.filter(x=>x.done).length,total:steps.length};
}
export const dayTitle=(s:Save)=>caseInfo(s.mystery).title;
