import {expect,it} from 'vitest';
import {newCat} from './care';
import {guidance} from './guidance';
import {act,newMystery} from './mystery';
it('guides the window from cabinet through placement, light and invitation',()=>{
 let s=newCat();expect(guidance(s)).toMatchObject({target:'cabinet',item:'sage'});
 expect(guidance(s,'cushion')?.target).toBe('window-seat');
 s=act(s,'cushion',1).state;expect(guidance(s)?.target).toBe('curtain');
 s=act(s,'shade',.6).state;expect(guidance(s)?.label).toBe('Invite your cat');
 s.mystery.shade=1;expect(guidance(s)?.text).toContain('too closed');
});
it('guides mat placement and pour, and skips furnishings on returning days',()=>{
 const s=newCat();s.mystery=newMystery(2,'rattle');expect(guidance(s)?.item).toBe('felt');expect(guidance(s,'mat')?.target).toBe('water');
 s.mystery.mat=true;expect(guidance(s)?.text).toContain('gold mark');
 s.mystery=newMystery(4,'sunbeam',{sunbeam:1});expect(guidance(s)?.target).toBe('curtain');
});
it('guides mouse investigation before fetching the exact tool and pulling',()=>{
 let s=newCat();s.mystery=newMystery(3,'mouse');expect(guidance(s)?.target).toBe('bed-clue');
 s=act(s,'bed').state;expect(guidance(s)).toMatchObject({target:'cabinet',item:'wand'});expect(guidance(s,'wand')?.text).toContain('slowly drag');
 s.mystery.patience=0;expect(guidance(s,'wand')?.text).toContain('Put your tool down');
});
it('explains ordinary food, drink, play, company, rest and space requests',()=>{
 const s=newCat();s.mystery.solved=true;
 for(const [need,target] of [['food','food'],['water','water'],['play','cabinet'],['comfort','cat'],['energy','window-seat']] as const){s.needs={food:100,water:100,play:100,comfort:100,energy:100};s.needs[need]=10;expect(guidance(s)?.target).toBe(target);}
 s.tension=90;expect(guidance(s)?.text).toContain('step away');
});
it('names the action for every optional shared moment',()=>{
 const s=newCat();s.mystery.solved=true;
 for(const kind of ['bird','storm','lost'] as const){s.adventure.active={kind,started:0};expect(guidance(s)?.target).toBe('moment');expect(guidance(s)?.text).toContain('Tap here');}
});
