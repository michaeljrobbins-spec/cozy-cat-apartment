import {expect,it} from 'vitest';
import {voicePlan,VOICE_COOLDOWN} from './cat-audio';
it('varies cat pitch, duration and timbre instead of replaying a fixed tone',()=>{
 const a=voicePlan('meow','request',()=>0),b=voicePlan('meow','request',()=>1);expect(a.duration).toBeLessThan(b.duration);expect(a.start).toBeLessThan(b.start);expect(a.peak).toBeLessThan(b.peak);expect(voicePlan('meow','wary',()=>.5).peak).toBeLessThan(voicePlan('meow','content',()=>.5).peak);expect(voicePlan('meow','request',()=>.5,'Shy').volume).toBeLessThan(voicePlan('meow','request',()=>.5,'Demanding').volume);
});
it('keeps warning sounds brief and purrs slower than the voiced sounds',()=>{
 expect(voicePlan('hiss','overwhelmed',()=>1).duration).toBeLessThan(.6);expect(voicePlan('purr','content',()=>.5).start).toBeLessThan(30);expect(voicePlan('chirp','playful',()=>1).pulses).toBe(2);expect(VOICE_COOLDOWN.hiss).toBeGreaterThanOrEqual(10);
});
