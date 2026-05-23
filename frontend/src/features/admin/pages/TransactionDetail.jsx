import { useState } from "react";
import { ArrowLeft, Printer, CheckCircle2, Package, Clock, MapPin, CreditCard, Receipt, Milestone, BellRing } from "lucide-react";

// DATABASE DETAIL TRANSAKSI YANG SUDAH DILENGKAPI DATA PAYMENT & LOG SESUAI GAMBAR
const DUMMY_ALL_DETAILS = {
  "TRX-0842": {
    id_transaksi: "TRX-0842",
    waktu_order: "11 Okt 2023 - 14:30 WIB",
    status_sewa: "aktif",
    destinasi: "Gunung Rinjani",
    penyewa: { 
      nama: "Budi Santoso", 
      email: "budi.s@example.com", 
      telepon: "+62 812-3456-7890" 
    },
    tanggal_mulai: "2023-10-12",
    tanggal_selesai: "2023-10-15",
    durasi_hari: 3,
    // Finansial
    subtotal: 450000,
    diskon: 25000,
    pajak: 10000,
    deposit: 150000,
    total_biaya: 585000, // Subtotal - Diskon + Pajak + Deposit
    metode_pembayaran: "Transfer Bank (BCA)",
    status_pembayaran: "Lunas",
    // Data Tab 1
    items: [
      { nama: "Tenda Dome 4P", brand: "Eiger", qty: 1, subtotal: 300000 },
      { nama: "Sleeping Bag Polar", brand: "Arei", qty: 2, subtotal: 150000 }
    ],
    // Data Tab 2
    payments: [
      { id_payment: "PAY-9901", tanggal: "11 Okt 2023", metode: "BCA Transfer", jumlah: 435000, tipe: "Biaya Sewa", status: "Berhasil" },
      { id_payment: "PAY-9902", tanggal: "11 Okt 2023", metode: "BCA Transfer", jumlah: 150000, tipe: "Deposit Jaminan", status: "Berhasil" }
    ],
    // Log Alur Status (Timeline)
    logs: [
      { status: "Selesai Sempurna", waktu: "Belum Tercapai", deskripsi: "Penyewaan selesai dan deposit dikembalikan.", done: false },
      { status: "Pengembalian Alat", waktu: "Batas: 15 Okt 2023", deskripsi: "Menunggu pengecekan kondisi alat outdoor yang kembali.", done: false },
      { status: "Alat Diambil (Aktif)", waktu: "12 Okt 2023 - 09:00 WIB", deskripsi: "Alat sewa diserahkan ke pelanggan.", done: true },
      { status: "Pembayaran Diverifikasi", waktu: "11 Okt 2023 - 14:45 WIB", deskripsi: "Pembayaran lunas & deposit aman.", done: true },
      { status: "Transaksi Dibuat", waktu: "11 Okt 2023 - 14:30 WIB", deskripsi: "Pesanan masuk ke sistem antrean.", done: true },
    ]
  },
  "TRX-0841": {
    id_transaksi: "TRX-0841",
    waktu_order: "07 Okt 2023 - 11:15 WIB",
    status_sewa: "terlambat",
    destinasi: "Gunung Gede",
    penyewa: { 
      nama: "Siti Rahma", 
      email: "siti.rahma@email.com", 
      telepon: "+62 878-1122-3344" 
    },
    tanggal_mulai: "2023-10-08",
    tanggal_selesai: "2023-10-10",
    durasi_hari: 3,
    subtotal: 325000,
    diskon: 0,
    pajak: 5000,
    deposit: 100000,
    total_biaya: 430000,
    metode_pembayaran: "E-Wallet (Dana)",
    status_pembayaran: "Belum Selesai",
    items: [
      { nama: "Tenda Dome 4P", brand: "Eiger", qty: 1, subtotal: 200000 },
      { nama: "Carrier 60L", brand: "Consina", qty: 1, subtotal: 125000 }
    ],
    payments: [
      { id_payment: "PAY-9844", tanggal: "07 Okt 2023", metode: "Dana", jumlah: 330000, tipe: "Biaya Sewa", status: "Berhasil" }
    ],
    logs: [
      { status: "Selesai Sempurna", waktu: "Belum Tercapai", deskripsi: "Penyewaan selesai dan deposit dikembalikan.", done: false },
      { status: "Pengembalian Alat", waktu: "Terlambat dari 10 Okt", deskripsi: "Denda keterlambatan berjalan otomatis.", done: false },
      { status: "Alat Diambil (Aktif)", waktu: "08 Okt 2023 - 08:30 WIB", deskripsi: "Alat sewa dibawa oleh penyewa.", done: true },
      { status: "Pembayaran Diverifikasi", waktu: "07 Okt 2023 - 11:20 WIB", deskripsi: "Pembayaran sewa awal diverifikasi.", done: true },
      { status: "Transaksi Dibuat", waktu: "07 Okt 2023 - 11:15 WIB", deskripsi: "Pesanan terdaftar.", done: true },
    ]
  }
};

const STATUS_TRX_CONFIG = {
  aktif:      { label: "Aktif", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  terlambat:  { label: "Terlambat", className: "bg-red-50 text-red-700 border border-red-200" },
  selesai:    { label: "Selesai", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

const formatHarga = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;
const formatTanggalSederhana = (val) =>
  val ? new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function TransactionDetail({ activeId, setActiveId }) {
  const trx = DUMMY_ALL_DETAILS[activeId] || DUMMY_ALL_DETAILS["TRX-0842"];
  const [activeTab, setActiveTab] = useState("items");

  // Simulasi klik kirim pengingat pelunasan / pengembalian alat
  const handleSendReminder = () => {
    alert(`Pengingat otomatis berhasil dikirimkan ke WhatsApp/Email ${trx.penyewa.nama}!`);
  };

  return (
    <div className="space-y-6">
      {/* ─── TOP HEADER NAVIGATION ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveId(null)} className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs text-gray-400">Dashboard &gt; Transaksi Penyewaan &gt; Detail</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-2xl font-bold text-gray-900">{trx.id_transaksi}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${STATUS_TRX_CONFIG[trx.status_sewa]?.className}`}>
                {STATUS_TRX_CONFIG[trx.status_sewa]?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition">
            <Printer size={15} /> Cetak Invoice
          </button>
          <button 
            onClick={() => setActiveId(null)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-sm font-medium hover:bg-emerald-900 transition shadow-sm"
          >
            <CheckCircle2 size={15} /> Selesaikan Transaksi
          </button>
        </div>
      </div>

      {/* ─── MAIN LAYOUT GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KOLOM KIRI (TABEL DATA & INFORMASI WAKTU) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB BUTTONS INTERFACES */}
          <div className="flex border-b border-gray-200 gap-6 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab("items")}
              className={`pb-3 transition-all ${activeTab === "items" ? "text-emerald-800 border-b-2 border-emerald-800 font-bold" : "text-gray-400 hover:text-gray-600"}`}
            >
              Rented Items ({trx.items.length})
            </button>
            <button 
              onClick={() => setActiveTab("payments")}
              className={`pb-3 transition-all ${activeTab === "payments" ? "text-emerald-800 border-b-2 border-emerald-800 font-bold" : "text-gray-400 hover:text-gray-600"}`}
            >
              Payment History ({trx.payments.length})
            </button>
          </div>

          {/* RENDER TAB 1: RENTED ITEMS */}
          {activeTab === "items" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b bg-slate-50/50">
                <span className="font-bold text-gray-800 text-xs flex items-center gap-2 uppercase tracking-wider text-slate-500">
                  <Package size={14} className="text-emerald-700" /> Daftar Alat Outdoor yang Disewa
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-3">Nama Alat</th>
                      <th className="px-4 py-3 text-center">Jumlah Pasang</th>
                      <th className="px-5 py-3 text-right">Subtotal Sewa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {trx.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{item.nama}</p>
                          <p className="text-[11px] text-gray-400 font-normal">Brand: {item.brand}</p>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-slate-900">x{item.qty}</td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900">{formatHarga(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RENDER TAB 2: PAYMENT HISTORY */}
          {activeTab === "payments" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b bg-slate-50/50">
                <span className="font-bold text-gray-800 text-xs flex items-center gap-2 uppercase tracking-wider text-slate-500">
                  <CreditCard size={14} className="text-emerald-700" /> Histori Rekam Pembayaran Pembukuan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-3">ID Pembayaran</th>
                      <th className="px-4 py-3">Tanggal & Tipe</th>
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {trx.payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30">
                        <td className="px-5 py-4 font-bold text-slate-900">{p.id_payment}</td>
                        <td className="px-4 py-4">
                          <p className="text-slate-900 font-semibold">{p.tipe}</p>
                          <p className="text-[11px] text-gray-400 font-normal">{p.tanggal}</p>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-600">{p.metode}</td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-800">{formatHarga(p.jumlah)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOX INFORMASI PERIODE SEWA WAKTU + BUTTON KIRIM PENGINGAT */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3 flex-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-slate-400" /> Informasi Durasi & Periode Main
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 font-medium">
                <div>
                  <p className="text-xs text-gray-400">Waktu Order Dibuat</p>
                  <p className="text-slate-900 font-semibold mt-0.5">{trx.waktu_order}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Durasi Pemakaian Alat</p>
                  <p className="text-slate-900 font-semibold mt-0.5">
                    {formatTanggalSederhana(trx.tanggal_mulai)} — {formatTanggalSederhana(trx.tanggal_selesai)} 
                    <span className="ml-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">({trx.durasi_hari} Hari)</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* BUTTON KIRIM PENGINGAT (REMINDER) */}
            <div className="w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex justify-end">
              <button 
                onClick={handleSendReminder}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-sm"
              >
                <BellRing size={13} /> Kirim Pengingat
              </button>
            </div>
          </div>
        </div>

        {/* ─── KOLOM KANAN (PROFIL, TIMELINE LOG, & DETAIL FINANSIAL) ─── */}
        <div className="space-y-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Profile</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm">
                {trx.penyewa.nama.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{trx.penyewa.nama}</h5>
                <p className="text-xs text-gray-400 font-medium">{trx.penyewa.email} • {trx.penyewa.telepon}</p>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-2.5 border-t border-slate-100">
              <MapPin size={13} className="text-red-500" /> Destinasi Jalur: <span className="text-slate-900">{trx.destinasi}</span>
            </p>
          </div>

          {/* TIMELINE ALUR STATUS (LOG) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Milestone size={14} className="text-slate-400" /> Alur Proses Transaksi
            </h4>
            <div className="relative pl-5 space-y-5 border-l-2 border-slate-100 ml-2">
              {trx.logs.map((log, index) => (
                <div key={index} className="relative text-xs">
                  <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                    log.done ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                  }`}>
                    {log.done && <div className="w-1 h-1 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <p className={`font-bold ${log.done ? "text-slate-900" : "text-gray-400"}`}>{log.status}</p>
                      <span className="text-[10px] text-gray-400 font-medium">{log.waktu}</span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{log.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Receipt size={14} className="text-slate-400" /> Ringkasan Finansial
            </h4>
            
            <div className="space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal Sewa</span>
                <span className="text-slate-900 font-bold">{formatHarga(trx.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon Kupon</span>
                <span className="text-red-600 font-bold">-{formatHarga(trx.diskon)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak Pelayanan (Ppn)</span>
                <span className="text-slate-900 font-bold">+{formatHarga(trx.pajak)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Jaminan (Aman)</span>
                <span className="text-slate-900 font-bold">+{formatHarga(trx.deposit)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed text-slate-400">
                <span>Metode Bayar</span>
                <span className="text-slate-700 font-bold">{trx.metode_pembayaran}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-900 text-xs block">Total Tagihan</span>
                <span className="text-[10px] text-emerald-700 font-bold tracking-wide uppercase bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                  {trx.status_pembayaran}
                </span>
              </div>
              <span className="font-black text-xl text-emerald-800 tracking-tight">{formatHarga(trx.total_biaya)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}