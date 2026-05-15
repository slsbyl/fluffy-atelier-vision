import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface StockItem {
  productId: string;
  size: string;
  quantity: number;
}

/**
 * Get current product stock
 * Returns the total available stock or stock by size if available
 */
export const getProductStock = async (productId: string) => {
  try {
    const response = await api.get(`/products/${productId}`);
    if (response.data.status === "success") {
      return response.data.data.product.stock || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return 0;
  }
};

/**
 * Check if there's enough stock for the requested items
 */
export const checkAvailableStock = async (
  productId: string,
  requestedQuantity: number
): Promise<boolean> => {
  try {
    const stock = await getProductStock(productId);
    return stock >= requestedQuantity;
  } catch (error) {
    console.error("Error checking stock:", error);
    return false;
  }
};

/**
 * Update product stock after successful order
 * Should be called after order is confirmed on backend
 */
export const updateProductStock = async (
  productId: string,
  quantityDecrement: number
): Promise<boolean> => {
  try {
    const response = await api.patch(`/products/${productId}/stock`, {
      decrement: quantityDecrement,
    });
    return response.data.status === "success";
  } catch (error) {
    console.error("Error updating product stock:", error);
    return false;
  }
};

/**
 * Place order and update stock
 * Backend should handle stock updates as part of order processing
 */
export const placeOrder = async (orderData: {
  customerName: string;
  phone: string;
  address: string;
  governorate: string;
  shippingFee: number;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}) => {
  try {
    // Validate before sending
    if (!orderData.customerName?.trim() || !orderData.phone?.trim() || !orderData.address?.trim() || !orderData.governorate?.trim()) {
      return {
        success: false,
        message: "الرجاء ملء جميع بيانات التوصيل والمحافظة",
      };
    }

    if (!orderData.items || orderData.items.length === 0) {
      return {
        success: false,
        message: "السلة فارغة",
      };
    }

    const response = await api.post("/orders", {
      customerName: orderData.customerName,
      phone: orderData.phone,
      address: orderData.address,
      governorate: orderData.governorate,
      shippingFee: orderData.shippingFee,
      items: orderData.items
    });

    // Handle successful response
    if (response && response.data && response.data.status === "success") {
      return {
        success: true,
        orderId: response.data.data?.orderId || response.data.data?._id || `ORD-${Date.now()}`,
        message: response.data.message || "تم تأكيد الطلب بنجاح",
      };
    }

    // If no success status
    return {
      success: false,
      message: response?.data?.message || "فشل في تأكيد الطلب",
    };
  } catch (error: any) {
    console.error("Error placing order:", error);

    const errorMessage = error.response?.data?.message ||
                        error.message ||
                        "حدث خطأ. الرجاء المحاولة مرة أخرى";

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Restore stock when order is returned
 */
export const restoreStockOnReturn = async (
  orderId: string,
  items: Array<{ productId: string; quantity: number }>
): Promise<boolean> => {
  try {
    const response = await api.post("/orders/restore-stock", {
      orderId,
      items,
    });
    return response.data.status === "success";
  } catch (error) {
    console.error("Error restoring stock:", error);
    return false;
  }
};

export default api;
