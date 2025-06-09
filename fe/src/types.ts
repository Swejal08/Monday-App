export interface FactorFormData {
  factor: number;
}

export interface MondayContext {
  data: {
    itemId: string;
    itemName: string;
    boardId: string;
  };
}

export interface CalculationLogResponse {
  data: {
    _id: string;
    number: number;
    factor: number;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
