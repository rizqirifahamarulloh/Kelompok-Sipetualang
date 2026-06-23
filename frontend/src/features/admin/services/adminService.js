// service buat fitur-fitur admin
import api from '@/services/api'

export const adminService = {
  // ambil semua data user
  async getUsers(params) {
    const response = await api.get('/admin/users', { params })
    return response
  },

  // ambil data user berdasarkan id
  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`)
    return response
  },

  // reset password user
  async resetPassword(userId) {
    const response = await api.post(`/admin/users/${userId}/reset-password`)
    return response
  },

  // update data user
  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data)
    return response
  },

  // hapus user
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`)
    return response
  },

  // ambil statistik dashboard
  async getStats() {
    const response = await api.get('/admin/dashboard')
    return response
  },

  // ambil jumlah badge sidebar (ringan)
  async getSidebarBadges() {
    const response = await api.get('/admin/sidebar-badges')
    return response
  },

  // ambil daftar verifikasi
  async getVerifications() {
    const response = await api.get('/admin/verifikasi')
    return response.data
  },

  // setujui verifikasi
  async approveVerification(id, activateRental = false) {
    const response = await api.post(`/admin/verifikasi/${id}/approve`, { activate_rental: activateRental })
    return response
  },

  // tolak verifikasi
  async rejectVerification(id, catatan) {
    const response = await api.post(`/admin/verifikasi/${id}/reject`, { catatan_admin: catatan })
    return response
  },
  
  async getRevenueStats() {
    const response = await api.get('/admin/revenue')
    return response.data
  },
  
  async getAllTransactions() {
    const response = await api.get('/admin/transactions')
    return response.data
  },
  
  async getOwnerEarnings() {
    const response = await api.get('/admin/owner-earnings')
    return response.data
  },
  
  // endpoint pengiriman
  async getPengiriman() {
    const response = await api.get('/admin/pengiriman')
    return response.data
  },
  
  async kirimBarang(id, data) {
    const response = await api.post(`/admin/pengiriman/${id}/kirim`, data)
    return response.data
  },
  
  async updateLokasi(idPengiriman, data) {
    const response = await api.put(`/admin/pengiriman/${idPengiriman}/lokasi`, data)
    return response.data
  },
  
  async getBarangDisewa() {
    const response = await api.get('/admin/pengiriman/disewa')
    return response.data
  },
  
  async konfirmasiKembali(id, data) {
    const response = await api.post(`/admin/pengiriman/${id}/konfirmasi-kembali`, data)
    return response.data
  },

  async pickupBarangDiambil(id) {
    const response = await api.post(`/admin/pengiriman/${id}/pickup-diambil`)
    return response.data
  },

  // pengembalian deposit
  async getDepositRefunds() {
    const response = await api.get('/admin/deposit-refund')
    return response.data
  },

  async processDepositRefund(id, data) {
    const formData = new FormData()
    formData.append('refund_amount', data.refund_amount)
    formData.append('refund_method', data.refund_method)
    if (data.refund_note) formData.append('refund_note', data.refund_note)
    if (data.refund_proof) formData.append('refund_proof', data.refund_proof)
    const response = await api.post(`/admin/deposit-refund/${id}/process`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // --- penarikan saldo ---
  
  // ambil riwayat semua penarikan
  async getWithdrawals(status = null) {
    const params = status ? { status } : {};
    const response = await api.get('/admin/withdrawals/all', { params });
    return response.data;
  },

  // ambil statistik penarikan
  async getWithdrawalStats() {
    const response = await api.get('/admin/withdrawals/stats');
    return response.data;
  },

  // ambil saldo admin
  async getAdminBalance() {
    const response = await api.get('/customer/withdrawal/balance');
    return response.data;
  },

  // penarikan instan oleh admin
  async adminWithdrawal(data) {
    const response = await api.post('/admin/withdrawals/instant', data);
    return response.data;
  },

  // setujui penarikan (kirim bukti transfer)
  async approveWithdrawal(id, data) {
    const formData = new FormData();
    if (data.transfer_proof) formData.append('transfer_proof', data.transfer_proof);
    if (data.admin_note) formData.append('admin_note', data.admin_note);
    const response = await api.post(`/admin/withdrawals/${id}/approve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // tolak penarikan
  async rejectWithdrawal(id, data) {
    const response = await api.post(`/admin/withdrawals/${id}/reject`, data);
    return response.data;
  },
}