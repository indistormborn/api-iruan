import { Router } from 'express';
const router = Router();
import { Entrada, Saida } from '../db.js';
import { Op } from 'sequelize';
import { getUserFromToken } from '../token.js';
import logger from '../logger.js';

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

    const query = { user: user.id_user, data_hora: {} };
    if(body.data_inicio && body.data_fim) {
      query.data_hora = {
        [Op.between]: [body.data_inicio, body.data_fim]
      };
    }

    if(!body.data_inicio && body.data_fim) {
      query.data_hora = {
        [Op.lte]: body.data_fim
      };
    }

    if(body.data_inicio && !body.data_fim) {
      query.data_hora = {
        [Op.gte]: body.data_inicio
      };
    }

    logger.info(`Usuário ${user.username} gerando relatório de estoque`, { userId: user.id_user, query });

    const [relatorioEntrada, relatorioSaida] = await Promise.all([
      Entrada.findAll({ where: query }),
      Saida.findAll({ where: query })
    ]);

    const relatorio = relatorioEntrada.concat(relatorioSaida).sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

    res.json(relatorio);
  } catch (error) {
    logger.error('Erro ao gerar relatório de estoque', { error });
    res.status(500).json({ error: 'Erro ao gerar relatório de estoque' });
  }
});

export default router;