import { Router } from 'express';
const router = Router();
import { User } from '../db.js';
import { generateToken } from '../token.js';
import logger from '../logger.js';
import Joi from 'joi';
import { validateJoi } from '../middlewares.js';

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Listar todos os usuarios
router.get('/usuario', async (req, res) => {
  try {
    logger.info('Listando todos os usuarios');
    const usuarios = await User.findAll();
    res.json(usuarios);
  } catch (error) {
    logger.error('Erro ao listar usuarios', { error });
    res.status(500).json({ error: 'Erro ao listar usuarios' });
  }
});

// Obter um usuario pelo ID
router.get('/usuario/:id', async (req, res) => {
  try {
    logger.info(`Obtendo usuario com ID: ${req.params.id}`);
    const usuario = await User.findByPk(req.params.id);
    if (usuario) {
      logger.info(`Usuario encontrado: ${usuario.username}`);
      res.json(usuario);
    } else {
      logger.warn(`Usuario com ID ${req.params.id} não encontrado`);
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao obter usuario', { error });
    res.status(500).json({ error: 'Erro ao obter usuario' });
  }
});

// Criar um novo usuario
router.post('/usuario', validateJoi(userSchema), async (req, res) => {
  try {
    logger.info('Criando novo usuario:', req.body);
    const novoUsuario = await User.create(req.body);
    logger.info(`Usuario criado com sucesso: ${novoUsuario.username}`);
    res.status(201).json(novoUsuario);
  } catch (error) {
    logger.error('Erro ao criar usuario', { error });
    res.status(500).json({ error: 'Erro ao criar usuario' });
  }
});

// Atualizar um usuario existente
router.put('/usuario/:id', validateJoi(userSchema), async (req, res) => {
  try {
    logger.info(`Atualizando usuario com ID: ${req.params.id}`, { usuario: req.body });
    const [updated] = await User.update(req.body, {
      where: { id_user: req.params.id }
    });
    if (updated) {
      logger.info(`Usuario com ID ${req.params.id} atualizado com sucesso`, { usuario: req.body });
      const usuarioAtualizado = await User.findByPk(req.params.id);
      res.json(usuarioAtualizado);
    } else {
      logger.warn(`Usuario com ID ${req.params.id} não encontrado para atualização`);
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao atualizar usuario', { error });
    res.status(500).json({ error: 'Erro ao atualizar usuario' });
  }
});

// Deletar um usuario
router.delete('/usuario/:id', async (req, res) => {
  try {
    logger.info(`Deletando usuario com ID: ${req.params.id}`);
    const deleted = await User.destroy({
      where: { id_user: req.params.id }
    });
    if (deleted) {
      logger.info(`Usuario com ID ${req.params.id} deletado com sucesso`);
      res.status(204).send();
    } else {
      logger.warn(`Usuario com ID ${req.params.id} não encontrado para deleção`);
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    logger.error('Erro ao deletar usuario', { error });
    res.status(500).json({ error: 'Erro ao deletar usuario' });
  }
});

router.post('/usuario/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      logger.warn('Dados incompletos para login');
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const usuario = await User.findOne({ where: { username, password } });
    if (usuario) {
      logger.info(`Login bem-sucedido para usuario: ${usuario.username}`);
      res.json({ message: 'Login bem-sucedido', token: generateToken(usuario) });
    } else {
      logger.warn('Login falhou: username ou password inválidos');
      res.status(401).json({ error: 'Username ou password inválidos' });
    }
  } catch (error) {
    logger.error('Erro ao realizar login', { error });
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

export default router;
