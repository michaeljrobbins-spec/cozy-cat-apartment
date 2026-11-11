export const SAVE_KEY = 'cozy-cat-apartment:v1';
export const COATS = ['Orange tabby', 'Brown tabby', 'Tuxedo', 'Calico', 'Midnight', 'Cream'] as const;
export const PERSONALITIES = ['Shy', 'Playful', 'Demanding'] as const;
export type Personality = typeof PERSONALITIES[number];
export type Need = 'food' | 'water' | 'comfort' | 'energy' | 'stimulation';
export type Action = 'feed' | 'water' | 'brush' | 'play' | 'nap' | 'space';
export const NEEDS: Need[] = ['food', 'water', 'comfort', 'energy', 'stimulation'];
export interface State {
  schema: 1; name: string; coat: number; personality: Personality; day: number; actions: number;
  totalActions: number; hearts: number; needs: Record<Need, number>; owned: string[];
  equipped: Record<string, string>; treats: Record<string, number>; rewards: Record<string, number>;
  sound: boolean; reducedMotion: boolean;
}
export interface Item { id: string; name: string; price: number; type: 'decor' | 'toy' | 'treat'; slot?: string; color: string; description: string }
export const SHOP: Item[] = [
  {id:'sage-cushion',name:'Sage cushion',price:6,type:'decor',slot:'cushion',color:'#84977a',description:'A soft little spot by the window.'},
  {id:'rose-cushion',name:'Rose cushion',price:6,type:'decor',slot:'cushion',color:'#cc998e',description:'For the very sweetest daydreams.'},
  {id:'sunset-rug',name:'Sunset rug',price:9,type:'decor',slot:'rug',color:'#ca9478',description:'A little warmth under tiny paws.'},
  {id:'moss-rug',name:'Moss rug',price:9,type:'decor',slot:'rug',color:'#8c9b75',description:'Bring a little garden indoors.'},
  {id:'fern',name:'Boston fern',price:8,type:'decor',slot:'plant',color:'#72894f',description:'Cat-safe greenery for your shelf.'},
  {id:'palm',name:'Parlor palm',price:8,type:'decor',slot:'plant',color:'#507b60',description:'A cat-safe corner of the tropics.'},
  {id:'ribbon',name:'Ribbon wand',price:10,type:'toy',slot:'toy',color:'#d49897',description:'A fluttery new way to spend time.'},
  {id:'mouse',name:'Felt mouse',price:12,type:'toy',slot:'toy',color:'#a49b8d',description:'A tiny friend for big pounces.'},
  {id:'salmon',name:'Salmon bites',price:3,type:'treat',color:'#d78e72',description:'One small treat. One happy purr.'},
  {id:'crunch',name:'Crunchy stars',price:3,type:'treat',color:'#d4b16e',description:'A star-shaped little thank-you.'},
];
export function createCat(name: string, coat: number, personality: Personality): State {
  return {schema:1,name:name.trim().slice(0,24)||'Miso',coat,personality,day:1,actions:0,totalActions:0,hearts:6,
    needs:{food:62,water:68,comfort:76,energy:82,stimulation:55},owned:[],equipped:{},treats:{},rewards:{},sound:false,reducedMotion:false};
}
export function phase(s: State) { return s.actions < 4 ? 'Morning' : s.actions < 8 ? 'Afternoon' : 'Evening'; }
export function cue(s: State): string {
  if (s.needs.energy < 32) return `${s.name} gives a long yawn. A soft place to nap sounds lovely.`;
  if (s.needs.water < 55 && s.personality === 'Demanding') return `${s.name} looks from you to the water bowl. Fresh water, please.`;
  const low = NEEDS.reduce((a,b)=>s.needs[a]<s.needs[b]?a:b);
  if (s.needs[low] < 65) return ({food:`A little meow by the food bowl. ${s.name} could use a meal.`,water:`${s.name} taps the water bowl with one curious paw.`,comfort:`A twitch of the tail. ${s.name} could use a little comfort.`,energy:`Heavy eyelids, slow blinks. It might be nap time.`,stimulation:s.personality==='Shy'?`${s.name} peeks out at the toy. A gentle invitation might be nice.`:`${s.name} crouches, tail wiggling. Someone is ready to play.`})[low];
  return s.personality==='Shy'?`${s.name} settles nearby and offers a slow blink. You're good company.`:s.personality==='Playful'?`${s.name} rolls over in a patch of sunlight. Life is pretty good.`:`${s.name} surveys the apartment, then gives an approving little purr.`;
}
const clamp = (v:number)=>Math.max(0,Math.min(100,v));
export function care(s: State, action: Action): {state: State; message: string; earned: number; accepted: boolean} {
  const n = structuredClone(s);
  let refusal = '';
  if (action==='play' && s.needs.energy<30) refusal=`${s.name} turns away with a sleepy yawn. A nap first, a pounce later.`;
  if (action==='play' && s.needs.stimulation>92) refusal=`${s.name}'s tail flicks: that's enough excitement for now. Try giving a little space.`;
  if (action==='brush' && s.personality==='Shy' && s.needs.stimulation>85) refusal=`${s.name} leans away, ears turned sideways. A quiet moment would help.`;
  if (refusal) return {state:n,message:refusal,earned:0,accepted:false};
  const target: Record<Action,Need>={feed:'food',water:'water',brush:'comfort',play:'stimulation',nap:'energy',space:'comfort'};
  const amount: Record<Action,number>={feed:38,water:45,brush:30,play:s.personality==='Playful'?42:34,nap:48,space:s.personality==='Shy'?24:16};
  const improvement = Math.min(100-s.needs[target[action]],amount[action]);
  for (const need of NEEDS) n.needs[need]=clamp(n.needs[need]-(need==='energy'?3:2));
  n.needs[target[action]]=clamp(s.needs[target[action]]+amount[action]);
  if(action==='play') n.needs.energy=clamp(n.needs.energy-10);
  if(action==='space') n.needs.stimulation=clamp(n.needs.stimulation-12);
  if(action==='nap') n.needs.comfort=clamp(n.needs.comfort+8);
  const earned=improvement>=10 && (n.rewards[action]||0)<3 ? (improvement>=25?2:1) : 0;
  if(earned) n.rewards[action]=(n.rewards[action]||0)+1;
  n.hearts+=earned; n.actions++; n.totalActions++;
  const messages: Record<Action,string>={feed:`A happy little crunch. ${s.name} enjoys a fresh meal.`,water:`Fresh water, tiny sips. Just right.`,brush:`${s.name} leans into the brush. That's the spot.`,play:`One last pounce! ${s.name} had a lovely time with you.`,nap:`Curled paws and quiet purrs. A little nap does wonders.`,space:`You sit quietly together. ${s.name} relaxes, knowing there's no rush.`};
  return {state:n,message:messages[action],earned,accepted:true};
}
export function nextDay(s:State):State {
  const n=structuredClone(s); n.day++; n.actions=0; n.rewards={};
  n.needs.energy=100; n.needs.comfort=clamp(n.needs.comfort+12); return n;
}
export function buy(s:State,id:string):State {
  const item=SHOP.find(i=>i.id===id); if(!item||s.hearts<item.price||(item.type!=='treat'&&s.owned.includes(id))) return s;
  const n=structuredClone(s); n.hearts-=item.price;
  if(item.type==='treat') n.treats[id]=(n.treats[id]||0)+1;
  else {n.owned.push(id); if(item.slot)n.equipped[item.slot]=id;}
  return n;
}
export function equip(s:State,id:string):State {
  const item=SHOP.find(i=>i.id===id); if(!item?.slot||!s.owned.includes(id))return s;
  return {...s,equipped:{...s.equipped,[item.slot]:id}};
}
export function treat(s:State,id:string):State {
  if(!(s.treats[id]>0)||!SHOP.some(i=>i.id===id&&i.type==='treat'))return s;
  const n=structuredClone(s); n.treats[id]--; n.needs.comfort=clamp(n.needs.comfort+12); return n;
}
export function parseSave(raw:string):State {
  const s=JSON.parse(raw);
  const finite=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
  const int=(n:unknown,max=1_000_000)=>finite(n,max)&&Number.isInteger(n);
  if(s?.schema!==1||typeof s.name!=='string'||!s.name.trim()||s.name.length>24||!int(s.coat,5)||!PERSONALITIES.includes(s.personality)||!int(s.day)||s.day<1||!int(s.actions)||!int(s.totalActions)||!int(s.hearts)||!NEEDS.every(k=>finite(s.needs?.[k],100))||!Array.isArray(s.owned)||!s.owned.every((id:unknown)=>SHOP.some(i=>i.id===id&&i.type!=='treat'))||typeof s.sound!=='boolean'||typeof s.reducedMotion!=='boolean') throw new Error('Invalid save');
  for(const key of ['equipped','treats','rewards']) if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))throw new Error('Invalid save');
  for(const [slot,id] of Object.entries(s.equipped)) if(!SHOP.some(i=>i.id===id&&i.slot===slot)||!s.owned.includes(id)) throw new Error('Invalid equipment');
  for(const [id,count] of Object.entries(s.treats)) if(!SHOP.some(i=>i.id===id&&i.type==='treat')||!int(count))throw new Error('Invalid treats');
  for(const [action,count] of Object.entries(s.rewards)) if(!['feed','water','brush','play','nap','space'].includes(action)||!int(count,3))throw new Error('Invalid rewards');
  return s;
}
