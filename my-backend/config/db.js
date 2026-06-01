import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load my-backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test connection on boot
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL Database connected successfully.'))
  .catch((err) => console.error('❌ Database connection failed:', err.stack));

export const query = (text, params) => pool.query(text, params);
export default { query };