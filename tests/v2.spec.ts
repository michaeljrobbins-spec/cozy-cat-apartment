import {test,expect} from '@playwright/test';
test('v2 cat travels through the room and uses multiple real sprite frames',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/v2/');await page.getByRole('button',{name:'Come on in'}).click();const stage=page.locator('#stage');await expect(stage).toHaveAttribute('data-ready','true');
 const before=await stage.getAttribute('data-x'),frames=new Set<string>();for(let i=0;i<12;i++){frames.add((await stage.getAttribute('data-frame'))!);await page.waitForTimeout(350);}
 expect(frames.size).toBeGreaterThan(3);expect(await stage.getAttribute('data-x')).not.toBe(before);
 await expect(stage).toHaveAttribute('data-node','window',{timeout:25000});await expect(stage).toHaveAttribute('data-pose','sit');
 await page.screenshot({path:'test-results/v2-stage1.png',fullPage:true});expect(errors).toEqual([]);
});
