import {expect,it} from 'vitest';
import {act,windowReady,lightReady} from './mystery';
import {newCat,readSave,SAVE_KEY} from './care';
it('gives actionable prerequisites without penalizing an unavailable invitation',()=>{const s=newCat(),r=act(s,'invite');expect(r.state.mystery.attempts).toBe(0);expect(r.message).toContain('toy cabinet');expect(windowReady(s.mystery)).toBe(false);});
it('persists each window prerequisite in a separate v7 save and rewards the invitation once',()=>{let s=newCat();s=act(s,'cushion',1).state;expect(act(s,'seat').message).toContain('cushion is in place');s=act(s,'shade',.4).state;s=readSave(JSON.stringify(s));expect(SAVE_KEY).toBe('cozy-cat-apartment:v7');expect(windowReady(s.mystery)).toBe(true);expect(lightReady(.81)).toBe(false);s=act(s,'invite').state;expect(s.mystery.solved).toBe(true);expect(s.mystery.photos.sunbeam).toBe(1);expect(act(s,'invite').state.hearts).toBe(s.hearts);});
