import './style.css';
import {Soundscape} from './audio';
import {COATS,PERSONALITIES,SAVE_KEY,newCat,readSave,phase,CATALOG,purchase,type Save} from './model';
import {portrait} from './sprites';
import {startRoom,type RoomSnapshot,type ObjectName} from './scene';
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let state=newCat(),exists=false,warning='',original='';
try{const raw=localStorage.getItem(SAVE_KEY);if(raw){original=raw;try{state=readSave(raw);exists=true;}catch{warning='Your v2 save could not be read. Download a backup before starting a new story.';}}}catch{warning='Storage is unavailable. This visit will not be saved.';}
const portraits=COATS.map((_,i)=>portrait(i));
function persist(){if(!exists)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));warning='';}catch{warning='This visit could not be saved. Storage may be full or blocked.';}$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
document.querySelector('#app')!.innerHTML=`<header><a href="../" class="brand"><span class="brand-cat" aria-hidden="true">⌑</span><span>little windows<small>A LITTLE LIFE · CHAPTER TWO</small></span></a><div class="header-right"><span id="day">Day 1 · Morning</span><button class="icon-button" id="mute" aria-label="Mute sound" aria-pressed="false" title="Mute sound">♫</button><button id="hearts" class="heart-wallet" aria-label="Open little shop">♥ 6</button><button class="icon-button" id="focus-cat" aria-label="Find your cat" title="Find your cat">◎</button></div></header><main><div class="scene-heading"><div><p class="eyebrow">THE WORLD CAN WAIT A LITTLE.</p><h1>Make room for a little life.</h1></div><span class="live-label"><i></i> A home of your own</span></div><p id="storage-warning" role="alert" hidden></p><section id="stage" tabindex="0" aria-label="Your living apartment. Use left and right arrow keys to explore."><div id="canvas-room" role="img" aria-label="A pixel-art apartment with an animated cat that wanders, grooms, stretches, sleeps, and hops onto furniture."></div><div id="room-controls"></div><div id="tool-state" hidden><span id="tool-name"></span><button id="set-down" aria-label="Put down tool">Put down ×</button></div><button id="look-left" class="edge-hint" aria-label="Look toward bowls and tools" hidden>← bowls & tools</button><button id="look-right" class="edge-hint right" aria-label="Look toward the sofa" hidden>sofa →</button><div class="room-corner"><span id="cat-label">Miso is home.</span><span class="room-version">v2</span></div></section><div class="room-footer"><span>Tap the bowls. Pick up the brush. Move a toy slowly.</span><span class="pan-hint">Swipe to look around · ◎ to find your cat</span></div><div class="little-extras"><div><button id="shop-open">♧ Little shop</button><button id="details-open">♡ Your companion</button><button id="weather" aria-pressed="false">☁ A little rain</button></div><button id="bedtime">☾ Settle in for the night</button></div></main><footer><a href="../">All chapters</a><a href="../v1/">Visit v1</a><span>Nothing changes while you're away.</span></footer><dialog id="creator" aria-labelledby="creator-title"></dialog><dialog id="shop-dialog" aria-labelledby="shop-title"></dialog><dialog id="details-dialog" aria-labelledby="details-title"></dialog><dialog id="bedtime-dialog" aria-labelledby="bedtime-title"></dialog>`;
const sound=new Soundscape(status=>{const button=$('#mute');button.dataset.audioState=status;button.title=status==='unavailable'?'Audio is unavailable in this browser':state.muted?'Enable sound':'Mute sound';});
let audioUnlocked=false;
function unlock(){if(audioUnlocked)return;audioUnlocked=true;void sound.unlock(state.muted,state.rain);}
window.addEventListener('pointerdown',unlock,{once:true});window.addEventListener('keydown',unlock,{once:true});
$('#mute').onclick=()=>{state.muted=!state.muted;void sound.unlock(state.muted,state.rain);sound.setMuted(state.muted);persist();refresh();};
let snapshot:RoomSnapshot|undefined;
const objects:{id:ObjectName;x:number;y:number;label:string}[]=[
 {id:'food',x:210,y:650,label:'Refill food bowl'}, {id:'water',x:310,y:650,label:'Refill water bowl'},
 {id:'brush',x:320,y:365,label:'Pick up brush'},{id:'wand',x:475,y:690,label:'Pick up feather wand'},
 {id:'window',x:485,y:390,label:'Invite cat to window seat'},{id:'treat',x:205,y:284,label:'Offer a treat'},{id:'cat',x:635,y:590,label:'Offer quiet company'},
];
$('#room-controls').innerHTML=objects.map(o=>`<button class="room-object" id="object-${o.id}" data-object="${o.id}" aria-label="${o.label}" title="${o.label}"><span>${o.label}</span></button>`).join('')+'<button id="toy-target" class="room-object" aria-label="Move toy for your cat" hidden><span>Move toy · Space or Enter</span></button>';
function positionObjects(s:RoomSnapshot){
 for(const o of objects){const button=$(`#object-${o.id}`);const x=o.id==='cat'?s.x:o.x,y=o.id==='cat'?s.y-43:o.y;const px=(x-s.scrollX)*s.zoom,py=(y-s.scrollY)*s.zoom;
 button.toggleAttribute('disabled',s.night);button.style.left=`${px}px`;button.style.top=`${py}px`;button.hidden=px<-30||px>s.width+30;button.classList.toggle('selected',(o.id==='brush'&&s.tool==='brush')||(o.id==='wand'&&s.tool==='wand'));}
 $('#object-cat').setAttribute('aria-label',s.tool==='brush'?'Brush your cat':s.tool==='wand'?'Invite a pounce':'Offer quiet company');
 const target=$('#toy-target');target.hidden=s.tool!=='wand';target.style.left=`${(s.toy.x-s.scrollX)*s.zoom}px`;target.style.top=`${(s.toy.y-s.scrollY)*s.zoom}px`;
 $('#look-left').hidden=s.scrollX<140;$('#look-right').hidden=s.scrollX+s.width/s.zoom>1150;
 $('#bedtime').toggleAttribute('disabled',s.night);$('#bedtime').textContent=s.night?'☾ Finding a soft place to sleep…':'☾ Settle in for the night';
 $('#object-wand').setAttribute('aria-label',state.equipped.toy==='mouse'?'Pick up felt mouse':state.equipped.toy==='ribbon'?'Pick up ribbon wand':'Pick up feather wand');
 $('#tool-state').hidden=s.tool==='hands';$('#tool-name').textContent=s.tool==='brush'?'Brush · Slow strokes, four little purrs':'Wand · Move, pause, pounce. Three times.';
}
const room=startRoom($('#canvas-room'),state,{
 ready:()=>{$('#stage').dataset.ready='true';},
 feedback:kind=>{if(kind==='empty-jar'){shopType='treat';openShop();}else sound.effect(kind);},
 change:s=>{state=s;persist();refresh();},
 snapshot:s=>{snapshot=s;const stage=$('#stage');stage.dataset.pose=s.pose;stage.dataset.node=s.node;stage.dataset.destination=s.destination;stage.dataset.frame=s.frame;stage.dataset.x=String(Math.round(s.x));stage.dataset.y=String(Math.round(s.y));stage.dataset.expression=s.expression;stage.dataset.mood=s.mood;stage.dataset.night=String(s.night);stage.dataset.tool=s.tool;stage.dataset.pounces=String(s.pounces);stage.dataset.brush=String(s.brush);positionObjects(s);},
});
$('#look-left').onclick=()=>room.scene.lookAt(270);$('#look-right').onclick=()=>room.scene.lookAt(1060);
$('#focus-cat').onclick=()=>room.scene.focusCat();
$('#stage').addEventListener('keydown',e=>{if(e.target!==$('#stage'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();room.scene.pan(e.key==='ArrowLeft'?90:-90);}});
$('#room-controls').addEventListener('click',e=>{const id=(e.target as HTMLElement).closest<HTMLElement>('[data-object]')?.dataset.object;if(id)room.scene.interact(id as ObjectName);});
$('#set-down').onclick=()=>room.scene.setTool('hands');$('#toy-target').onclick=()=>room.scene.keyboardToy();
let panX=0,panning=false,dragging=false,lastStrokeX=0;
$('#stage').addEventListener('pointerdown',e=>{if(!exists)return;panX=e.clientX;lastStrokeX=e.clientX;panning=true;dragging=true;if(snapshot?.tool==='wand'){const p=room.scene.point(e.clientX,e.clientY);room.scene.moveToy(p.x,p.y);}});
$('#stage').addEventListener('pointermove',e=>{if(!snapshot)return;const p=room.scene.point(e.clientX,e.clientY);if(snapshot.tool==='brush')room.scene.hoverBrush(p.x,p.y);if(!panning)return;
 if(snapshot.tool==='wand'&&dragging)room.scene.moveToy(p.x,p.y);
 else if(snapshot.tool==='brush'&&dragging){if(Math.abs(e.clientX-lastStrokeX)>9){room.scene.brushAt(p.x,p.y);lastStrokeX=e.clientX;}}
 else if(Math.abs(e.clientX-panX)>2){room.scene.pan(e.clientX-panX);panX=e.clientX;}
});
window.addEventListener('pointerup',()=>{panning=false;dragging=false;});
function refresh(){room.scene.sync(state);$('#cat-label').textContent=`${state.name} is home.`;$('#day').textContent=`Day ${state.day} · ${phase(state)}`;$('#hearts').textContent=`♥ ${state.hearts}`;$('#mute').textContent=state.muted?'♩':'♫';$('#mute').setAttribute('aria-label',state.muted?'Enable sound':'Mute sound');$('#mute').setAttribute('aria-pressed',String(state.muted));sound.setMuted(state.muted);sound.setRain(state.rain);$('#weather').setAttribute('aria-pressed',String(state.rain));$('#weather').textContent=state.rain?'☀ Bring back the sunshine':'☁ A little rain';$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
refresh();
if(!exists){const el=$<HTMLDialogElement>('#creator');el.innerHTML=`<div class="welcome-art"><div class="welcome-window"><img id="cat-preview" src="${portraits[0]}" alt="Marmalade cat"></div><p>A quiet apartment.<br>A very real little personality.</p></div><form id="create-form"><p class="eyebrow">CHAPTER TWO · A LITTLE LIFE</p><h2 id="creator-title">Someone's moving in.</h2><p class="intro">Meet your new roommate. Learn their little ways.</p>${warning?`<p class="recovery">${esc(warning)}</p>${original?'<button type="button" id="backup-original">Download original save</button>':''}`:''}<label for="name">Their name</label><input id="name" name="name" value="Miso" maxlength="24" required autocomplete="off"><fieldset><legend>Their coat</legend><div class="coats">${COATS.map((c,i)=>`<label><input type="radio" name="coat" value="${i}" ${i===0?'checked':''}><span><img src="${portraits[i]}" alt=""><small>${c}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>Their little ways</legend><div class="personalities">${PERSONALITIES.map(p=>`<label><input type="radio" name="personality" value="${p}" ${p==='Playful'?'checked':''}><span><strong>${p}</strong><small>${p==='Shy'?'Quiet corners & slow blinks':p==='Playful'?'Curiosity in every paw':'A little cat with big opinions'}</small></span></label>`).join('')}</div></fieldset><button class="primary" type="submit">Come on in <span>→</span></button><p class="fine-print">Your v1 cat and save stay exactly where they are.</p></form>`;el.addEventListener('cancel',e=>{if(!exists)e.preventDefault();});el.showModal();
 el.querySelectorAll<HTMLInputElement>('[name="coat"]').forEach(b=>b.onchange=()=>{$<HTMLImageElement>('#cat-preview').src=portraits[Number(b.value)];});
 if(original&&warning)$('#backup-original').onclick=()=>download(original,'little-windows-v2-original.json');
 $('#create-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target as HTMLFormElement);state=newCat(String(f.get('name')),Number(f.get('coat')),String(f.get('personality')) as Save['personality']);state.reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;exists=true;persist();refresh();el.close();void sound.unlock(state.muted,state.rain);};
}
function download(contents:string,name:string){const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

let shopType='decor';
function closeButton(){return '<button class="close-dialog" aria-label="Close dialog">×</button>';}
function bindClose(el:HTMLDialogElement){el.querySelector('.close-dialog')?.addEventListener('click',()=>el.close());}
function itemArt(item:typeof CATALOG[number]){
 const color='#'+item.color.toString(16).padStart(6,'0');let body='';
 if(item.slot==='cushion')body=`<path fill="${color}" d="M24 21h48v4h4v25h-4v4H24v-4h-4V25h4z"/><path fill="#ffffff" opacity=".18" d="M27 24h42v3H27zM23 28h3v18h-3z"/>`;
 else if(item.slot==='rug')body=`<path fill="${color}" d="M12 20h72v34H12z"/><path fill="none" stroke="#f2dfb8" stroke-width="2" d="M17 24h62v26H17zM22 29h52v16H22z"/><path stroke="#d7c7a5" d="M13 16v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4M13 54v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4m7-4v4"/>`;
 else if(item.slot==='plant')body=`<path fill="${color}" d="M46 14h4v31h-4zM29 24h18v5H29zM34 16h14v5H34zM39 9h10v5H39zM50 12h12v5H50zM50 21h18v5H50zM50 31h20v5H50zM25 34h21v5H25z"/><path fill="#b68865" d="M36 44h27v5H36zM39 49h21v12H39z"/>`;
 else if(item.id==='mouse')body='<path fill="#a29a8a" d="M30 32h32v19H30zM62 37h6v10h-6z"/><path fill="#c7ada0" d="M36 25h9v10h-9z"/><path fill="#49483d" d="M59 36h3v3h-3z"/><path fill="none" stroke="#b8aa92" stroke-width="2" d="m30 44-10 5-7-6"/>';
 else if(item.type==='toy')body=`<path stroke="#9a7850" stroke-width="4" d="m28 51 38-36"/><path stroke="#9f967a" fill="none" d="m28 51-6-8 3-16"/><path fill="${color}" d="M19 18h13v17H19zM23 33h5v10h-5z"/>`;
 else body=`<path fill="#cfb48c" d="M31 21h35v37H31z"/><path fill="#8d9c7a" d="M29 16h39v7H29z"/><path fill="#eee1c0" d="M34 32h29v17H34z"/><path fill="${color}" d="M40 35h6v5h-6zM51 40h6v5h-6zM51 33h5v4h-5z"/>`;
 return `<svg viewBox="0 0 96 72" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
}
function openShop(){renderShop();const el=$<HTMLDialogElement>('#shop-dialog');if(!el.open)el.showModal();}
function renderShop(){
 const el=$<HTMLDialogElement>('#shop-dialog');el.innerHTML=`${closeButton()}<p class="eyebrow">SMALL TREASURES. NEW LITTLE RITUALS.</p><div class="dialog-heading"><h2 id="shop-title">The little shop</h2><span class="heart-wallet">♥ ${state.hearts}</span></div><p class="intro">A softer seat. A new favorite toy. Something just because.</p><div class="shop-tabs">${[['decor','For your home'],['toy','For playtime'],['treat','Little treats']].map(([id,label])=>`<button data-type="${id}" aria-pressed="${shopType===id}">${label}</button>`).join('')}</div><p class="shop-status" role="status"></p><div class="shop-grid">${CATALOG.filter(i=>i.type===shopType).map(item=>{
  const owned=state.owned.includes(item.id),selected=state.equipped[item.slot]===item.id;
  return `<article><div class="item-preview">${itemArt(item)}</div><h3>${item.name}</h3><span class="item-detail">${item.type==='treat'?`${state.treats[item.id]||0} in the treat jar`:owned?'Yours to keep':item.slot==='plant'?'Cat-safe greenery':'A little comfort, all your own'}</span><div class="item-buy"><span>♥ ${item.price}</span><button data-buy="${item.id}" ${!owned&&state.hearts<item.price?'disabled':''}>${selected?'In your room':owned?'Use this':item.type==='treat'?'Add to jar':'Bring home'}</button></div></article>`;
 }).join('')}</div><p class="shop-note">${shopType==='treat'?'Treats live in the jar on the bookshelf. Tap the jar to share one.':shopType==='toy'?'Your chosen toy replaces the feather on the rug. Pick it up in the room.':'Hearts come from helpful care. Everyday essentials are always free.'}</p>`;
 bindClose(el);
 el.querySelectorAll<HTMLButtonElement>('[data-type]').forEach(b=>b.onclick=()=>{shopType=b.dataset.type!;renderShop();el.querySelector<HTMLButtonElement>(`[data-type="${shopType}"]`)?.focus();});
 el.querySelectorAll<HTMLButtonElement>('[data-buy]').forEach(b=>b.onclick=()=>{const id=b.dataset.buy!;state=purchase(state,id);persist();refresh();renderShop();el.querySelector('.shop-status')!.textContent=`${CATALOG.find(i=>i.id===id)!.name} is ready to enjoy.`;el.querySelector<HTMLButtonElement>(`[data-buy="${id}"]`)?.focus();sound.effect('complete');});
}
$('#shop-open').onclick=openShop;$('#hearts').onclick=openShop;
$('#weather').onclick=()=>{state={...state,rain:!state.rain};persist();refresh();};
$('#details-open').onclick=()=>{
 const el=$<HTMLDialogElement>('#details-dialog');const labels:Record<string,string>={food:'Food',water:'Water',comfort:'Comfort',energy:'Energy',play:'Stimulation'};
 el.innerHTML=`${closeButton()}<div class="companion-portrait"><img src="${portraits[state.coat]}" alt="${COATS[state.coat]} cat"></div><p class="eyebrow">YOUR LITTLE COMPANION</p><h2 id="details-title">${esc(state.name)}</h2><p class="intro">${state.personality} · ${COATS[state.coat]}</p><div class="optional-needs">${Object.entries(state.needs).map(([key,value])=>`<label>${labels[key]}<meter min="0" max="100" value="${value}">${Math.round(value)}%</meter></label>`).join('')}</div><p class="intro">Watch the ears, eyes, and tail. A flicking tail and turned ears ask for space; a crouch and a wiggle invite play. There’s no penalty for getting to know each other.</p><label class="motion-setting"><span>Reduced motion<small>Keep ambient details still; essential cat movement stays readable.</small></span><input id="reduce-motion" type="checkbox" ${state.reducedMotion?'checked':''}></label><button class="secondary" id="backup-save">Download save backup</button><p class="fine-print">Saved on this browser and device. No progress changes while you're away.</p>`;
 bindClose(el);el.showModal();$('#backup-save').onclick=()=>download(JSON.stringify(state,null,2),'little-windows-v2.json');
 $('#reduce-motion').onchange=()=>{state={...state,reducedMotion:$<HTMLInputElement>('#reduce-motion').checked};persist();refresh();};
};
$('#bedtime').onclick=()=>{
 const el=$<HTMLDialogElement>('#bedtime-dialog');el.innerHTML=`${closeButton()}<p class="night-moon" aria-hidden="true">☾</p><p class="eyebrow">THE CITY WILL KEEP YOU COMPANY</p><h2 id="bedtime-title">Call it a cozy day?</h2><p class="intro">${esc(state.name)} will find a soft spot, settle down, and wake up to a fresh morning. There’s nothing you have to finish first.</p><button id="goodnight" class="primary">Goodnight, ${esc(state.name)}</button><button id="not-yet">Stay a little longer</button>`;
 bindClose(el);el.showModal();$('#not-yet').onclick=()=>el.close();$('#goodnight').onclick=()=>{el.close();room.scene.settleIn();};
};
