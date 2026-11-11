import Phaser from 'phaser';
import { SHOP, phase, type State, type Action } from './game';

export const PALETTES = [
  ['#cf8954','#f0bc7d','#895b40'],['#8e7562','#c9ae88','#564b43'],['#44484b','#f1e8d5','#303437'],
  ['#eee4cd','#d39060','#514b45'],['#454a52','#686e75','#30343b'],['#ddcba7','#f1e2be','#b6a182'],
];
// Original pixel sprites, shared by the character creator and the game scene.
export function catSVG(coat:number, sleepy=false):string {
 const [fur,light,dark]=PALETTES[coat]||PALETTES[0];
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 34" shape-rendering="crispEdges"><path fill="${dark}" d="M29 19h5v-6h3v10h-6v7H10v-3H7V15h3V5h3v3h3v3h8V8h3V5h3v14z"/><path fill="${fur}" d="M11 10h5v3h8v-3h5v14h-3v6H12v-5H9v-9h2zM27 20h7v-5h2v7h-9z"/><path fill="${light}" d="M13 24h11v6H13zM10 15h3v3h-3z"/><path fill="#dca59a" d="M12 9h2v3h-2zM26 9h2v3h-2zM18 21h3v2h-3z"/>${coat===0||coat===1?`<path fill="${dark}" d="M17 12h2v5h-2zM21 12h2v5h-2zM10 21h4v2h-4zM25 21h4v2h-4zM28 25h-3v2h3z"/>`:''}${coat===2?`<path fill="${light}" d="M17 18h5v7h-5zM12 28h5v2h-5zM22 28h4v2h-4z"/>`:''}${coat===3?`<path fill="${dark}" d="M11 12h5v5h-5zM23 24h6v4h-6z"/><path fill="${light}" d="M22 12h7v6h-7z"/>`:''}<path fill="#353b35" d="${sleepy?'M13 19h4v1h-4zM23 19h4v1h-4z':'M14 18h2v3h-2zM24 18h2v3h-2z'}"/><path fill="#f6eddb" d="M9 22h6v1H9zM24 22h7v1h-7z"/></svg>`;
}
export const catURL=(coat:number,sleepy=false)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(catSVG(coat,sleepy));

export class Apartment extends Phaser.Scene {
  private room!:Phaser.GameObjects.Graphics;
  private cat?:Phaser.GameObjects.Image;
  private shadow?:Phaser.GameObjects.Ellipse;
  private state?:State;
  private activity='';
  private until=0;
  private lastBlink=false;
  private reaction?:Phaser.GameObjects.Text;
  private onLook:()=>void;
  constructor(onLook:()=>void){super('apartment');this.onLook=onLook;}
  preload(){for(let c=0;c<6;c++)for(let s=0;s<2;s++)this.load.svg(`cat-${c}-${s}`,'data:image/svg+xml;base64,'+btoa(catSVG(c,!!s)),{width:160,height:136});}
  create(){
    this.room=this.add.graphics();
    this.shadow=this.add.ellipse(355,340,82,13,0x695447,.15);
    this.cat=this.add.image(355,296,'cat-0-0').setScale(.72).setInteractive({useHandCursor:true});
    this.cat.on('pointerdown',()=>this.onLook());
    this.reaction=this.add.text(355,224,'',{fontFamily:'Georgia',fontSize:'15px',color:'#6d795c',backgroundColor:'#fff7e3',padding:{x:10,y:6}}).setOrigin(.5).setVisible(false);
    if(this.state)this.sync(this.state);
    document.querySelector('#apartment')?.setAttribute('data-ready','true');
  }
  sync(state:State){this.state=state;if(!this.room)return;this.draw();this.cat?.setTexture(`cat-${state.coat}-0`);}
  react(action:Action){this.activity=action;this.until=this.time.now+2500;
    const words:Record<Action,string>={feed:'nom nom',water:'tiny sips',brush:'purrrrr',play:'pounce!',nap:'z z z',space:'slow blink'};
    this.reaction?.setText(words[action]).setVisible(true);
  }
  update(time:number){
    if(!this.state||!this.cat)return;
    const nap=this.activity==='nap'&&time<this.until;
    const blink=nap||time%5300>5070;
    if(blink!==this.lastBlink){this.cat.setTexture(`cat-${this.state.coat}-${blink?1:0}`);this.lastBlink=blink;}
    const still=this.state.reducedMotion;
    if(this.reaction){this.reaction.setVisible(time<this.until);this.reaction.y=224+(still?0:Math.round(Math.sin(time/400)*2));}
    this.cat.y=296+(still?0:Math.round(Math.sin(time/(this.activity==='play'&&time<this.until?110:700))*1.5));
    this.cat.angle=still?0:time<this.until?Math.sin(time/(this.activity==='play'?140:300))*(this.activity==='play'?5:2):0;
  }
  private draw(){
    const g=this.room;g.clear(); const state=this.state!;const evening=phase(state)==='Evening';
    const r=(x:number,y:number,w:number,h:number,c:number,a=1)=>{g.fillStyle(c,a);g.fillRect(x,y,w,h);};
    const line=(x:number,y:number,x2:number,y2:number,c:number,width=1)=>{g.lineStyle(width,c);g.lineBetween(x,y,x2,y2);};
    const color=(slot:string,fallback:number)=>{const i=SHOP.find(i=>i.id===state.equipped[slot]);return i?Number.parseInt(i.color.slice(1),16):fallback;};
    // Wallpaper and timber, with a hand-pixelled palette.
    r(0,0,720,430,evening?0xd8c7b4:0xece1ca);r(0,0,720,10,0xf7eed9);r(0,264,720,166,0xc59972);
    for(let y=280;y<430;y+=28){r(0,y,720,2,0xad815e);for(let x=(y%3)*87;x<720;x+=146)r(x,y-26,2,26,0xb78c66);}
    for(let i=0;i<75;i++){const x=(i*97)%720,y=272+(i*31)%150;r(x,y,14+(i%3)*8,1,0xba8e67,.6);}
    r(0,254,720,12,0x99785e);r(0,254,720,3,0xf4e5c8);
    for(let x=12;x<720;x+=24){r(x,12,1,240,0xc8b99f,.25);}
    // Tall central window, city silhouettes, open sky.
    r(210,23,256,204,0x94765d);r(216,29,244,192,0xfbf0d5);r(223,36,230,177,evening?0xc5a6ac:0xb5d0cc);
    const sky=evening?0xe7b797:0xe8e5c8;
    r(232,51,33,8,sky);r(239,46,22,6,sky);r(382,68,43,7,sky);r(390,63,25,6,sky);
    g.fillStyle(evening?0xedca9f:0xf5e8ba);g.fillCircle(412,59,14);
    const buildings=[[227,124,32,88],[258,104,38,108],[297,140,27,72],[326,113,43,99],[373,143,32,69],[407,96,42,116]];
    buildings.forEach(([x,y,w,h],i)=>{r(x,y,w,h,i%2?0x8eaaa5:0x99b6af);r(x+5,y-6,w-10,6,0x91aaa3);for(let xx=x+6;xx<x+w-4;xx+=10)for(let yy=y+12;yy<208;yy+=16)r(xx,yy,4,6,evening?0xf4d4a0:0xbdd0c1);});
    r(335,32,7,183,0xf4e7cb);r(220,122,236,6,0xf4e7cb);r(205,216,267,10,0xf9ecd0);r(210,226,256,7,0xa58a6c);
    // Curtains and window seat.
    r(185,16,306,5,0x8c755d);r(191,21,28,194,0xc4bda0);r(195,25,7,182,0xd8d0b1);r(208,26,7,185,0xb0ac91);r(459,21,26,194,0xc4bda0);r(463,25,7,182,0xd8d0b1);r(478,25,4,188,0xaca78d);
    r(217,238,245,41,0xb99270);r(223,243,233,29,0xd9b793);r(231,249,65,17,0xc7a27f);r(304,249,65,17,0xc7a27f);r(377,249,65,17,0xc7a27f);r(210,230,260,12,0xf0d8ad);
    r(229,218,64,12,color('cushion',0xc99580));r(235,214,52,4,color('cushion',0xc99580));r(236,222,49,2,0xf0d1ad,.5);
    // Bookshelf, books, picture and a tiny houseplant.
    r(38,76,118,183,0x896e54);r(43,82,108,173,0xb59875);
    [125,174,224].forEach(y=>{r(38,y,118,6,0x81684e);r(41,y,113,2,0xd5b38b);});
    const books=[0x889679,0xc38b71,0xd5bd8d,0x7b8b89,0xb89985];
    for(let i=0;i<7;i++){const x=49+i*12,h=24+(i%3)*5;r(x,124-h,9,h,books[i%5]);r(x+2,127-h,5,2,0xead9bb);}
    r(51,157,46,10,0xcfac84);r(55,149,41,8,0x91a08c);r(53,146,40,3,0xeadfc4);r(110,144,25,28,0xe8d6b0);r(114,147,17,18,0xc2967c);r(117,151,6,7,0xddd0a7);
    r(53,195,28,27,0xb9b6a0);r(57,199,20,2,0xe2dac1);r(94,207,47,14,0xccac88);r(99,211,37,3,0xf4e1bf);
    r(43,258,7,10,0x785e48);r(143,258,7,10,0x785e48);
    // Framed cat portrait.
    r(65,23,54,42,0x917357);r(69,27,46,34,0xf7e8cb);r(78,34,28,20,0xc6c6a6);r(86,39,14,11,0xc28b62);r(86,36,4,5,0xc28b62);r(96,36,4,5,0xc28b62);
    // Sunlight reaches across the floor.
    g.fillStyle(0xffe8ac,evening?.07:.2);g.fillPoints([{x:224,y:268},{x:450,y:268},{x:539,y:429},{x:303,y:429}],true);
    // Rug with a block woven border.
    r(237,318,299,84,0x977f63,.18);r(231,312,299,84,color('rug',0xb9bf96));r(238,319,285,70,0xf0dfb7,.45);r(244,325,273,58,color('rug',0xb9bf96));
    for(let x=233;x<530;x+=9){r(x,307,3,5,0xe3d4af);r(x,396,3,5,0xe3d4af);}for(let x=255;x<510;x+=26){r(x,331,6,3,0xf6e6c1,.6);r(x+7,370,6,3,0xf6e6c1,.6);}
    // Sofa.
    r(507,211,154,76,0x7f8b74);r(514,205,140,8,0x929c83);r(512,216,67,46,0x9ca68c);r(584,216,69,46,0x9ca68c);r(503,253,160,39,0x8d987e);r(511,260,142,25,0xafb49a);r(495,241,19,53,0x939e83);r(651,241,19,53,0x939e83);r(500,239,14,5,0xb7bba1);r(653,239,14,5,0xb7bba1);r(508,294,9,15,0x79614c);r(647,294,9,15,0x79614c);r(581,260,3,25,0x8e997f);
    r(526,226,30,28,0xd7ba90);r(530,230,22,20,0xe0c8a1);r(610,231,31,23,0xc49379);r(615,234,21,15,0xd5ab88);
    // Floor lamp and plants.
    r(684,166,4,111,0x80694f);r(672,277,27,5,0x80694f);r(667,139,36,27,0xe4cba2);r(662,161,46,6,0xf2ddb6);
    if(evening){g.fillStyle(0xffde9f,.08);g.fillCircle(685,167,60);}
    const plant=(x:number,y:number,size:number,c:number)=>{r(x-12,y,24,24,0xb38266);r(x-15,y-3,30,6,0xd1a17c);r(x-9,y+22,18,3,0x966c54);r(x-1,y-size,3,size,0x697950);for(let j=0;j<4;j++){const yy=y-8-j*10;r(x-14+j*2,yy-7,14-j,6,c);r(x+1,yy-12,14-j*2,7,c);r(x-11+j*2,yy-10,8,3,c);}};
    plant(570,178,48,color('plant',0x72895e));r(546,205,49,5,0x967552);r(551,183,4,23,0x987659);r(584,183,4,23,0x987659);
    plant(182,284,55,0x77936b);
    // Two ceramic bowls, toy, and a resting cushion.
    r(68,338,114,38,0xd6ba95);r(73,341,104,30,0xe5cca5);
    g.fillStyle(0x986f55);g.fillEllipse(100,355,40,20);g.fillStyle(0xd4a57e);g.fillEllipse(100,352,40,17);g.fillStyle(0x87644c);g.fillEllipse(100,350,28,10);for(let i=0;i<8;i++)r(90+(i*7)%21,346+(i*3)%7,3,3,0xc3945f);
    g.fillStyle(0x7c9a96);g.fillEllipse(151,355,39,20);g.fillStyle(0xb9cebd);g.fillEllipse(151,351,39,17);g.fillStyle(0x8db7bd);g.fillEllipse(151,350,29,10);r(145,347,10,2,0xe2e7cf);
    r(561,352,72,33,0xc5a186);r(566,347,62,35,0xd5bba0);r(574,354,47,21,0xe4ceb0);r(584,360,27,8,0xc5a186);
    if(state.equipped.toy==='mouse'){r(424,361,21,10,0x9d9689);r(427,357,5,5,0xccb2a0);line(445,366,459,369,0x9d9689,2);}else {line(424,361,454,345,0x9b7957,3);line(424,361,413,372,state.equipped.toy==='ribbon'?0xc8838a:0x828e73,2);r(408,369,8,8,state.equipped.toy==='ribbon'?0xd49897:0xc9a06f);}
    if(evening)r(0,0,720,430,0x8c6075,.07);
  }
}
export function makeRoom(parent:string,onLook:()=>void):{game:Phaser.Game;scene:Apartment}{
  const scene=new Apartment(onLook);
  const game=new Phaser.Game({type:Phaser.CANVAS,width:720,height:430,parent,backgroundColor:'#ece1ca',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],audio:{noAudio:true},banner:false});
  return {game,scene};
}
