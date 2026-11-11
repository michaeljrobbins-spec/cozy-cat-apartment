import type {Personality,Save} from './care';
export const TOY_IDS=['wand','ball','laser','box','feather','mouse'] as const;
export type ToyId=typeof TOY_IDS[number];
export interface ToyMemory{uses:number;joy:number}
export interface PlayHistory{toys:Partial<Record<ToyId,ToyMemory>>;last?:ToyId;streak:number;day:number;rewarded:number}
export const newPlayHistory=():PlayHistory=>({toys:{},streak:0,day:1,rewarded:0});
export const TOYS:Record<ToyId,{name:string;verb:string;hint:string;period:number;spot:{x:number;y:number};approach:{x:number;y:number}}>={
 wand:{name:'Ribbon wand',verb:'Flick ribbon',hint:'Let the ribbon settle, then flick in the green band.',period:2600,spot:{x:176,y:244},approach:{x:192,y:256}},
 ball:{name:'Crinkle ball',verb:'Roll ball',hint:'Choose a direction. Release in green for a gentle rolling catch.',period:2100,spot:{x:368,y:432},approach:{x:368,y:464}},
 laser:{name:'Laser pointer',verb:'Let them catch',hint:'Guide the dot slowly near your cat. Pause, then offer a soft mouse to catch.',period:3000,spot:{x:790,y:328},approach:{x:784,y:432}},
 box:{name:'Cardboard box',verb:'Rustle the box',hint:'Wait for curious ears. Rustle in green to invite a hide-and-pounce.',period:3600,spot:{x:352,y:576},approach:{x:368,y:624}},
 feather:{name:'Feather teaser',verb:'Flick feather',hint:'A little patience: flick in green when the cat is ready to leap.',period:2800,spot:{x:368,y:200},approach:{x:384,y:240}},
 mouse:{name:'Catnip mouse',verb:'Toss mouse',hint:'Aim 50–110 steps away, then toss. Give your cat time to stalk.',period:2600,spot:{x:320,y:592},approach:{x:320,y:624}},
};
const BASE:Record<Personality,Record<ToyId,number>>={Shy:{wand:.64,ball:.55,laser:.42,box:.9,feather:.75,mouse:.88},Playful:{wand:.82,ball:.92,laser:.87,box:.65,feather:.82,mouse:.72},Demanding:{wand:.86,ball:.6,laser:.78,box:.65,feather:.94,mouse:.65}};
export function interest(s:Save,id:ToyId){const m=s.playHistory.toys[id],learned=m?m.joy/Math.max(1,m.uses):BASE[s.personality][id];return Math.max(0,BASE[s.personality][id]*.55+learned*.45-(s.playHistory.last===id?Math.max(0,s.playHistory.streak-1)*.2:0));}
export function favorite(s:Save):ToyId|undefined{return TOY_IDS.filter(id=>(s.playHistory.toys[id]?.uses||0)>=2).sort((a,b)=>interest({...s,playHistory:{...s.playHistory,streak:0}},b)-interest({...s,playHistory:{...s.playHistory,streak:0}},a))[0];}
export function timingAt(elapsed:number,id:ToyId){return (elapsed%TOYS[id].period)/TOYS[id].period;}
export function grade(id:ToyId,timing:number,range:number,steady:number){if(id==='laser')return steady>=.55?1:.45;if(id==='mouse')return range>=50&&range<=110?1:.45;return timing>=.32&&timing<=.78?1:.4;}
export function rememberPlay(s:Save,id:ToyId,quality:number){const n=structuredClone(s),h=n.playHistory,m=h.toys[id]||{uses:0,joy:0};m.uses++;m.joy+=Math.max(0,Math.min(1,quality));h.toys[id]=m;h.streak=h.last===id?h.streak+1:1;h.last=id;if(h.day!==n.day){h.day=n.day;h.rewarded=0;}const bonus=h.rewarded<3;h.rewarded++;if(bonus){n.hearts+=quality>=.75?3:1;n.journey.bond++;}return n;}
export function validPlay(h:unknown):h is PlayHistory{const p=h as PlayHistory,n=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<1e6;return !!p&&n(p.streak)&&n(p.day)&&n(p.rewarded)&&(!p.last||TOY_IDS.includes(p.last))&&!!p.toys&&typeof p.toys==='object'&&!Array.isArray(p.toys)&&Object.entries(p.toys).every(([id,m])=>TOY_IDS.includes(id as ToyId)&&n(m.uses)&&Number.isInteger(m.uses)&&n(m.joy)&&m.joy<=m.uses);}
