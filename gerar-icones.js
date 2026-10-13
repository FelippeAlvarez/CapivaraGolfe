const {chromium}=require('playwright'); const fs=require('fs');
fs.mkdirSync('icones',{recursive:true});
const inner=fs.readFileSync('logo.svg','utf8').replace(/<svg[^>]*>/,'').replace('</svg>','').replace(/<title>.*?<\/title>/,'');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
 const jobs=[['icon-192.png',192,false],['icon-512.png',512,false],['icon-maskable-512.png',512,true],['apple-touch-icon.png',180,true]];
 for(const [n,s,m] of jobs){
  const p=await b.newPage({viewport:{width:s,height:s}});
  const svg=m?`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${s}" height="${s}"><rect width="100" height="100" fill="#1e5aa8"/><g transform="translate(14 14) scale(.72)">${inner}</g></svg>`
   :`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${s}" height="${s}">${inner}</svg>`;
  await p.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
  await p.screenshot({path:'icones/'+n,omitBackground:!m}); await p.close();
 } await b.close();})();
