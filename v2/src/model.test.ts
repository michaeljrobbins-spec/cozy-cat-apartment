import {expect,it} from 'vitest';
import {newCat,complete,readSave,purchase,mood,accepts,tomorrow,phase} from './model';
it('keeps v2 saves independent, validates records, and never applies offline time',()=>{
 const s=newCat(' Nori ',3,'Shy');expect(s.name).toBe('Nori');expect(s.muted).toBe(false);expect(readSave(JSON.stringify(s))).toEqual(s);expect(()=>readSave('{broken')).toThrow();expect(()=>readSave(JSON.stringify({...s,schema:1}))).toThrow();expect(()=>readSave(JSON.stringify({...s,tension:Infinity}))).toThrow();expect(()=>readSave(JSON.stringify({...s,equipped:{toy:'mouse'}}))).toThrow();
});
it('rewards helpful care when completed, not on a click, and bounds all needs',()=>{
 let s=newCat();const original=structuredClone(s);const result=complete(s,'eat');expect(s).toEqual(original);expect(result.state.needs.food).toBe(100);expect(result.earned).toBe(2);s=result.state;
 for(let i=0;i<25;i++)s=complete(s,'eat').state;expect(s.hearts).toBe(8);expect(phase(s)).toBe('Evening');expect(Object.values(s.needs).every(n=>n>=0&&n<=100)).toBe(true);
 const auto=complete(newCat(),'eat',false);expect(auto.earned).toBe(0);expect(auto.state.actions).toBe(0);
});
it('makes rest, quiet company, and helpful attention recover temperament',()=>{
 const s=newCat('Miso',0,'Shy');s.tension=80;expect(mood(s)).toBe('overwhelmed');expect(accepts(s,'brush')).toBe(false);expect(complete(s,'brush').state).toBe(s);const quiet=complete(s,'company').state;expect(quiet.tension).toBe(50);expect(mood(quiet)).toBe('wary');const sleep=complete(quiet,'sleep').state;expect(accepts(sleep,'brush')).toBe(true);
 s.needs.energy=10;s.tension=0;expect(mood(s)).toBe('sleepy');expect(accepts(s,'play')).toBe(false);
});
it('persists purchases, prevents duplicate charges, and stores treats',()=>{
 let s=newCat();s=purchase(s,'sage');expect(s.hearts).toBe(0);expect(s.equipped.cushion).toBe('sage');expect(purchase(s,'mouse')).toBe(s);expect(purchase(s,'sage').hearts).toBe(0);s.hearts=10;s=purchase(s,'salmon');expect(s.treats.salmon).toBe(1);expect(readSave(JSON.stringify(s))).toEqual(s);expect(tomorrow(s).day).toBe(2);
});
