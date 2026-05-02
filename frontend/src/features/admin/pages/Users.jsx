// frontend/src/features/admin/pages/Users.jsx
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  Search, 
  MoreVertical, 
  Key, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Edit,
  Save,
  X,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { adminService } from '@/features/admin/services/adminService'

const roleColors = {
  admin: 'destructive',
  pemilik: 'default',
  penyewa: 'secondary'
}

const roleLabels = {
  admin: 'Admin',
  pemilik: 'Pemilik',
  penyewa: 'Penyewa'
}

// SKELETON COMPONENT
function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// EDIT USER DIALOG
function EditUserDialog({ user, open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nama || '',
        email: user.email || '',
        phone: user.no_telp || '',
      })
      setPhotoPreview(user.foto_ktp ? `http://localhost:8000/storage/${user.foto_ktp}` : null)
    }
  }, [user])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      if (photo) {
        formDataToSend.append('photo', photo)
      }
      
      await adminService.updateUser(user.id_pengguna, formDataToSend)
      toast.success('Profil user berhasil diupdate')
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update profil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profil User</DialogTitle>
          <DialogDescription>
            Edit informasi profil user
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Foto Profile */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="size-20">
              <AvatarImage src={photoPreview} />
              <AvatarFallback className="text-2xl">
                {formData.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="photo-upload" className="cursor-pointer text-sm text-primary">
              <Upload className="inline size-4 mr-1" />
              Ganti Foto
            </Label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Nama */}
          <div>
            <Label>Nama Lengkap</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap"
            />
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
            />
          </div>

          {/* Telepon */}
          <div>
            <Label>No. Telepon</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="No. Telepon"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <RefreshCw className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// RESET PASSWORD DIALOG
function ResetPasswordDialog({ user, open, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    
    setIsLoading(true)
    try {
      await adminService.resetPassword(user.id_pengguna, newPassword)
      toast.success(`Password ${user.nama} berhasil direset`)
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password untuk <span className="font-semibold">{user?.nama}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label>Password Baru</Label>
          <div className="relative mt-1">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Password minimal 6 karakter
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <RefreshCw className="size-4 mr-2 animate-spin" /> : <Key className="size-4 mr-2" />}
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// DELETE USER DIALOG
function DeleteUserDialog({ user, open, onClose, onSuccess }) {
  const [confirmName, setConfirmName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (confirmName !== user?.nama) {
      toast.error('Nama tidak cocok')
      return
    }
    
    setIsLoading(true)
    try {
      await adminService.deleteUser(user.id_pengguna)
      toast.success(`User ${user.nama} berhasil dihapus`)
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal hapus user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Hapus User</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. User akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Ketik <span className="font-bold text-red-600">{user?.nama}</span> untuk konfirmasi:
          </p>
          <Input
            className="mt-2"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Ketik "${user?.nama}"`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <RefreshCw className="size-4 mr-2 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
            Hapus Permanen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// MAIN COMPONENT
export default function Users() {
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await adminService.getUsers()
      const usersData = res.data.data?.data || res.data.data || res.data.users || []
      setUsers(usersData)
    } catch (error) {
      toast.error('Gagal memuat data users')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.no_telp?.includes(searchTerm)
  )

  const getInitials = (nama) => {
    if (!nama) return '?'
    return nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getPhotoUrl = (fotoKtp) => {
    if (!fotoKtp) return null
    if (fotoKtp.startsWith('http')) return fotoKtp
    return `http://localhost:8000/storage/${fotoKtp}`
  }

  if (isLoading) {
    return <UsersSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola semua pengguna SiPetualang</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Daftar Pengguna</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <CardDescription>
            Total pengguna: {filteredUsers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status KTP</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id_pengguna}>
                      <TableCell>
                        <Avatar className="size-10">
                          <AvatarImage src={getPhotoUrl(user.foto_ktp)} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(user.nama)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{user.nama}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.no_telp || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={roleColors[user.peran_pengguna] || 'outline'}>
                          {roleLabels[user.peran_pengguna] || user.peran_pengguna}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.verifikasi_ktp ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="size-3 mr-1" />
                            Terverifikasi
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            <XCircle className="size-3 mr-1" />
                            Belum Verifikasi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 size-4" />
                              Edit Profil
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setResetDialogOpen(true)
                              }}
                              disabled={user.peran_pengguna === 'admin'}
                            >
                              <Key className="mr-2 size-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteDialogOpen(true)
                              }}
                              disabled={user.peran_pengguna === 'admin'}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Hapus Akun
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={fetchUsers}
      />

      <ResetPasswordDialog
        user={selectedUser}
        open={resetDialogOpen}
        onClose={() => {
          setResetDialogOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={fetchUsers}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={fetchUsers}
      />
    </div>
  )
}