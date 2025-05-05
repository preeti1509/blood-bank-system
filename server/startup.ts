import { db, pool } from './db';
import { seedDatabase } from './seed';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export async function initializeDatabase() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');

    console.log('Starting database seeding...');
    await seedDatabase();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  } finally {
    await pool.end();
  }
} 
