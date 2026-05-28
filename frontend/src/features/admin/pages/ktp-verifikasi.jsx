import { useEffect, useState } from "react";
import TablePagination, { paginateArray } from "@/components/TablePagination";
import { adminService } from "../services/adminService";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/services/api";
import { getStorageUrl } from "@/utils/storageUrl";


export default function KtpVerification() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

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

  const approve = async (id, activateRental = false) => {
    try {
      await adminService.approveVerification(id, activateRental);
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
        <>
        <div className="grid gap-4">
          {paginateArray(data, currentPage, PER_PAGE).map((item) => {
            const isRentalRequest = item.catatan_admin === '[PENDAFTARAN_RENTAL]';
            
            return (
              <Card key={item.id_verifikasi} className={isRentalRequest ? 'border-blue-200 bg-blue-50/10' : ''}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span>{item.pengguna?.nama}</span>
                      {isRentalRequest && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded w-fit font-normal">
                          PENGAJUAN BUKA RENTAL
                        </span>
                      )}
                    </div>

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
                      src={getStorageUrl(item.foto_ktp)}
                      className="rounded-lg border w-full h-40 object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs mb-1">Selfie</p>
                    <img
                      src={getStorageUrl(item.foto_selfie_ktp)}
                      className="rounded-lg border w-full h-40 object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {item.status_verifikasi === "pending" ? (
                      <>
                        {isRentalRequest ? (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={() => approve(item.id_verifikasi, true)}
                          >
                            Approve & Aktifkan Rental
                          </Button>
                        ) : (
                          <Button onClick={() => approve(item.id_verifikasi, false)}>
                            Approve KTP
                          </Button>
                        )}

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
            );
          })}
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={data.length}
          perPage={PER_PAGE}
          onPageChange={setCurrentPage}
          label="verifikasi"
        />
        </>
      )}
    </div>
  );
}