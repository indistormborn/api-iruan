import { Sequelize, DataTypes } from 'sequelize';


Sequelize.afterConnect(() => {
  console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

Sequelize.afterDisconnect(() => {
  console.log('Conexão com o banco de dados encerrada.');
});

const sequelize = new Sequelize('stockpro', 'postgres', 'postgres', {
  host: "stockpro.cdwmm22cqnql.sa-east-1.rds.amazonaws.com",
  dialect: 'postgres',
  dialectOptions: { //< Add this
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: DataTypes.STRING,
  password: DataTypes.STRING,
});

const Produto = sequelize.define('Produto', {
  id_produto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: DataTypes.STRING,
  cod_barra: DataTypes.STRING,
  quantidade: DataTypes.INTEGER,
  validade: DataTypes.DATE,
  user: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_user',
    },
  },
});

const Entrada = sequelize.define('Entrada', {
  id_entrada: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_produto: {
    type: DataTypes.INTEGER,
    references: {
      model: Produto,
      key: 'id_produto',
    },
  },
  quantidade: DataTypes.INTEGER,
  data_hora: DataTypes.DATE,
  user: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_user',
    },
  },
});

const Saida = sequelize.define('Saida', {
  id_saida: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_produto: {
    type: DataTypes.INTEGER,
    references: {
      model: Produto,
      key: 'id_produto',
    },
  },
  quantidade: DataTypes.INTEGER,
  data_hora: DataTypes.DATE,
  user: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id_user',
    },
  },
});

// Associations
Produto.hasMany(Entrada, { foreignKey: 'id_produto' });
Entrada.belongsTo(Produto, { foreignKey: 'id_produto' });

Produto.hasMany(Saida, { foreignKey: 'id_produto' });
Saida.belongsTo(Produto, { foreignKey: 'id_produto' });

sequelize.getQueryInterface().showAllTables().then(async (tables) => {
  const requiredTables = ['Users', 'Produtos', 'Entradas', 'Saidas'];
  const missingTables = requiredTables.filter(
    (table) => !tables.map(t => t.toLowerCase()).includes(table.toLowerCase())
  );
  if (missingTables.length > 0) {
    await sequelize.sync();
    console.log('Tabelas criadas:', missingTables);
  } else {
    console.log('Todas as tabelas já existem.');
  }
});

export { sequelize, User, Produto, Entrada, Saida };