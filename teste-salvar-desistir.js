const { chromium } = require('playwright');
const fs=require('fs');
let s=fs.readFileSync('mini-golfe.html','utf8');
const i=s.lastIndexOf('})();');
s=s.slice(0,i)+`window.__t={hpar:()=>HOLE.par,state:()=>state,players:()=>players,hi:()=>hi,si:()=>si,cur:()=>cur,
 snap(){return JSON.stringify({hi,si,cur,seq,honors,pm:planMode,cup:HOLE.cup,wind:HOLE.wind,pz:HOLE.pinZone,done:state==='done',pl:players.map(p=>({n:p.name,ai:p.ai,sc:seq.map(h=>p.scores[h]===undefined?null:p.scores[h]),b:p.ball,lr:p.lastRest,s:p.strokes,h:p.holed,f:p.forced,g:p.gaveUp,l:p.lieKey,c:p.clubIdx}))})},
 human(){ // joga o humano da vez até a bola parar (1 tacada)
  const ang=Math.atan2(HOLE.cup[1]-ball.y,HOLE.cup[0]-ball.x); launch(ang,0.5,0); let g=0; while((state==='roll'||state==='sink')&&g++<200000) step(DT); return state; },
 drive(maxMs){ const t0=performance.now(); let n=0;
  while(state!=='final'&&performance.now()-t0<maxMs){
   if(state==='aim'&&players[cur].ai){ if(aiTimer){clearTimeout(aiTimer);aiTimer=null;} aiPlay(); if(aiTimer){clearTimeout(aiTimer);aiTimer=null;} aiShoot(aiPend); n++; }
   else if(state==='roll'||state==='sink'){ step(DT); }
   else if(state==='done'){ if(aiTimer){clearTimeout(aiTimer);aiTimer=null;} els.nextBtn.click(); }
   else if(state==='aim'){ __t.human(); }
   else break;
  } return state; }};
`+s.slice(i);
fs.writeFileSync('_teste.html',s);
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
 const ctx=await b.newContext({viewport:{width:390,height:844}});
 const errs=[]; let ok=true; const chk=(c,m)=>{console.log((c?'OK  ':'FALHA ')+m); if(!c)ok=false;};
 const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/_teste.html');await p.waitForTimeout(300);
 chk(await p.$eval('#resumeBtn',e=>e.hidden),'sem save: botão continuar oculto');
 await p.click('#segN button:nth-child(2)'); await p.click('#segF button[data-k="9"]');
 await p.selectOption('#names .namerow:nth-child(1) select','0'); await p.selectOption('#names .namerow:nth-child(2) select','1');
 await p.click('#startBtn'); await p.waitForTimeout(300);
 chk(await p.evaluate(()=>__t.state())==='aim','estado aim');
 chk(!(await p.$eval('#giveBtn',e=>e.hidden)),'botão desistir visível na vez do humano');
 chk(!(await p.$eval('#saveBtn',e=>e.hidden)),'botão salvar visível');
 await p.screenshot({path:'cx_btn.png'});
 // humano dá uma tacada e depois salva no meio do buraco
 await p.evaluate(()=>__t.human()); await p.evaluate(()=>__t.drive(1)); 
 // avança até vez do humano de novo
 let g=0; while(g++<50){ const st=await p.evaluate(()=>[__t.state(),__t.players()[__t.cur()]?.ai]); if(st[0]==='aim'&&!st[1])break; await p.evaluate(()=>{ if(__t.state()==='aim'&&__t.players()[__t.cur()].ai) __t.drive(30); }); if(st[0]==='done')break; }
 await p.waitForFunction(()=>__t.state()==='aim'&&!__t.players()[__t.cur()].ai,null,{timeout:60000});
 const before=await p.evaluate(()=>{ document.getElementById('saveBtn').click(); return __t.snap(); }); await p.waitForTimeout(100);
 const toast=await p.$eval('#toast',e=>e.textContent); chk(/salvo/i.test(toast),'toast salvo: '+toast);
 const saved=await p.evaluate(()=>localStorage.getItem('capivara-golfe-partida-v1')); chk(!!saved,'gravou no localStorage ('+(saved||'').length+' bytes)');
 // recarrega e retoma
 await p.reload(); await p.waitForTimeout(400);
 chk(!(await p.$eval('#resumeBtn',e=>e.hidden)),'após reload: botão continuar visível');
 console.log('hint:',await p.$eval('#resumeHint',e=>e.textContent));
 await p.click('#resumeBtn'); await p.waitForTimeout(300);
 const after=await p.evaluate(()=>__t.snap());
 chk(before===after,'estado idêntico após retomar'); if(before!==after){console.log(before);console.log(after);}
 chk(await p.evaluate(()=>__t.state())==='aim','retomou em aim');
 // desistir
 await p.click('#giveBtn'); chk((await p.$eval('#giveBtn',e=>e.textContent)).includes('Confirmar'),'1º toque pede confirmação');
 await p.click('#giveBtn'); await p.waitForTimeout(100);
 const info=await p.evaluate(()=>{const q=__t.players().find(x=>!x.ai);const h=__t.hi();return {n:q.scores[h],g:q.gaveUp,f:q.forced,holed:q.holed,par:__t.hpar()}});
 console.log('desistência',JSON.stringify(info));
 chk(info.g&&info.holed&&info.n===info.par+4,'desistir: score = par+4, gaveUp');
 // salvar em estado done (precisa terminar buraco)
 await p.evaluate(()=>__t.drive(60000)); 
 // drive passa para os próximos buracos; queremos parar no 'done': refaz
 await p.close();
 // 2ª página: fluxo done
 const p2=await ctx.newPage(); p2.on('pageerror',e=>errs.push(String(e)));
 await p2.goto('file://'+process.cwd()+'/_teste.html');await p2.waitForTimeout(300);
 chk(await p2.$eval('#resumeBtn',e=>e.hidden),'save da partida terminada já foi apagado');
 await p2.click('#segN button:nth-child(1)'); await p2.click('#segF button[data-k="3"]');
 await p2.selectOption('#names .namerow:nth-child(1) select','0');
 await p2.click('#startBtn'); await p2.waitForTimeout(300);
 await p2.click('#giveBtn'); await p2.click('#giveBtn'); await p2.waitForTimeout(150);
 chk(await p2.evaluate(()=>__t.state())==='done','solo: desistir leva ao resultado');
 console.log('resultado:',await p2.$eval('#resTitle',e=>e.textContent));
 await p2.click('#saveBtn');
 const snapD=await p2.evaluate(()=>__t.snap());
 await p2.reload(); await p2.waitForTimeout(300); await p2.click('#resumeBtn'); await p2.waitForTimeout(300);
 chk(await p2.evaluate(()=>__t.state())==='done','retomou em done'); chk(snapD===await p2.evaluate(()=>__t.snap()),'estado done idêntico');
 console.log('res após retomar:',await p2.$eval('#resTitle',e=>e.textContent),'| botão:',await p2.$eval('#nextBtn',e=>e.textContent));
 // continua até o fim; o save deve ser apagado
 await p2.click('#nextBtn'); await p2.waitForTimeout(100);
 await p2.evaluate(()=>__t.drive(60000)); await p2.waitForTimeout(100);
 chk(await p2.evaluate(()=>__t.state())==='final','partida chegou ao final após retomar');
 chk(!(await p2.evaluate(()=>localStorage.getItem('capivara-golfe-partida-v1'))),'save apagado ao terminar a partida');
 // armazenamento bloqueado
 await p2.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('x')};});
 await p2.click('#newBtn'); await p2.waitForTimeout(100);
 console.log('errs',errs); chk(errs.length===0,'sem erros de página');
 console.log(ok?'TUDO OK':'HÁ FALHAS');
 await b.close();
})();
