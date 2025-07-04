import { Router } from "express";
const router = Router();
import { Entrada, Saida } from "../db.js";
import { Op } from "sequelize";
import { getUserFromToken } from "../token.js";
import logger from "../logger.js";

router.post("/relatorio/estoque", async (req, res) => {
  try {
    const user = getUserFromToken(req, res);
    if (!user) {
      logger.error("Usuário não autenticado");
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    const body = req.body;
    if (!body || !body.data_inicio || !body.data_fim) {
      logger.warn("Dados de início ou fim são obrigatórios");
      return res
        .status(400)
        .json({ error: "Dados de início ou fim são obrigatórios" });
    }

    logger.info(`Usuário ${user.username} solicitando relatório de estoque`, {
      data_inicio: body.data_inicio,
      data_fim: body.data_fim,
    });

    const dataInicio = body.data_inicio ? new Date(body.data_inicio) : null;
    const dataFim = body.data_fim ? new Date(body.data_fim) : null;
    const query = { user: user.id_user };

    logger.info(`Usuário ${user.username} gerando relatório de estoque`, {
      query: JSON.stringify(query),
    });
    const [relatorioEntrada, relatorioSaida] = await Promise.all([
      Entrada.findAll({
        where: query,
        include: [{ association: "Produto" }], // Certifique-se de que a associação 'produto' está definida no modelo Entrada
      }).then((entradas) => {
        return entradas
          .filter((entrada) => {
            const data = new Date(entrada.data_hora);
            data.setHours(0, 0, 0, 0);
            return (
              (!dataInicio || data >= dataInicio) &&
              (!dataFim || data <= dataFim)
            );
          })
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      }),
      Saida.findAll({
        where: query,
        include: [{ association: "Produto" }], // Certifique-se de que a associação 'produto' está definida no modelo Saida
      }).then((saidas) => {
        return saidas
          .filter((saida) => {
            const data = new Date(saida.data_hora);
            data.setHours(0, 0, 0, 0);

            return (
              (!dataInicio || data >= dataInicio) &&
              (!dataFim || data <= dataFim)
            );
          })
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      }),
    ]);

    const relatorio = configuraEstruturaDoRelatorio(
      relatorioEntrada,
      relatorioSaida
    );

    res.json(relatorio);
  } catch (error) {
    logger.error("Erro ao gerar relatório de estoque", { error });
    res.status(500).json({ error: "Erro ao gerar relatório de estoque" });
  }
});

const configuraEstruturaDoRelatorio = (entradas, saidas) => {
  const parsedEntradas = entradas.map((entrada) => ({
    tipo: "Entrada",
    quantidade: entrada.quantidade,
    produto: entrada.Produto ? entrada.Produto.nome : entrada.id_produto, // Use o nome do produto se disponível
    data_hora: entrada.data_hora,
  }));

  const parsedSaidas = saidas.map((saida) => ({
    tipo: "Saída",
    quantidade: saida.quantidade,
    produto: saida.Produto ? saida.Produto.nome : saida.id_produto, // Use o nome do produto se disponível
    data_hora: saida.data_hora,
  }));

  return parsedEntradas
    .concat(parsedSaidas)
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
};

export default router;
