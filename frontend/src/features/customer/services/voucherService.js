import { api } from "@/services/api";

export const customerVoucherService = {
  // ambil voucher yg tersedia buat checkout
  getAvailableVouchers: async (totalPrice) => {
    const response = await api.get("/customer/voucher/available", {
      params: {
        total_price: totalPrice,
      },
    });
    return response.data;
  },

  // ambil semua voucher yg tersedia
  getAllAvailable: async () => {
    const response = await api.get("/customer/voucher/all");
    return response.data;
  },

  // validasi dan pasang voucher
  validateAndApply: async (voucherCode, totalPrice) => {
    const response = await api.post("/customer/voucher/validate", {
      kode_voucher: voucherCode,
      total_price: totalPrice,
    });
    return response.data;
  },
};
