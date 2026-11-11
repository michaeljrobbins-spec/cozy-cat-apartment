import { test, expect, type Page } from '@playwright/test';
async function create(page:Page,name='Miso',personality='Playful'){
  await page.goto('/v1/');await expect(page.getByRole('heading',{name:'Who’s moving in?'})).toBeVisible();
  await page.getByLabel('A name to call home').fill(name);await page.getByRole('radio',{name:new RegExp(personality)}).check();
  await page.getByRole('button',{name:'Make yourself at home'}).click();
  await expect(page.locator('#creator')).not.toBeVisible();await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#apartment')).toHaveAttribute('data-ready','true');
}
test('full daily loop, purchases, treats, play, settings and persistence',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await create(page);
  await page.getByRole('button',{name:'Fresh food'}).click();await expect(page.locator('#hearts')).toHaveText('8');
  await page.getByRole('button',{name:'Little shop'}).click();await page.locator('[data-buy="sage-cushion"]').click();await expect(page.locator('[data-buy="sage-cushion"]')).toHaveText('Selected');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.getByRole('button',{name:'Play together'}).click();await page.getByLabel('Keep the toy still').check();
  for(let i=0;i<5;i++)await page.getByRole('button',{name:'Catch the feather wand'}).click();
  await page.getByRole('button',{name:'Enjoy a well-earned purr'}).click();await expect(page.locator('#thought')).toContainText('One last pounce');
  await page.getByRole('button',{name:'Fresh water'}).click();await page.getByRole('button',{name:'Gentle brush'}).click();await expect(page.locator('#phase')).toHaveText(/Afternoon/);
  await page.getByRole('button',{name:'Little shop'}).click();await page.getByRole('button',{name:'Little treats',exact:true}).click();
  await page.locator('[data-buy="salmon"]').click();await expect(page.locator('[data-treat="salmon"]')).toBeVisible();await page.locator('[data-treat="salmon"]').click();await expect(page.locator('[data-treat="salmon"]')).toHaveCount(0);await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.getByRole('button',{name:'Settle in for the night'}).click();await page.getByRole('button',{name:'Goodnight, Miso'}).click();await expect(page.locator('#day-label')).toHaveText('Day 2 · Morning');
  await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByLabel('Reduced motion').check();await page.getByRole('button',{name:'Close',exact:true}).click();
  const before=await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v1'));await page.reload();await expect(page.locator('#cat-summary h2')).toHaveText('Miso');expect(await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v1'))).toBe(before);await expect(page.locator('html')).toHaveClass('reduced-motion');expect(errors).toEqual([]);
});
test('mobile layout, six coats and all personalities, no overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/v1/');await page.screenshot({path:'test-results/creator-mobile.png',fullPage:true});
  await page.getByRole('radio',{name:'Calico',exact:true}).check();await page.getByRole('radio',{name:/Shy/}).check();await page.getByRole('button',{name:'Make yourself at home'}).click();await expect(page.locator('#cat-summary')).toContainText('Shy');await expect(page.locator('#cat-summary img')).toHaveAttribute('alt','Calico cat');
  await expect(page.locator('#apartment')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Quiet company'}).click();await page.screenshot({path:'test-results/apartment-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Little shop'}).click();expect(await page.locator('#shop').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:'test-results/shop-mobile.png',fullPage:true});
});
test('corrupt save is preserved until an explicit new game',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('cozy-cat-apartment:v1','broken original'));
  await page.goto('/v1/');await expect(page.locator('#creator .recovery-warning')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v1'))).toBe('broken original');await expect(page.getByRole('button',{name:'Download original save backup'})).toBeVisible();await page.getByRole('button',{name:'Start a fresh little story'}).click();await expect(page.locator('#creator')).not.toBeVisible();expect(JSON.parse((await page.evaluate(()=>localStorage.getItem('cozy-cat-apartment:v1')))!)).toHaveProperty('schema',1);
});
test('blocked storage still allows play and reports unsaved progress',async({page})=>{
  await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});await create(page,'Nori','Demanding');await expect(page.locator('#storage-warning')).toContainText('could not be saved');await page.getByRole('button',{name:'Fresh food'}).click();await expect(page.locator('#hearts')).toHaveText('8');await expect(page.locator('#save-status')).toContainText('without a saved copy');
});
test('version landing page and desktop room',async({page})=>{
  await page.setViewportSize({width:1440,height:1100});await page.goto('/');await page.getByRole('link',{name:/Play v1/}).click();await page.getByRole('button',{name:'Make yourself at home'}).click();await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#apartment')).toHaveAttribute('data-ready','true');await page.waitForTimeout(800);await page.screenshot({path:'test-results/apartment-desktop.png',fullPage:true});
});
