import { Router } from 'express';
const router = Router();
import { Entrada, Produto, Saida } from '../db.js';
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
    
    const produto = await Produto.findByPk(req.body.id_produto);
    if (!produto) {
      logger.error('Produto não encontrado ao registrar entrada de estoque', { id_produto: req.body.id_produto });
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    produto.quantidade += req.body.quantidade;
    await produto.save();
    // Registrar a entrada no histórico
    logger.info(`Entrada registrada para o produto ${produto.nome}`, { quantidade: req.body.quantidade });
    await Entrada.create({...req.body, user: user.id_user });

    res.status(201).json(produto);
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

    const produto = await Produto.findByPk(req.body.id_produto);
    if (!produto) {
      logger.error('Produto não encontrado ao registrar saída de estoque', { id_produto: req.body.id_produto });
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (produto.quantidade < req.body.quantidade) {
      logger.warn('Quantidade insuficiente em estoque para registrar saída', { produto: produto.nome, quantidade: req.body.quantidade });
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
    }

    produto.quantidade -= req.body.quantidade;
    await produto.save();

    logger.info(`Usuário ${user.username} registrando saída de estoque`, { saida: req.body });
    await Saida.create({...req.body, user: user.id_user });
    res.status(201).json(produto);
  } catch (error) {
    logger.error('Erro ao registrar saída de estoque', { error });
    res.status(500).json({ error: 'Erro ao registrar saída de estoque' });
  }
});

router.get('/estoque/entrada', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao listar entradas de estoque');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const entradas = await Entrada.findAll({
      where: { user: user.id_user },
      include: [{ association: 'Produto' }]
    });

    res.json(entradas.map(entrada => ({
      produto: entrada.Produto ? entrada.Produto.nome : entrada.id_produto,
      quantidade: entrada.quantidade,
      data_hora: entrada.data_hora,
    })));
  } catch (error) {
    logger.error('Erro ao listar entradas de estoque', { error });
    res.status(500).json({ error: 'Erro ao listar entradas de estoque' });
  }
});

router.get('/estoque/saida', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao listar saídas de estoque');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const saidas = await Saida.findAll({
      where: { user: user.id_user },
      include: [{ association: 'Produto' }]
    });

    res.json(saidas.map(saida => ({
      produto: saida.Produto ? saida.Produto.nome : saida.id_produto,
      quantidade: saida.quantidade,
      data_hora: saida.data_hora,
    })));
  } catch (error) {
    logger.error('Erro ao listar saídas de estoque', { error });
    res.status(500).json({ error: 'Erro ao listar saídas de estoque' });
  }
});

export default router;