import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Gift, Ticket } from "lucide-react";
import { toast } from "sonner";

export default function VoucherSelector({ 
  totalPrice, 
  onVoucherApplied, 
  selectedVoucher,
  onVoucherRemoved 
}) {
  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [showAvailableList, setShowAvailableList] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const handleValidateVoucher = async (code) => {
    if (!code.trim()) {
      toast.error("Masukkan kode voucher");
      return;
    }

    try {
      setValidating(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/customer/voucher/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            kode_voucher: code,
            total_price: totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Voucher tidak valid");
        return;
      }

      onVoucherApplied({
        ...data.data.voucher,
        discount: data.data.discount,
        final_price: data.data.final_price,
      });
      setCodeInput("");
      toast.success("Voucher berhasil digunakan!");
    } catch (error) {
      toast.error("Gagal memproses voucher");
      console.error(error);
    } finally {
      setValidating(false);
    }
  };

  const handleShowAvailable = async () => {
    try {
      setLoadingAvailable(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/customer/voucher/available?total_price=${totalPrice}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAvailableVouchers(data.data || []);
        setShowAvailableList(true);
      }
    } catch (error) {
      toast.error("Gagal memuat voucher tersedia");
      console.error(error);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleSelectVoucher = async (voucher) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/customer/voucher/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            kode_voucher: voucher.kode_voucher,
            total_price: totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal menerapkan voucher");
        return;
      }

      onVoucherApplied({
        ...voucher,
        discount: data.data.discount,
        final_price: data.data.final_price,
      });
      setShowAvailableList(false);
      toast.success("Voucher berhasil digunakan!");
    } catch (error) {
      toast.error("Gagal memproses voucher");
      console.error(error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Voucher Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <p className="font-semibold text-sm">Punya Kode Voucher?</p>
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan kode voucher"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleValidateVoucher(codeInput);
                }}
                disabled={selectedVoucher}
              />
              <Button
                onClick={() => handleValidateVoucher(codeInput)}
                disabled={validating || selectedVoucher}
                size="sm"
              >
                {validating ? "Cek..." : "Gunakan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Voucher */}
      {selectedVoucher && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900">
                    {selectedVoucher.kode_voucher}
                  </p>
                  <p className="text-sm text-green-700">
                    {selectedVoucher.nama_voucher}
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    Diskon: {formatCurrency(selectedVoucher.discount)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoucherRemoved}
                className="text-red-600 hover:text-red-700"
              >
                Hapus
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Vouchers List */}
      {!selectedVoucher && (
        <Button
          variant="outline"
          onClick={handleShowAvailable}
          disabled={loadingAvailable}
          className="w-full"
        >
          <Gift className="w-4 h-4 mr-2" />
          {loadingAvailable ? "Memuat..." : "Lihat Voucher Tersedia"}
        </Button>
      )}

      {showAvailableList && availableVouchers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="font-semibold text-sm mb-3">Voucher Tersedia</p>
              {availableVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => handleSelectVoucher(voucher)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        {voucher.kode_voucher}
                      </p>
                      <p className="text-sm text-gray-600">
                        {voucher.nama_voucher}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Min pembelian: {formatCurrency(voucher.min_pembelian)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Pilih
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showAvailableList && availableVouchers.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 text-sm">
                  Tidak ada voucher tersedia
                </p>
                <p className="text-sm text-yellow-700">
                  Tidak ada voucher yang bisa digunakan untuk pembelian ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
