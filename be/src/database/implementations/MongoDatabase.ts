import mongoose from 'mongoose';
import { IDatabase, IItem, ICalculationLog } from '../interfaces/IDatabase';
import { Item } from '../models/Item';
import { CalculationLog } from '../models/CalculationLog';

export class MongoDatabase implements IDatabase {
  private connectionString: string;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(this.connectionString);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  // Item operations
  async createItem(
    item: Omit<IItem, '_id' | 'created_at' | 'updated_at'>
  ): Promise<IItem> {
    try {
      const newItem = new Item(item);
      const savedItem = await newItem.save();
      return {
        _id: savedItem._id.toString(),
        number: savedItem.number,
        factor: savedItem.factor,
        created_at: savedItem.created_at,
        updated_at: savedItem.updated_at,
      };
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async getItemById(id: string): Promise<IItem | null> {
    try {
      const item = await Item.findById(id);
      if (!item) return null;

      return {
        _id: item._id.toString(),
        number: item.number,
        factor: item.factor,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    } catch (error) {
      console.error('Error getting item by id:', error);
      throw error;
    }
  }

  async getAllItems(): Promise<IItem[]> {
    try {
      const items = await Item.find();
      return items.map((item) => ({
        _id: item._id.toString(),
        number: item.number,
        factor: item.factor,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      console.error('Error getting all items:', error);
      throw error;
    }
  }

  async updateItem(
    id: string,
    updates: Partial<Omit<IItem, '_id' | 'created_at'>>
  ): Promise<IItem | null> {
    try {
      const updatedItem = await Item.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedItem) return null;

      return {
        _id: updatedItem._id.toString(),
        number: updatedItem.number,
        factor: updatedItem.factor,
        created_at: updatedItem.created_at,
        updated_at: updatedItem.updated_at,
      };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      const result = await Item.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // Calculation Log operations
  async createCalculationLog(
    log: Omit<ICalculationLog, '_id' | 'created_at'>
  ): Promise<ICalculationLog> {
    try {
      const newLog = new CalculationLog(log);
      const savedLog = await newLog.save();
      return {
        _id: savedLog._id.toString(),
        item_id: savedLog.item_id.toString(),
        number: savedLog.number,
        factor: savedLog.factor,
        created_at: savedLog.created_at,
      };
    } catch (error) {
      console.error('Error creating calculation log:', error);
      throw error;
    }
  }

  async getCalculationLogsByItemId(itemId: string): Promise<ICalculationLog[]> {
    try {
      const logs = await CalculationLog.find({ item_id: itemId }).sort({
        created_at: -1,
      });
      return logs.map((log) => ({
        _id: log._id.toString(),
        item_id: log.item_id.toString(),
        number: log.number,
        factor: log.factor,
        created_at: log.created_at,
      }));
    } catch (error) {
      console.error('Error getting calculation logs by item id:', error);
      throw error;
    }
  }

  async getAllCalculationLogs(): Promise<ICalculationLog[]> {
    try {
      const logs = await CalculationLog.find().sort({ created_at: -1 });
      return logs.map((log) => ({
        _id: log._id.toString(),
        item_id: log.item_id.toString(),
        number: log.number,
        factor: log.factor,
        created_at: log.created_at,
      }));
    } catch (error) {
      console.error('Error getting all calculation logs:', error);
      throw error;
    }
  }
}
