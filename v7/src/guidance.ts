import type {Save} from './care';
import {dayDirection} from './progress';
export interface Guidance {target:string;label:string;text:string;item?:string}
/** Daily completion stays visible; ordinary needs remain in the cat's bubbles. */
export function guidance(s:Save,tool:string=s.held.tool,_pose='',_behavior='',toy=s.held.toy):Guidance{
 const next=dayDirection(s,tool,toy);
 return {target:next.target,label:next.label,text:`${next.label}. ${next.text}`,item:next.item};
}
