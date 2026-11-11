import type {Save} from './care';
export const CASES=['sunbeam','rattle','mouse'] as const;
export type Case=typeof CASES[number];
export interface Mystery{day:number;kind:Case;solved:boolean;read:boolean;clues:string[];patience:number;attempts:number;shade:number;cushion:boolean;mat:boolean;mouse:{x:number;y:number;hooked:boolean;recovered:boolean};photos:Partial<Record<Case,number>>}
export const CASE_INFO:Record<Case,{title:string;goal:string;hint:string;payoff:string}>={
 sunbeam:{title:'The empty window seat',goal:'Help your cat choose the window seat.',hint:'Those squinting eyes dislike the glare. A curtain can soften it; a cushion makes the perch welcoming.',payoff:'A window worth watching'},
 rattle:{title:'The bowl that talks back',goal:'Help your cat enjoy a peaceful drink.',hint:'Listen to the ringing bowl. Try the felt mat from your cabinet, then hold to pour and release at the marked waterline.',payoff:'A quiet little sip'},
 mouse:{title:'One very missing mouse',goal:'Find the missing toy and help your cat catch it.',hint:'Follow the gaze and listen near the bed. Hook the mouse with the ribbon wand and ease it onto clear floor. E gives a gentle pull.',payoff:'Found, caught, treasured'},
};
export const newMystery=(day=1,kind:Case=CASES[(day-1)%3],photos:Mystery['photos']={}):Mystery=>({day,kind,photos:{...photos},solved:false,read:false,clues:[],patience:4,attempts:0,shade:0,cushion:false,mat:false,mouse:{x:758,y:654,hooked:false,recovered:false}});
export function nextMystery(m:Mystery,day:number){return newMystery(day,m.solved?CASES[(CASES.indexOf(m.kind)+1)%3]:m.kind,m.photos);}
export type MysteryAction='cat'|'seat'|'bowl'|'bed'|'read'|'shade'|'cushion'|'mat'|'invite'|'pour'|'recover'|'reassure'|'wrong';
export function act(s:Save,action:MysteryAction,value=0):{state:Save;message:string;success:boolean}{
 const n=structuredClone(s),m=n.mystery;let message='',success=false;
 const clue=(id:string,text:string)=>{if(!m.clues.includes(id))m.clues.push(id);message=text;};
 const miss=(text:string)=>{m.attempts++;m.patience=Math.max(0,m.patience-1);message=m.patience?text:'Ears back. A turned shoulder. Put tools down and offer a quiet moment together.';};
 if(action==='read')m.read=true;
 if(action==='cat')clue('cat',m.kind==='sunbeam'?'A squint toward the bright window, then a glance at the bare perch.':m.kind==='rattle'?'Thirsty… but that ringing sound makes the ears fold back.':'A pointed gaze toward the bedroom. A tiny, searching chirp.');
 if(action==='seat')clue('seat','The wood feels hard, and the light is bright at eye level.');
 if(action==='bowl')clue('bowl','Ting! The bowl rocks against the hard floor. A little padding might help.');
 if(action==='bed')clue('bed','A familiar felt tail peeks from under the bed. A wand could reach it.');
 if(action==='reassure'){m.patience=Math.min(4,m.patience+3);n.tension=Math.max(0,n.tension-30);message='A slow blink, a softer tail. Ready to be curious again.';}
 if(!m.solved){
  if(action==='shade'){m.shade=Math.max(0,Math.min(1,value));message=m.shade>=.4&&m.shade<=.8?'A soft patch of light falls across the perch.':'Watch the light on the seat as you draw the curtain.';}
  if(action==='cushion'){if(value===1&&n.owned.includes('sage')){m.cushion=true;message='A soft cushion, right where those little paws would land.';}else miss('That cushion would feel better on the window seat.');}
  if(action==='mat'){if(value===1&&n.owned.includes('felt')){m.mat=true;message='The bowl settles onto soft felt. The ringing stops.';}else miss('Try the felt mat underneath the water bowl.');}
  if(action==='invite'&&m.kind==='sunbeam'){if(m.patience===0)message='A little reassurance first. Put your tools down and visit gently.';else if(m.shade>=.4&&m.shade<=.8&&m.cushion)success=true;else miss(m.shade<.4?'Squint… one paw up, then back down. The light is still bright.':!m.cushion?'A tentative paw on the hard wood. Something soft might help.':'Too dark to watch the city. A little more light?');}
  if(action==='pour'&&m.kind==='rattle'){if(m.patience===0)message='Your cat wants a little reassurance before trying again.';else if(m.mat&&value>=70&&value<=90)success=true;else miss(!m.mat?'Ting! The little bowl still rings against the floor.':value<70?'Just a shallow sip. Try a little more water.':'Splosh! A slower pour, released at the marked line.');}
  if(action==='recover'&&m.kind==='mouse'){if(value===1&&m.patience>0){m.mouse.recovered=true;success=true;}else miss('The mouse slips away. A slow, steady pull will work better.');}
  if(action==='wrong')miss('A little head tilt. That didn’t change what was bothering your cat.');
  if(success){m.solved=true;m.photos[m.kind]=(m.photos[m.kind]||0)+1;n.hearts+=6+(m.attempts<=2?2:0);n.journey.bond+=3;n.treats.stars=(n.treats.stars||0)+2;const item=m.kind==='sunbeam'?'felt':m.kind==='rattle'?'feather':'mouse';if(!n.owned.includes(item))n.owned.push(item);message=`${CASE_INFO[m.kind].payoff}. A photo for the fridge · +3 bond, +${m.attempts<=2?8:6} hearts, +2 treats${m.attempts<=2?' · a patient-paws sticker':''}.`;}
 }
 return {state:n,message,success};
}
export function validMystery(v:unknown):v is Mystery{const m=v as Mystery,num=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;return !!m&&Number.isInteger(m.day)&&m.day>0&&CASES.includes(m.kind)&&typeof m.solved==='boolean'&&typeof m.read==='boolean'&&Array.isArray(m.clues)&&m.clues.every(c=>['cat','seat','bowl','bed'].includes(c))&&new Set(m.clues).size===m.clues.length&&num(m.patience,4)&&Number.isInteger(m.patience)&&num(m.attempts,1e6)&&num(m.shade,1)&&typeof m.cushion==='boolean'&&typeof m.mat==='boolean'&&!!m.mouse&&num(m.mouse.x,1000)&&num(m.mouse.y,800)&&typeof m.mouse.hooked==='boolean'&&typeof m.mouse.recovered==='boolean'&&!!m.photos&&typeof m.photos==='object'&&!Array.isArray(m.photos)&&Object.entries(m.photos).every(([k,v])=>CASES.includes(k as Case)&&num(v,1e6)&&Number.isInteger(v));}
