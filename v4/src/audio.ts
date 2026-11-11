import {CatVoice,type VoiceKind,type VoiceMood} from './cat-audio';
/** Original, locally synthesized soundscape. No downloads or third-party samples. */
export class Soundscape{
 private voice?:CatVoice;private musicBus?:GainNode;private voiceMood:VoiceMood='content';private voicePersonality='Playful';private context?:AudioContext;private master?:GainNode;private ambience?:GainNode;private rainGain?:GainNode;
 private noise?:AudioBuffer;private musicTimer?:ReturnType<typeof setInterval>;private nextNote=0;private note=0;
 private muted=false;private started=false;private lastMeow=-100;private lastPurr=-100;
 constructor(private report:(state:string)=>void){}
 async unlock(muted:boolean,rain:boolean){
  this.muted=muted;
  try{
   if(!this.context){
    const c=this.context=new AudioContext();this.master=c.createGain();this.master.gain.value=muted?0:.55;this.master.connect(c.destination);this.musicBus=c.createGain();this.musicBus.gain.value=.7;this.musicBus.connect(this.master);this.voice=new CatVoice(c,this.master);this.voice.setMood(this.voiceMood,this.voicePersonality);
    this.noise=c.createBuffer(1,c.sampleRate*6,c.sampleRate);const data=this.noise.getChannelData(0);let low=0;
    // A softly correlated noise bed avoids the harshness of white noise.
    for(let i=0;i<data.length;i++){low=.97*low+.03*(Math.random()*2-1);data[i]=low*3;}
    this.ambience=c.createGain();this.ambience.gain.value=.12;this.ambience.connect(this.master);
    const city=c.createBufferSource();city.buffer=this.noise;city.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;city.connect(filter).connect(this.ambience);city.start();
    this.rainGain=c.createGain();this.rainGain.gain.value=rain?.13:0;this.rainGain.connect(this.master);const rainSource=c.createBufferSource();rainSource.buffer=this.noise;rainSource.loop=true;const rainFilter=c.createBiquadFilter();rainFilter.type='highpass';rainFilter.frequency.value=900;rainSource.connect(rainFilter).connect(this.rainGain);rainSource.start();
    this.nextNote=c.currentTime+.3;this.musicTimer=setInterval(()=>this.schedule(),150);
    document.addEventListener('visibilitychange',()=>{if(!this.context)return;if(document.hidden){void this.context.suspend();}else if(this.started){void this.context.resume().then(()=>this.report(this.muted?'muted':'playing'));}});
   }
   await this.context.resume();this.started=true;this.setMuted(muted);this.report(muted?'muted':'playing');
  }catch{this.report('unavailable');}
 }
 setMuted(value:boolean){this.muted=value;if(this.context&&this.master){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(value?0:.55,this.context.currentTime,.035);}this.report(this.context?(value?'muted':'playing'):'waiting');}
 setRain(value:boolean){if(this.context&&this.rainGain)this.rainGain.gain.setTargetAtTime(value?.13:0,this.context.currentTime,.8);}
 private tone(frequency:number,start:number,duration:number,volume:number,type:OscillatorType='sine',destination?:AudioNode){
  const c=this.context!;const osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.value=frequency;
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain).connect(destination||this.musicBus||this.master!);osc.start(start);osc.stop(start+duration+.02);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
 private schedule(){
  const c=this.context;if(!c||c.state!=='running')return;
  if(this.nextNote<c.currentTime)this.nextNote=c.currentTime+.1;
  const melody=[0,7,12,9,7,-1,4,2,0,4,7,12,9,-1,7,4,2,7,9,14,12,-1,9,7,4,2,0,7,4,-1,2,0];
  const chords=[[130.81,164.81,196],[110,130.81,164.81],[87.31,130.81,174.61],[98,146.83,196]];
  while(this.nextNote<c.currentTime+.6){
   const index=this.note%melody.length,semitone=melody[index],time=this.nextNote;
   if(semitone>=0){const hz=261.63*2**(semitone/12);this.tone(hz,time,2.2,.028,'sine');this.tone(hz*2,time,1.2,.006,'sine');}
   if(index%8===0)for(const hz of chords[Math.floor(index/8)])this.tone(hz,time,5.6,.011,'triangle');
   // Distant, passing traffic: slowly opening and closing, never a sharp horn.
   if(index===0){const source=c.createBufferSource();source.buffer=this.noise!;const filter=c.createBiquadFilter(),gain=c.createGain();filter.type='lowpass';filter.frequency.setValueAtTime(130,time);filter.frequency.linearRampToValueAtTime(550,time+4);filter.frequency.linearRampToValueAtTime(130,time+9);gain.gain.setValueAtTime(.001,time);gain.gain.linearRampToValueAtTime(.06,time+4);gain.gain.linearRampToValueAtTime(.001,time+9);source.connect(filter).connect(gain).connect(this.master!);source.start(time);source.stop(time+9);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
   this.note++;this.nextNote+=.72;
  }
 }
 effect(kind:string){
  const c=this.context;if(!c||c.state!=='running'||this.muted)return;
  if(kind==='chirp'){this.vocal('chirp');return;}
  if(kind==='brush'||kind==='company'){this.purr();return;}
  if(kind==='meow'||kind==='refuse'){this.meow(kind==='refuse');return;}
  const now=c.currentTime;
  if(kind==='step'){this.tone(90+Math.random()*25,now,.06,.014,'triangle');return;}
  if(kind==='pounce'){this.tone(110,now,.1,.035,'triangle');this.tone(180,now+.035,.12,.012);return;}
  if(kind==='refill'||kind==='drink'){[0,.12,.27].forEach((t,i)=>{this.tone(650+i*170,now+t,.13,.016);});return;}
  if(kind==='eat'){for(let i=0;i<7;i++)this.tone(120+Math.random()*150,now+i*.28,.06,.012,'triangle');return;}
  if(kind==='morning'){this.tone(392,now,1.5,.025);this.tone(523.25,now+.25,1.5,.018);this.tone(659.25,now+.5,1.8,.012);return;}
  if(kind==='complete'){this.tone(523.25,now,.65,.022);this.tone(659.25,now+.12,.75,.017);this.purr();return;}
  if(kind==='tool')this.tone(330,now,.1,.012,'triangle');
 }
 setCatMood(mood:string,personality:string){this.voiceMood=mood==='hungry'||mood==='thirsty'?'request':mood==='curious'?'playful':['wary','overwhelmed','sleepy'].includes(mood)?mood as VoiceMood:'content';this.voicePersonality=personality;this.voice?.setMood(this.voiceMood,personality);}
 private vocal(kind:VoiceKind){
  const duration=this.voice?.speak(kind)||0,c=this.context;
  if(duration&&c&&this.musicBus){this.musicBus.gain.cancelScheduledValues(c.currentTime);this.musicBus.gain.setTargetAtTime(.24,c.currentTime,.08);this.musicBus.gain.setTargetAtTime(.7,c.currentTime+duration+.15,.45);}
 }
 private purr(){this.vocal('purr');}
 private meow(grumble=false){this.vocal(grumble&&this.voiceMood==='overwhelmed'?'hiss':'meow');}
 destroy(){clearInterval(this.musicTimer);void this.context?.close();}
}
