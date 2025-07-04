import 'dotenv/config';

import express, { json } from 'express';
import swaggerUi from 'swagger-ui-express';

import produtosRouter from './routers/produtos.js';
import usuarioRouter from './routers/usuario.js';
import estoqueRouter from './routers/estoque.js';
import relatorioRouter from './routers/relatorio.js';
import { readFileSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

app.get('/', (req, res) => {
  res.send('Hello, Express server is running!');
});

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  try {
    const docs = JSON.parse(readFileSync('./docs.json', 'utf-8'));
    return swaggerUi.setup(docs)(req, res, next);
  } catch (err) {
    res.status(500).send('Erro ao carregar a documentação Swagger.');
  }
});

app.use(produtosRouter);
app.use(usuarioRouter);
app.use(estoqueRouter);
app.use(relatorioRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});