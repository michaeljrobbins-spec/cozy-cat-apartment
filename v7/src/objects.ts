import {LAYOUT} from './world';
import {PROPS,type Prop} from './props';
import {DISCOVERIES} from './adventure';
import {TOYS,TOY_IDS} from './play';
const fixtureLabels:Record<string,string>={food:'Refill water' /* replaced below */,water:'Fresh water',sofa:'Sit together','window-seat':'Window seat',bookshelf:'Books','coffee-table':'Tea table',bed:'Settle in for the night','nook-chair':'Reading chair','nook-books':'Nook books','kitchen-counter':'Kitchen counter','kitchen-table':'Dining table','bedroom-books':'Bedroom books'};fixtureLabels.food='Food bowl';
export interface WorldObject{id:string;label:string;x:number;y:number;approach:{x:number;y:number};w?:number;h?:number}
export const ROOM_OBJECTS:WorldObject[]=LAYOUT.fixtures.filter(f=>!['wall','plantTable','tools'].includes(f.kind)).map(f=>({id:f.id,label:PROPS[f.id as Prop]?.name||fixtureLabels[f.id]||f.id,x:f.rect.x+f.rect.w/2,y:f.rect.y-f.height+(f.rect.h+f.height)/2,w:f.rect.w,h:f.rect.h+f.height,approach:f.approach}));
ROOM_OBJECTS.push({id:'brush',label:'Brush',x:414,y:194,approach:{x:432,y:272}},{id:'phone',label:'Your phone',x:186,y:365,approach:PROPS.phone.approach},{id:'clock',label:'Wall clock',x:832,y:86,approach:PROPS.clock.approach},{id:'treat',label:'Treat jar',x:224,y:392,approach:{x:208,y:464}});
ROOM_OBJECTS.push({id:'curtain',label:'Draw the curtain',x:420,y:95,approach:{x:384,y:240}},{id:'bed-clue',label:'Look beneath the bed',x:738,y:654,approach:{x:688,y:640}});
ROOM_OBJECTS.push({id:'moment',label:'Share a moment',x:272,y:240,approach:{x:272,y:240}});
for(const d of DISCOVERIES)ROOM_OBJECTS.push({id:`discover-${d.id}`,label:d.id==='nook'?'Search bookshelf':'Open kitchen tin',...d.spot,approach:d.approach});
for(const id of TOY_IDS)ROOM_OBJECTS.push({id:`toy-${id}`,label:TOYS[id].name,...TOYS[id].spot,approach:TOYS[id].approach});
