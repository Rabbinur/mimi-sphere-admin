import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  id: string; 
  name?: string;
  price: any;
  quantity: number;
  thumbnail?: string;
}

interface OrderState {
  orders: OrderItem[];
}

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<OrderItem>) => {
      const item = action.payload;
      const existingItem = state.orders.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        state.orders.push({
          ...item,
          id: String(item.id),
          quantity: item.quantity || 1,
        });
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(
        (i) => String(i.id) !== String(action.payload)
      );
    },
    updateOrderQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.orders.find((i) => i.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { addOrder, removeOrder, updateOrderQuantity, clearOrders } =
  orderSlice.actions;
export default orderSlice.reducer;
