const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Usa a porta do Render ou 3000 como fallback

// Configuração do pool de conexão com o Neon
const pool = new Pool({
  connectionString:
    'postgresql://neondb_owner:npg_YT4Pse6SzfOC@ep-calm-violet-acy8r6nl-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require', // Substitua pela sua string
  ssl: {
    rejectUnauthorized: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produtos_historico ORDER BY data ASC'
    );
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

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
