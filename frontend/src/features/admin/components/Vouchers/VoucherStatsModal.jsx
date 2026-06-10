import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Gift, Users, Zap } from "lucide-react";

export default function VoucherStatsModal({ isOpen, onClose, stats }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Statistik Voucher</DialogTitle>
        </DialogHeader>

        {stats && (
          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Voucher</p>
                      <p className="text-2xl font-bold">{stats.total_vouchers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Voucher Aktif</p>
                      <p className="text-2xl font-bold">{stats.active_vouchers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Penggunaan</p>
                      <p className="text-2xl font-bold">{stats.total_usages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Diskon</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(stats.total_discount_given)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Vouchers */}
            {stats.top_vouchers && stats.top_vouchers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Voucher Terpopuler</h3>
                <div className="space-y-2">
                  {stats.top_vouchers.map((voucher, idx) => (
                    <Card key={voucher.id}>
                      <CardContent className="pt-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{voucher.kode_voucher}</p>
                          <p className="text-sm text-gray-500">
                            {voucher.nama_voucher}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(voucher.total_discount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {voucher.usages_count} penggunaan
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
