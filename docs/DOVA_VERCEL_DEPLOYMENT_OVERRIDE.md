# DOVA Deployment Override

Dokumen ini mengoverride bagian deployment lama yang menyebut Docker dan DigitalOcean App Platform.

## Keputusan saat ini

- Frontend Next.js dibuild dan dideploy di Vercel melalui `vercel.json`.
- Repository tidak memakai Dockerfile atau Docker Compose untuk build/deploy.
- Backend NestJS berjalan pada runtime Node.js terpisah.
- PostgreSQL dan Redis disediakan sebagai managed/external services melalui `DATABASE_URL` dan `REDIS_URL`.
- CI menjalankan install, build, typecheck, dan test tanpa membuild image Docker.
- Migration remote dijalankan manual melalui `.github/workflows/database-migrate.yml`.

Jika instruksi di dokumen lama berbeda dengan keputusan ini, dokumen ini dan konfigurasi repository adalah sumber yang berlaku.
