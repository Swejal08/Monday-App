import { IDatabase } from './interfaces/IDatabase';
import { MongoDatabase } from './implementations/MongoDatabase';

export enum DatabaseType {
  MONGODB = 'mongodb',
}

export class DatabaseFactory {
  static create(type: DatabaseType): IDatabase {
    switch (type) {
      case DatabaseType.MONGODB:
        const connectionString = process.env.MONGODB_URL;
        return new MongoDatabase(connectionString);

      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}

let databaseInstance: IDatabase | null = null;

export const getDatabaseInstance = (): IDatabase => {
  if (!databaseInstance) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return databaseInstance;
};

export const initializeDatabase = (type: DatabaseType) => {
  const databaseInstance = DatabaseFactory.create(type);
  databaseInstance.connect();
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (databaseInstance) {
    await databaseInstance.disconnect();
    databaseInstance = null;
  }
};
