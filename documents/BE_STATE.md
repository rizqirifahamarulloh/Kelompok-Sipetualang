# Backend State — SiPetualang

> Last updated: 2026-05-02

## Tech Stack
- **Framework**: Laravel 13 (released March 2026)
- **PHP**: 8.4.20
- **Auth**: JWT via `php-open-source-saver/jwt-auth` v2.9
- **RBAC**: `spatie/laravel-permission` v7.4
- **Database**: MySQL — `sipetualang`
- **API Format**: JSON with standardized ApiResponse trait

## Architecture
```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php          # JWT auth
│   │   └── Admin/
│   │       └── DashboardController.php # Admin dashboard stats
│   ├── Models/                         # 9 Eloquent models
│   │   ├── User.php                    # JWTSubject + HasRoles
│   │   ├── Gear.php                    # Outdoor equipment
│   │   ├── Category.php
│   │   ├── Destination.php
│   │   ├── GearStandard.php
│   │   ├── Transaction.php
│   │   ├── TransactionDetail.php
│   │   ├── Payment.php
│   │   └── Deposit.php
│   └── Traits/
│       └── ApiResponse.php             # Standardized JSON responses
├── database/
│   ├── migrations/                     # 12 migration files
│   └── seeders/                        # 7 seeders + DatabaseSeeder
├── routes/
│   └── api.php                         # JWT-protected routes
└── config/
    ├── auth.php                        # JWT guard configured
    ├── jwt.php                         # JWT settings
    └── permission.php                  # Spatie config
```

## Database Tables
| Table | Model | Mapped From |
|-------|-------|-------------|
| users | User | pengguna |
| categories | Category | kategori |
| destinations | Destination | jenisdestinasi |
| gears | Gear | barang |
| gear_standards | GearStandard | standaralat |
| transactions | Transaction | transaksi |
| transaction_details | TransactionDetail | detail_transaksi |
| payments | Payment | pembayaran |
| deposits | Deposit | NEW |

## Roles & Permissions
| Role | Guard | Description |
|------|-------|-------------|
| super_admin | api | Full access to all resources |
| penyewa | api | Manage own gears, view transactions |
| customer | api | Browse gears, create transactions, upload payments |

## API Endpoints (Implemented)
```
POST   /api/auth/register    # Public
POST   /api/auth/login       # Public
POST   /api/auth/logout      # Auth required
POST   /api/auth/refresh     # Auth required
GET    /api/auth/me          # Auth required
GET    /api/admin/dashboard  # super_admin only
```

## Current Blockers
- MySQL database `sipetualang` must be created manually before migrate
- Admin/Penyewa/Customer CRUD controllers not yet implemented
- No file upload handling yet

## Known Issues
- None currently (fresh setup)
