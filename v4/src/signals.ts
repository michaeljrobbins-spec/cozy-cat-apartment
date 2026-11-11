import type {Save} from './care';
export type Thought='food'|'water'|'play'|'attention'|'nap'|'space';
export const THOUGHT_LABELS:Record<Thought,string>={food:'Food',water:'Fresh water',play:'Play',attention:'Company',nap:'Rest',space:'Some space'};
export const OBJECT_NAMES:Record<string,string>={food:'Food bowl',water:'Water bowl',brush:'Brush',wand:'Toy wand',sofa:'Sofa','window-seat':'Window seat',bookshelf:'Books','coffee-table':'Tea table',treat:'Treat jar','kitchen-counter':'Kitchen counter','kitchen-table':'Dining table',bed:'Bed','nook-chair':'Reading chair','nook-books':'Books','bedroom-books':'Books',cat:'Your cat'};
export function thoughts(s:Save,pose:string,behavior:string):Thought[]{
 if(s.tension>=65||(s.personality==='Shy'&&s.tension>=35))return ['space'];
 if(pose==='sleep')return ['nap'];
 if(s.needs.energy<32)return ['nap'];
 const choices:{kind:Thought;value:number}[]=[{kind:'food',value:s.needs.food},{kind:'water',value:s.needs.water},{kind:'play',value:s.needs.play},{kind:'attention',value:s.needs.comfort}];
 const wanted=choices.filter(c=>c.value<60).sort((a,b)=>a.value-b.value).slice(0,2).map(c=>c.kind);
 if(!wanted.length&&(behavior==='visiting'||behavior==='rubbing'||behavior==='coming for a lap'))return ['attention'];
 return wanted;
}
export function thoughtSVG(kind:Thought){
 const paths:Record<Thought,string>={food:'M3 10h18l-3 8H6L3 10Zm4-4h2m3-2h2m2 3h2',water:'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z',play:'m4 20 15-15M15 3l6 6M4 5l3 1 1 4-4-1-1-3Zm11 11 4 1 1 4-4-1-1-4Z',attention:'M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z',nap:'M19 16A8 8 0 0 1 9 4 8 8 0 1 0 19 16Z',space:'M7 18c-4-9 0-13 5-13h7c0 10-5 16-12 13Zm0 0 9-10M3 20h4'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[kind]}"/></svg>`;
}
