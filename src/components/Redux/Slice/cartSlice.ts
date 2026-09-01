// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   id: string;
//   name?: string;
//   price: any;
//   quantity: number;
//   thumbnail?: string;
// }

// interface CartState {
//   cartItems: CartItem[];
// }

// const initialState: CartState = {
//   cartItems: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart: (state, action: PayloadAction<CartItem>) => {
//       const item = action.payload;
//       const existingItem = state.cartItems.find((i) => i.id === item.id);
//       if (existingItem) {
//         existingItem.quantity += item.quantity || 1;
//       } else {
//         // Ensure item.id is a string here (if it's coming in as a number)
//         state.cartItems.push({
//           ...item,
//           id: String(item.id),
//           quantity: item.quantity || 1,
//         });
//       }
//     },
//     removeFromCart: (state, action: PayloadAction<string>) => {
//       state.cartItems = state.cartItems.filter(
//         (i) => String(i.id) !== String(action.payload)
//       );
//     },

//     updateQuantity: (
//       state,
//       action: PayloadAction<{ id: string; quantity: number }>
//     ) => {
//       const { id, quantity } = action.payload;
//       const item = state.cartItems.find((i) => i.id === id);
//       if (item && quantity > 0) {
//         item.quantity = quantity;
//       }
//     },
//     clearCart: (state) => {
//       state.cartItems = [];
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } =
//   cartSlice.actions;
// export default cartSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SelectedVariantValues = Record<string, string>;

export interface CartItem {
  // deterministic id composed from product_id + variant_id (see addToCart)
  id: string;
  product_id: string;
  variant_id?: string | null;
  title: string;
  thumbnail?: string;
  price: number; // snapshot price at time of add
  quantity: number;
  is_free_delivery?: boolean;
  selected_variant_values?: SelectedVariantValues;
}

export interface CartState {
  cartItems: CartItem[];
}

const initialState: CartState = {
  cartItems: [],
};

/**
 * Helper: build deterministic id so same product+variant merges
 * If variant_id is null/undefined we use product_id only.
 */
const buildCartItemId = (product_id: string, variant_id?: string | null) =>
  variant_id ? `${product_id}::${variant_id}` : `${product_id}::default`;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * payload should contain at least:
     * { product_id, title, price, quantity }
     * optional: variant_id, thumbnail, selected_variant_values
     */
    addToCart: (
      state,
      action: PayloadAction<
        Omit<CartItem, "id"> & { variant_id?: string | null }
      >
    ) => {
      const {
        product_id,
        variant_id = null,
        title,
        thumbnail,
        price,
        quantity = 1,
        is_free_delivery = false,
        selected_variant_values,
      } = action.payload;

      const id = buildCartItemId(product_id, variant_id);

      const existingItem = state.cartItems.find((i) => i.id === id);

      if (existingItem) {
        // Update quantity and refresh properties from the latest add
        existingItem.quantity += quantity;
        existingItem.price = price;
        existingItem.is_free_delivery = is_free_delivery;
        if (selected_variant_values) {
          existingItem.selected_variant_values = selected_variant_values;
        }
      } else {
        state.cartItems.push({
          id,
          product_id,
          variant_id: variant_id ?? null,
          title,
          thumbnail,
          price,
          quantity,
          is_free_delivery,
          selected_variant_values,
        });
      }
    },

    /**
     * Remove by the deterministic id (you can pass product+variant constructed id,
     * or use buildCartItemId(productId, variantId) when dispatching)
     */
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
    },

    /**
     * Update quantity by cart item id
     */
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id === id);
      if (item) {
        if (quantity <= 0) {
          // remove if quantity set to 0 or less
          state.cartItems = state.cartItems.filter((i) => i.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
    },

    /**
     * Optional: replace entire cart (useful when rehydrating from server)
     */
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.cartItems = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } =
  cartSlice.actions;
export default cartSlice.reducer;

/* --------------------
   Selectors (use in components)
   -------------------- */

export const selectCartItems = (state: { cart: CartState }) =>
  state.cart.cartItems;

export const selectCartTotalQuantity = (state: { cart: CartState }) =>
  state.cart.cartItems.reduce((sum, it) => sum + it.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

/* Helper export for building ids when dispatching from components */
export { buildCartItemId };
