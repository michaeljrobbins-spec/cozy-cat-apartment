import type {Personality,Save} from './care';
export const SOCIAL_SECONDS:Record<Personality,number>={Shy:75,Playful:50,Demanding:60};
export const VISIT_SECONDS=12;
export function routine(index:number,personality:Personality){
 const patterns=personality==='Playful'?['groom','explore','window','stretch','sleep']:personality==='Shy'?['window','sleep','groom','explore','stretch']:['groom','window','explore','sleep','stretch'];
 const kind=patterns[index%patterns.length];return {kind,seconds:kind==='sleep'?25:kind==='window'?22:kind==='groom'?16:12};
}
export function mayVisit(state:Save,now:number,next:number){return now>=next&&state.tension<35&&state.needs.energy>=35&&state.needs.food>=35&&state.needs.water>=35;}
export function visitFinished(now:number,until:number){return until>0&&now>=until;}
