const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do pool de conexão com o Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos_historico ORDER BY data ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Rota para buscar lançamentos de um produto específico
app.get('/produtos/:nome/lancamentos', async (req, res) => {
  const { nome } = req.params;
  const { ano } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM produtos_historico WHERE nome = $1 AND EXTRACT(YEAR FROM data) = $2 ORDER BY data ASC',
      [nome, ano]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar lançamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar lançamentos' });
  }
});

app.post('/produtos', async (req, res) => {
  const { nome, categoria, empresa, data, valor_unitario } = req.body;
  console.log('Dados recebidos:', req.body);
  if (!nome || !categoria || !empresa || !data || !valor_unitario) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO produtos_historico (nome, categoria, empresa, data, valor_unitario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, categoria, empresa, data, valor_unitario]
    );
    console.log('Produto inserido:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    res.status(500).json({ error: 'Erro ao adicionar produto', details: err.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});