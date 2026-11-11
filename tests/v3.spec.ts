import {test,expect,type Page} from '@playwright/test';
import {newCat} from '../v3/src/care';
import {createLayout,canStand} from '../v3/src/world';
async function create(page:Page){await page.goto('/v3/');await page.getByRole('button',{name:'Open the door',exact:false}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');}
test('owner and cat creation, four-direction movement, and a moving in-game clock',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/v3/');
 await page.getByLabel('Your name',{exact:true}).fill('Ari');await page.getByRole('radio',{name:'Dark curls',exact:true}).check();await page.getByRole('radio',{name:'Skin tone 4',exact:true}).check();await page.getByRole('radio',{name:'Blue linen',exact:true}).check();await page.getByLabel('Their name',{exact:true}).fill('Juniper');await page.getByRole('radio',{name:'Calico',exact:true}).check();await page.getByRole('radio',{name:/Shy/}).check();
 await page.getByRole('button',{name:'Open the door',exact:false}).click();const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');const before=Number(await stage.getAttribute('data-owner-x'));
 await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.up('d');await expect(stage).toHaveAttribute('data-owner-pose','idle');expect(Number(await stage.getAttribute('data-owner-x'))).toBeGreaterThan(before+50);
 const angle=Number(await stage.getAttribute('data-clock-minute'));await page.waitForTimeout(1500);expect(Number(await stage.getAttribute('data-clock-minute'))).toBeGreaterThan(angle+5);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!).owner.name),{timeout:6500}).toBe('Ari');const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!));expect(save.owner).toEqual({name:'Ari',hair:2,skin:3,outfit:2});expect(save.name).toBe('Juniper');expect(save.coat).toBe(3);
 await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');await page.getByRole('button',{name:'Invite cat to window seat',exact:true}).click();await expect.poll(async()=>Number(await stage.getAttribute('data-owner-y')),{timeout:10000}).toBeLessThan(340);await page.screenshot({path:'test-results/v3-foundation.png',fullPage:true});expect(errors).toEqual([]);
});
test('owner cannot walk through the sofa and the cat remains on walkable floor',async({page})=>{
 const save=newCat();save.ownerPosition={x:592,y:400};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.keyboard.down('d');await page.waitForTimeout(1200);await page.keyboard.up('d');expect(Number(await stage.getAttribute('data-owner-x'))).toBeLessThanOrEqual(628);
 const l=createLayout(false);for(let i=0;i<14;i++){const x=Number(await stage.getAttribute('data-cat-x')),y=Number(await stage.getAttribute('data-cat-y'));expect(canStand(l,{x,y},10)).toBe(true);await page.waitForTimeout(200);}
});

test('the owner approaches the bowl, refills it, and then brushes their cat',async({page})=>{
 test.setTimeout(40000);const save=newCat();save.ownerPosition={x:112,y:624};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Refill food bowl',exact:true}).click();await expect(stage).toHaveAttribute('data-owner-pose','care');
 expect(Number(await stage.getAttribute('data-owner-y'))).toBeLessThan(610);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!).food),{timeout:6000}).toBe(3);
 await expect(stage).toHaveAttribute('data-cat-pose','eat',{timeout:14000});await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!).actions),{timeout:6000}).toBe(1);
 await page.getByRole('button',{name:'Pick up brush',exact:true}).click();await expect(stage).toHaveAttribute('data-tool','brush',{timeout:7000});
 await page.getByRole('button',{name:'Brush your cat',exact:true}).click();await expect(stage).toHaveAttribute('data-owner-pose','care',{timeout:12000});await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!).actions),{timeout:7000}).toBe(2);
 await page.screenshot({path:'test-results/v3-owner-care.png',fullPage:true});
});

test('the cat follows, rubs against the owner, and joins their lap on the sofa',async({page})=>{
 test.setTimeout(40000);await create(page);const stage=page.locator('#stage');await page.keyboard.down('a');await page.waitForTimeout(900);await page.keyboard.up('a');
 await expect(stage).toHaveAttribute('data-behavior',/following|rubbing/,{timeout:6500});
 await expect(stage).toHaveAttribute('data-behavior','rubbing',{timeout:9000});expect(Math.hypot(Number(await stage.getAttribute('data-cat-x'))-Number(await stage.getAttribute('data-owner-x')),Number(await stage.getAttribute('data-cat-y'))-Number(await stage.getAttribute('data-owner-y')))).toBeLessThan(100);
 await page.getByRole('button',{name:'Sit on sofa',exact:true}).click();await expect(stage).toHaveAttribute('data-seated','true',{timeout:11000});await expect(stage).toHaveAttribute('data-behavior','lap',{timeout:14000});
 await expect(stage).toHaveAttribute('data-cat-pose','sleep');await page.screenshot({path:'test-results/v3-lap.png',fullPage:true});
 await page.keyboard.press('e');await expect(stage).toHaveAttribute('data-seated','false');await page.waitForTimeout(900);expect(canStand(createLayout(false),{x:Number(await stage.getAttribute('data-cat-x')),y:Number(await stage.getAttribute('data-cat-y'))},10)).toBe(true);
});

test('a sulking cat ignores a call and keeps its distance from the owner',async({page})=>{
 const save=newCat('Juniper',3,'Shy');save.tension=100;await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Call your cat',exact:false}).click();await expect(stage).toHaveAttribute('data-behavior','sulking');await expect(stage).not.toHaveAttribute('data-behavior','rubbing');
 await page.waitForTimeout(4000);const x=Number(await stage.getAttribute('data-cat-x')),y=Number(await stage.getAttribute('data-cat-y'));expect(Math.hypot(x-368,y-624)).toBeGreaterThan(120);expect(canStand(createLayout(false),{x,y},10)).toBe(true);
});


test('the owner holds the wand while the cat stalks and pounces around solid objects',async({page})=>{
 test.setTimeout(45000);const save=newCat();save.ownerPosition={x:176,y:464};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Pick up feather wand',exact:true}).click();await expect(stage).toHaveAttribute('data-tool','wand',{timeout:6000});
 for(let i=0;i<3;i++){await page.keyboard.press('e');await expect(stage).toHaveAttribute('data-pounces',String((i+1)%3),{timeout:13000});}
 expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!))).actions).toBe(1);
 expect(canStand(createLayout(false),{x:Number(await stage.getAttribute('data-cat-x')),y:Number(await stage.getAttribute('data-cat-y'))},10)).toBe(true);
});
