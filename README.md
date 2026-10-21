# MV CELL | Outlet Cell — Landing page

Landing page da **MV CELL | Outlet Cell**: assistência técnica de celular, celulares outlet e acessórios em Embu das Artes (SP).
O objetivo da página é um só: fazer o visitante **chamar no WhatsApp**. Toda seção termina com um botão para o WhatsApp.

🔗 **Site:** https://efsolutionsadvanceds.github.io/mvcell-lp/

---

## Tecnologia

- HTML5, CSS3 e JavaScript puro (ES2020+). Sem framework, sem build, sem `npm install`.
- Funciona abrindo o `index.html` direto no navegador e no GitHub Pages.
- Todos os caminhos são relativos (`css/styles.css`, `assets/img/...`), porque o Pages publica o site em `/nome-do-repo/`.

## Estrutura

```
index.html          Página (cada seção tem um comentário de bloco: <!-- 4. SERVIÇOS --> etc.)
404.html            Página de erro (CSS próprio embutido, funciona em qualquer URL)
css/styles.css      Estilos (tokens de cor no :root, um bloco comentado por seção)
js/main.js          Comportamento (produtos, horários, WhatsApp, animações, carrosséis...)
assets/img/         Fotos da loja: .webp (usada) + .jpg (fallback) + .png (original, não é carregado)
assets/og.jpg       Imagem de compartilhamento (1200x630)
favicon.svg         Ícone (barras de sinal)
robots.txt / sitemap.xml / .nojekyll
```

## Como rodar localmente

Opção 1: dê dois cliques no `index.html`.

Opção 2 (igual ao GitHub Pages): suba um servidor na pasta do projeto e abra http://localhost:8080

```bash
python -m http.server 8080
# ou
npx serve -l 8080 .
```

## Como editar

### Preços e modelos do Outlet
Em `js/main.js`, no topo do arquivo, edite o array **`PRODUCTS`**:

```js
{ id: 'iphone13', brand: 'apple', model: 'iPhone 13', storage: '128GB', condition: 'seminovo', price: 2399 },
```

- `price`: valor inteiro em reais (`2399` vira **R$ 2.399**).
- `condition`: `'novo'` ou `'seminovo'` (aparece como "Seminovo revisado").
- `brand`: `'apple'`, `'samsung'`, `'motorola'` ou `'xiaomi'` (muda a cor do card).
- `id`: identificador curto e único (usado no rastreamento: `outlet_iphone13`).

Para adicionar um modelo, copie uma linha e altere. Para remover, apague a linha.

### Horários
Em `js/main.js`, edite o objeto **`HOURS`** (fuso de São Paulo). Use `null` para dia fechado:

```js
sab: { open: '09:00', close: '13:00' },
dom: null,
```

Ele alimenta o status "Aberto agora / Fechado · abre ..." do topo e a tabela de horários.
Se mudar o horário, atualize também os textos fixos no `index.html`: rodapé, a tabela (versão sem JavaScript) e o bloco `openingHoursSpecification` do JSON-LD no `<head>`.

### Textos
Tudo está no `index.html`, separado por seção com comentários (`<!-- 2. HERO -->`, `<!-- 4. SERVIÇOS -->`...).
As perguntas do FAQ também aparecem no JSON-LD `FAQPage` no `<head>`: se mudar uma resposta, mude nos dois lugares.

### Mensagens do WhatsApp
Cada botão tem:

- `data-wa-msg`: o texto que já vem escrito na conversa;
- `data-origin`: de onde veio o clique (usado no rastreamento);
- `href`: o link completo, para funcionar mesmo sem JavaScript.

Ao trocar uma mensagem, atualize o `data-wa-msg` e gere o `href` novo. No console do navegador (F12):

```js
'https://wa.me/5511947840245?text=' + encodeURIComponent('Olá! Vim pelo site e ...')
```

(Com JavaScript ativo, o `main.js` já regera o link a partir do `data-wa-msg`.)

### Cores e fontes
Em `css/styles.css`, no bloco `:root` (tokens `--ink`, `--cream`, `--signal`, `--volt`...).

### Fotos
Substitua os arquivos em `assets/img/` mantendo os nomes (`loja-1.webp` + `loja-1.jpg`, etc.). Se a proporção mudar, ajuste `width`/`height` da `<img>` no `index.html`.

## Rastreamento (GTM e Meta Pixel)

Os blocos do Google Tag Manager e do Meta Pixel estão **comentados** no `<head>` (e o `noscript` do GTM no começo do `<body>`), com o ID `IDS_AQUI`.
Para ativar: descomente e troque pelo seu ID.

Todo clique em botão do WhatsApp já envia, quando essas ferramentas existem na página:

- `dataLayer.push({ event: 'whatsapp_click', origin })`
- `fbq('track', 'Contact', { origin })`

## Performance e acessibilidade

- Imagens em WebP com fallback JPG, `width`/`height` definidos e `loading="lazy"` (exceto a do topo).
- Fontes do Google carregadas sem bloquear a renderização (`display=swap`).
- Seções abaixo da dobra com `content-visibility: auto` e mapa carregado só quando a seção aparece.
- Animações só com `transform`/`opacity`, desligadas em "reduzir movimento".
- Sem JavaScript, todo o conteúdo continua visível e todos os links funcionam.

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz (`/`). Cada `git push` na `main` atualiza o site em 1 a 2 minutos.
