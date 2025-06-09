export interface IItem {
  _id?: string;
  number: number;
  factor: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICalculationLog {
  _id?: string;
  item_id: string;
  number: number;
  factor: number;
  created_at: Date;
}

export interface IDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Item operations
  createItem(
    item: Omit<IItem, '_id' | 'created_at' | 'updated_at'>
  ): Promise<IItem>;
  getItemById(id: string): Promise<IItem | null>;
  getAllItems(): Promise<IItem[]>;
  updateItem(
    id: string,
    updates: Partial<Omit<IItem, '_id' | 'created_at'>>
  ): Promise<IItem | null>;
  deleteItem(id: string): Promise<boolean>;

  // Calculation Log operations
  createCalculationLog(
    log: Omit<ICalculationLog, '_id' | 'created_at'>
  ): Promise<ICalculationLog>;
  getCalculationLogsByItemId(itemId: string): Promise<ICalculationLog[]>;
  getAllCalculationLogs(): Promise<ICalculationLog[]>;
}
