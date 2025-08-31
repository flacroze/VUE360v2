require('dotenv').config();
import { createPool } from 'mysql2/promise';

// Configuration de la connexion à MariaDB
const poolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3307', 10),
  connectionLimit: 10,
};

const pool = createPool(poolOptions);

export default pool;