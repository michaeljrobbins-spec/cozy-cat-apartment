import {expect,it} from 'vitest';
import {newCat,readSave,tomorrow} from './care';
import {event as record,goals,goalProgress,validJourney} from './journey';
it('tutorial teaches real interactions in order and completes without blocking play',()=>{
 let s=newCat();s=record(s,'refillWater').state;expect(s.journey.tutorial.step).toBe(0);
 for(const e of ['walk','refillFood','refillWater','observe','quiet'] as const)s=record(s,e).state;
 expect(s.journey.tutorial).toEqual({step:5,status:'complete'});expect(readSave(JSON.stringify(s))).toEqual(s);
});
it('goals reward varied useful care once, preserving bond while resetting the next day',()=>{
 let s=newCat();s=record(s,'observe').state;for(let i=0;i<10;i++)s=record(s,'observe').state;expect(s.journey.bond).toBe(1);expect(s.hearts).toBe(8);
 s=record(s,'refillFood').state;expect(s.journey.completed).not.toContain('meal');s=record(s,'ate').state;s=record(s,'drank').state;expect(s.journey.completed).toHaveLength(3);expect(s.journey.bond).toBe(3);expect(s.hearts).toBe(12);
 s=tomorrow(s);expect(s.journey.bond).toBe(3);expect(s.journey.goalDay).toBe(2);expect(s.journey.completed).toEqual([]);expect(goals(s.journey).every(g=>goalProgress(s.journey,g)===0)).toBe(true);
});
it('upgrades earlier v4 saves without erasing either resident and rejects broken progress',()=>{
 const s=newCat('Mochi',3,'Shy');s.owner.hair=2;const legacy={...s} as any;delete legacy.journey;const restored=readSave(JSON.stringify(legacy));expect(restored.owner).toEqual(s.owner);expect(restored.name).toBe('Mochi');expect(restored.journey.tutorial.status).toBe('active');expect(validJourney({...s.journey,stats:{ate:-1}})).toBe(false);expect(()=>readSave(JSON.stringify({...s,journey:{}}))).toThrow();
});
