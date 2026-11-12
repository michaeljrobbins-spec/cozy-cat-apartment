/** Original cat-voice synthesis: voiced glottal harmonics, changing vowel
 * resonances, micro-jitter, breathing and unvoiced air. No recordings. */
export type VoiceKind='meow'|'purr'|'chirp'|'hiss';
export type VoiceMood='content'|'request'|'sleepy'|'wary'|'overwhelmed'|'playful';
export const VOICE_COOLDOWN:Record<VoiceKind,number>={meow:5,purr:4,chirp:3.5,hiss:10};
export interface VoicePlan{kind:VoiceKind;duration:number;start:number;peak:number;end:number;volume:number;vibrato:number;breath:number;pulses:number}
export function voicePlan(kind:VoiceKind,mood:VoiceMood,random= Math.random,personality='Playful'):VoicePlan{
 const a=random(),b=random(),c=random(),shy=personality==='Shy',demanding=personality==='Demanding';
 if(kind==='purr')return {kind,duration:2.7+a*1.4,start:24+a*3,peak:27+b*2,end:25+c*2,volume:shy?.39:.48,vibrato:.7,breath:.18,pulses:1};
 if(kind==='hiss')return {kind,duration:.32+a*.22,start:0,peak:0,end:0,volume:shy?.075:.095,vibrato:0,breath:1,pulses:1};
 if(kind==='chirp')return {kind,duration:.17+a*.2,start:610+a*190,peak:1050+b*450,end:480+c*250,volume:shy?.095:.13,vibrato:7,breath:.05,pulses:b>.5?2:1};
 const low=mood==='sleepy'||mood==='wary'||mood==='overwhelmed',request=mood==='request';
 return {kind,duration:(request?.62:low?.48:.33)+a*(request?.45:.26)+(demanding?.1:0),start:(low?260:420)+a*110,peak:(low?380:request?740:620)+b*130,end:(low?210:340)+c*100,volume:(shy?.11:request?.19:.15)*(low?.8:1),vibrato:3+b*4,breath:low?.13:.065,pulses:1};
}
export class CatVoice{
 private last:Partial<Record<VoiceKind,number>>={};private noise:AudioBuffer;private wave:PeriodicWave;private mood:VoiceMood='content';private personality='Playful';
 constructor(private c:BaseAudioContext,private output:AudioNode){
  this.noise=c.createBuffer(1,Math.ceil(c.sampleRate*5),c.sampleRate);const samples=this.noise.getChannelData(0);let pink=0;
  for(let i=0;i<samples.length;i++){const white=Math.random()*2-1;pink=.93*pink+.07*white;samples[i]=white*.6+pink*1.4;}
  const real=new Float32Array(40),imag=new Float32Array(40);for(let n=1;n<40;n++)imag[n]=(n%3===0?.72:1)/n**1.35;
  this.wave=c.createPeriodicWave(real,imag,{disableNormalization:false});
 }
 setMood(mood:VoiceMood,personality='Playful'){this.mood=mood;this.personality=personality;}
 speak(kind:VoiceKind,random=Math.random):number{
  const now=this.c.currentTime;if(now-(this.last[kind]??-100)<VOICE_COOLDOWN[kind])return 0;this.last[kind]=now;
  const plan=voicePlan(kind,this.mood,random,this.personality);
  if(kind==='purr')this.purr(plan);else if(kind==='hiss')this.hiss(plan);else this.voiced(plan);
  return plan.duration;
 }
 private envelope(duration:number,volume:number,start=this.c.currentTime){
  const gain=this.c.createGain();gain.gain.setValueAtTime(.00001,start);gain.gain.linearRampToValueAtTime(volume,start+Math.min(.075,duration*.2));gain.gain.setValueAtTime(volume*.85,start+duration*.55);gain.gain.exponentialRampToValueAtTime(.00001,start+duration);gain.connect(this.output);return gain;
 }
 private voiced(p:VoicePlan){
  const c=this.c,now=c.currentTime,duration=p.duration/p.pulses;
  for(let pulse=0;pulse<p.pulses;pulse++){
   const start=now+pulse*duration,span=duration*(p.pulses>1?.77:1),voice=c.createOscillator(),vibrato=c.createOscillator(),vibratoGain=c.createGain(),env=this.envelope(span,p.volume,start);
   voice.setPeriodicWave(this.wave);const curve=new Float32Array(48);
   for(let i=0;i<curve.length;i++){const t=i/(curve.length-1),f=t<.26?p.start+(p.peak-p.start)*Math.sin(t/.26*Math.PI/2):p.peak+(p.end-p.peak)*((t-.26)/.74)**.72;curve[i]=f+(Math.random()-.5)*5;}
   voice.frequency.setValueCurveAtTime(curve,start,span);vibrato.frequency.value=p.kind==='chirp'?18:4.5+Math.random();vibratoGain.gain.value=p.vibrato;vibrato.connect(vibratoGain).connect(voice.frequency);
   const filters:BiquadFilterNode[]=[],gains:GainNode[]=[];
   const vowels=p.kind==='chirp'?[[1300,2300,1400],[2600,3300,2100]]:[[650,1150,620],[1450,2250,1150],[2900,3300,2300]];
   vowels.forEach((v,i)=>{const f=c.createBiquadFilter(),g=c.createGain();f.type='bandpass';f.Q.value=i===0?2.2:4.1;f.frequency.setValueCurveAtTime(new Float32Array([v[0],v[1],v[1]*.92,v[2]]),start,span);g.gain.value=i===0?1.1:i===1?.5:.12;voice.connect(f).connect(g).connect(env);filters.push(f);gains.push(g);});
   const air=c.createBufferSource(),airFilter=c.createBiquadFilter(),airGain=c.createGain();air.buffer=this.noise;airFilter.type='highpass';airFilter.frequency.value=1900;airGain.gain.value=p.breath;air.connect(airFilter).connect(airGain).connect(env);
   voice.start(start);vibrato.start(start);air.start(start,Math.random()*2);voice.stop(start+span+.025);vibrato.stop(start+span+.025);air.stop(start+span+.025);
   voice.onended=()=>{[voice,vibrato,vibratoGain,air,airFilter,airGain,env,...filters,...gains].forEach(n=>n.disconnect());};
  }
 }
 private purr(p:VoicePlan){
  const c=this.c,now=c.currentTime,air=c.createBufferSource(),filter=c.createBiquadFilter(),fast=c.createOscillator(),fastDepth=c.createGain(),pulse=c.createGain(),breath=c.createOscillator(),breathDepth=c.createGain(),breathe=c.createGain(),env=this.envelope(p.duration,p.volume),rumble=c.createOscillator(),rumbleGain=c.createGain();
  air.buffer=this.noise;air.loop=true;filter.type='lowpass';filter.frequency.value=230;filter.Q.value=.8;
  fast.frequency.setValueAtTime(p.start,now);fast.frequency.linearRampToValueAtTime(p.peak,now+p.duration*.5);fast.frequency.linearRampToValueAtTime(p.end,now+p.duration);fastDepth.gain.value=.35;pulse.gain.value=.6;fast.connect(fastDepth).connect(pulse.gain);
  breath.frequency.value=.65;breathDepth.gain.value=.16;breathe.gain.value=.75;breath.connect(breathDepth).connect(breathe.gain);
  air.connect(filter).connect(pulse).connect(breathe).connect(env);rumble.frequency.value=p.start*2;rumbleGain.gain.value=.027;rumble.connect(rumbleGain).connect(pulse);
  air.start();fast.start();breath.start();rumble.start();for(const n of [air,fast,breath,rumble])n.stop(now+p.duration+.03);
  air.onended=()=>{[air,filter,fast,fastDepth,pulse,breath,breathDepth,breathe,env,rumble,rumbleGain].forEach(n=>n.disconnect());};
 }
 private hiss(p:VoicePlan){
  const c=this.c,now=c.currentTime,air=c.createBufferSource(),high=c.createBiquadFilter(),mouth=c.createBiquadFilter(),low=c.createBiquadFilter(),env=this.envelope(p.duration,p.volume);
  air.buffer=this.noise;high.type='highpass';high.frequency.value=1000;mouth.type='peaking';mouth.frequency.value=3600;mouth.Q.value=.7;mouth.gain.value=3;low.type='lowpass';low.frequency.value=6500;
  air.connect(high).connect(mouth).connect(low).connect(env);air.start(now,Math.random()*2);air.stop(now+p.duration+.02);air.onended=()=>{[air,high,mouth,low,env].forEach(n=>n.disconnect());};
 }
}
