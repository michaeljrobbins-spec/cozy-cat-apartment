import './style.css';
import {COATS,PERSONALITIES,SAVE_KEY,newCat,readSave,type Save} from './model';
import {portrait} from './sprites';
import {startRoom,type RoomSnapshot} from './scene';
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let state=newCat(),exists=false,warning='',original='';
try{const raw=localStorage.getItem(SAVE_KEY);if(raw){original=raw;try{state=readSave(raw);exists=true;}catch{warning='Your v2 save could not be read. Download a backup before starting a new story.';}}}catch{warning='Storage is unavailable. This visit will not be saved.';}
const portraits=COATS.map((_,i)=>portrait(i));
function persist(){if(!exists)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));warning='';}catch{warning='This visit could not be saved. Storage may be full or blocked.';}$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
document.querySelector('#app')!.innerHTML=`<header><a href="../" class="brand"><span class="brand-cat" aria-hidden="true">⌑</span><span>little windows<small>A LITTLE LIFE · CHAPTER TWO</small></span></a><div class="header-right"><span id="day">Day 1 · Morning</span><button class="icon-button" id="focus-cat" aria-label="Find your cat" title="Find your cat">◎</button></div></header><main><div class="scene-heading"><div><p class="eyebrow">THE WORLD CAN WAIT A LITTLE.</p><h1>Make room for a little life.</h1></div><span class="live-label"><i></i> A home of your own</span></div><p id="storage-warning" role="alert" hidden></p><section id="stage" aria-label="Your living apartment"><div id="canvas-room" role="img" aria-label="A pixel-art apartment with an animated cat that wanders, grooms, stretches, sleeps, and hops onto furniture."></div><div id="room-controls"></div><div class="room-corner"><span id="cat-label">Miso is home.</span><span class="room-version">v2</span></div></section><div class="room-footer"><span>Sun-warmed floors. Small adventures. Good company.</span><span class="pan-hint">Swipe to look around · ◎ to find your cat</span></div></main><footer><a href="../">All chapters</a><a href="../v1/">Visit v1</a><span>Nothing changes while you're away.</span></footer><dialog id="creator" aria-labelledby="creator-title"></dialog>`;
let snapshot:RoomSnapshot|undefined;
const room=startRoom($('#canvas-room'),state,{
 ready:()=>{$('#stage').dataset.ready='true';},
 change:s=>{state=s;persist();},
 snapshot:s=>{snapshot=s;const stage=$('#stage');stage.dataset.pose=s.pose;stage.dataset.node=s.node;stage.dataset.destination=s.destination;stage.dataset.frame=s.frame;stage.dataset.x=String(Math.round(s.x));stage.dataset.y=String(Math.round(s.y));stage.dataset.expression=s.expression;},
});
$('#focus-cat').onclick=()=>room.scene.focusCat();
let panX=0,panning=false;
$('#canvas-room').addEventListener('pointerdown',e=>{panX=e.clientX;panning=true;});
$('#canvas-room').addEventListener('pointermove',e=>{if(panning&&Math.abs(e.clientX-panX)>2){room.scene.pan(e.clientX-panX);panX=e.clientX;}});
window.addEventListener('pointerup',()=>panning=false);
function refresh(){room.scene.sync(state);$('#cat-label').textContent=`${state.name} is home.`;$('#day').textContent=`Day ${state.day} · Morning`;$('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;}
refresh();
if(!exists){const el=$<HTMLDialogElement>('#creator');el.innerHTML=`<div class="welcome-art"><div class="welcome-window"><img id="cat-preview" src="${portraits[0]}" alt="Marmalade cat"></div><p>A quiet apartment.<br>A very real little personality.</p></div><form id="create-form"><p class="eyebrow">CHAPTER TWO · A LITTLE LIFE</p><h2 id="creator-title">Someone's moving in.</h2><p class="intro">Meet your new roommate. Learn their little ways.</p>${warning?`<p class="recovery">${esc(warning)}</p>${original?'<button type="button" id="backup-original">Download original save</button>':''}`:''}<label for="name">Their name</label><input id="name" name="name" value="Miso" maxlength="24" required autocomplete="off"><fieldset><legend>Their coat</legend><div class="coats">${COATS.map((c,i)=>`<label><input type="radio" name="coat" value="${i}" ${i===0?'checked':''}><span><img src="${portraits[i]}" alt=""><small>${c}</small></span></label>`).join('')}</div></fieldset><fieldset><legend>Their little ways</legend><div class="personalities">${PERSONALITIES.map(p=>`<label><input type="radio" name="personality" value="${p}" ${p==='Playful'?'checked':''}><span><strong>${p}</strong><small>${p==='Shy'?'Quiet corners & slow blinks':p==='Playful'?'Curiosity in every paw':'A little cat with big opinions'}</small></span></label>`).join('')}</div></fieldset><button class="primary" type="submit">Come on in <span>→</span></button><p class="fine-print">Your v1 cat and save stay exactly where they are.</p></form>`;el.addEventListener('cancel',e=>{if(!exists)e.preventDefault();});el.showModal();
 el.querySelectorAll<HTMLInputElement>('[name="coat"]').forEach(b=>b.onchange=()=>{$<HTMLImageElement>('#cat-preview').src=portraits[Number(b.value)];});
 if(original&&warning)$('#backup-original').onclick=()=>download(original,'little-windows-v2-original.json');
 $('#create-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target as HTMLFormElement);state=newCat(String(f.get('name')),Number(f.get('coat')),String(f.get('personality')) as Save['personality']);state.reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;exists=true;persist();refresh();el.close();};
}
function download(contents:string,name:string){const url=URL.createObjectURL(new Blob([contents],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
