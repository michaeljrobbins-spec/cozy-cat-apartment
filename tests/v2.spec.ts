import {test,expect} from '@playwright/test';
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
