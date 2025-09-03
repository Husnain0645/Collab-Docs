import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './src/auth/entities/user.entity';

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'collab_docs',
  entities: [User],
  migrations: [__dirname + '/src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Never true in production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true',
});
