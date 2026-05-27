export type OrderStatus = 'pending' | 'paid' | 'shipped';

export interface OrderItem {
  id?: string;
  partId?: string;
  orderId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrder {
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  totalPrice: number;
  items: OrderItem[];
}

export interface Order extends CreateOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
