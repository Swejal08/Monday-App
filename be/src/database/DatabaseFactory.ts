import { IDatabase } from './interfaces/IDatabase';
import { MongoDatabase } from './implementations/MongoDatabase';

export enum DatabaseType {
  MONGODB = 'mongodb',
}

export class DatabaseFactory {
  static create(type: DatabaseType): IDatabase {
    switch (type) {
      case DatabaseType.MONGODB:
        const username = process.env.MONGO_USERNAME;
        const password = process.env.MONGO_PASSWORD;
        const database = process.env.MONGO_DATABASE;
        const port = process.env.MONGO_PORT;

        // const connectionString = `mongodb://${username}:${password}@mongodb:${port}/${database}?authSource=admin`;
        const connectionString =
          'mongodb+srv://swejalshrestha08:waAi3WIrlhAWcaKw@cluster0.v3018in.mongodb.net/';
        return new MongoDatabase(connectionString);

      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}

// Singleton pattern for database instance
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
