const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Parse connection string from Azure (DATABASE_URL or CUSTOMCONNSTR_DefaultConnection)
const connStr = process.env.DATABASE_URL || process.env.CUSTOMCONNSTR_DefaultConnection || '';

function parseConnectionString(str) {
  if (!str) return null;
  const parts = {};
  str.split(';').forEach(part => {
    const [key, ...vals] = part.split('=');
    if (key && vals.length) parts[key.trim().toLowerCase()] = vals.join('=').trim();
  });
  const server = (parts['server'] || '').replace('tcp:', '').split(',')[0];
  return {
    server: server,
    database: parts['initial catalog'] || parts['database'] || '',
    user: parts['user id'] || parts['username'] || parts['user'] || '',
    password: parts['password'] || '',
    options: { encrypt: true, trustServerCertificate: false }
  };
}

const dbConfig = parseConnectionString(connStr);
let pool = null;

async function getPool() {
  if (!dbConfig) return null;
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

app.get('/', (req, res) => {
  res.json({ service: 'be-node-orders', status: 'running', databaseConnected: !!dbConfig });
});

app.get('/api/orders', async (req, res) => {
  if (!dbConfig) {
    return res.json({ source: 'no-database', data: [] });
  }
  try {
    const db = await getPool();
    const result = await db.request().query('SELECT Id, ProductName, Quantity, TotalAmount, Status, OrderDate FROM NodeOrders');
    res.json({ source: 'database', data: result.recordset });
  } catch (err) {
    res.json({ source: 'error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Orders API running on port ${PORT}`);
});
