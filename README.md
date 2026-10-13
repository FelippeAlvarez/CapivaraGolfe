# Capivara Golfe

Jogo de golfe para 1 a 4 jogadores, em um único arquivo HTML (Canvas, sem dependências), com adversários de IA e a Cacá, a capivara Head Pro, como mascote.

- **Campos:** Itanhangá (18 buracos) e Capivara Links (9 buracos; 18 = duas voltas)
- **Formatos:** 18, 9 ou 3 buracos
- **Modos:** Stroke play, Match play e Par point (Stableford)
- **Jogadores:** humanos e IA (Iniciante, Intermediário, Pro), revezando no mesmo aparelho
- **Recursos:** editor de buracos, desistir do buraco, salvar e continuar a partida (localStorage), PWA instalável

Autor: Felippe Alvarez de Sá.

## Arquivos

| Arquivo | Função |
|---|---|
| `mini-golfe.html` | Código-fonte do jogo (fragmento HTML; o build gera as páginas completas) |
| `build_pwa.py` | Gera `export/` (PWA, arquivo único e LEIA-ME de instalação) |
| `gerar-icones.js` | Gera os ícones PNG do app a partir de `logo.svg` (Node + Playwright) |
| `logo.svg` | Logo do app |
| `teste-salvar-desistir.js` | Teste automatizado (Playwright) de desistir, salvar e retomar |

## Como gerar o app

```bash
npm install playwright        # uma vez
node gerar-icones.js          # cria a pasta icones/
python3 build_pwa.py          # cria export/capivara-golfe-pwa e export/capivara-golfe-arquivo-unico.html
```

Antes de cada versão nova, mude o nome do cache (`capivara-golfe-vNN`) em `build_pwa.py` para os aparelhos pegarem a atualização.

Para instalar como app (ícone na tela inicial, sem barra de endereço), a pasta `export/capivara-golfe-pwa` precisa estar hospedada em um endereço https. Veja `export/LEIA-ME-INSTALAR.txt`.

## Limitações conhecidas

- A IA foi calibrada só para o Capivara Links; no Itanhangá ela ainda não foi calibrada.
- O jogo é para um único aparelho, sem partida online.
- Salvar partida depende do armazenamento local do navegador, que pode ser bloqueado em pré-visualizações.

## Direitos

Todos os direitos reservados. Veja `LICENSE`.
