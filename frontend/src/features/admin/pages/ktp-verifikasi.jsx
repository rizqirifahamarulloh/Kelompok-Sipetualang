import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function KtpVerification() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getVerifications();
      const items = response?.data ?? response ?? [];
      console.log('KTP verifications response:', response);
      setData(Array.isArray(items) ? items : []);
      if (!Array.isArray(items)) {
        setError('Respons API tidak mengandung array verifikasi')
      }
    } catch (err) {
      console.error('Fetch verifikasi error:', err);
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data verifikasi');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const approve = async (id) => {
    try {
      await adminService.approveVerification(id);
      getData();
    } catch (err) {
      console.log(err);
    }
  };

  const reject = async (id) => {
    const alasan = prompt("Alasan penolakan:");
    if (!alasan) return;

    try {
      await adminService.rejectVerification(id, alasan);
      getData();
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "disetujui") return "bg-green-100 text-green-700";
    if (status === "ditolak") return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Verifikasi KTP</h1>

      {loading ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          Memuat data verifikasi...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center text-sm text-red-500">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          Tidak ada permintaan verifikasi KTP saat ini.
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((item) => (
            <Card key={item.id_verifikasi}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{item.pengguna?.nama}</span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      item.status_verifikasi
                    )}`}
                  >
                    {item.status_verifikasi}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-xs mb-1">KTP</p>
                  <img
                    src={`http://localhost:8000/storage/${item.foto_ktp}`}
                    className="rounded-lg border w-full h-40 object-cover"
                  />
                </div>

                <div>
                  <p className="text-xs mb-1">Selfie</p>
                  <img
                    src={`http://localhost:8000/storage/${item.foto_selfie_ktp}`}
                    className="rounded-lg border w-full h-40 object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {item.status_verifikasi === "pending" ? (
                    <>
                      <Button onClick={() => approve(item.id_verifikasi)}>
                        Approve
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => reject(item.id_verifikasi)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sudah diproses
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}