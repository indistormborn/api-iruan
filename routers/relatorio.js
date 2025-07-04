import { Router } from 'express';
const router = Router();
import { Entrada, Saida } from '../db.js';
import { Op } from 'sequelize';
import { getUserFromToken } from '../token.js';
import logger from '../logger.js';
import { parse, isValid } from 'date-fns';

const parseDate = (dateString) => {
  if (!dateString) throw new Error('Data não informada');
  const formatos = [
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    "yyyy-MM-dd'T'HH:mm:ssxxx",
    "yyyy-MM-dd HH:mm:ss",
    "yyyy-MM-dd",
    "dd/MM/yyyy",
    "MM/dd/yyyy",
    "dd-MM-yyyy",
    "MM-dd-yyyy"
  ];
  for (const formato of formatos) {
    const date = parse(dateString, formato, new Date());
    if (isValid(date)) {
      return date; // Retorne o objeto Date
    }
  }
  const date = new Date(dateString);
  if (isValid(date)) {
    return date; // Retorne o objeto Date
  }
  throw new Error('Data inválida');
}

router.post('/relatorio/estoque', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const body = req.body;
    if (!body || (!body.data_inicio && !body.data_fim)) {
      logger.warn('Dados de início ou fim são obrigatórios');
      return res.status(400).json({ error: 'Dados de início ou fim são obrigatórios' });
    }

    const dataInicio = body.data_inicio ? parseDate(body.data_inicio) : null;
    const dataFim = body.data_fim ? parseDate(body.data_fim) : null;

    const query = { user: user.id_user };
    if(dataInicio && dataFim) {
      query.data_hora = {
        [Op.between]: [dataInicio, dataFim]
      };
    }

    if(!dataInicio && dataFim) {
      query.data_hora = {
        [Op.lte]: dataFim
      };
    }

    if(dataInicio && !dataFim) {
      query.data_hora = {
        [Op.gte]: dataInicio
      };
    }

    logger.info(`Usuário ${user.username} gerando relatório de estoque`, { userId: user.id_user, query });
    const [relatorioEntrada, relatorioSaida] = await Promise.all([
      Entrada.findAll({ 
        where: query,
        include: [{ association: 'Produto' }] // Certifique-se de que a associação 'produto' está definida no modelo Entrada
      }),
      Saida.findAll({ 
        where: query,
        include: [{ association: 'Produto' }] // Certifique-se de que a associação 'produto' está definida no modelo Saida
      })
    ]);

    const relatorio = configuraEstruturaDoRelatorio(relatorioEntrada, relatorioSaida);

    res.json(relatorio);
  } catch (error) {
    logger.error('Erro ao gerar relatório de estoque', { error });
    res.status(500).json({ error: 'Erro ao gerar relatório de estoque' });
  }
});

const configuraEstruturaDoRelatorio = (entradas, saidas) => {
  const parsedEntradas = entradas.map(entrada => ({
    tipo: 'Entrada',
    quantidade: entrada.quantidade,
    produto: entrada.Produto ? entrada.Produto.nome : entrada.id_produto, // Use o nome do produto se disponível
    data_hora: entrada.data_hora,
  }));

  const parsedSaidas = saidas.map(saida => ({
    tipo: 'Saída',
    quantidade: saida.quantidade,
    produto: saida.Produto ? saida.Produto.nome : saida.id_produto, // Use o nome do produto se disponível
    data_hora: saida.data_hora,
  }));

  return parsedEntradas.concat(parsedSaidas)
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
}

export default router;