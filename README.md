# Inventário da Oficina 🔧

Sistema de gestão de inventário para oficinas de automóveis.

## Como colocar online (sem código) — Railway

### Passo 1 — Criar conta no GitHub
1. Aceda a https://github.com e crie uma conta gratuita (se ainda não tiver)

### Passo 2 — Criar repositório com os ficheiros
1. Em GitHub, clique em **New repository**
2. Dê o nome `inventario-oficina`
3. Clique em **Create repository**
4. Faça upload de todos os ficheiros desta pasta (arraste os ficheiros para a página)

### Passo 3 — Publicar no Railway
1. Aceda a https://railway.app e clique em **Login with GitHub**
2. Clique em **New Project** → **Deploy from GitHub repo**
3. Selecione o repositório `inventario-oficina`
4. O Railway detecta automaticamente que é Node.js e faz o deploy
5. Após 1-2 minutos, clique em **Settings** → **Networking** → **Generate Domain**
6. O seu inventário fica acessível num endereço tipo: `inventario-oficina.up.railway.app`

## Alternativa: Render.com
1. Aceda a https://render.com → **New** → **Web Service**
2. Ligue ao GitHub e selecione o repositório
3. Start Command: `node server.js`
4. Clique em **Create Web Service**

## Dados
Os dados são guardados no ficheiro `data/inventario.json` no servidor.
O Railway tem armazenamento persistente — os seus dados não se perdem.

## Estrutura do projeto
```
inventario-oficina/
├── server.js          ← servidor Node.js
├── package.json       ← dependências
├── data/
│   └── inventario.json  ← base de dados (criada automaticamente)
└── public/
    └── index.html     ← interface web
```
