(function(){
'use strict';
var CFG={WIN:7,PW:8,PH:80,BS:8,SPD:6.5,MAX:15,PM:36,FNT:'"futura-pt",sans-serif'};
var KONAMI=[38,38,40,40,37,39,37,39,66,65],ki=0,kbuf='';
var active=false,phase='waiting',raf=null,lts=0;
var g={w:0,h:0,mouse:0,pl:{y:0,s:0},ai:{y:0,s:0},b:{x:0,y:0,vx:0,vy:0},flash:0,winner:''};
var overlay,cv,ctx,lastTap=0;

// Auto-launch triggers: /gameover path or ?play=1
var params=new URLSearchParams(location.search);
var path=location.pathname.replace(/\.html$/,'');
if(params.get('play')==='1'||params.get('pong')==='1'||path.endsWith('/gameover')){
  window.addEventListener('load',function(){setTimeout(launch,300);});
}

// Keyboard: type 'rrb' anywhere, or Konami code
document.addEventListener('keydown',function(e){
  if(e.keyCode===KONAMI[ki]){ki++;if(ki===KONAMI.length){ki=0;launch();return;}}else{ki=0;}
  if(!active){
    kbuf+=(e.key.length===1?e.key.toLowerCase():'');
    if(kbuf.length>12)kbuf=kbuf.slice(-12);
    if(kbuf.endsWith('rrb')){kbuf='';launch();}
  }else{
    if(e.key==='Escape')teardown();
    if((e.key==='r'||e.key==='R')&&phase==='over')restart();
  }
});

function buildDOM(){
  overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0a0a0a;cursor:none;user-select:none;-webkit-user-select:none;touch-action:none;';
  cv=document.createElement('canvas');
  cv.style.cssText='display:block;width:100%;height:100%;';
  overlay.appendChild(cv);
  document.body.appendChild(overlay);
  ctx=cv.getContext('2d');
  overlay.addEventListener('mousemove',function(e){g.mouse=e.clientY;});
  overlay.addEventListener('touchmove',function(e){
    e.preventDefault();
    g.mouse=e.touches[0].clientY;
  },{passive:false});
  overlay.addEventListener('touchstart',function(e){
    e.preventDefault();
    g.mouse=e.touches[0].clientY;
    var now=Date.now();
    if(now-lastTap<320){teardown();return;}
    lastTap=now;
  },{passive:false});
  overlay.addEventListener('touchend',function(e){e.preventDefault();},{passive:false});
}

function launch(){
  if(active)return;
  active=true;
  buildDOM();
  resize();
  window.addEventListener('resize',resize);
  restart();
  raf=requestAnimationFrame(loop);
}

function teardown(){
  active=false;phase='waiting';
  cancelAnimationFrame(raf);
  window.removeEventListener('resize',resize);
  if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
  overlay=cv=ctx=null;
}

function restart(){
  g.pl.s=0;g.ai.s=0;g.winner='';g.flash=0;
  phase='waiting';resetBall(1);
  setTimeout(function(){if(active&&phase==='waiting')phase='playing';},900);
}

function resize(){
  g.w=cv.width=window.innerWidth;
  g.h=cv.height=window.innerHeight;
  g.mouse=g.h/2;g.pl.y=g.h/2;g.ai.y=g.h/2;
  if(phase==='waiting'||phase==='playing')resetBall(1);
}

function resetBall(d){
  g.b.x=g.w/2;g.b.y=g.h/2+(Math.random()-.5)*(g.h*.3);
  var a=(Math.random()*.4-.2);
  g.b.vx=d*CFG.SPD*Math.cos(a);g.b.vy=CFG.SPD*Math.sin(a);
}

function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v;}

function bounce(dir,hit){
  var spd=Math.min(Math.hypot(g.b.vx,g.b.vy)*1.06,CFG.MAX);
  var a=hit*(Math.PI/3.8);
  g.b.vx=dir*spd*Math.cos(a);g.b.vy=spd*Math.sin(a);
}

function scored(who,nd){
  who==='ai'?g.ai.s++:g.pl.s++;
  g.flash=10;
  if(g.pl.s>=CFG.WIN||g.ai.s>=CFG.WIN){
    phase='over';g.winner=g.pl.s>=CFG.WIN?'YOU WIN.':'YOU LOSE.';
  }else{
    phase='waiting';resetBall(nd);
    setTimeout(function(){if(active&&phase==='waiting')phase='playing';},900);
  }
}

function loop(ts){
  raf=requestAnimationFrame(loop);
  var dt=Math.min((ts-lts)/16.667,3);lts=ts;
  if(phase==='playing')update(dt);
  draw(ts);
}

function update(dt){
  var b=g.b,pl=g.pl,ai=g.ai,w=g.w,h=g.h;
  pl.y+=(g.mouse-pl.y)*.18*dt;
  pl.y=clamp(pl.y,CFG.PH/2,h-CFG.PH/2);
  var tot=pl.s+ai.s,spAI=3.5+tot*.25,noise=Math.max(0,35-tot*3.5)*(Math.random()-.5);
  if(ai.y<b.y+noise-4)ai.y+=spAI;
  if(ai.y>b.y+noise+4)ai.y-=spAI;
  ai.y=clamp(ai.y,CFG.PH/2,h-CFG.PH/2);
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  var r=CFG.BS/2;
  if(b.y-r<=0){b.y=r;b.vy=Math.abs(b.vy);}
  if(b.y+r>=h){b.y=h-r;b.vy=-Math.abs(b.vy);}
  var pR=CFG.PM+CFG.PW/2;
  if(b.vx<0&&b.x-r<=pR&&b.x+r>=CFG.PM-CFG.PW/2){
    var h1=(b.y-pl.y)/(CFG.PH/2);
    if(Math.abs(h1)<=1.15){bounce(1,h1);b.x=pR+r+1;}
  }
  var aL=w-CFG.PM-CFG.PW/2;
  if(b.vx>0&&b.x+r>=aL&&b.x-r<=w-CFG.PM+CFG.PW/2){
    var h2=(b.y-ai.y)/(CFG.PH/2);
    if(Math.abs(h2)<=1.15){bounce(-1,h2);b.x=aL-r-1;}
  }
  if(b.x<-20)scored('ai',-1);
  if(b.x>w+20)scored('player',1);
}

function draw(ts){
  var w=g.w,h=g.h,b=g.b,pl=g.pl,ai=g.ai;
  ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,w,h);
  if(g.flash>0){ctx.fillStyle='rgba(255,255,255,'+g.flash*.018+')';ctx.fillRect(0,0,w,h);ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,w,h);g.flash--;}
  ctx.strokeStyle='rgba(255,255,255,.025)';ctx.lineWidth=1;
  for(var x=80;x<w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(var y=80;y<h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.setLineDash([5,9]);
  ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();ctx.setLineDash([]);
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.font='400 '+Math.floor(h*.42)+'px '+CFG.FNT;
  ctx.fillStyle='rgba(255,255,255,.04)';
  ctx.fillText(pl.s,w*.27,h*.06);ctx.fillText(ai.s,w*.73,h*.06);
  ctx.font='400 '+clamp(Math.floor(h*.08),36,80)+'px '+CFG.FNT;
  ctx.fillStyle='rgba(255,255,255,.5)';
  ctx.fillText(pl.s,w*.27,28);ctx.fillText(ai.s,w*.73,28);
  ctx.font='500 11px '+CFG.FNT;
  ctx.fillStyle='rgba(255,255,255,.18)';
  ctx.fillText('RRB.EXE   FIRST TO '+CFG.WIN+'   ESC / DOUBLE-TAP TO EXIT',w/2,16);
  ctx.fillStyle='#f5f5f5';
  ctx.fillRect(CFG.PM-CFG.PW/2,pl.y-CFG.PH/2,CFG.PW,CFG.PH);
  ctx.fillRect(w-CFG.PM-CFG.PW/2,ai.y-CFG.PH/2,CFG.PW,CFG.PH);
  if(phase==='playing'){
    ctx.fillStyle='#f5f5f5';ctx.fillRect(b.x-CFG.BS/2,b.y-CFG.BS/2,CFG.BS,CFG.BS);
  }else if(phase==='waiting'){
    var p=.4+.32*Math.sin(ts/180);
    ctx.fillStyle='rgba(245,245,245,'+p+')';
    ctx.fillRect(w/2-CFG.BS/2,h/2-CFG.BS/2,CFG.BS,CFG.BS);
  }
  if(phase==='over'){
    ctx.fillStyle='rgba(10,10,10,.88)';ctx.fillRect(0,0,w,h);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#f5f5f5';
    ctx.font='700 '+clamp(Math.floor(w*.09),32,96)+'px '+CFG.FNT;
    ctx.fillText(g.winner,w/2,h/2-26);
    ctx.font='400 12px '+CFG.FNT;
    ctx.fillStyle='rgba(255,255,255,.3)';
    ctx.fillText('R TO PLAY AGAIN   ESC / DOUBLE-TAP TO EXIT',w/2,h/2+26);
  }
}
})();
