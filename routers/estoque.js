import { Router } from 'express';
const router = Router();
import { Entrada, Saida } from '../db.js';
import { getUserFromToken } from '../token.js';
import logger from '../logger.js';

router.post('/estoque/entrada', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao registrar entrada de estoque');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    logger.info(`Usuário ${user.username} registrando entrada de estoque`, { entrada: req.body });
    const novaEntrada = await Entrada.create({...req.body, user: user.id_user });
    res.status(201).json(novaEntrada);
  } catch (error) {
    logger.error('Erro ao registrar entrada de estoque', { error });
    res.status(500).json({ error: 'Erro ao registrar entrada de estoque' });
  }
});

router.post('/estoque/saida', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao registrar saída de estoque');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    logger.info(`Usuário ${user.username} registrando saída de estoque`, { saida: req.body });
    const novaSaida = await Saida.create({...req.body, user: user.id_user });
    res.status(201).json(novaSaida);
  } catch (error) {
    logger.error('Erro ao registrar saída de estoque', { error });
    res.status(500).json({ error: 'Erro ao registrar saída de estoque' });
  }
});

export default router;