export interface ShoppingList {
  _id: string;
  name: string;
  storeId?: string | null;
  createdAt: string;
}

export interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  completed: boolean;
  order: number;
  listId: string;
  categoryId?: string | null;
  createdAt: string;
}

export interface ShoppingCategory {
  _id: string;
  name: string;
  createdAt: string;
}

export interface ShoppingStore {
  _id: string;
  name: string;
  createdAt: string;
}

export interface ListDetails {
  list: ShoppingList;
  items: ShoppingItem[];
}

export interface ProductSuggestion {
  name: string;
  count: number;
}

export interface PriceComparisonOccurrence {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  listName: string;
  storeName: string;
  priceRank: 'highest' | 'lowest' | 'normal';
  createdAt: string;
}

export interface PriceComparisonResult {
  query: string;
  productName: string;
  totalOccurrences: number;
  occurrences: PriceComparisonOccurrence[];
}

export type CreateListRequest = Pick<ShoppingList, 'name'> &
  Partial<Pick<ShoppingList, 'storeId'>>;

export type CreateItemRequest = Pick<ShoppingItem, 'name' | 'quantity'> &
  Partial<Pick<ShoppingItem, 'price' | 'categoryId'>>;

export type UpdateItemRequest = Partial<
  Pick<ShoppingItem, 'name' | 'quantity' | 'price' | 'completed' | 'categoryId'>
>;
