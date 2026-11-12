import type {Save} from './care';
export type Thought='food'|'water'|'play'|'attention'|'nap'|'space'|'window'|'sound'|'mouse';
export const THOUGHT_LABELS:Record<Thought,string>={food:'Food',water:'Fresh water',play:'Play',attention:'Company',nap:'Rest',space:'Some space',window:'A comfortable window perch',sound:'A worrying little sound',mouse:'A missing little mouse'};
export const OBJECT_NAMES:Record<string,string>={food:'Food bowl',water:'Water bowl',brush:'Brush',wand:'Toy wand',sofa:'Sofa','window-seat':'Window seat',bookshelf:'Books','coffee-table':'Tea table',treat:'Treat jar','kitchen-counter':'Kitchen counter','kitchen-table':'Dining table',bed:'Bed','nook-chair':'Reading chair','nook-books':'Books','bedroom-books':'Books',cat:'Your cat'};
export function thoughts(s:Save,pose:string,behavior:string):Thought[]{
 if(!s.mystery.solved){if(s.mystery.patience===0)return ['space'];if(s.mystery.kind==='sunbeam')return ['window'];if(s.mystery.kind==='rattle')return ['water','sound'];if(s.mystery.kind==='mouse')return ['mouse'];}
 if(s.adventure.active?.kind==='storm')return ['space'];
 if(s.tension>=65||(s.personality==='Shy'&&s.tension>=35))return ['space'];
 if(pose==='sleep')return ['nap'];
 if(s.needs.energy<32)return ['nap'];
 const choices:{kind:Thought;value:number}[]=[{kind:'food',value:s.needs.food},{kind:'water',value:s.needs.water},{kind:'play',value:s.needs.play},{kind:'attention',value:s.needs.comfort}];
 const wanted=choices.filter(c=>c.value<60).sort((a,b)=>a.value-b.value).slice(0,2).map(c=>c.kind);
 if(!wanted.length&&(behavior==='visiting'||behavior==='rubbing'||behavior==='coming for a lap'))return ['attention'];
 return wanted;
}
export function thoughtSVG(kind:Thought){
 const paths:Record<Thought,string>={window:'M4 3h16v16H4zM12 3v16M4 11h16M2 21h20',sound:'M9 8V4c7-4 13 4 7 10-3 2-3 6-7 6M7 12l4-3 2 4-4 3M3 9l2 2M3 16h3',mouse:'M3 17q-2 6 3 5M6 16q-2-10 9-8 8 1 7 8-7 6-16 0M12 8q-5-8-6-2 0 5 5 4M18 12h1',food:'M3 10h18l-3 8H6L3 10Zm4-4h2m3-2h2m2 3h2',water:'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z',play:'m4 20 15-15M15 3l6 6M4 5l3 1 1 4-4-1-1-3Zm11 11 4 1 1 4-4-1-1-4Z',attention:'M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z',nap:'M19 16A8 8 0 0 1 9 4 8 8 0 1 0 19 16Z',space:'M7 18c-4-9 0-13 5-13h7c0 10-5 16-12 13Zm0 0 9-10M3 20h4'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[kind]}"/></svg>`;
}
