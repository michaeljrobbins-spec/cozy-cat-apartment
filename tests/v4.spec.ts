import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {newCat} from '../v4/src/care';
import {newJourney} from '../v4/src/journey';
import {LAYOUT,canStand} from '../v4/src/world';
async function create(page:Page){await page.goto('/v4/');await page.getByRole('button',{name:'Open the door',exact:false}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');}
test('owner profile keeps eyes, nose and mouth in every hair and skin combination',async({page})=>{
 await page.goto('/v4/');const source=readFileSync('v4/src/sprites.ts','utf8'),code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 const checked=await page.evaluate(async code=>{const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));const m=await import(url);let count=0;
  for(let hair=0;hair<4;hair++)for(let skin=0;skin<5;skin++)for(let outfit=0;outfit<4;outfit++)for(const direction of ['left','right']){
   const image=new Image();image.src=m.ownerPortrait({name:'Robin',hair,skin,outfit},direction);await image.decode();const c=document.createElement('canvas');c.width=32;c.height=48;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);
   const hex=(x:number,y:number)=>'#'+Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(hex(direction==='right'?22:9,13)!=='#41443d')throw Error(`Missing eye ${hair}/${skin}/${outfit}/${direction}`);
   if(hex(direction==='right'?26:5,16)!==m.SKINS[skin])throw Error('Missing nose');
   if(hex(direction==='right'?24:7,19)!=='#714f40')throw Error('Missing mouth');count++;
  }URL.revokeObjectURL(url);return count;
 },code);expect(checked).toBe(160);
});
test('cat has its own routine, accepts a short visit and leaves again',async({page})=>{
 test.setTimeout(45000);await create(page);const stage=page.locator('#stage');await page.getByRole('button',{name:'Explore home',exact:false}).click();await page.getByRole('button',{name:'Walk to Bedroom',exact:true}).click();await expect(stage).toHaveAttribute('data-room','Bedroom',{timeout:9000});await expect(stage).toHaveAttribute('data-owner-pose','idle');
 await page.waitForTimeout(7500);expect(Number(await stage.getAttribute('data-cat-x'))).toBeLessThan(528);expect(await stage.getAttribute('data-behavior')).not.toBe('following');
 await page.getByRole('button',{name:'Call cat',exact:false}).click();await expect(stage).toHaveAttribute('data-behavior',/visiting|rubbing/,{timeout:8000});await expect(stage).toHaveAttribute('data-behavior','leaving',{timeout:16000});
 expect(canStand(LAYOUT,{x:Number(await stage.getAttribute('data-cat-x')),y:Number(await stage.getAttribute('data-cat-y'))},8)).toBe(true);await page.screenshot({path:'test-results/v4-independent-cat.png',fullPage:true});
});

test('nearby objects have labels and the cat shows needs rather than dots',async({page})=>{
 const save=newCat();save.ownerPosition={x:592,y:432};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v4',JSON.stringify(s)),save);await page.goto('/v4/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await expect(page.locator('#object-food')).toHaveClass(/near/);await expect(page.locator('#object-food span')).toContainText('Food bowl');expect(await page.locator('#object-food').evaluate(el=>getComputedStyle(el,':after').content)).toBe('none');
 await expect(page.locator('[data-thought="food"]')).toBeVisible();await page.getByRole('button',{name:'Refill food bowl',exact:true}).click();await expect(stage).toHaveAttribute('data-owner-pose','care');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!).needs.food),{timeout:10000}).toBeGreaterThan(70);await expect(page.locator('[data-thought="food"]')).toHaveCount(0);await page.screenshot({path:'test-results/v4-labels-needs.png',fullPage:true});
});

test('first-day guide, bonding goals, skip and replay all persist without duplicate rewards',async({page})=>{
 test.setTimeout(45000);await create(page);const stage=page.locator('#stage');await expect(page.locator('#coach')).toContainText('Take a few little steps');
 await page.getByRole('button',{name:'Explore home',exact:false}).click();await page.getByRole('button',{name:'Walk to Kitchen',exact:true}).click();await expect(page.locator('#coach')).toContainText('A fresh bowl');
 await page.getByRole('button',{name:'Refill food bowl',exact:true}).click();await expect(page.locator('#coach')).toContainText('A little fresh water',{timeout:7000});await page.getByRole('button',{name:'Refill water bowl',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!).journey.completed.length),{timeout:16000}).toBe(3);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!).journey.tutorial.status),{timeout:15000}).toBe('complete');await expect(page.locator('#coach')).not.toBeVisible();
 await page.getByRole('button',{name:'A little help',exact:false}).click();await expect(page.locator('#help-dialog')).toContainText('A friend, with their own plans');await page.getByRole('button',{name:'Replay the gentle guide',exact:true}).click();await expect(page.locator('#coach')).toContainText('Take a few little steps');
 await page.getByRole('button',{name:'I’ll explore on my own',exact:true}).click();await expect(page.locator('#coach')).not.toBeVisible();const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!));expect(s.journey.bond).toBe(3);expect(s.journey.tutorial.status).toBe('skipped');await page.reload();await expect(page.locator('#coach')).not.toBeVisible();expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!))).journey.bond).toBe(3);
});


test('a new day rewards welcomed bonding even when the comfort meter is already full',async({page})=>{
 const s=newCat();s.day=2;s.journey=newJourney(2);s.ownerPosition={x:432,y:272};s.needs.comfort=100;await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v4',JSON.stringify(s)),s);await page.goto('/v4/');await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Pick up brush',exact:true}).click();await expect(page.locator('#stage')).toHaveAttribute('data-tool','brush',{timeout:5000});await page.getByRole('button',{name:'Brush your cat',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!).journey.completed),{timeout:10000}).toContain('comfort');expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v4')!))).journey.bond).toBe(1);
});
