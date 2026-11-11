import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

test('built site works below a GitHub Pages repository prefix',async({page})=>{
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
    await page.goto(`http://127.0.0.1:${port}/cozy-cat-apartment/`);
    await page.getByRole('link',{name:/Play v1/}).click();await expect(page).toHaveURL(/cozy-cat-apartment\/v1\/$/);
    await page.getByRole('button',{name:'Make yourself at home'}).click();await expect(page.locator('#apartment')).toHaveAttribute('data-ready','true');
    // The canvas must contain actual room artwork, rather than a blank background.
    const colors=await page.locator('canvas').evaluate(canvas=>{
      const c=canvas as HTMLCanvasElement,ctx=c.getContext('2d')!;const pixels=ctx.getImageData(0,0,c.width,c.height).data;const colors=new Set();
      for(let i=0;i<pixels.length;i+=400)colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);return colors.size;
    });expect(colors).toBeGreaterThan(30);
    await page.goto(`http://127.0.0.1:${port}/cozy-cat-apartment/v2/`);
    await page.getByRole('button',{name:'Come on in'}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
    await page.goto(`http://127.0.0.1:${port}/cozy-cat-apartment/v3/`);
    await page.getByRole('button',{name:'Open the door',exact:false}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
    await page.goto(`http://127.0.0.1:${port}/cozy-cat-apartment/v4/`);
    await page.getByRole('button',{name:'Open the door',exact:false}).click();await expect(page.locator('#stage')).toHaveAttribute('data-ready','true');
    const credits=await page.request.get(`http://127.0.0.1:${port}/cozy-cat-apartment/v4/CREDITS.txt`);expect(credits.status()).toBe(200);expect(await credits.text()).toContain('No third-party sound recordings');
    expect(errors).toEqual([]);expect(requests).toEqual([]);
    await page.setViewportSize({width:320,height:568});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await new Promise<void>((done,reject)=>server.close(err=>err?reject(err):done()));}
});
