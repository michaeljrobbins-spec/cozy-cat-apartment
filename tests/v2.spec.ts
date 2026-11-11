import {test,expect} from '@playwright/test';
import {newCat} from '../v2/src/model';
test('v2 cat travels through the room and uses multiple real sprite frames',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/v2/');await page.getByRole('button',{name:'Come on in'}).click();const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 const before=await stage.getAttribute('data-x'),frames=new Set<string>();for(let i=0;i<12;i++){frames.add((await stage.getAttribute('data-frame'))!);await page.waitForTimeout(350);}
 expect(frames.size).toBeGreaterThan(3);expect(await stage.getAttribute('data-x')).not.toBe(before);
 await expect(stage).toHaveAttribute('data-node','window',{timeout:25000});await expect(stage).toHaveAttribute('data-pose','sit');
 await page.screenshot({path:'test-results/v2-stage1.png',fullPage:true});expect(errors).toEqual([]);
});

test('care takes place at room objects, with brushing and three in-room pounces',async({page})=>{
 await page.goto('/v2/');await page.getByRole('button',{name:'Come on in'}).click();const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Refill food bowl',exact:true}).click();await expect(stage).toHaveAttribute('data-destination','bowls');await expect(stage).toHaveAttribute('data-pose','eat',{timeout:15000});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v2')!).actions),{timeout:6000}).toBe(1);
 await page.getByRole('button',{name:'Pick up brush',exact:true}).click();await expect(stage).toHaveAttribute('data-tool','brush');
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'Brush your cat',exact:true}).click();await page.waitForTimeout(230);}
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v2')!).actions),{timeout:6000}).toBe(2);
 await page.getByRole('button',{name:'Put down tool',exact:true}).click();await page.getByRole('button',{name:'Pick up feather wand',exact:true}).click();await expect(stage).toHaveAttribute('data-tool','wand');
 for(let i=0;i<3;i++){await page.getByRole('button',{name:'Move toy for your cat',exact:true}).click();await expect(stage).toHaveAttribute('data-pounces',String((i+1)%3),{timeout:15000});}
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v2')!).actions)).toBe(3);
 await page.getByRole('button',{name:'Put down tool',exact:true}).click();await expect(page.locator('#play-dialog')).toHaveCount(0);await page.screenshot({path:'test-results/v2-interactions.png',fullPage:true});
});


test('overwhelmed cats flatten their ears, hide, and recover when left alone',async({page})=>{
 test.setTimeout(45000);const cat=newCat('Juniper',3,'Shy');cat.tension=100;
 await page.addInitScript(save=>localStorage.setItem('cozy-cat-apartment:v2',JSON.stringify(save)),cat);
 await page.goto('/v2/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-expression','flat');
 await expect(stage).toHaveAttribute('data-node','hide',{timeout:16000});await expect(stage).toHaveAttribute('data-pose','hide');
 await page.screenshot({path:'test-results/v2-body-language.png',fullPage:true});
 await expect(stage).toHaveAttribute('data-expression','soft',{timeout:25000});
 expect(await page.locator('#thought').count()).toBe(0);
});

test('a hungry cat finds a stocked bowl without needing a menu',async({page})=>{
 const cat=newCat('Nori',2,'Demanding');cat.needs.food=15;
 await page.addInitScript(save=>localStorage.setItem('cozy-cat-apartment:v2',JSON.stringify(save)),cat);await page.goto('/v2/');
 await expect(page.locator('#stage')).toHaveAttribute('data-destination','bowls',{timeout:6000});await expect(page.locator('#stage')).toHaveAttribute('data-pose','eat',{timeout:13000});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v2')!).needs.food),{timeout:6000}).toBeGreaterThan(15);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v2')!).hearts)).toBe(6);
});

test('sound starts on a gesture, produces audio, mutes, and persists',async({page})=>{
 await page.addInitScript(()=>{
  const w=window as any,Native=window.AudioContext,connect=AudioNode.prototype.connect;
  w.AudioContext=class extends Native{constructor(){super();w.__context=this;}};
  AudioNode.prototype.connect=function(...args:any[]){if(args[0] instanceof AudioDestinationNode)w.__master=this;return (connect as any).apply(this,args);};
 });
 await page.goto('/v2/');await expect(page.getByRole('button',{name:'Mute sound',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.getByRole('button',{name:'Come on in'}).click();await expect(page.locator('#mute')).toHaveAttribute('data-audio-state','playing');
 const rms=()=>page.evaluate(async()=>{const w=window as any,c=w.__context as AudioContext,master=w.__master as GainNode,analyser=c.createAnalyser();master.connect(analyser);await new Promise(r=>setTimeout(r,250));const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);master.disconnect(analyser);return Math.sqrt(values.reduce((a,b)=>a+b*b,0)/values.length);});
 expect(await rms()).toBeGreaterThan(.0001);
 await page.getByRole('button',{name:'Mute sound',exact:true}).click();await expect(page.locator('#mute')).toHaveAttribute('data-audio-state','muted');expect(await rms()).toBeLessThan(.0001);
 await page.reload();await expect(page.getByRole('button',{name:'Enable sound',exact:true})).toHaveAttribute('aria-pressed','true');
});
