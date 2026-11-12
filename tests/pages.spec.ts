import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

test('every v1–v7 landing link opens a playable game beneath the Pages repository prefix',async({page})=>{
  test.setTimeout(60000);
  const root=resolve('dist');
  const server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url!,'http://localhost');
      if(!url.pathname.startsWith('/cozy-cat-apartment/')){res.writeHead(404).end();return;}
      const part=decodeURIComponent(url.pathname.slice('/cozy-cat-apartment/'.length));
      const file=resolve(root,part+(part.endsWith('/')||!part?'index.html':''));
      if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
      const mime:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
      res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise<void>(done=>server.listen(0,'127.0.0.1',done));
  const port=(server.address() as {port:number}).port;
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const requests:string[]=[];page.on('response',r=>{if(r.status()>=400)requests.push(`${r.status()} ${r.url()}`);});
  try{
    const landing=`http://127.0.0.1:${port}/cozy-cat-apartment/`;
    for(let v=1;v<=7;v++){
      await page.goto(landing);
      await expect(page.locator('article.release')).toHaveCount(7);
      await page.getByRole('link',{name:new RegExp(`^Play v${v} `)}).click();
      await expect(page).toHaveURL(new RegExp(`cozy-cat-apartment/v${v}/$`));
      const start=v===1?'Make yourself at home':v===2?'Come on in':'Open the door';
      await page.getByRole('button',{name:start,exact:false}).click();
      await expect(page.locator(v===1?'#apartment':'#stage')).toHaveAttribute('data-ready','true');
      const colors=await page.locator('canvas').evaluate(canvas=>{
        const c=canvas as HTMLCanvasElement,ctx=c.getContext('2d')!,pixels=ctx.getImageData(0,0,c.width,c.height).data,colors=new Set();
        for(let i=0;i<pixels.length;i+=400)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);return colors.size;
      });expect(colors,`v${v} renders real apartment art`).toBeGreaterThan(30);
      expect(await page.evaluate(v=>!!localStorage.getItem(`cozy-cat-apartment:v${v}`),v)).toBe(true);
      if(v>=4){const credits=await page.request.get(`${landing}v${v}/CREDITS.txt`);expect(credits.status()).toBe(200);expect(await credits.text()).toContain('No third-party sound recordings');}
    }
    await page.goto(landing);await page.setViewportSize({width:320,height:568});
    await expect(page.getByRole('link',{name:/^Play v7 /})).toBeVisible();
    expect(errors).toEqual([]);expect(requests).toEqual([]);
    await page.setViewportSize({width:320,height:568});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await new Promise<void>((done,reject)=>server.close(err=>err?reject(err):done()));}
});
