(function(){
'use strict';

// Ensure Futura PT is available (TypeKit kit lnt1dnh)
if(!document.querySelector('link[href*="lnt1dnh"]')){
  var _tk=document.createElement('link');
  _tk.rel='stylesheet';_tk.href='https://use.typekit.net/lnt1dnh.css';
  document.head.appendChild(_tk);
}

var API='https://pong-scores.robinrichardburkhardt.workers.dev';
var FNT='"futura-pt",sans-serif';
var CFG={AI_WIN:7,PW:8,PH:80,BS:8,SPD:6.5,MAX:16,PM:36};

var DARK={
  bg:'#0d0d0d',el:'#f5f5f5',
  grid:'rgba(255,255,255,.025)',div:'rgba(255,255,255,.07)',
  ghost:'rgba(255,255,255,.035)',score:'rgba(255,255,255,.55)',
  hdr:'rgba(255,255,255,.2)',pulse:'rgba(245,245,245,',
  flashCol:'#ffffff',row:'rgba(255,255,255,.07)',
  overBg:'rgba(13,13,13,.95)',overEl:'#f5f5f5',overHint:'rgba(255,255,255,.3)'
};
var LIGHT={
  bg:'#f5f5f5',el:'#0d0d0d',
  grid:'rgba(0,0,0,.04)',div:'rgba(0,0,0,.09)',
  ghost:'rgba(0,0,0,.035)',score:'rgba(0,0,0,.55)',
  hdr:'rgba(0,0,0,.22)',pulse:'rgba(13,13,13,',
  flashCol:'#000000',row:'rgba(0,0,0,.06)',
  overBg:'rgba(245,245,245,.95)',overEl:'#0d0d0d',overHint:'rgba(0,0,0,.3)'
};
var C=DARK;

var KONAMI=[38,38,40,40,37,39,37,39,66,65],ki=0,kbuf='';
var active=false,phase='idle',raf=null,lts=0;
var g={w:0,h:0,mouse:0,pl:{y:0,s:0},ai:{y:0},b:{x:0,y:0,vx:0,vy:0},flash:0,lives:3,blinkHeart:-1,blinkTimer:0};
var overlay,cv,ctx,lastTap=0,homeBtn,playBtn,initPanel,board=[],myRank=-1;

var params=new URLSearchParams(location.search);
var urlPath=location.pathname.replace(/\.html$/,'');
if(params.get('play')==='1'||params.get('pong')==='1'||urlPath.endsWith('/gameover')){
  window.addEventListener('load',function(){setTimeout(launch,300);});
}
document.addEventListener('keydown',function(e){
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(e.keyCode===KONAMI[ki]){ki++;if(ki===KONAMI.length){ki=0;launch();return;}}else{ki=0;}
  if(!active){
    kbuf+=(e.key.length===1?e.key.toLowerCase():'');
    if(kbuf.length>12)kbuf=kbuf.slice(-12);
    if(kbuf.endsWith('rrb')){kbuf='';launch();}
  }else if(phase==='playing'||phase==='waiting'){
    if(e.key==='Escape')teardown();
  }else if(phase==='leaderboard'){
    if(e.key==='Escape')teardown();
    if(e.key==='r'||e.key==='R')restartGame();
  }
});

function launch(){
  if(active)return;
  active=true;

  // Hide custom cursor, switch body to native cursor mode
  var cs=document.createElement('style');
  cs.id='rrb-pong-css';
  cs.textContent='body.pong-active,body.pong-active *{cursor:auto!important}body.pong-active button,body.pong-active a{cursor:pointer!important}body.pong-active #cursor-dot{display:none!important;pointer-events:none!important}#rrb-pong canvas{pointer-events:none!important}';
  document.head.appendChild(cs);
  document.body.classList.add('pong-active');
  var dot=document.getElementById('cursor-dot');
  if(dot){dot.dataset.prevDisplay=dot.style.display||'';dot.style.display='none';}

  // Match current site theme
  var isDark=(document.documentElement.getAttribute('data-theme')||'dark')==='dark';
  var wBg=isDark?'#0d0d0d':'#f5f5f5';
  var wEl=isDark?'#f5f5f5':'#0d0d0d';
  var wGrid=isDark
    ?'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)'
    :'linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)';
  var wDim=isDark?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)';
  var wLine=isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.18)';
  var wHint=isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.18)';

  overlay=document.createElement('div');
  overlay.id='rrb-pong';
  overlay.style.cssText=[
    'position:fixed','inset:0','z-index:2147483647',
    'background:'+wBg,
    'background-image:'+wGrid,
    'background-size:80px 80px',
    'user-select:none','-webkit-user-select:none',
    'font-family:'+FNT,'color:'+wEl,
    'opacity:0','transition:opacity .4s'
  ].join(';');

  var pad='clamp(32px,6vw,80px)';
  overlay.innerHTML=
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:'+pad+';overflow:hidden;">'+
      '<div style="font-size:10px;font-weight:500;letter-spacing:.25em;text-transform:uppercase;color:'+wDim+';margin-bottom:clamp(14px,2vw,24px);">ROBIN\'S SECRET</div>'+
      '<div style="font-size:clamp(56px,11vw,160px);font-weight:700;line-height:.88;letter-spacing:-.015em;color:'+wEl+';margin-bottom:clamp(36px,5vw,64px);">PONG.</div>'+
      '<div style="width:clamp(36px,5vw,56px);height:1px;background:'+wLine+';margin-bottom:clamp(20px,3vw,32px);"></div>'+
      '<div style="font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:'+wDim+';margin-bottom:14px;">SELECT A MODE</div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">'+
        '<button data-mode="dark" style="font-family:'+FNT+';font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:15px 28px;border:none;background:#0d0d0d;color:#f5f5f5;outline:1px solid rgba(255,255,255,.3);">DARK &#8594;</button>'+
        '<button data-mode="light" style="font-family:'+FNT+';font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:15px 28px;border:none;background:#f5f5f5;color:#0d0d0d;outline:1px solid rgba(0,0,0,.18);">LIGHT &#8594;</button>'+
      '</div>'+
      '<div style="position:absolute;bottom:'+pad+';left:'+pad+';font-size:9px;letter-spacing:.18em;color:'+wHint+';line-height:2;text-transform:uppercase;">'+
        'MOUSE OR TOUCH TO MOVE YOUR PADDLE<br>HIT THE BALL AS MANY TIMES AS YOU CAN<br>3 LIVES - DOUBLE-TAP OR ESC TO EXIT'+
      '</div>'+
    '</div>';

  document.body.appendChild(overlay);
  requestAnimationFrame(function(){requestAnimationFrame(function(){overlay.style.opacity='1';});});
  overlay.addEventListener('click',function(e){
    var btn=e.target.closest('[data-mode]');
    if(btn)selectMode(btn.dataset.mode==='dark');
  });
  phase='welcome';
}

function selectMode(dark){
  C=dark?DARK:LIGHT;
  overlay.innerHTML='';
  overlay.style.cssText=[
    'position:fixed','inset:0','z-index:2147483647',
    'background:'+C.bg,
    'user-select:none','-webkit-user-select:none'
  ].join(';');

  cv=document.createElement('canvas');
  cv.style.cssText='display:block;position:absolute;inset:0;width:100%;height:100%;';
  overlay.appendChild(cv);
  ctx=cv.getContext('2d');

  initPanel=document.createElement('div');
  initPanel.style.cssText=[
    'position:absolute','bottom:0','left:0','right:0',
    'display:none','flex-wrap:wrap','align-items:center','gap:12px',
    'padding:18px clamp(24px,5vw,64px)',
    'font-family:'+FNT,'touch-action:auto',
    'border-top:1px solid '+(C===DARK?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'),
    'background:'+C.overBg
  ].join(';');
  overlay.appendChild(initPanel);

  overlay.addEventListener('mousemove',function(e){
    if(phase==='playing'||phase==='waiting')g.mouse=e.clientY;
  });
  overlay.addEventListener('touchmove',function(e){
    if(phase==='playing'||phase==='waiting'){e.preventDefault();g.mouse=e.touches[0].clientY;}
  },{passive:false});
  overlay.addEventListener('touchstart',function(e){
    if(phase==='playing'||phase==='waiting'){
      e.preventDefault();g.mouse=e.touches[0].clientY;
      var now=Date.now();
      if(now-lastTap<320){teardown();return;}
      lastTap=now;
    }
  },{passive:false});
  overlay.addEventListener('touchend',function(e){
    if(phase==='playing'||phase==='waiting')e.preventDefault();
  },{passive:false});

  resize();
  window.addEventListener('resize',resize);
  restartGame();
  raf=requestAnimationFrame(loop);
}

function teardown(){
  active=false;phase='idle';
  cancelAnimationFrame(raf);
  window.removeEventListener('resize',resize);
  // Restore site cursor
  document.body.classList.remove('pong-active');
  var dot=document.getElementById('cursor-dot');
  if(dot){dot.style.display=dot.dataset.prevDisplay||'';delete dot.dataset.prevDisplay;}
  var cs=document.getElementById('rrb-pong-css');
  if(cs)cs.parentNode.removeChild(cs);
  if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
  overlay=cv=ctx=null;
  window.location.href='/';
}

function restartGame(){
  g.pl.s=0;g.flash=0;g.lives=3;g.blinkHeart=-1;g.blinkTimer=0;
  board=[];myRank=-1;
  if(initPanel)initPanel.style.display='none';
  if(overlay)overlay.style.touchAction='none';
  phase='waiting';resetBall(1);
  setTimeout(function(){if(active&&phase==='waiting')phase='playing';},900);
}

function resize(){
  if(phase==='leaderboard'||phase==='over'||phase==='submitting')return;
  g.w=cv.width=window.innerWidth;
  g.h=cv.height=window.innerHeight;
  g.mouse=g.h/2;g.pl.y=g.h/2;g.ai.y=g.h/2;
  if(phase==='waiting'||phase==='playing')resetBall(1);
}

function resetBall(d){
  g.b.x=g.w/2;g.b.y=g.h/2+(Math.random()-.5)*(g.h*.3);
  var level=Math.min(Math.floor(g.pl.s/10),8);
  var spd=CFG.SPD*(1+level*.1);
  var a=(Math.random()*.4-.2);
  g.b.vx=d*spd*Math.cos(a);g.b.vy=spd*Math.sin(a);
}

function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v;}

function bounce(dir,hit){
  var spd=Math.min(Math.hypot(g.b.vx,g.b.vy)*1.02,CFG.MAX);
  var a=hit*(Math.PI/3.8);
  g.b.vx=dir*spd*Math.cos(a);g.b.vy=spd*Math.sin(a);
}

function scored(who,nd){
  if(who==='ai'){
    g.lives--;
    g.blinkHeart=g.lives;
    g.blinkTimer=55;
    g.flash=14;
    if(g.lives<=0){
      phase='over';
      setTimeout(function(){
        fetch(API).then(function(r){return r.json();}).then(function(data){
          board=Array.isArray(data)?data:[];
        }).catch(function(){board=[];}).finally(function(){
          myRank=-1;phase='leaderboard';
          overlay.style.touchAction='auto';
          showInitPanel();
        });
      },1200);
    }else{
      phase='waiting';resetBall(1);
      setTimeout(function(){if(active&&phase==='waiting')phase='playing';},1000);
    }
  }else{
    g.flash=4;
    phase='waiting';resetBall(nd);
    setTimeout(function(){if(active&&phase==='waiting')phase='playing';},700);
  }
}

function buildActionBtns(){
  var tc=C.el,bc=C.bg;
  var btnBase='font-family:'+FNT+';font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:12px 22px;border:none;';
  return '<button id="po-again" style="'+btnBase+'outline:1px solid '+tc+';background:transparent;color:'+tc+';">PLAY AGAIN</button>'+
         '<a href="/" style="font-family:'+FNT+';font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:12px 22px;text-decoration:none;background:'+tc+';color:'+bc+';">BACK TO SITE &#8594;</a>';
}

function showInitPanel(){
  var tc=C.el,dc=C.hdr,bc=C===DARK?'rgba(255,255,255,.15)':'rgba(0,0,0,.15)';
  var inpStyle='width:44px;height:56px;background:transparent;border:1px solid '+bc+';color:'+tc+';font-family:'+FNT+';font-size:24px;font-weight:700;text-align:center;text-transform:uppercase;-webkit-text-transform:uppercase;outline:none;';
  var btnBase='font-family:'+FNT+';font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;padding:12px 22px;border:none;';

  initPanel.style.display='flex';
  initPanel.innerHTML=
    '<div style="font-size:10px;font-weight:500;letter-spacing:.2em;color:'+dc+';text-transform:uppercase;white-space:nowrap;">SCORE <strong style="color:'+tc+';font-size:18px;">'+g.pl.s+'</strong></div>'+
    '<div style="width:1px;height:32px;background:'+bc+';flex-shrink:0;"></div>'+
    '<div style="font-size:10px;font-weight:500;letter-spacing:.2em;color:'+dc+';text-transform:uppercase;white-space:nowrap;">INITIALS</div>'+
    '<div style="display:flex;gap:6px;" id="po-slots">'+
      '<input id="po-0" maxlength="1" autocomplete="off" autocorrect="off" spellcheck="false" style="'+inpStyle+'" />'+
      '<input id="po-1" maxlength="1" autocomplete="off" autocorrect="off" spellcheck="false" style="'+inpStyle+'" />'+
      '<input id="po-2" maxlength="1" autocomplete="off" autocorrect="off" spellcheck="false" style="'+inpStyle+'" />'+
    '</div>'+
    '<button id="po-sub" style="'+btnBase+'background:'+tc+';color:'+C.bg+';">SUBMIT &#8594;</button>'+
    '<div style="flex:1;min-width:12px;"></div>'+
    buildActionBtns();

  setTimeout(function(){
    var ins=[document.getElementById('po-0'),document.getElementById('po-1'),document.getElementById('po-2')];
    ins.forEach(function(inp,i){
      if(!inp)return;
      inp.addEventListener('input',function(){
        inp.value=inp.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(-1);
        if(inp.value&&i<2)ins[i+1].focus();
      });
      inp.addEventListener('keydown',function(e){
        if(e.key==='Backspace'&&!inp.value&&i>0)ins[i-1].focus();
        if(e.key==='Enter')doSubmit(ins);
      });
    });
    var sub=document.getElementById('po-sub');
    if(sub)sub.addEventListener('click',function(){doSubmit(ins);});
    var again=document.getElementById('po-again');
    if(again)again.addEventListener('click',restartGame);
    if(ins[0])ins[0].focus();
  },50);
}

function doSubmit(ins){
  var name=(ins.map(function(i){return i?i.value.replace(/[^A-Za-z0-9]/g,''):''}).join('')).toUpperCase();
  if(!name)name='???';
  name=name.padEnd(3,'?').slice(0,3);
  var sub=document.getElementById('po-sub');
  if(sub){sub.textContent='...';sub.disabled=true;}
  phase='submitting';
  var myScore=g.pl.s;
  fetch(API,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:name,score:myScore})
  }).then(function(r){return r.json();})
  .then(function(data){
    board=Array.isArray(data)?data:[];
    myRank=board.findIndex(function(e){return e.name===name&&e.score===myScore;});
    if(myRank<0)myRank=board.findIndex(function(e){return e.score===myScore;});
    finishSubmit();
  })
  .catch(function(){board=[];myRank=-1;finishSubmit();});
}

function finishSubmit(){
  var dc=C.hdr;
  initPanel.innerHTML=
    '<div style="font-size:10px;font-weight:500;letter-spacing:.2em;color:'+dc+';text-transform:uppercase;">SCORE SUBMITTED</div>'+
    '<div style="flex:1;min-width:12px;"></div>'+
    buildActionBtns();
  setTimeout(function(){
    var again=document.getElementById('po-again');
    if(again)again.addEventListener('click',restartGame);
  },0);
  phase='leaderboard';
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
  var spAI=4+Math.min(g.pl.s*.04,3),noise=Math.max(0,28-g.pl.s*.3)*(Math.random()-.5);
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
    if(Math.abs(h1)<=1.15){bounce(1,h1);b.x=pR+r+1;g.pl.s++;}
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
  var w=g.w,h=g.h;
  ctx.fillStyle=C.bg;ctx.fillRect(0,0,w,h);

  if(phase==='leaderboard'){drawLeaderboard(w,h);return;}
  if(phase==='over'||phase==='submitting'){
    ctx.fillStyle=C.overBg;ctx.fillRect(0,0,w,h);
    return;
  }

  var b=g.b,pl=g.pl,ai=g.ai;
  ctx.strokeStyle=C.grid;ctx.lineWidth=1;
  for(var x=80;x<w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(var y=80;y<h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle=C.div;ctx.setLineDash([5,9]);
  ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();ctx.setLineDash([]);

  // Score - large centered, site style
  var scoreSize=clamp(Math.floor(h*.22),80,240);
  var labelSize=11;
  var centerY=h*.38;
  ctx.textAlign='center';ctx.textBaseline='middle';
  // Ghost behind
  ctx.font='700 '+Math.floor(scoreSize*1.8)+'px '+FNT;
  ctx.fillStyle=C.ghost;
  ctx.fillText(pl.s,w/2,h/2+scoreSize*.2);
  // "SCORE" label
  ctx.font='500 '+labelSize+'px '+FNT;
  ctx.fillStyle=C.hdr;
  ctx.fillText('SCORE',w/2,centerY-scoreSize*.5-16);
  // Big number
  ctx.font='700 '+scoreSize+'px '+FNT;
  ctx.fillStyle=C.el;
  ctx.fillText(pl.s,w/2,centerY);

  // Hearts (lives) - top left
  var hSize=clamp(Math.floor(h*.038),16,28);
  var hY=20;
  ctx.textBaseline='top';ctx.font=hSize+'px '+FNT;
  for(var i=0;i<3;i++){
    var hx=28+i*(hSize+8);
    if(i<g.lives){
      ctx.globalAlpha=1;ctx.fillStyle=C.el;
      ctx.fillText('\u2665',hx,hY);
    }else if(g.blinkTimer>0&&i===g.blinkHeart){
      ctx.globalAlpha=Math.floor(g.blinkTimer/6)%2===0?1:0;
      ctx.fillStyle=C.el;ctx.fillText('\u2665',hx,hY);
      ctx.globalAlpha=1;
    }else{
      ctx.globalAlpha=0.18;ctx.fillStyle=C.el;
      ctx.fillText('\u2665',hx,hY);ctx.globalAlpha=1;
    }
  }
  if(g.blinkTimer>0)g.blinkTimer--;

  // Exit hint
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.font='500 10px '+FNT;
  ctx.fillStyle=C.hdr;
  ctx.fillText('ESC / DOUBLE-TAP TO EXIT',w/2,14);

  ctx.fillStyle=C.el;
  ctx.fillRect(CFG.PM-CFG.PW/2,pl.y-CFG.PH/2,CFG.PW,CFG.PH);
  ctx.fillRect(w-CFG.PM-CFG.PW/2,ai.y-CFG.PH/2,CFG.PW,CFG.PH);

  if(phase==='playing'){
    ctx.fillStyle=C.el;ctx.fillRect(b.x-CFG.BS/2,b.y-CFG.BS/2,CFG.BS,CFG.BS);
  }else if(phase==='waiting'){
    var p=.4+.32*Math.sin(ts/180);
    ctx.fillStyle=C.pulse+p+')';
    ctx.fillRect(w/2-CFG.BS/2,h/2-CFG.BS/2,CFG.BS,CFG.BS);
  }

  if(g.flash>0){
    ctx.globalAlpha=g.flash*.014;
    ctx.fillStyle=C.flashCol;ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=1;g.flash--;
  }
}

function drawLeaderboard(w,h){
  ctx.strokeStyle=C.grid;ctx.lineWidth=1;
  for(var x=80;x<w;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(var y=80;y<h;y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

  var pad=clamp(w*.08,40,100);
  var titleSize=clamp(Math.floor(w*.07),32,88);
  var rowSize=clamp(Math.floor(h*.042),20,32);
  var rowH=rowSize*1.9;

  ctx.textBaseline='top';ctx.textAlign='left';
  ctx.font='700 '+titleSize+'px '+FNT;
  ctx.fillStyle=C.el;
  ctx.fillText('LEADERBOARD.',pad,clamp(40,36,56));

  var lineY=clamp(40,36,56)+titleSize+20;
  ctx.strokeStyle=C.div;ctx.lineWidth=1;ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(pad,lineY);ctx.lineTo(w-pad,lineY);ctx.stroke();

  var startY=lineY+24;

  if(board.length===0){
    ctx.font='400 '+rowSize+'px '+FNT;
    ctx.fillStyle=C.hdr;
    ctx.fillText('NO SCORES YET.',pad,startY);
  }

  board.forEach(function(entry,i){
    var ry=startY+i*rowH;
    var isMe=i===myRank;
    if(isMe){
      ctx.fillStyle=C.row;
      ctx.fillRect(pad-20,ry-8,w-pad*2+40,rowH-2);
    }
    ctx.font=(isMe?'700':'400')+' '+rowSize+'px '+FNT;
    ctx.fillStyle=isMe?C.el:C.hdr;
    ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(String(i+1).padStart(2,'0'),pad,ry);
    ctx.fillText(entry.name,pad+70,ry);
    ctx.textAlign='right';
    ctx.font=(isMe?'700':'400')+' '+rowSize+'px '+FNT;
    ctx.fillText(entry.score,w-pad,ry);
    if(isMe){
      ctx.font='500 9px '+FNT;
      ctx.fillStyle=C.hdr;
      ctx.textAlign='right';
      ctx.fillText('YOU',w-pad-String(entry.score).length*rowSize*.65-16,ry+rowSize*.25);
    }
  });

  ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.font='500 10px '+FNT;
  ctx.fillStyle=C.hdr;
  ctx.fillText('ESC TO EXIT',w/2,h-clamp(80,70,100));
}
})();
