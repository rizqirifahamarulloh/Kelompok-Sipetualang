import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function VoucherDetailModal({ isOpen, onClose, voucher }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Voucher: {voucher?.kode_voucher}</DialogTitle>
        </DialogHeader>

        {voucher && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Voucher</p>
                <p className="font-semibold">{voucher.nama_voucher}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={voucher.is_active ? "default" : "secondary"}>
                  {voucher.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipe Diskon</p>
                <p className="font-semibold">
                  {voucher.tipe_diskon === "percentage" ? "Persentase" : "Fixed"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nilai Diskon</p>
                <p className="font-semibold">
                  {voucher.tipe_diskon === "percentage"
                    ? `${voucher.nilai_diskon}%`
                    : formatCurrency(voucher.nilai_diskon)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Purchase & Limit Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Min Pembelian</p>
                <p className="font-semibold">
                  {formatCurrency(voucher.min_pembelian)}
                </p>
              </div>
              {voucher.max_diskon && (
                <div>
                  <p className="text-sm text-gray-500">Max Diskon</p>
                  <p className="font-semibold">
                    {formatCurrency(voucher.max_diskon)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Kuota</p>
                <p className="font-semibold">
                  {voucher.kuota === 0 ? "Unlimited" : voucher.kuota}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sudah Dipakai</p>
                <p className="font-semibold">{voucher.used_count}</p>
              </div>
            </div>

            <Separator />

            {/* Date Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal Mulai</p>
                <p className="font-semibold">
                  {new Date(voucher.tanggal_mulai).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Selesai</p>
                <p className="font-semibold">
                  {new Date(voucher.tanggal_selesai).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Diskon Diberikan</p>
                <p className="font-semibold">
                  {formatCurrency(voucher.total_discount_given || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Penggunaan</p>
                <p className="font-semibold">{voucher.total_usages || 0}x</p>
              </div>
            </div>

            {/* Recent Usages */}
            {voucher.recent_usages && voucher.recent_usages.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="font-semibold mb-3">Penggunaan Terbaru</p>
                  <div className="overflow-x-auto max-h-40">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pengguna</TableHead>
                          <TableHead>Diskon</TableHead>
                          <TableHead>Tanggal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {voucher.recent_usages.map((usage) => (
                          <TableRow key={usage.id}>
                            <TableCell className="text-sm">
                              {usage.pengguna?.nama_pengguna}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatCurrency(usage.diskon_dapat)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(usage.created_at).toLocaleDateString("id-ID")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
