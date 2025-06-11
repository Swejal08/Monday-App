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
}
