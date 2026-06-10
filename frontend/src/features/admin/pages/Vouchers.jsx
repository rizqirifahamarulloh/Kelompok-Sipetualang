import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, MoreHorizontal, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import TablePagination, { paginateArray } from "@/components/TablePagination";
import VoucherFormModal from "../components/Vouchers/VoucherFormModal";
import VoucherDeleteModal from "../components/Vouchers/VoucherDeleteModal";
import VoucherDetailModal from "../components/Vouchers/VoucherDetailModal";
import VoucherStatsModal from "../components/Vouchers/VoucherStatsModal";
import { voucherService } from "../services/voucherService";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [validityFilter, setValidityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const PER_PAGE = 10;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    loadVouchers();
    loadStats();
  }, [search, statusFilter, validityFilter, currentPage]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter || undefined,
        validity: validityFilter || undefined,
        page: currentPage,
      };
      const response = await voucherService.getAll(params);
      setVouchers(response.data || []);
      setTotalPages(response.pagination?.last_page || 1);
    } catch (error) {
      toast.error("Gagal memuat voucher");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await voucherService.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error("Gagal memuat statistik", error);
    }
  };

  const handleAddVoucher = () => {
    setEditingVoucher(null);
    setIsFormModalOpen(true);
  };

  const handleEditVoucher = (voucher) => {
    setEditingVoucher(voucher);
    setIsFormModalOpen(true);
  };

  const handleDeleteVoucher = (voucher) => {
    setDeleteTarget(voucher);
  };

  const confirmDelete = async () => {
    try {
      await voucherService.delete(deleteTarget.id);
      toast.success("Voucher berhasil dihapus");
      setDeleteTarget(null);
      loadVouchers();
      loadStats();
    } catch (error) {
      toast.error("Gagal menghapus voucher");
      console.error(error);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingVoucher) {
        await voucherService.update(editingVoucher.id, data);
        toast.success("Voucher berhasil diperbarui");
      } else {
        await voucherService.create(data);
        toast.success("Voucher berhasil dibuat");
      }
      setIsFormModalOpen(false);
      loadVouchers();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
      console.error(error);
    }
  };

  const filteredVouchers = paginateArray(vouchers, currentPage, PER_PAGE);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Voucher</h1>
            <p className="text-gray-500 mt-1">Kelola semua voucher promosi</p>
          </div>
          <Button onClick={handleAddVoucher} className="gap-2">
            <Plus className="w-4 h-4" />
            Buat Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total_vouchers}</div>
                <p className="text-sm text-gray-500">Total Voucher</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.active_vouchers}</div>
                <p className="text-sm text-gray-500">Voucher Aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total_usages}</div>
                <p className="text-sm text-gray-500">Total Penggunaan</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer" onClick={() => setShowStatsModal(true)}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.total_discount_given)}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Total Diskon
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Filter & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari kode atau nama voucher..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(v) => {
  setStatusFilter(v === "all" ? "" : v);
  setCurrentPage(1);
}}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Status</SelectItem>
    <SelectItem value="active">Aktif</SelectItem>
    <SelectItem value="inactive">Nonaktif</SelectItem>
  </SelectContent>
</Select>
            <Select value={validityFilter || "all"} onValueChange={(v) => {
  setValidityFilter(v === "all" ? "" : v);
  setCurrentPage(1);
}}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Validitas" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Validitas</SelectItem>
    <SelectItem value="valid">Berlaku</SelectItem>
    <SelectItem value="expired">Kadaluarsa</SelectItem>
  </SelectContent>
</Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Memuat voucher...</div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Tidak ada voucher</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Tipe Diskon</TableHead>
                      <TableHead>Nilai</TableHead>
                      <TableHead>Min Belanja</TableHead>
                      <TableHead>Tanggal Berlaku</TableHead>
                      <TableHead>Kuota/Terpakai</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono font-bold">
                          {voucher.kode_voucher}
                        </TableCell>
                        <TableCell>{voucher.nama_voucher}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {voucher.tipe_diskon === "percentage"
                              ? "Persentase"
                              : "Fixed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {voucher.tipe_diskon === "percentage"
                            ? `${voucher.nilai_diskon}%`
                            : formatCurrency(voucher.nilai_diskon)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(voucher.min_pembelian)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(voucher.tanggal_mulai).toLocaleDateString("id-ID")} -
                          <br />
                          {new Date(voucher.tanggal_selesai).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          {voucher.kuota === 0
                            ? "Unlimited"
                            : `${voucher.used_count}/${voucher.kuota}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={voucher.is_active ? "default" : "secondary"}
                          >
                            {voucher.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDetailTarget(voucher)}
                              >
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditVoucher(voucher)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteVoucher(voucher)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6">
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {isFormModalOpen && (
        <VoucherFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingVoucher(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingVoucher}
        />
      )}

      {deleteTarget && (
        <VoucherDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          voucher={deleteTarget}
        />
      )}

      {detailTarget && (
        <VoucherDetailModal
          isOpen={!!detailTarget}
          onClose={() => setDetailTarget(null)}
          voucher={detailTarget}
        />
      )}

      {showStatsModal && (
        <VoucherStatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          stats={stats}
        />
      )}
    </div>
  );
}
