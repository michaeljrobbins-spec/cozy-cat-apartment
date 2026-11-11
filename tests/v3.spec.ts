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
 const l=createLayout(true);for(let i=0;i<14;i++){const x=Number(await stage.getAttribute('data-cat-x')),y=Number(await stage.getAttribute('data-cat-y'));expect(canStand(l,{x,y},10)).toBe(true);await page.waitForTimeout(200);}
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
 await page.keyboard.press('e');await expect(stage).toHaveAttribute('data-seated','false');await page.waitForTimeout(900);expect(canStand(createLayout(true),{x:Number(await stage.getAttribute('data-cat-x')),y:Number(await stage.getAttribute('data-cat-y'))},10)).toBe(true);
});

test('a sulking cat ignores a call and keeps its distance from the owner',async({page})=>{
 const save=newCat('Juniper',3,'Shy');save.tension=100;await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Call cat',exact:false}).click();await expect(stage).toHaveAttribute('data-behavior','sulking');await expect(stage).not.toHaveAttribute('data-behavior','rubbing');
 await page.waitForTimeout(4000);const x=Number(await stage.getAttribute('data-cat-x')),y=Number(await stage.getAttribute('data-cat-y'));expect(Math.hypot(x-368,y-624)).toBeGreaterThan(120);expect(canStand(createLayout(true),{x,y},10)).toBe(true);
});


test('the owner holds the wand while the cat stalks and pounces around solid objects',async({page})=>{
 test.setTimeout(45000);const save=newCat();save.ownerPosition={x:176,y:464};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Pick up feather wand',exact:true}).click();await expect(stage).toHaveAttribute('data-tool','wand',{timeout:6000});
 for(let i=0;i<3;i++){await page.keyboard.press('e');await expect(stage).toHaveAttribute('data-pounces',String((i+1)%3),{timeout:13000});}
 expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!))).actions).toBe(1);
 expect(canStand(createLayout(true),{x:Number(await stage.getAttribute('data-cat-x')),y:Number(await stage.getAttribute('data-cat-y'))},10)).toBe(true);
});


test('owner and cat cross real doorways into the kitchen, nook and bedroom',async({page})=>{
 test.setTimeout(60000);await create(page);const stage=page.locator('#stage');
 for(const room of ['Kitchen','Reading nook']){
  await page.getByRole('button',{name:'Explore home',exact:false}).click();await page.getByRole('button',{name:`Walk to ${room}`,exact:true}).click();
  await expect(stage).toHaveAttribute('data-room',room,{timeout:16000});await expect(stage).toHaveAttribute('data-owner-pose','idle',{timeout:8000});
  expect(canStand(createLayout(true),{x:Number(await stage.getAttribute('data-owner-x')),y:Number(await stage.getAttribute('data-owner-y'))})).toBe(true);
 }
 await page.getByRole('button',{name:'Sit in reading chair',exact:true}).click();await expect(stage).toHaveAttribute('data-seated','true',{timeout:7000});await expect(stage).toHaveAttribute('data-behavior','lap',{timeout:14000});await page.screenshot({path:'test-results/v3-reading-nook.png',fullPage:true});
 await page.getByRole('button',{name:'Explore home',exact:false}).click();await page.getByRole('button',{name:'Walk to Bedroom',exact:true}).click();await expect(stage).toHaveAttribute('data-room','Bedroom',{timeout:16000});await expect(stage).toHaveAttribute('data-owner-pose','idle',{timeout:8000});
 await page.getByRole('button',{name:'Turn in for the night',exact:true}).click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!).day),{timeout:10000}).toBe(2);expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!))).minutes).toBeLessThan(485);
});

test('mobile owner creation, thumbstick, purchases and independent persistent saves',async({page})=>{
 test.setTimeout(35000);await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{localStorage.setItem('cozy-cat-apartment:v1','v1 untouched');localStorage.setItem('cozy-cat-apartment:v2','v2 untouched');});await page.goto('/v3/');
 await page.getByLabel('Your name',{exact:true}).fill('Maya');await page.getByRole('radio',{name:'Copper bob',exact:true}).check();await page.getByRole('radio',{name:'Skin tone 5',exact:true}).check();await page.getByRole('radio',{name:'Golden knit',exact:true}).check();await page.getByRole('button',{name:'Open the door',exact:false}).click();
 const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');const before=Number(await stage.getAttribute('data-owner-x'));const j=(await page.locator('#joystick').boundingBox())!;
 await page.mouse.move(j.x+j.width/2,j.y+j.height/2);await page.mouse.down();await page.mouse.move(j.x+j.width/2+27,j.y+j.height/2-14,{steps:5});await page.waitForTimeout(750);await page.mouse.up();await expect(stage).toHaveAttribute('data-owner-pose','idle');expect(Number(await stage.getAttribute('data-owner-x'))).toBeGreaterThan(before+40);
 await page.getByRole('button',{name:'Little shop',exact:false}).click();await page.locator('[data-buy="rose"]').click();await expect(page.locator('[data-buy="rose"]')).toHaveText('At home');await page.getByRole('button',{name:'Close shop',exact:true}).click();
 await page.getByRole('button',{name:'Rain',exact:false}).click();await page.getByRole('button',{name:'Mute sound',exact:true}).click();await page.screenshot({path:'test-results/v3-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!));expect(saved.owner).toEqual({name:'Maya',hair:1,skin:4,outfit:3});expect(saved.equipped.cushion).toBe('rose');expect(saved.muted).toBe(true);expect(saved.rain).toBe(true);
 expect(await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v1'))).toBe('v1 untouched');expect(await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v2'))).toBe('v2 untouched');await page.reload();await expect(page.locator('#creator')).not.toBeVisible();await expect(page.getByRole('button',{name:'Enable sound',exact:true})).toBeVisible();
});

test('corrupt v3 save is preserved until a new household is explicitly created',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('cozy-cat-apartment:v3','original damaged save'));await page.goto('/v3/');await expect(page.getByRole('button',{name:'Download original save',exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v3'))).toBe('original damaged save');await page.getByRole('button',{name:'Open the door',exact:false}).click();expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v3')!))).schema).toBe(3);
});

test('blocked storage still allows the owner to move with an unsaved-progress warning',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});await create(page);await expect(page.locator('#storage-warning')).toContainText('could not be saved');const before=Number(await page.locator('#stage').getAttribute('data-owner-x'));await page.keyboard.down('d');await page.waitForTimeout(500);await page.keyboard.up('d');expect(Number(await page.locator('#stage').getAttribute('data-owner-x'))).toBeGreaterThan(before+30);
});
