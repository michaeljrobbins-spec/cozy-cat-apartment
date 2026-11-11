import Phaser from 'phaser';
import {CATALOG,phase,type Save} from './model';
export const WORLD={width:1280,height:800};
export interface DecorLayers{back:Phaser.GameObjects.Graphics;front:Phaser.GameObjects.Graphics;leaves:Phaser.GameObjects.Container;light:Phaser.GameObjects.Graphics}
export function drawApartment(scene:Phaser.Scene,state:Save,previous?:DecorLayers):DecorLayers{
 previous?.back.destroy();previous?.front.destroy();previous?.leaves.destroy(true);previous?.light.destroy();
 const back=scene.add.graphics().setDepth(0),front=scene.add.graphics().setDepth(638),leaves=scene.add.container(0,0).setDepth(555),light=scene.add.graphics().setDepth(2000).setBlendMode(Phaser.BlendModes.MULTIPLY);
 let g=back;
 const r=(x:number,y:number,w:number,h:number,c:number,a=1)=>{g.fillStyle(c,a);g.fillRect(Math.round(x),Math.round(y),w,h);};
 const p=(points:number[][],c:number,a=1)=>{g.fillStyle(c,a);g.fillPoints(points.map(([x,y])=>({x,y})),true);};
 const l=(x:number,y:number,x2:number,y2:number,c:number,w=2)=>{g.lineStyle(w,c);g.lineBetween(x,y,x2,y2);};
 const circle=(x:number,y:number,radius:number,c:number,a=1)=>{g.fillStyle(c,a);g.fillCircle(x,y,radius);};
 const selected=(slot:string,fallback:number)=>CATALOG.find(i=>i.id===state.equipped[slot])?.color??fallback;
 const evening=phase(state)==='Evening';
 // Shallow perspective walls, trim and staggered oak planks.
 r(0,0,1280,800,0xb58e6f);r(0,0,1280,520,0xe5d7ba);r(0,0,1280,13,0xf6e9cb);r(0,13,1280,4,0xcdb994);
 r(0,35,45,483,0xd6c7a9);p([[0,15],[45,35],[45,520],[0,542]],0xcebb99);p([[1235,35],[1280,15],[1280,542],[1235,520]],0xc5b296);
 for(let x=60;x<1240;x+=29){r(x,30,1,477,0xc3b28e,.32);for(let y=60;y<450;y+=62){r(x+11,y,2,4,0xc0ad88,.35);r(x+9,y+2,6,1,0xc0ad88,.35);}}
 r(43,500,1193,15,0x9a7e5f);r(43,499,1193,4,0xf7e7c7);r(43,515,1193,6,0xb69a74);
 for(let y=530;y<800;y+=38){r(0,y,1280,2,0x9d785b);for(let x=(y%4)*145-200;x<1280;x+=215)r(x,y-36,2,36,0xa37f61);}
 for(let i=0;i<170;i++){const x=(i*83)%1280,y=528+(i*37)%270;r(x,y,12+(i%5)*5,1,0xc9a17a,.65);}
 // Window recess, hand-pixelled skyline, buildings with roof gardens.
 r(405,44,413,340,0xab8f6a);r(414,50,395,320,0xede0bd);r(425,60,373,299,evening?0x999da9:state.rain?0xa5b8b9:0xb3ceca);
 circle(740,107,24,evening?0xefc8a7:0xf6e5b5);
 const cloud=(x:number,y:number)=>{r(x,y,58,9,0xe9e8d2,.8);r(x+12,y-7,32,9,0xe9e8d2,.8);};cloud(460,110);cloud(655,150);
 [[428,230,48,130],[481,193,58,167],[544,251,45,109],[595,211,64,149],[665,237,49,123],[722,177,70,183]].forEach(([x,y,w,h],i)=>{
  r(x,y,w,h,i%2?0x819f9b:0x93afaa);r(x+6,y-7,w-12,7,0x7e9992);r(x+16,y-13,4,8,0x6d8c7b);
  for(let xx=x+9;xx<x+w-5;xx+=14)for(let yy=y+17;yy<350;yy+=22)r(xx,yy,6,9,evening&&((xx+yy)%3)?0xf3d1a1:0xb6c9ba);
 });
 r(605,58,9,304,0xf6e7c7);r(420,216,383,8,0xf6e7c7);r(414,361,393,10,0x9c805e);r(400,372,422,13,0xf5e8c8);r(408,385,406,7,0xb49a74);
 // Curtains, ties and seat, usable as an elevated navigation surface.
 r(368,31,486,6,0x8d7458);r(377,39,47,330,0xafb392);r(382,41,11,315,0xcbd0ab);r(403,41,7,320,0x9fa98b);r(802,39,42,330,0xafb392);r(808,41,10,319,0xcbd0ab);r(833,41,5,323,0x9ba789);r(378,254,42,7,0xcebd96);r(804,254,40,7,0xcebd96);
 r(415,410,390,100,0xb28d68);r(426,426,368,70,0xc6a37a);r(436,438,103,44,0xb8936b);r(548,438,111,44,0xb8936b);r(668,438,114,44,0xb8936b);r(445,443,84,3,0xd2b18a);r(562,443,84,3,0xd2b18a);r(681,443,84,3,0xd2b18a);
 r(404,397,412,16,0xe8cfa3);r(410,391,400,8,0xf6e1b4);r(437,378,104,17,selected('cushion',0xc19279));r(443,372,92,8,selected('cushion',0xc19279));r(448,378,80,2,0xf0d2ac,.6);
 // Deep bookshelf, printed books, baskets, plants and framed sketches.
 r(74,150,190,363,0x725a42);r(82,157,174,345,0xa78a64);r(85,165,164,332,0x8c7456);
 for(const y of [232,318,406,492]){r(75,y,190,10,0x6d563e);r(81,y,176,4,0xc2a179);r(84,y+9,166,7,0x6d563e,.3);}
 const bookColors=[0x8e9d7c,0xbb8567,0xd1b47e,0x6f8984,0x9d8882];
 for(let i=0;i<9;i++){const x=91+i*17,h=42+(i%3)*8;r(x,231-h,13,h,bookColors[i%5]);r(x+3,236-h,7,3,0xe5d2ad);r(x+3,220,7,2,0xe5d2ad);}
 r(94,289,70,18,0xbe9b73);r(99,274,61,14,0x8e9e86);r(98,270,66,4,0xe6d9b7);r(187,258,45,51,0xe7d4ae);r(192,263,35,37,0x9baf9d);p([[195,294],[207,277],[224,294]],0xd3be8e);
 r(96,350,59,53,0xb7b5a0);r(102,356,47,4,0xe0d8b9);r(111,369,29,3,0x8f9683);r(180,376,58,25,0xc1a27c);for(let x=185;x<233;x+=7)r(x,379,2,18,0xa48963);
 r(98,443,139,44,0xc2a47b);for(let x=104;x<234;x+=10)r(x,448,3,33,0xaa8a60);r(146,449,35,6,0x947650);r(85,508,9,19,0x70583f);r(246,508,9,19,0x70583f);
 // Wall art, clock and small shelf.
 r(111,59,102,66,0x8b6c4c);r(116,64,92,56,0xf6e4be);r(124,72,76,39,0xc9ccb0);circle(182,82,8,0xe9d9a4);p([[126,107],[145,83],[167,107]],0x83987b);p([[149,107],[175,89],[196,107]],0xa9b291);
 circle(937,94,29,0x967957);circle(937,94,25,0xf1e4c9);l(937,94,937,76,0x7e8167,3);l(937,94,951,101,0x7e8167,3);circle(937,94,3,0x7e8167);
 r(908,220,214,8,0x8d7251);r(927,228,7,18,0x8d7251);r(1095,228,7,18,0x8d7251);r(927,184,28,36,0xc2a47c);r(965,198,63,19,0x91a080);r(969,193,57,5,0xe5d7b4);r(1049,166,46,52,0xa1805c);r(1054,171,36,41,0xe6d4ac);r(1062,182,20,19,0xb99578);
 // Warm woven rug and direct sunlight.
 g.fillStyle(0xffe6a6,evening?.04:.22);g.fillPoints([{x:445,y:521},{x:778,y:521},{x:970,y:799},{x:570,y:799}],true);
 r(412,584,455,161,0x78604c,.13);r(402,574,455,161,selected('rug',0xb7b68e));r(411,583,437,143,0xead6ad);r(418,590,423,129,selected('rug',0xb7b68e));
 for(let x=403;x<857;x+=11){r(x,568,3,6,0xe6d3ae);r(x,735,3,6,0xe6d3ae);}for(let x=439;x<821;x+=42){r(x,604,9,3,0xe7d8b5);r(x+12,698,9,3,0xe7d8b5);}r(442,626,376,2,0xe7d8b5,.35);r(442,683,376,2,0xe7d8b5,.35);
 // Sofa rear and seat. Its front is drawn separately for genuine occlusion.
 r(906,384,285,146,0x778571);r(915,376,267,13,0x8e9b82);r(919,395,120,95,0x98a38b);r(1048,395,130,95,0x98a38b);r(920,485,258,65,0xa7ae92);r(922,492,119,45,0xb6b99d);r(1049,492,127,45,0xb6b99d);
 r(938,425,57,55,0xd5b68d);r(945,430,43,43,0xe0c7a0);r(1106,432,57,45,0xbd8e76);r(1113,437,42,35,0xd3aa88);
 // Floor lamp.
 r(1218,325,5,272,0x7a654c);r(1192,596,57,7,0x806b50);p([[1198,270],[1242,270],[1256,326],[1183,326]],0xdfc395);r(1182,324,76,8,0xf0d8a9);r(1203,278,3,43,0xefdcaf);r(1235,278,3,43,0xc9ab7f);
 // Ceramic bowl station and wall-mounted tools.
 r(137,620,232,78,0xd2b18b);r(142,625,222,65,0xe0c59e);r(151,633,204,2,0xc8a581);
 const bowl=(x:number,color:number,inside:number,full:boolean)=>{g.fillStyle(0x78634e,.13);g.fillEllipse(x+3,671,76,20);g.fillStyle(color);g.fillEllipse(x,655,72,29);g.fillStyle(inside);g.fillEllipse(x,648,62,20);r(x-25,652,50,3,color);if(full&&inside===0x86634b){for(let i=0;i<13;i++)r(x-20+(i*13)%39,642+(i*5)%11,5,3,i%2?0xbd925d:0xa27a4f);}else if(full)r(x-17,643,19,2,0xe3e6cf);};
 bowl(210,0xb88d6a,state.food?0x86634b:0xb09575,!!state.food);bowl(310,0x88a79e,state.water?0x91bfc0:0x9bafa1,!!state.water);
 r(300,330,53,92,0xbca584);r(306,334,41,81,0xd0bc99);r(318,352,6,34,0x8e7655);r(313,344,17,15,0xb9b190);for(let i=0;i<4;i++)r(314+i*4,343,2,7,0x7b8168);r(339,342,3,50,0x9d8059);l(340,342,347,363,0x7b8f75);r(344,362,6,12,0xc4a67b);
 // Plants: stems sit behind animated leaf clusters.
 const plant=(x:number,y:number,scale:number)=>{r(x-22,y,44,43,0xae7d5e);r(x-25,y-5,50,10,0xcb9974);r(x-16,y+38,32,6,0x8c634b);r(x-2,y-88*scale,4,88*scale,0x76834e);const leaf=scene.add.graphics();for(let j=0;j<6;j++){const yy=-20-j*13*scale;leaf.fillStyle(selected('plant',0x789461));leaf.fillRect(-32+j*3,yy,30-j*2,8);leaf.fillRect(2,yy-9,31-j*2,8);leaf.fillRect(-25+j*3,yy-4,15,4);}const container=scene.add.container(x,y,[leaf]);leaves.add(container);};
 plant(300,526,1);plant(1145,337,.6);r(1120,383,51,6,0x8b7153);r(1124,380,5,35,0x8b7153);r(1162,380,5,35,0x8b7153);
 // Foreground furniture with independent depth. Cat can shelter beneath it.
 g=front;
 r(899,556,299,64,0x7c8a71);r(895,506,28,123,0x8c997e);r(1178,506,29,123,0x8c997e);r(899,499,25,10,0xafb69a);r(1180,499,25,10,0xafb69a);r(926,543,249,41,0x9eaa8d);r(931,552,239,2,0xb8bfa2);r(930,615,13,35,0x715b44);r(1163,615,13,35,0x715b44);
 // Open shadow under sofa: hidden cat's head and tail are still readable.
 r(948,619,209,24,0x675d4c,.2);
 const table=scene.add.graphics().setDepth(730);table.fillStyle(0x755c43,.15);table.fillEllipse(807,760,130,24);table.fillStyle(0x8e6b4a);table.fillRect(753,704,8,53);table.fillRect(844,704,8,53);table.fillStyle(0xae865d);table.fillEllipse(801,697,156,56);table.fillStyle(0xc8a374);table.fillEllipse(801,691,156,49);table.fillStyle(0xe5cda4);table.fillRect(776,673,40,26);table.fillStyle(0x8da08b);table.fillRect(779,670,37,4);table.fillStyle(0xe8d8ba);table.fillRect(827,672,14,17);table.lineStyle(3,0xe8d8ba);table.strokeCircle(842,680,6);
 // Ownership of this layer is tied to back so redraws don't leave stale tables.
 back.once('destroy',()=>table.destroy());
 if(evening){light.fillStyle(0xd8bec1,.3);light.fillRect(0,0,1280,800);}
 return {back,front,leaves,light};
}
