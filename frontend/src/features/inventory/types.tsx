export type Part = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  active: boolean;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartFilters = {
  page: number;
  size: number;
  search: string;
};

export type PartPageResponse = {
  content: Part[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type CreatePartValues = {
  sku: string;
  name: string;
  unit: string;
  reorderLevel: number;
};

export type UpdatePartValues = {
  name: string;
  unit: string;
  reorderLevel: number;
};

export type StockInValues = {
  quantity: number;
  unitCost: number;
  note: string;
};

export type InventoryTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";

export type InventoryTransaction = {
  id: string;
  partId: string;
  partName: string;
  serviceRequestId: string | null;
  transactionType: InventoryTransactionType;
  quantity: number;
  unitCost: number;
  note: string | null;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
};
