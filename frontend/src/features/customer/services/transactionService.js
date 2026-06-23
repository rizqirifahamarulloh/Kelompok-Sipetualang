import api from '@/services/api';

export const transactionService = {
  // checkout langsung (beli sekarang)
  async checkout(data) {
    const response = await api.post('/customer/transaksi/checkout', data);
    return response.data;
  },

  // ambil transaksi sbg penyewa (customer yg nyewa barang)
  async getTransaksiSebagaiPenyewa() {
    const response = await api.get('/customer/transaksi/sebagai-penyewa');
    return response.data;
  },

  // ambil transaksi sbg pemilik (customer yg nerima sewa)
  async getTransaksiSebagaiPemilik() {
    const response = await api.get('/customer/transaksi/sebagai-pemilik');
    return response.data;
  },

  // update status transaksi
  async updateStatus(transactionId, status) {
    const response = await api.put(`/customer/transaksi/${transactionId}/status`, { 
      status_sewa: status 
    });
    return response.data;
  },

  // ambil detail transaksi berdasarkan id
  async getDetail(transactionId) {
    const response = await api.get(`/customer/transaksi/${transactionId}`);
    return response.data;
  },

  // konfirmasi barang udah diterima (penyewa)
  async confirmBarangDiterima(transactionId) {
    return await this.updateStatus(transactionId, 'sedang_disewa');
  },

  // konfirmasi barang udah dikembalikan (pemilik)
  async confirmBarangKembali(transactionId) {
    return await this.updateStatus(transactionId, 'selesai');
  },

  // batalin transaksi
  async cancelTransaction(transactionId) {
    return await this.updateStatus(transactionId, 'dibatalkan');
  },

  // kembalikan barang (penyewa)
  async kembalikanBarang(transactionId, data) {
    const response = await api.post(`/customer/pengiriman/${transactionId}/kembalikan`, data);
    return response.data;
  }
};

export default transactionService;