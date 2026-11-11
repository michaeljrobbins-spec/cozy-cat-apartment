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
 await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');await page.getByRole('button',{name:'Approach window seat',exact:true}).click();await expect.poll(async()=>Number(await stage.getAttribute('data-owner-y')),{timeout:10000}).toBeLessThan(340);await page.screenshot({path:'test-results/v3-foundation.png',fullPage:true});expect(errors).toEqual([]);
});
test('owner cannot walk through the sofa and the cat remains on walkable floor',async({page})=>{
 const save=newCat();save.ownerPosition={x:592,y:400};await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v3',JSON.stringify(s)),save);await page.goto('/v3/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 await page.keyboard.down('d');await page.waitForTimeout(1200);await page.keyboard.up('d');expect(Number(await stage.getAttribute('data-owner-x'))).toBeLessThanOrEqual(628);
 const l=createLayout(false);for(let i=0;i<14;i++){const x=Number(await stage.getAttribute('data-cat-x')),y=Number(await stage.getAttribute('data-cat-y'));expect(canStand(l,{x,y},10)).toBe(true);await page.waitForTimeout(200);}
});
