const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'inventario.json');

app.use(express.json());

// Criar pasta data se não existir
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { pecas: defaultPecas(), movimentos: [], nextId: 7 };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function defaultPecas() {
  return [
    { id:1, nome:"Filtro de óleo", ref:"FO-001", cat:"Filtros", qtd:12, min:5, preco:4.50, forn:"AutoPeças Lisboa", loc:"Prateleira A1" },
    { id:2, nome:"Pastilhas de travão dianteiras", ref:"TR-045", cat:"Travões", qtd:3, min:4, preco:22.00, forn:"BrakePro", loc:"Prateleira B2" },
    { id:3, nome:"Filtro de ar", ref:"FA-012", cat:"Filtros", qtd:8, min:3, preco:7.80, forn:"AutoPeças Lisboa", loc:"Prateleira A2" },
    { id:4, nome:"Óleo motor 5W40 1L", ref:"OM-5W40", cat:"Lubrificantes", qtd:0, min:10, preco:9.90, forn:"LubriMax", loc:"Zona C" },
    { id:5, nome:"Correia de distribuição", ref:"CD-088", cat:"Motor", qtd:2, min:2, preco:38.00, forn:"TechAuto", loc:"Prateleira D1" },
    { id:6, nome:"Amortecedor dianteiro esq.", ref:"SU-220", cat:"Suspensão", qtd:1, min:1, preco:65.00, forn:"SuspMax", loc:"Prateleira E1" },
  ];
}

// Servir pasta public se existir, senão servir index inline
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Rota raiz — serve sempre o HTML
app.get('/', (req, res) => {
  const indexFile = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  // HTML inline como fallback
  res.send(getHTML());
});

// --- API Peças ---
app.get('/api/pecas', (req, res) => res.json(readDB().pecas));

app.post('/api/pecas', (req, res) => {
  const db = readDB();
  const peca = { id: db.nextId++, ...req.body };
  db.pecas.push(peca);
  writeDB(db);
  res.json(peca);
});

app.put('/api/pecas/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.pecas = db.pecas.map(p => p.id === id ? { ...p, ...req.body, id } : p);
  writeDB(db);
  res.json(db.pecas.find(p => p.id === id));
});

app.delete('/api/pecas/:id', (req, res) => {
  const db = readDB();
  db.pecas = db.pecas.filter(p => p.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

// --- API Movimentos ---
app.get('/api/movimentos', (req, res) => res.json(readDB().movimentos));

app.post('/api/movimentos', (req, res) => {
  const db = readDB();
  const { pecaId, tipo, qtd, nota } = req.body;
  const peca = db.pecas.find(p => p.id === pecaId);
  if (!peca) return res.status(404).json({ error: 'Peça não encontrada' });
  if (tipo === 'entrada') peca.qtd += qtd;
  else if (tipo === 'saida') peca.qtd = Math.max(0, peca.qtd - qtd);
  else if (tipo === 'acerto') peca.qtd = qtd;
  const mov = { data: new Date().toISOString().split('T')[0], nome: peca.nome, tipo, qtd, nota: nota || '' };
  db.movimentos.push(mov);
  writeDB(db);
  res.json({ peca, mov });
});

// --- Export CSV ---
app.get('/api/export', (req, res) => {
  const db = readDB();
  const header = 'Nome,Referência,Categoria,Quantidade,Mínimo,Preço,Fornecedor,Localização\n';
  const rows = db.pecas.map(p =>
    [p.nome, p.ref, p.cat, p.qtd, p.min, p.preco, p.forn, p.loc].map(v => `"${v}"`).join(',')
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inventario.csv"');
  res.send('\uFEFF' + header + rows);
});

app.listen(PORT, () => console.log(`Oficina inventário a correr em http://localhost:${PORT}`));
