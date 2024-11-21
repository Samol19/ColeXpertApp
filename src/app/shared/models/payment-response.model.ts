export interface CustomPaymentResponse {
  id?: number;
  amount: number;
  method: string;
  date: string;
  state: string;
  item_id: number;
  user_id: number;
  item_name?: string;
  user_name?: string;
}