import {test,expect,type Page} from '@playwright/test';
import {newCat} from '../v5/src/care';
async function create(page:Page){await page.goto('/v5/');await page.getByRole('button',{name:'Open the door',exact:false}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');}
test('welcome items, purchases and inventory actions have clear counts and survive reload',async({page})=>{
 await create(page);await expect(page.locator('#acquisition')).toContainText('Welcome basket');await page.getByRole('button',{name:'Open inventory',exact:true}).click();await expect(page.locator('#inventory-dialog')).toContainText('Crinkle ball');await expect(page.locator('#inventory-dialog')).toContainText('Buy for 8 hearts');
 await page.getByRole('button',{name:'Treats',exact:true}).click();await expect(page.locator('#inventory-dialog')).toContainText('Salmon bites × 3');await page.getByRole('button',{name:'Visit the Little shop',exact:false}).click();await page.locator('[data-buy="salmon"]').click();await expect(page.locator('#acquisition')).toContainText('+1 Salmon bites');await expect(page.locator('#shop-dialog')).toContainText('4 in the jar');await page.getByRole('button',{name:'Close shop',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Open inventory',exact:true}).click();await page.getByRole('button',{name:'Treats',exact:true}).click();await expect(page.locator('#inventory-dialog')).toContainText('Salmon bites × 4');await page.locator('[data-bag-use="salmon"]').click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v5')!).treats.salmon),{timeout:12000}).toBe(3);
});
test('mobile bag fits and v5 preserves the earlier household saves',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{for(const v of [1,2,3,4])localStorage.setItem(`cozy-cat-apartment:v${v}`,`keep ${v}`);});await create(page);await page.getByRole('button',{name:'Open inventory',exact:true}).click();await expect(page.locator('#inventory-dialog')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/v5-inventory-mobile.png',fullPage:true});for(const v of [1,2,3,4])expect(await page.evaluate(v=>localStorage.getItem(`cozy-cat-apartment:v${v}`),v)).toBe(`keep ${v}`);
});

test('physical toys support three-catch sessions, learned favorites and independent breaks',async({page})=>{
 test.setTimeout(95000);const s=newCat();s.owned.push('laser','feather','mouse');s.needs={food:95,water:95,energy:100,play:20,comfort:95};s.journey.tutorial.status='skipped';await page.addInitScript(s=>localStorage.setItem('cozy-cat-apartment:v5',JSON.stringify(s)),s);await page.goto('/v5/');const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 for(const id of ['ball','box','mouse','feather','laser','wand']){
  await page.getByRole('button',{name:'Open inventory',exact:true}).click();await page.locator(`[data-bag-use="${id}"]`).click();await expect(stage).toHaveAttribute('data-toy',id,{timeout:9000});await expect(stage).toHaveAttribute('data-play-active','true',{timeout:9000});
  for(let round=0;round<3;round++){await expect(page.locator('#play-assist')).toBeEnabled({timeout:12000});await page.locator('#play-assist').click();await expect(stage).toHaveAttribute('data-pounces',String(round+1),{timeout:12000});}
  await expect(stage).toHaveAttribute('data-play-active','false');expect((await page.evaluate(()=>JSON.parse(localStorage.getItem('cozy-cat-apartment:v5')!))).playHistory.toys[id].uses).toBe(1);await page.locator('#put-down').click();
 }
 await expect(stage).toHaveAttribute('data-tool','hands');await page.screenshot({path:'test-results/v5-toys.png',fullPage:true});
});
