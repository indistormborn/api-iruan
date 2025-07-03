import { Router } from 'express';
const router = Router();
import { User } from '../db.js';
import { generateToken } from '../token.js';

// Listar todos os usuarios
router.get('/usuario', async (req, res) => {
  try {
    const usuarios = await User.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuarios' });
  }
});

// Obter um usuario pelo ID
router.get('/usuario/:id', async (req, res) => {
  try {
    const usuario = await User.findByPk(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter usuario' });
  }
});

// Criar um novo usuario
router.post('/usuario', async (req, res) => {
  try {
    console.info('Criando novo usuario:', req.body);
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }
    const novoUsuario = await User.create(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuario' });
  }
});

// Atualizar um usuario existente
router.put('/usuario/:id', async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { id_user: req.params.id }
    });
    if (updated) {
      const usuarioAtualizado = await User.findByPk(req.params.id);
      res.json(usuarioAtualizado);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuario' });
  }
});

// Deletar um usuario
router.delete('/usuario/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { id_user: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuario' });
  }
});

router.post('/usuario/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    const usuario = await User.findOne({ where: { username, password } });
    if (usuario) {
      res.json({ message: 'Login bem-sucedido', token: generateToken(usuario) });
    } else {
      res.status(401).json({ error: 'Username ou password inválidos' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

export default router;
