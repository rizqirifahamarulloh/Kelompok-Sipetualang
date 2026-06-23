import api from '@/services/api';

export const voucherService = {
  // ambil semua data voucher (pake pagination)
  getAll: async (params = {}) => {
    const response = await api.get("/admin/voucher", { params });
    return response.data;
  },

  // ambil detail voucher berdasarkan id
  getById: async (id) => {
    const response = await api.get(`/admin/voucher/${id}`);
    return response.data;
  },

  // buat voucher baru
  create: async (data) => {
    const response = await api.post("/admin/voucher", data);
    return response.data;
  },

  // update data voucher
  update: async (id, data) => {
    const response = await api.put(`/admin/voucher/${id}`, data);
    return response.data;
  },

  // hapus voucher
  delete: async (id) => {
    const response = await api.delete(`/admin/voucher/${id}`);
    return response.data;
  },

  // aktifkan/nonaktifkan voucher
  toggleStatus: async (id) => {
    const response = await api.patch(`/admin/voucher/${id}/toggle`);
    return response.data;
  },

  // ambil statistik voucher
  getStatistics: async () => {
    const response = await api.get("/admin/voucher/statistics");
    return response.data;
  },
};