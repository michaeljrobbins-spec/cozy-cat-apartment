import './style.css';
import {COATS,PERSONALITIES,SAVE_KEY,newCat,readSave,phase,type Save} from './model';
import {portrait} from './sprites';
import {startRoom,type RoomSnapshot,type ObjectName} from './scene';
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let state=newCat(),exists=false,warning='',original='';
try{const raw=localStorage.getItem(SAVE_KEY);if(raw){original=raw;try{state=readSave(raw);exists=true;}catch{warning='Your v2 save could not be read. Download a backup before starting a new story.';}}}catch{warning='Storage is unavailable. This visit will not be saved.';}
const portraits=COATS.map((_,i)=>portrait(i));
function persist(){if(!exists)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));warning='';}catch{warning='This visit could not be saved. Storage may be full or blocked.';}$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
document.querySelector('#app')!.innerHTML=`<header><a href="../" class="brand"><span class="brand-cat" aria-hidden="true">⌑</span><span>little windows<small>A LITTLE LIFE · CHAPTER TWO</small></span></a><div class="header-right"><span id="day">Day 1 · Morning</span><span id="hearts" class="heart-wallet">♥ 6</span><button class="icon-button" id="focus-cat" aria-label="Find your cat" title="Find your cat">◎</button></div></header><main><div class="scene-heading"><div><p class="eyebrow">THE WORLD CAN WAIT A LITTLE.</p><h1>Make room for a little life.</h1></div><span class="live-label"><i></i> A home of your own</span></div><p id="storage-warning" role="alert" hidden></p><section id="stage" tabindex="0" aria-label="Your living apartment. Use left and right arrow keys to explore."><div id="canvas-room" role="img" aria-label="A pixel-art apartment with an animated cat that wanders, grooms, stretches, sleeps, and hops onto furniture."></div><div id="room-controls"></div><div id="tool-state" hidden><span id="tool-name"></span><button id="set-down" aria-label="Put down tool">Put down ×</button></div><div class="room-corner"><span id="cat-label">Miso is home.</span><span class="room-version">v2</span></div></section><div class="room-footer"><span>Sun-warmed floors. Small adventures. Good company.</span><span class="pan-hint">Swipe to look around · ◎ to find your cat</span></div></main><footer><a href="../">All chapters</a><a href="../v1/">Visit v1</a><span>Nothing changes while you're away.</span></footer><dialog id="creator" aria-labelledby="creator-title"></dialog>`;
let snapshot:RoomSnapshot|undefined;
const objects:{id:ObjectName;x:number;y:number;label:string}[]=[
 {id:'food',x:210,y:650,label:'Refill food bowl'}, {id:'water',x:310,y:650,label:'Refill water bowl'},
 {id:'brush',x:320,y:365,label:'Pick up brush'},{id:'wand',x:475,y:690,label:'Pick up feather wand'},
 {id:'window',x:485,y:390,label:'Invite cat to window seat'},{id:'cat',x:635,y:590,label:'Offer quiet company'},
];
$('#room-controls').innerHTML=objects.map(o=>`<button class="room-object" id="object-${o.id}" data-object="${o.id}" aria-label="${o.label}" title="${o.label}"><span>${o.label}</span></button>`).join('')+'<button id="toy-target" class="room-object" aria-label="Move toy for your cat" hidden><span>Move toy · Space or Enter</span></button>';
function positionObjects(s:RoomSnapshot){
 for(const o of objects){const button=$(`#object-${o.id}`);const x=o.id==='cat'?s.x:o.x,y=o.id==='cat'?s.y-43:o.y;const px=(x-s.scrollX)*s.zoom,py=(y-s.scrollY)*s.zoom;
 button.style.left=`${px}px`;button.style.top=`${py}px`;button.hidden=px<-30||px>s.width+30;button.classList.toggle('selected',(o.id==='brush'&&s.tool==='brush')||(o.id==='wand'&&s.tool==='wand'));}
 $('#object-cat').setAttribute('aria-label',s.tool==='brush'?'Brush your cat':s.tool==='wand'?'Invite a pounce':'Offer quiet company');
 const target=$('#toy-target');target.hidden=s.tool!=='wand';target.style.left=`${(s.toy.x-s.scrollX)*s.zoom}px`;target.style.top=`${(s.toy.y-s.scrollY)*s.zoom}px`;
 $('#tool-state').hidden=s.tool==='hands';$('#tool-name').textContent=s.tool==='brush'?'Brush · Slow strokes, four little purrs':'Wand · Move, pause, pounce. Three times.';
}
const room=startRoom($('#canvas-room'),state,{
 ready:()=>{$('#stage').dataset.ready='true';},
 change:s=>{state=s;persist();refresh();},
 snapshot:s=>{snapshot=s;const stage=$('#stage');stage.dataset.pose=s.pose;stage.dataset.node=s.node;stage.dataset.destination=s.destination;stage.dataset.frame=s.frame;stage.dataset.x=String(Math.round(s.x));stage.dataset.y=String(Math.round(s.y));stage.dataset.expression=s.expression;stage.dataset.tool=s.tool;stage.dataset.pounces=String(s.pounces);stage.dataset.brush=String(s.brush);positionObjects(s);},
});
$('#focus-cat').onclick=()=>room.scene.focusCat();
$('#stage').addEventListener('keydown',e=>{if(e.target!==$('#stage'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();room.scene.pan(e.key==='ArrowLeft'?90:-90);}});
$('#room-controls').addEventListener('click',e=>{const id=(e.target as HTMLElement).closest<HTMLElement>('[data-object]')?.dataset.object;if(id)room.scene.interact(id as ObjectName);});
$('#set-down').onclick=()=>room.scene.setTool('hands');$('#toy-target').onclick=()=>room.scene.keyboardToy();
let panX=0,panning=false,dragging=false,lastStrokeX=0;
$('#stage').addEventListener('pointerdown',e=>{if(!exists)return;panX=e.clientX;lastStrokeX=e.clientX;panning=true;dragging=true;if(snapshot?.tool==='wand'){const p=room.scene.point(e.clientX,e.clientY);room.scene.moveToy(p.x,p.y);}});
$('#stage').addEventListener('pointermove',e=>{if(!panning||!snapshot)return;const p=room.scene.point(e.clientX,e.clientY);
 if(snapshot.tool==='wand'&&dragging)room.scene.moveToy(p.x,p.y);
 else if(snapshot.tool==='brush'&&dragging){if(Math.abs(e.clientX-lastStrokeX)>9){room.scene.brushAt(p.x,p.y);lastStrokeX=e.clientX;}}
 else if(Math.abs(e.clientX-panX)>2){room.scene.pan(e.clientX-panX);panX=e.clientX;}
});
window.addEventListener('pointerup',()=>{panning=false;dragging=false;});
function refresh(){room.scene.sync(state);$('#cat-label').textContent=`${state.name} is home.`;$('#day').textContent=`Day ${state.day} · ${phase(state)}`;$('#hearts').textContent=`♥ ${state.hearts}`;$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
refresh();
if(!exists){const el=$<HTMLDialogElement>('#creator');el.innerHTML=`<div class="welcome-art"><div class="welcome-window"><img id="cat-preview" src="${portraits[0]}" alt="Marmalade cat"></div><p>A quiet apartment.<br>A very real little personality.</p></div><form id="create-form"><p class="eyebrow">CHAPTER TWO · A LITTLE LIFE</p><h2 id="creator-title">Someone's moving in.</h2><p class="intro">Meet your new roommate. Learn their little ways.</p>${warning?`<p class="recovery">${esc(warning)}</p>${original?'<button type="button" id="backup-original">Download original save</button>':''}`:''}<label for="name">Their name</label><input id="name" name="name" value="Miso" maxlength="24" required autocomplete="off"><fieldset><legend>Their coat</legend><div class="coats">${COATS.map((c,i)=>`<label><input type="radio" name="coat" value="${i}" ${i===0?'checked':''}><span><img src="${portraits[i]}" alt=""><small>${c}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>Their little ways</legend><div class="personalities">${PERSONALITIES.map(p=>`<label><input type="radio" name="personality" value="${p}" ${p==='Playful'?'checked':''}><span><strong>${p}</strong><small>${p==='Shy'?'Quiet corners & slow blinks':p==='Playful'?'Curiosity in every paw':'A little cat with big opinions'}</small></span></label>`).join('')}</div></fieldset><button class="primary" type="submit">Come on in <span>→</span></button><p class="fine-print">Your v1 cat and save stay exactly where they are.</p></form>`;el.addEventListener('cancel',e=>{if(!exists)e.preventDefault();});el.showModal();
 el.querySelectorAll<HTMLInputElement>('[name="coat"]').forEach(b=>b.onchange=()=>{$<HTMLImageElement>('#cat-preview').src=portraits[Number(b.value)];});
 if(original&&warning)$('#backup-original').onclick=()=>download(original,'little-windows-v2-original.json');
 $('#create-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target as HTMLFormElement);state=newCat(String(f.get('name')),Number(f.get('coat')),String(f.get('personality')) as Save['personality']);state.reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;exists=true;persist();refresh();el.close();};
}
function download(contents:string,name:string){const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
