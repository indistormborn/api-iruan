import { Router } from 'express';
const router = Router();
import { Entrada, Saida } from '../db.js';
import { getUserFromToken } from '../token.js';

router.post('/estoque/entrada', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const novaEntrada = await Entrada.create({...req.body, user: user.id_user });
    res.status(201).json(novaEntrada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar entrada de estoque' });
  }
});

router.post('/estoque/saida', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const novaSaida = await Saida.create({...req.body, user: user.id_user });
    res.status(201).json(novaSaida);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar saída de estoque' });
  }
});

export default router;