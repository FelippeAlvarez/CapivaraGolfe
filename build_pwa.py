import re,os,shutil,json,zipfile
src=open('mini-golfe.html').read()
out='export/capivara-golfe-pwa'
shutil.rmtree('export',ignore_errors=True)
os.makedirs(out+'/icons')
# sem fontes externas (funciona offline; usa as fontes do sistema)
h=re.sub(r'<link rel="preconnect"[^>]*>\n?','',src)
h=re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\n?','',h)
assert 'googleapis' not in h
head='''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Capivara Golfe</title>
<meta name="theme-color" content="#1c6a38">
<meta name="description" content="Capivara Golfe: golfe para 1 a 4 jogadores, com adversários de IA, jogado com a Head Pro.">
<meta name="author" content="Felippe Alvarez de Sá">
<meta name="copyright" content="© 2026 Felippe Alvarez de Sá. Todos os direitos reservados.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Capivara Golfe">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}body{min-height:100vh}</style>
</head>
<body>
'''
body=re.sub(r'<meta (name="viewport"|charset="utf-8"|name="theme-color")[^>]*>\n?','',h.replace('<title>Capivara Golfe</title>\n','',1))
reg='''<script>
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
</body>
</html>
'''
h2=head+body+reg
open(out+'/index.html','w').write(h2)
# arquivo único (sem service worker) — abre em qualquer navegador
single=head.replace('<link rel="manifest" href="manifest.webmanifest">\n','').replace('<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n','')+body+'</body>\n</html>\n'
open('export/capivara-golfe-arquivo-unico.html','w').write(single)
json.dump({"name":"Capivara Golfe","short_name":"Capivara Golfe","description":"Golfe para 1 a 4 jogadores, com adversários de IA, jogado com a Head Pro.","lang":"pt-BR","id":"/CapivaraGolfe/app-capivara-golfe-2","start_url":"./","scope":"./","display":"standalone","orientation":"any","background_color":"#edf1e8","theme_color":"#1c6a38","categories":["games","sports"],
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},open(out+'/manifest.webmanifest','w'),indent=2,ensure_ascii=False)
open(out+'/sw.js','w').write('''const CACHE = 'capivara-golfe-v42';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
    const copy = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return resp;
  }).catch(() => caches.match('index.html'))));
});
''')
for f in ['icon-192.png','icon-512.png','icon-maskable-512.png']: shutil.copy('icones/'+f,out+'/icons/'+f)
shutil.copy('icones/logo.svg',out+'/icons/logo.svg')
shutil.copy('icones/apple-touch-icon.png',out+'/icons/apple-touch-icon.png')
open('export/LEIA-ME-INSTALAR.txt','w').write('''CAPIVARA GOLFE — como instalar e distribuir
==========================================

O QUE TEM AQUI
- capivara-golfe-pwa/  -> o app instalável (PWA). Precisa ser colocado numa hospedagem com endereço https.
- capivara-golfe-arquivo-unico.html -> o jogo inteiro em um só arquivo. Abre em qualquer navegador (computador ou celular), funciona sem internet, mas NÃO instala como app.

COMO FICA INSTALÁVEL (qualquer pessoa, sem conta do Claude)
1) Coloque a pasta capivara-golfe-pwa numa hospedagem estática com https. Opções simples e gratuitas:
   - Netlify Drop (app.netlify.com/drop): arraste a pasta e ele devolve um endereço https.
   - GitHub Pages: suba a pasta para um repositório e ative o Pages.
   - Qualquer hospedagem de sites (cPanel etc.) com certificado https.
2) Mande o endereço para os jogadores.
3) No Android (Chrome): abrir o endereço > menu (três pontos) > "Instalar app" (ou "Adicionar à tela inicial").
   No iPhone/iPad (Safari): botão Compartilhar > "Adicionar à Tela de Início".
   No computador (Chrome/Edge): ícone de instalar na barra de endereço.
4) Depois de aberto uma vez, o jogo funciona sem internet.

GOOGLE PLAY (opcional)
Um PWA hospedado pode ser empacotado como app Android (TWA) com ferramentas como o PWABuilder (pwabuilder.com) a partir do endereço https do jogo. Exige conta de desenvolvedor do Google Play e o arquivo de verificação de domínio. Confirme os passos atuais no site da ferramenta antes de começar.

ATUALIZAR O JOGO
Substitua os arquivos na hospedagem e mude o número em CACHE no arquivo sw.js (por exemplo, 'capivara-golfe-v42'); assim os aparelhos pegam a versão nova.

OBSERVAÇÕES
- Todos os jogadores usam o mesmo aparelho, em revezamento (não há jogo online entre aparelhos nesta versão).
- As fontes do navegador/sistema são usadas no lugar de fontes da internet, para o app funcionar offline; o visual pode variar um pouco.
''')
