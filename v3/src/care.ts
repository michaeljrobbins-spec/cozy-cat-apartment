export interface Owner{name:string;hair:number;skin:number;outfit:number}
export const SAVE_KEY='cozy-cat-apartment:v3';
export const COATS=['Marmalade','Hazelnut','Tuxedo','Calico','Midnight','Biscuit'] as const;
export const PERSONALITIES=['Shy','Playful','Demanding'] as const;
export type Personality=typeof PERSONALITIES[number];
export type Need='food'|'water'|'comfort'|'energy'|'play';
export type Activity='eat'|'drink'|'brush'|'play'|'sleep'|'company';
export type Mood='content'|'sleepy'|'wary'|'overwhelmed'|'hungry'|'thirsty'|'curious';
export type Pose='walk'|'sit'|'sleep'|'groom'|'stretch'|'pounce'|'hop'|'eat'|'drink'|'crouch'|'hide';
export interface Save {
 schema:3;owner:Owner;minutes:number;ownerPosition:{x:number;y:number};name:string;coat:number;personality:Personality;day:number;actions:number;hearts:number;
 needs:Record<Need,number>;tension:number;food:number;water:number;rewards:Partial<Record<Activity,number>>;
 owned:string[];equipped:Record<string,string>;treats:Record<string,number>;muted:boolean;reducedMotion:boolean;rain:boolean;
}
export function newCat(name='Miso',coat=0,personality:Personality='Playful'):Save {
 return {schema:3,owner:{name:'Robin',hair:0,skin:1,outfit:0},minutes:480,ownerPosition:{x:368,y:624},name:name.trim().slice(0,24)||'Miso',coat,personality,day:1,actions:0,hearts:6,needs:{food:65,water:67,comfort:72,energy:80,play:58},tension:0,food:1,water:1,rewards:{},owned:[],equipped:{},treats:{},muted:false,reducedMotion:false,rain:false};
}
export const phase=(s:Save)=>s.minutes<720?'Morning':s.minutes<1050?'Afternoon':'Evening';
export function mood(s:Save):Mood {
 if(s.tension>=65)return 'overwhelmed';
 if(s.personality==='Shy'&&s.tension>=35)return 'wary';
 if(s.needs.energy<30)return 'sleepy';
 if(s.needs.water<40)return 'thirsty';
 if(s.needs.food<40)return 'hungry';
 if(s.needs.play<45)return 'curious';
 return 'content';
}
export function accepts(s:Save,activity:Activity):boolean {
 if(activity==='company'||activity==='sleep'||activity==='drink'||activity==='eat')return true;
 if(activity==='play'&&(s.needs.energy<28||s.tension>=65))return false;
 if(activity==='brush'&&(s.tension>=65||(s.personality==='Shy'&&s.tension>=35)))return false;
 return true;
}
export const clamp=(v:number)=>Math.max(0,Math.min(100,v));
export function complete(s:Save,activity:Activity,player=true):{state:Save;earned:number} {
 if(!accepts(s,activity))return {state:s,earned:0};
 const n=structuredClone(s);
 const target:Record<Activity,Need>={eat:'food',drink:'water',brush:'comfort',play:'play',sleep:'energy',company:'comfort'};
 const gains:Record<Activity,number>={eat:38,drink:44,brush:28,play:s.personality==='Playful'?38:31,sleep:45,company:16};
 const gain=Math.min(100-s.needs[target[activity]],gains[activity]);
 for(const key of Object.keys(n.needs) as Need[])n.needs[key]=clamp(n.needs[key]-(key==='energy'?4:2));
 n.needs[target[activity]]=clamp(s.needs[target[activity]]+gains[activity]);
 if(activity==='play'){n.needs.energy=clamp(n.needs.energy-9);n.tension=clamp(n.tension+(s.personality==='Shy'?22:14));}
 else n.tension=clamp(n.tension-(activity==='company'?30:activity==='sleep'?35:8));
 if(activity==='eat')n.food=Math.max(0,n.food-1);
 if(activity==='drink')n.water=Math.max(0,n.water-1);
 const earned=player&&gain>=8&&(n.rewards[activity]||0)<3?(gain>=25?2:1):0;
 if(earned)n.rewards[activity]=(n.rewards[activity]||0)+1;
 n.hearts+=earned;if(player){n.actions++;n.minutes=Math.min(1320,n.minutes+10);}return {state:n,earned};
}
export function tomorrow(s:Save):Save{return {...s,day:s.day+1,minutes:480,actions:0,tension:0,rewards:{},needs:{...s.needs,energy:100}};}
export function readSave(raw:string):Save{
 const s=JSON.parse(raw);const num=(v:unknown,max=1e6)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;const int=(v:unknown,max=1e6)=>num(v,max)&&Number.isInteger(v);
 if(s?.schema!==3||!s.owner||typeof s.owner.name!=='string'||!s.owner.name.trim()||s.owner.name.length>24||!int(s.owner.hair,3)||!int(s.owner.skin,4)||!int(s.owner.outfit,3)||!num(s.minutes,1320)||s.minutes<480||!num(s.ownerPosition?.x,2000)||!num(s.ownerPosition?.y,1400)||typeof s.name!=='string'||!s.name.trim()||s.name.length>24||!int(s.coat,5)||!PERSONALITIES.includes(s.personality)||!int(s.day)||s.day<1||!int(s.actions)||!int(s.hearts)||!['food','water','comfort','energy','play'].every(k=>num(s.needs?.[k],100))||!num(s.tension,100)||!int(s.food,3)||!int(s.water,3)||!Array.isArray(s.owned)||!s.owned.every((x:unknown)=>typeof x==='string'&&CATALOG.some(i=>i.id===x&&i.type!=='treat'))||typeof s.muted!=='boolean'||typeof s.reducedMotion!=='boolean'||typeof s.rain!=='boolean')throw Error('Unreadable v3 save');
 for(const k of ['rewards','equipped','treats'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))throw Error('Invalid save record');
 for(const [k,v]of Object.entries(s.rewards))if(!['eat','drink','brush','play','sleep','company'].includes(k)||!int(v,3))throw Error('Invalid rewards');
 for(const [k,v]of Object.entries(s.equipped))if(!s.owned.includes(v)||!CATALOG.some(i=>i.id===v&&i.slot===k))throw Error('Invalid furnishing');
 for(const [k,v]of Object.entries(s.treats))if(!CATALOG.some(i=>i.id===k&&i.type==='treat')||!int(v))throw Error('Invalid treat');
 return s;
}
export interface Item{id:string;name:string;type:'decor'|'toy'|'treat';price:number;slot:string;color:number}
export const CATALOG:Item[]=[
 {id:'sage',name:'Sage linen cushion',type:'decor',price:6,slot:'cushion',color:0x91a184},
 {id:'rose',name:'Rose velvet cushion',type:'decor',price:6,slot:'cushion',color:0xc48f85},
 {id:'moss',name:'Moss woven rug',type:'decor',price:9,slot:'rug',color:0x8d9f77},
 {id:'terracotta',name:'Terracotta woven rug',type:'decor',price:9,slot:'rug',color:0xc68d72},
 {id:'fern',name:'Boston fern',type:'decor',price:8,slot:'plant',color:0x6b8d58},
 {id:'palm',name:'Parlor palm',type:'decor',price:8,slot:'plant',color:0x517d63},
 {id:'ribbon',name:'Ribbon wand',type:'toy',price:10,slot:'toy',color:0xcd928e},
 {id:'mouse',name:'Felt mouse',type:'toy',price:12,slot:'toy',color:0x97928b},
 {id:'salmon',name:'Salmon bites',type:'treat',price:3,slot:'treat',color:0xdb9a74},
 {id:'stars',name:'Crunchy stars',type:'treat',price:3,slot:'treat',color:0xd9b568},
];
export function purchase(s:Save,id:string):Save{
 const item=CATALOG.find(i=>i.id===id);if(!item)return s;
 const n=structuredClone(s);
 if(n.owned.includes(id)){n.equipped[item.slot]=id;return n;}
 if(n.hearts<item.price)return s;
 n.hearts-=item.price;
 if(item.type==='treat')n.treats[id]=(n.treats[id]||0)+1;else{n.owned.push(id);n.equipped[item.slot]=id;}
 return n;
}

export function advanceClock(minutes:number,seconds:number){return Math.min(1320,minutes+Math.max(0,seconds));}
export function clockHands(minutes:number){return {minute:(minutes%60)*6,hour:(minutes%720)/2};}
export function clockText(minutes:number){const n=Math.floor(minutes),h=Math.floor(n/60);return `${h%12||12}:${String(n%60).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
