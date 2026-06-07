# Smart Family Hub

Platform manajemen keluarga berbasis web - kalender, tugas rumah tangga, catatan, dan dashboard aktivitas keluarga.

Dibangun untuk SRS v1.0 oleh Dryhus Dzacky Damingtyas.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel

## Setup Lokal

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` ke `.env.local` dan isi dengan kredensial Supabase Anda.

3. Apply database schema:
   - Buka Supabase Dashboard -> SQL Editor -> New query
   - Copy isi `supabase/schema.sql` -> Paste -> Run

4. Jalankan dev server:
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Fitur (FR-01 s/d FR-14)

- FR-01/02/14: Registrasi, Login, Logout
- FR-03: Buat keluarga (otomatis jadi Admin)
- FR-04: Undang anggota via email (kode undangan)
- FR-05: Edit profil keluarga (Admin)
- FR-06/07: Manajemen acara + kalender bulanan interaktif
- FR-08/09: Tugas rumah tangga (Kanban: Belum Dimulai - Sedang Dikerjakan - Selesai)
- FR-10: Catatan keluarga bersama
- FR-11: Pengingat acara & deadline tugas di dashboard
- FR-12: Dashboard ringkasan
- FR-13: Riwayat aktivitas keluarga (100 terbaru)

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new)
3. Set environment variables (sama persis dengan `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

## Lisensi

Educational project - 2026
