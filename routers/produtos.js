import { Router } from 'express';
const router = Router();
import { Produto } from '../db.js';
import { getUserFromToken } from '../token.js';
import logger from '../logger.js';
import { validateJoi } from '../middlewares.js';
import Joi from 'joi';

const produtoSchema = Joi.object({
  nome: Joi.string().required(),
  cod_barra: Joi.string().required(),
  quantidade: Joi.number().integer().min(0).required(),
  validade: Joi.date(),
  user: Joi.number().integer().required()
});
// Listar todos os produtos
router.get('/produtos', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao listar produtos');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    logger.info(`Usuário ${user.username} listando produtos`, { userId: user.id_user });
    const produtos = await Produto.findAll({ where: { user: user.id_user } });
    res.json(produtos);
  } catch (error) {
    logger.error('Erro ao listar produtos', { error });
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Obter um produto pelo ID
router.get('/produtos/:id', async (req, res) => {
  try {
    logger.info(`Usuário solicitando produto com ID ${req.params.id}`);
    const produto = await Produto.findByPk(req.params.id);
    if (produto) {
      logger.info(`Produto encontrado: ${produto.nome}`, { produtoId: produto.id_produto });
      res.json(produto);
    } else {
      logger.warn(`Produto com ID ${req.params.id} não encontrado`);
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao obter produto', { error });
    res.status(500).json({ error: 'Erro ao obter produto' });
  }
});

// Criar um novo produto
router.post('/produtos', validateJoi(produtoSchema), async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error('Usuário não autenticado ao criar produto');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    logger.info(`Usuário ${user.username} criando novo produto`, { produto: req.body });
    const novoProduto = await Produto.create({...req.body, user: user.id_user });
    res.status(201).json(novoProduto);
  } catch (error) {
    logger.error('Erro ao criar produto', { error });
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar um produto existente
router.put('/produtos/:id', validateJoi(produtoSchema), async (req, res) => {
  try {
    logger.info(`Usuário solicitando atualização do produto com ID ${req.params.id}`, { produto: req.body });
    const [updated] =  await Produto.update(req.body, {
      where: { id_produto: req.params.id }
    });
    if (updated) {
      logger.info(`Produto com ID ${req.params.id} atualizado com sucesso`, { produto: req.body })
      const produtoAtualizado = await Produto.findByPk(req.params.id);
      res.json(produtoAtualizado);
    } else {
      logger.warn(`Produto com ID ${req.params.id} não encontrado para atualização`);
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao atualizar produto', { error });
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar um produto
router.delete('/produtos/:id', async (req, res) => {
  try {
    logger.info(`Usuário solicitando deleção do produto com ID ${req.params.id}`);
    const deleted = await Produto.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      logger.info(`Produto com ID ${req.params.id} deletado com sucesso`);
      res.status(204).send();
    } else {
      logger.warn(`Produto com ID ${req.params.id} não encontrado para deleção`);
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao deletar produto', { error });
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
