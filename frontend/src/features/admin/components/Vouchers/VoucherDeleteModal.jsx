import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function VoucherDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  voucher,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Hapus Voucher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            Apakah Anda yakin ingin menghapus voucher <strong>{voucher?.kode_voucher}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Riwayat penggunaan voucher akan tetap tersimpan, tetapi voucher tidak dapat digunakan lagi.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Hapus Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
