import { db, pool } from './db';
import { seedDatabase } from './seed';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function initializeDatabase() {
  try {
    console.log('Pushing database schema...');
    await execAsync('npm run db:push');
    console.log('Database schema pushed successfully');

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
