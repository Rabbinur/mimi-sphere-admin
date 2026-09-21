/**
 * MIMI SPHERE POS - Offline-First Engine & Automatic Background Sync Manager
 * Uses browser IndexedDB to safely persist:
 * 1. Product Catalog for offline search / barcode scanning
 * 2. Offline Orders Queue
 * 3. Offline Expenses Queue
 * Automatically syncs with backend when network connectivity is re-established.
 */

const DB_NAME = "mimi_pos_offline_db";
const DB_VERSION = 1;
const STORES = {
  PRODUCTS: "products_catalog",
  ORDERS: "offline_orders_queue",
  EXPENSES: "offline_expenses_queue",
} as const;

class PosOfflineSyncEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private syncInProgress = false;
  private listeners: Array<(state: { isOnline: boolean; isSyncing: boolean; pendingCount: number }) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initNetworkListeners();
    }
  }

  // Open / Upgrade IndexedDB
  private getDb(): Promise<IDBDatabase> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("IndexedDB is not available on server-side"));
    }

    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          db.createObjectStore(STORES.PRODUCTS, { keyPath: "_id" });
        }
        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          db.createObjectStore(STORES.ORDERS, { keyPath: "offline_id" });
        }
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          db.createObjectStore(STORES.EXPENSES, { keyPath: "offline_id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Network Listeners for Auto-Sync
  private initNetworkListeners() {
    window.addEventListener("online", () => {
      this.notifyListeners();
      // Wait 1.5s for connection stability, then trigger sync
      setTimeout(() => {
        this.triggerAutoSync();
      }, 1500);
    });

    window.addEventListener("offline", () => {
      this.notifyListeners();
    });
  }

  // --- PRODUCTS CACHE ---
  async cacheProductsLocally(products: any[]): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.PRODUCTS, "readwrite");
      const store = tx.objectStore(STORES.PRODUCTS);

      for (const p of products) {
        if (p && p._id) {
          store.put(p);
        }
      }
    } catch (e) {
      console.warn("Failed to cache products locally in IndexedDB:", e);
    }
  }

  async getCachedProducts(): Promise<any[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.PRODUCTS, "readonly");
        const store = tx.objectStore(STORES.PRODUCTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // --- ORDERS QUEUE ---
  async queueOfflineOrder(orderData: any): Promise<string> {
    const db = await this.getDb();
    const offlineId = `OFF-ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const offlineOrder = {
      ...orderData,
      offline_id: offlineId,
      receipt_number: offlineId,
      queued_at: new Date().toISOString(),
      sync_status: "pending",
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.ORDERS, "readwrite");
      const store = tx.objectStore(STORES.ORDERS);
      const req = store.put(offlineOrder);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    this.notifyListeners();
    return offlineId;
  }

  async getPendingOfflineOrders(): Promise<any[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.ORDERS, "readonly");
        const store = tx.objectStore(STORES.ORDERS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async removeOfflineOrder(offlineId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.ORDERS, "readwrite");
      tx.objectStore(STORES.ORDERS).delete(offlineId);
      this.notifyListeners();
    } catch (e) {
      console.warn("Failed to remove synced order from IndexedDB:", e);
    }
  }

  // --- EXPENSES QUEUE ---
  async queueOfflineExpense(expenseData: any): Promise<string> {
    const db = await this.getDb();
    const offlineId = `OFF-EXP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const offlineExpense = {
      ...expenseData,
      offline_id: offlineId,
      queued_at: new Date().toISOString(),
      sync_status: "pending",
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, "readwrite");
      const store = tx.objectStore(STORES.EXPENSES);
      const req = store.put(offlineExpense);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    this.notifyListeners();
    return offlineId;
  }

  async getPendingOfflineExpenses(): Promise<any[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.EXPENSES, "readonly");
        const store = tx.objectStore(STORES.EXPENSES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async removeOfflineExpense(offlineId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORES.EXPENSES, "readwrite");
      tx.objectStore(STORES.EXPENSES).delete(offlineId);
      this.notifyListeners();
    } catch (e) {
      console.warn("Failed to remove synced expense from IndexedDB:", e);
    }
  }

  // --- STATS & LISTENERS ---
  async getPendingCount(): Promise<number> {
    const [orders, expenses] = await Promise.all([
      this.getPendingOfflineOrders(),
      this.getPendingOfflineExpenses(),
    ]);
    return orders.length + expenses.length;
  }

  subscribe(listener: (state: { isOnline: boolean; isSyncing: boolean; pendingCount: number }) => void) {
    this.listeners.push(listener);
    this.notifyListeners();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyListeners() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const pendingCount = await this.getPendingCount();
    const state = {
      isOnline,
      isSyncing: this.syncInProgress,
      pendingCount,
    };
    this.listeners.forEach((l) => l(state));
  }

  // --- AUTOMATIC SYNC DISPATCHER ---
  async triggerAutoSync(
    callbacks?: {
      onSyncStart?: () => void;
      onSyncSuccess?: (result: { ordersCount: number; expensesCount: number }) => void;
      onSyncError?: (error: any) => void;
    }
  ): Promise<boolean> {
    if (this.syncInProgress) return false;
    if (typeof navigator !== "undefined" && !navigator.onLine) return false;

    const [orders, expenses] = await Promise.all([
      this.getPendingOfflineOrders(),
      this.getPendingOfflineExpenses(),
    ]);

    if (orders.length === 0 && expenses.length === 0) {
      return false;
    }

    this.syncInProgress = true;
    this.notifyListeners();
    callbacks?.onSyncStart?.();

    try {
      let syncedOrders = 0;
      let syncedExpenses = 0;

      // 1. Sync Orders
      if (orders.length > 0) {
        const token = typeof window !== "undefined" ? document.cookie.match(/adminAccessToken=([^;]+)/)?.[1] || "" : "";
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

        const res = await fetch(`${apiUrl}/admin/pos/sync-offline-orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ orders }),
        });

        if (res.ok) {
          const json = await res.json();
          const syncedList = json?.data?.orders || [];
          for (const item of syncedList) {
            if (item.status === "success" || item.status === "already_synced") {
              await this.removeOfflineOrder(item.offline_id);
              syncedOrders++;
            }
          }
        }
      }

      // 2. Sync Expenses
      if (expenses.length > 0) {
        const token = typeof window !== "undefined" ? document.cookie.match(/adminAccessToken=([^;]+)/)?.[1] || "" : "";
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

        const res = await fetch(`${apiUrl}/admin/pos/sync-offline-expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ expenses }),
        });

        if (res.ok) {
          const json = await res.json();
          const syncedList = json?.data?.expenses || [];
          for (const item of syncedList) {
            if (item.status === "success" || item.status === "already_synced") {
              await this.removeOfflineExpense(item.offline_id);
              syncedExpenses++;
            }
          }
        }
      }

      this.syncInProgress = false;
      this.notifyListeners();
      callbacks?.onSyncSuccess?.({ ordersCount: syncedOrders, expensesCount: syncedExpenses });
      return true;
    } catch (err) {
      console.error("Auto-sync error:", err);
      this.syncInProgress = false;
      this.notifyListeners();
      callbacks?.onSyncError?.(err);
      return false;
    }
  }
}

export const posOfflineSync = new PosOfflineSyncEngine();
