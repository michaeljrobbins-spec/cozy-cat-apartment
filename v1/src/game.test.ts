import { describe, expect, it } from 'vitest';
import { createCat, care, nextDay, buy, equip, treat, parseSave, phase, cue, type Action, PERSONALITIES, SHOP } from './game';
describe('a relaxed day with a cat',()=>{
  it('creates six coat variants and each personality with a welcome balance',()=>{
    for(let coat=0;coat<6;coat++)for(const personality of PERSONALITIES){const s=createCat(' Miso ',coat,personality);expect(parseSave(JSON.stringify(s))).toEqual(s);expect(s.name).toBe('Miso');expect(s.hearts).toBe(6);expect(cue(s)).toContain('Miso');}
  });
  it('rewards useful care, advances light, caps repeat rewards, and keeps meters bounded',()=>{
    let s=createCat('Miso',0,'Playful');const before=structuredClone(s);const fed=care(s,'feed');expect(fed.state.needs.food).toBe(100);expect(fed.earned).toBe(2);expect(s).toEqual(before);
    s=fed.state;for(let i=0;i<50;i++)s=care(s,'feed').state;expect(s.hearts).toBe(8);expect(phase(s)).toBe('Evening');expect(Object.values(s.needs).every(n=>n>=0&&n<=100)).toBe(true);
  });
  it('respects tiredness and overstimulation without spending a turn or hearts',()=>{
    const s=createCat('Miso',0,'Playful');s.needs.energy=20;const r=care(s,'play');expect(r.accepted).toBe(false);expect(r.state).toEqual(s);expect(r.message).toContain('nap');
    s.needs.energy=90;s.needs.stimulation=100;expect(care(s,'play').accepted).toBe(false);expect(care(care(s,'space').state,'play').accepted).toBe(true);
  });
  it('gives personalities distinct reactions and care effects',()=>{
    const shy=createCat('Miso',0,'Shy');shy.needs.stimulation=90;expect(care(shy,'brush').accepted).toBe(false);expect(care(care(shy,'space').state,'brush').accepted).toBe(true);
    const playful=createCat('Miso',0,'Playful'),demanding=createCat('Miso',0,'Demanding');expect(care(playful,'play').state.needs.stimulation).toBeGreaterThan(care(demanding,'play').state.needs.stimulation);demanding.needs.water=40;expect(cue(demanding)).toContain('Fresh water');
  });
  it('lets all essential care work without hearts and begins a day only on request',()=>{
    for(const action of ['feed','water','brush','play','nap','space'] as Action[]){const s=createCat('Miso',0,'Shy');s.hearts=0;expect(care(s,action).accepted).toBe(true);}
    const s=createCat('Miso',0,'Shy');s.actions=10;s.rewards={feed:3};const n=nextDay(s);expect(n.day).toBe(2);expect(n.needs.energy).toBe(100);expect(n.actions).toBe(0);expect(n.rewards).toEqual({});expect(n.needs.food).toBe(s.needs.food);
  });
});
describe('the little shop',()=>{
  it('charges once for permanent purchases and equips only owned items',()=>{
    let s=createCat('Miso',0,'Playful');expect(equip(s,'rose-cushion')).toBe(s);s=buy(s,'sage-cushion');expect(s.hearts).toBe(0);expect(s.equipped.cushion).toBe('sage-cushion');expect(buy(s,'sage-cushion')).toBe(s);expect(buy(s,'mouse')).toBe(s);s.hearts=20;s=buy(s,'rose-cushion');expect(equip(s,'sage-cushion').equipped.cushion).toBe('sage-cushion');
  });
  it('stores and consumes treats without creating hearts',()=>{
    let s=createCat('Miso',0,'Playful');s.needs.comfort=20;s=buy(s,'salmon');expect(s.treats.salmon).toBe(1);expect(s.hearts).toBe(3);s=treat(s,'salmon');expect(s.needs.comfort).toBe(32);expect(s.treats.salmon).toBe(0);expect(treat(s,'salmon')).toBe(s);expect(s.hearts).toBe(3);expect(parseSave(JSON.stringify(s))).toEqual(s);
  });
  it('includes six decorations, two toys, and two treats',()=>{
    expect(SHOP.filter(i=>i.type==='decor')).toHaveLength(6);expect(SHOP.filter(i=>i.type==='toy')).toHaveLength(2);expect(SHOP.filter(i=>i.type==='treat')).toHaveLength(2);
  });
});
describe('save safety',()=>{
  it('rejects corrupt, unknown, or inconsistent data',()=>{
    expect(()=>parseSave('broken')).toThrow();const s=createCat('Miso',0,'Playful');
    for(const bad of [{...s,schema:2},{...s,coat:99},{...s,personality:'Angry'},{...s,needs:{...s.needs,food:-1}},{...s,equipped:{toy:'mouse'}},{...s,treats:{salmon:-1}},{...s,owned:['<script>']},{...s,rewards:null}])expect(()=>parseSave(JSON.stringify(bad))).toThrow();
  });
  it('does not apply real time or mutate progress while loading',()=>{
    const s=care(createCat('Miso',0,'Shy'),'brush').state;expect(parseSave(JSON.stringify(s))).toEqual(s);
  });
});
