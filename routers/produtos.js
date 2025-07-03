import { Router } from 'express';
const router = Router();
import { Produto } from '../db.js';
import { getUserFromToken } from '../token.js';

// Listar todos os produtos
router.get('/produtos', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const produtos = await Produto.findAll({ where: { user: user.id_user } });
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Obter um produto pelo ID
router.get('/produtos/:id', async (req, res) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter produto' });
  }
});

// Criar um novo produto
router.post('/produtos', async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    const novoProduto = await Produto.create({...req.body, user: user.id_user });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar um produto existente
router.put('/produtos/:id', async (req, res) => {
  try {
    const [updated] =  await Produto.update(req.body, {
      where: { id_produto: req.params.id }
    });
    if (updated) {
      const produtoAtualizado = await Produto.findByPk(req.params.id);
      res.json(produtoAtualizado);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar um produto
router.delete('/produtos/:id', async (req, res) => {
  try {
    const deleted = await Produto.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
