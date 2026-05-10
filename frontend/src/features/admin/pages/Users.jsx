import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      setUsers(response.data?.data ?? response.data ?? []);
    } catch (err) {
      console.log(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const resetPassword = async (userId) => {
    if (!confirm("Reset password untuk user ini?")) return;
    try {
      await adminService.resetPassword(userId);
      alert("Password berhasil direset");
    } catch (err) {
      console.log(err);
      alert("Gagal reset password");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      await adminService.deleteUser(userId);
      alert("User berhasil dihapus");
      getUsers();
    } catch (err) {
      console.log(err);
      alert("Gagal hapus user");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Manajemen Users</h1>

      {loading ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          Memuat data users...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
          Tidak ada users.
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{user.nama}</span>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                    {user.role}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Verifikasi KTP</p>
                    <p>{user.verifikasi_ktp ? 'Terverifikasi' : 'Belum Verifikasi'}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetPassword(user.id)}
                  >
                    Reset Password
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUser(user.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}