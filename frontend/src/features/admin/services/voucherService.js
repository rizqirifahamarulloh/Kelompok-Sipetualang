import api from '@/services/api'; // ← HAPUS { api } jadi api aja

export const voucherService = {
  // Get all vouchers with pagination
  getAll: async (params = {}) => {
    const response = await api.get("/admin/voucher", { params });
    return response.data;
  },

  // Get voucher detail
  getById: async (id) => {
    const response = await api.get(`/admin/voucher/${id}`);
    return response.data;
  },

  // Create new voucher
  create: async (data) => {
    const response = await api.post("/admin/voucher", data);
    return response.data;
  },

  // Update voucher
  update: async (id, data) => {
    const response = await api.put(`/admin/voucher/${id}`, data);
    return response.data;
  },

  // Delete voucher
  delete: async (id) => {
    const response = await api.delete(`/admin/voucher/${id}`);
    return response.data;
  },

  // Toggle voucher status
  toggleStatus: async (id) => {
    const response = await api.patch(`/admin/voucher/${id}/toggle`);
    return response.data;
  },

  // Get voucher statistics
  getStatistics: async () => {
    const response = await api.get("/admin/voucher/statistics");
    return response.data;
  },
};