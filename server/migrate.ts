import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'migrations' });
  console.log('Migrations completed successfully');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed');
  console.error(err);
  process.exit(1);
}); 