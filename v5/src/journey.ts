import type {Save} from './care';
export const EVENTS=['walk','refillFood','refillWater','observe','quiet','ate','drank','affection','played','care','nap'] as const;
export type Event=typeof EVENTS[number];
export type Journey={tutorial:{step:number;status:'active'|'skipped'|'complete'};stats:Partial<Record<Event,number>>;bond:number;goalDay:number;arc:'settle'|'trust'|'listen'|'space';completed:string[];baseline:Partial<Record<Event,number>>};
export function newJourney(day=1,tension=0):Journey{return {tutorial:{step:0,status:day===1?'active':'complete'},stats:{},bond:0,goalDay:day,arc:day===1?'settle':tension>=35?'space':day%2===0?'trust':'listen',completed:[],baseline:{}};}
export function nextJourney(j:Journey,day:number,tension:number):Journey{return {...newJourney(day,tension),tutorial:{...j.tutorial},stats:{...j.stats},bond:j.bond,baseline:{...j.stats}};}
export const TUTORIAL=[
 {title:'Take a few little steps',text:'Move with WASD or arrows, the thumbstick, or tap the floor. This is your home, too.',event:'walk',target:undefined},
 {title:'A fresh bowl, a warm welcome',text:'Find the Food bowl. Tap it, or walk nearby and press E. You’ll fill it; your cat decides when to eat.',event:'refillFood',target:'food'},
 {title:'A little fresh water',text:'Use the Water bowl the same way. A soft outline and label show what’s nearby.',event:'refillWater',target:'water'},
 {title:'Notice the little signs',text:'Watch your cat for a moment. Thought icons show food, water, play, company, rest, or space; ears and tail tell the rest.',event:'observe',target:undefined},
 {title:'Let your roommate choose',text:'Put tools down and pause for a few seconds. Cats need their own little moments, too. You can skip or replay this guide in Help.',event:'quiet',target:undefined},
] as const;
export const ARC_TITLES={settle:'Help your cat settle in',trust:'A little more trust',listen:'Listen to the little things',space:'Room to feel safe'};
export interface Goal{id:string;label:string;event:Event;target:number}
export function goals(j:Journey):Goal[]{
 if(j.arc==='settle')return [{id:'watch',label:'Notice your cat’s little ways',event:'observe',target:1},{id:'meal',label:'Share a helpful fresh meal',event:'ate',target:1},{id:'water',label:'Offer a welcome drink',event:'drank',target:1}];
 if(j.arc==='trust')return [{id:'comfort',label:'Share welcome affection or brushing',event:'affection',target:1},{id:'play',label:'Enjoy a play session together',event:'played',target:1},{id:'rest',label:'Leave room for a quiet moment',event:'quiet',target:1}];
 return [{id:'notice',label:j.arc==='space'?'Notice the ears, tail, and space icon':'Read a little thought or body-language cue',event:'observe',target:1},{id:'care',label:'Respond with helpful care',event:'care',target:1},{id:'quiet',label:'Give your cat a peaceful moment',event:'quiet',target:1}];
}
export function goalProgress(j:Journey,g:Goal){return Math.min(g.target,Math.max(0,(j.stats[g.event]||0)-(j.baseline[g.event]||0)));}
export function bondName(bond:number){return bond<6?'Getting acquainted':bond<15?'Comfortable company':'A familiar friend';}
export function event(s:Save,kind:Event):{state:Save;messages:string[]}{
 const n=structuredClone(s);const j=n.journey;j.stats[kind]=(j.stats[kind]||0)+1;const messages:string[]=[];
 if(j.tutorial.status==='active'&&TUTORIAL[j.tutorial.step]?.event===kind){j.tutorial.step++;if(j.tutorial.step>=TUTORIAL.length){j.tutorial.status='complete';messages.push('You’ve found your own little rhythm. The guide is always in Help.');}}
 for(const g of goals(j))if(!j.completed.includes(g.id)&&goalProgress(j,g)>=g.target){j.completed.push(g.id);j.bond++;n.hearts+=2;n.treats.stars=(n.treats.stars||0)+1;messages.push(`${g.label} · +1 bond, +2 hearts, +1 crunchy star in Inventory`);}
 if(j.completed.length===3&&!n.owned.includes('feather')){n.owned.push('feather');messages.push('A whole day of little moments! Feather teaser added to Inventory.');}
 return {state:n,messages};
}
export function validJourney(j:unknown):j is Journey{
 const s=j as Journey,n=(v:unknown)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=1000000;
 if(!s||!s.tutorial||!n(s.tutorial.step)||s.tutorial.step>5||!['active','skipped','complete'].includes(s.tutorial.status)||!n(s.bond)||!n(s.goalDay)||s.goalDay<1||!['settle','trust','listen','space'].includes(s.arc)||!Array.isArray(s.completed)||!s.completed.every(k=>goals(s).some(g=>g.id===k)))return false;
 for(const record of [s.stats,s.baseline])if(!record||typeof record!=='object'||Array.isArray(record)||!Object.entries(record).every(([k,v])=>EVENTS.includes(k as Event)&&n(v)))return false;
 return new Set(s.completed).size===s.completed.length;
}
