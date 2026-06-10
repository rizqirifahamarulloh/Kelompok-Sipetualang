import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function VoucherFormModal({ isOpen, onClose, onSubmit, initialData }) {
  // 🔥 TAMBAHKAN DEFAULT VALUE 🔥
  const getDefaultDates = () => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    return {
      tanggal_mulai: today.toISOString().split('T')[0],
      tanggal_selesai: endDate.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();

  const [formData, setFormData] = useState({
    kode_voucher: "",
    nama_voucher: "",
    tipe_diskon: "percentage",
    nilai_diskon: "10",  // 🔥 DEFAULT VALUE 10
    min_pembelian: "0",  // 🔥 DEFAULT 0
    max_diskon: "",
    tanggal_mulai: defaultDates.tanggal_mulai,
    tanggal_selesai: defaultDates.tanggal_selesai,
    kuota: "0",  // 🔥 DEFAULT 0 (unlimited)
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const startDate = new Date(initialData.tanggal_mulai)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(initialData.tanggal_selesai)
        .toISOString()
        .split("T")[0];

      setFormData({
        kode_voucher: initialData.kode_voucher,
        nama_voucher: initialData.nama_voucher,
        tipe_diskon: initialData.tipe_diskon,
        nilai_diskon: initialData.nilai_diskon,
        min_pembelian: initialData.min_pembelian,
        max_diskon: initialData.max_diskon || "",
        tanggal_mulai: startDate,
        tanggal_selesai: endDate,
        kuota: initialData.kuota,
        is_active: initialData.is_active,
      });
    } else {
      // Reset ke default saat buat baru
      const newDefaultDates = getDefaultDates();
      setFormData({
        kode_voucher: "",
        nama_voucher: "",
        tipe_diskon: "percentage",
        nilai_diskon: "10",
        min_pembelian: "0",
        max_diskon: "",
        tanggal_mulai: newDefaultDates.tanggal_mulai,
        tanggal_selesai: newDefaultDates.tanggal_selesai,
        kuota: "0",
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 🔥 VALIDASI SEBELUM SUBMIT 🔥
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.kode_voucher) {
      newErrors.kode_voucher = "Kode voucher harus diisi";
    }
    if (!formData.nama_voucher) {
      newErrors.nama_voucher = "Nama voucher harus diisi";
    }
    if (!formData.nilai_diskon || Number(formData.nilai_diskon) <= 0) {
      newErrors.nilai_diskon = "Nilai diskon harus diisi dan lebih dari 0";
    }
    if (formData.tipe_diskon === "percentage" && Number(formData.nilai_diskon) > 100) {
      newErrors.nilai_diskon = "Nilai diskon percentage tidak boleh lebih dari 100";
    }
    if (formData.tanggal_mulai && formData.tanggal_selesai && formData.tanggal_mulai > formData.tanggal_selesai) {
      newErrors.tanggal_selesai = "Tanggal selesai harus setelah tanggal mulai";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // 🔥 KONVERSI DATA KE FORMAT YANG SESUAI 🔥
      const submitData = {
        kode_voucher: formData.kode_voucher.toUpperCase(),
        nama_voucher: formData.nama_voucher,
        tipe_diskon: formData.tipe_diskon,
        nilai_diskon: Number(formData.nilai_diskon),
        min_pembelian: Number(formData.min_pembelian) || 0,
        max_diskon: formData.max_diskon ? Number(formData.max_diskon) : null,
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
        kuota: Number(formData.kuota) || 0,
        is_active: formData.is_active,
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Voucher" : "Buat Voucher Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Kode Voucher */}
            <div>
              <Label>Kode Voucher *</Label>
              <Input
                name="kode_voucher"
                value={formData.kode_voucher}
                onChange={handleChange}
                placeholder="RAMADHAN20"
                disabled={!!initialData}
                className={errors.kode_voucher ? "border-red-500" : ""}
              />
              {errors.kode_voucher && (
                <p className="text-red-500 text-sm">{errors.kode_voucher}</p>
              )}
            </div>

            {/* Nama Voucher */}
            <div>
              <Label>Nama Voucher *</Label>
              <Input
                name="nama_voucher"
                value={formData.nama_voucher}
                onChange={handleChange}
                placeholder="Diskon Ramadhan 20%"
                className={errors.nama_voucher ? "border-red-500" : ""}
              />
              {errors.nama_voucher && (
                <p className="text-red-500 text-sm">{errors.nama_voucher}</p>
              )}
            </div>

            {/* Tipe Diskon */}
            <div>
              <Label>Tipe Diskon *</Label>
              <Select value={formData.tipe_diskon} onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, tipe_diskon: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nilai Diskon */}
            <div>
              <Label>Nilai Diskon *</Label>
              <Input
                name="nilai_diskon"
                type="number"
                value={formData.nilai_diskon}
                onChange={handleChange}
                placeholder={formData.tipe_diskon === "percentage" ? "20" : "50000"}
                min="0"
                className={errors.nilai_diskon ? "border-red-500" : ""}
              />
              {errors.nilai_diskon && (
                <p className="text-red-500 text-sm">{errors.nilai_diskon}</p>
              )}
            </div>

            {/* Min Pembelian */}
            <div>
              <Label>Min Pembelian (Rp) *</Label>
              <Input
                name="min_pembelian"
                type="number"
                value={formData.min_pembelian}
                onChange={handleChange}
                placeholder="200000"
                min="0"
                className={errors.min_pembelian ? "border-red-500" : ""}
              />
              {errors.min_pembelian && (
                <p className="text-red-500 text-sm">{errors.min_pembelian}</p>
              )}
            </div>

            {/* Max Diskon (untuk percentage) */}
            {formData.tipe_diskon === "percentage" && (
              <div>
                <Label>Max Diskon (Rp)</Label>
                <Input
                  name="max_diskon"
                  type="number"
                  value={formData.max_diskon}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                />
              </div>
            )}

            {/* Tanggal Mulai */}
            <div>
              <Label>Tanggal Mulai *</Label>
              <Input
                name="tanggal_mulai"
                type="date"
                value={formData.tanggal_mulai}
                onChange={handleChange}
                className={errors.tanggal_mulai ? "border-red-500" : ""}
              />
              {errors.tanggal_mulai && (
                <p className="text-red-500 text-sm">{errors.tanggal_mulai}</p>
              )}
            </div>

            {/* Tanggal Selesai */}
            <div>
              <Label>Tanggal Selesai *</Label>
              <Input
                name="tanggal_selesai"
                type="date"
                value={formData.tanggal_selesai}
                onChange={handleChange}
                className={errors.tanggal_selesai ? "border-red-500" : ""}
              />
              {errors.tanggal_selesai && (
                <p className="text-red-500 text-sm">{errors.tanggal_selesai}</p>
              )}
            </div>

            {/* Kuota */}
            <div>
              <Label>Kuota (0 = Unlimited) *</Label>
              <Input
                name="kuota"
                type="number"
                value={formData.kuota}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className={errors.kuota ? "border-red-500" : ""}
              />
              {errors.kuota && (
                <p className="text-red-500 text-sm">{errors.kuota}</p>
              )}
            </div>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2">
            <Checkbox
              name="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
            <Label>Aktifkan Voucher</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : initialData
                ? "Perbarui"
                : "Buat Voucher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}