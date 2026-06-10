import { api } from "@/services/api";

export const customerVoucherService = {
  // Get available vouchers for checkout
  getAvailableVouchers: async (totalPrice) => {
    const response = await api.get("/customer/voucher/available", {
      params: {
        total_price: totalPrice,
      },
    });
    return response.data;
  },

  // Get all available vouchers
  getAllAvailable: async () => {
    const response = await api.get("/customer/voucher/all");
    return response.data;
  },

  // Validate and apply voucher
  validateAndApply: async (voucherCode, totalPrice) => {
    const response = await api.post("/customer/voucher/validate", {
      kode_voucher: voucherCode,
      total_price: totalPrice,
    });
    return response.data;
  },
};
