# Backend Progress — SiPetualang

> Last updated: 2026-05-02

## Current Sprint: Sprint 1 — Foundation

| Phase | Task | Status | Completion |
|-------|------|--------|------------|
| 1 | Laravel 13 Project Setup | ✅ Done | 100% |
| 1 | JWT Auth (php-open-source-saver/jwt-auth) | ✅ Done | 100% |
| 1 | Spatie Permission v7 RBAC | ✅ Done | 100% |
| 1 | .env.example → MySQL sipetualang | ✅ Done | 100% |
| 2 | Database Migrations (9 tables) | ✅ Done | 100% |
| 3 | Eloquent Models (9 models) | ✅ Done | 100% |
| 4 | Auth API (register/login/logout/refresh/me) | ✅ Done | 100% |
| 4 | Admin Dashboard API | ✅ Done | 100% |
| 4 | API Routes (auth + role-based) | ✅ Done | 100% |
| 5 | Seeders (roles, users, data) | ✅ Done | 100% |
| - | Admin CRUD Controllers | ⬜ Pending | 0% |
| - | Penyewa CRUD Controllers | ⬜ Pending | 0% |
| - | Customer CRUD Controllers | ⬜ Pending | 0% |
| - | KTP Verification API | ⬜ Pending | 0% |
| - | File Upload (KTP, proof) | ⬜ Pending | 0% |
| - | i18n Error Messages | ⬜ Pending | 0% |
| - | API Resource Transformers | ⬜ Pending | 0% |
| - | Unit & Feature Tests | ⬜ Pending | 0% |

## Overall Progress: **60%** (Foundation Complete)

---

## Next Steps
1. Verify migration + seed (`php artisan migrate:fresh --seed`)
2. Create MySQL database `sipetualang`
3. Build Admin CRUD controllers
4. Build Penyewa & Customer controllers
5. KTP verification flow (manual approval)
6. i18n error messages (ID/EN)
7. API Resource classes for response formatting
8. Feature tests
