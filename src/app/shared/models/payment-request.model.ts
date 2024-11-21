export interface CustomPaymentRequest {
  amount: number;
  method: string;
  date: string;
  state: string;
  item_id: number;
  user_id: number;
}

export interface CustomPaymentUpdate {
  amount?: number;
  method?: string;
  date?: string;
  state?: string;
  item_id?: number;
  user_id?: number;
}