import type {Save} from './care';
import {MOMENT_INFO} from './adventure';
import {thoughts} from './signals';
export interface Guidance {target:string;label:string;text:string;item?:string}
/** The next useful action, shared by world labels, cabinet shelves and household notes. */
export function guidance(s:Save,tool='hands',pose='',behavior=''):Guidance|undefined{
 const m=s.mystery;
 if(!m.solved){
  if(m.patience===0)return {target:'cat',label:'Quiet reassurance',text:'Put your tool down, then tap your cat for a quiet moment together.'};
  if(m.kind==='sunbeam'){
   if(!m.cushion)return tool==='cushion'?{target:'window-seat',label:'Place window cushion',text:'Tap the window seat or Place cushion to soften the perch.'}:{target:'cabinet',item:'sage',label:'Window cushion inside',text:'The perch is hard. Take the Window cushion from the toy cabinet, then place it on the window seat.'};
   if(m.shade<.4||m.shade>.8)return {target:'curtain',label:'Soften the window light',text:m.shade>.8?'The curtain is too closed. Draw it back until the perch has a soft patch of light.':'The cat is squinting. Tap the curtain and draw it partway across the window.'};
   return {target:'window-seat',label:'Invite your cat',text:'The light is soft and the cushion is ready. Tap the window seat to invite your cat.'};
  }
  if(m.kind==='rattle'){
   if(!m.mat)return tool==='mat'?{target:'water',label:'Place felt bowl mat',text:'Tap the water bowl or Place bowl mat to stop the ringing.'}:{target:'cabinet',item:'felt',label:'Felt bowl mat inside',text:'The bowl rings on the hard floor. Take the Felt bowl mat from the toy cabinet and place it under the water bowl.'};
   return {target:'water',label:'Pour a quiet drink',text:'Tap the water bowl. Hold the pour action, then release at the gold mark on the jug.'};
  }
  if(!m.clues.includes('bed'))return {target:'bed-clue',label:'Look for the mouse tail',text:'Your cat is looking beneath the bedroom bed. Tap there to find the missing mouse.'};
  if(tool!=='wand')return {target:'cabinet',item:'wand',label:'Ribbon wand inside',text:'Take the Ribbon wand from the toy cabinet to reach the mouse beneath the bed.'};
  return {target:'bed-clue',label:'Ease the mouse out',text:'Tap beneath the bed, then slowly drag the mouse tail onto clear floor. Ease mouse out or E gives a gentle pull.'};
 }
 const moment=s.adventure.active?.kind;
 if(moment){const info=MOMENT_INFO[moment];return {target:'moment',label:info.action,text:info.text+' Tap here to '+info.action.toLowerCase()+', or give your cat space.'};}
 const want=thoughts(s,pose,behavior)[0];
 const care:Record<string,Guidance>={food:{target:'food',label:'Refill food bowl',text:'Tap the food bowl to offer a meal.'},water:{target:'water',label:'Refill water bowl',text:'Tap the water bowl for a fresh drink.'},play:{target:'cabinet',item:'wand',label:'Choose a toy inside',text:'Take a toy from the toy cabinet to play together.'},attention:{target:'cat',label:'Offer quiet company',text:'Put tools down and tap your cat to offer company.'},nap:{target:'window-seat',label:'A place to rest',text:'Tap the window seat to invite a rest, or let your cat settle on their own.'},space:{target:'',label:'Give some space',text:'Put tools down and step away. Let your cat unwind in peace.'}};
 return want?care[want]:undefined;
}
