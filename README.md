# Smart Family Hub

Platform manajemen keluarga modern — kalender, tugas, catatan, dan dashboard aktivitas keluarga dalam satu aplikasi.

Live: **[smart-family-hub.vercel.app](https://smart-family-hub.vercel.app)**

---

## Fitur Utama

- **Dashboard** — Ringkasan aktivitas keluarga: anggota, tugas aktif, acara mendatang, dan catatan terbaru
- **Kalender Bersama** — Sinkronisasi jadwal seluruh anggota keluarga
- **Acara** — Daftar acara mendatang lengkap dengan tanggal, waktu, lokasi, dan deskripsi
- **Tugas Rumah Tangga** — Delegasi tugas ke anggota keluarga, pantau status, dan deadline
- **Catatan Keluarga** — Catatan bersama: daftar belanja, resep, informasi penting
- **Profil Saya** — Foto profil, nama, tanggal lahir, dan deskripsi diri
- **Keluarga** — Atur info keluarga, undang anggota baru via kode 6-karakter, kelola peran
- **Riwayat Aktivitas** — Log semua perubahan dalam keluarga

---

## Langkah-Langkah Memakai Aplikasi

### 1. Daftar Akun
1. Buka [smart-family-hub.vercel.app](https://smart-family-hub.vercel.app)
2. Klik **Daftar Gratis** di pojok kanan atas
3. Isi **Nama Lengkap**, **Email**, dan **Password** (minimal 6 karakter)
4. Klik **Daftar Akun**

### 2. Buat atau Gabung Keluarga
Setelah daftar, kamu akan diarahkan ke halaman onboarding.

**Opsi A — Buat keluarga baru** (jika kamu admin):
1. Pilih tab **Buat Keluarga Baru**
2. Isi **Nama Keluarga** (mis. "Keluarga Damingtyas")
3. Isi deskripsi (opsional)
4. Klik **Buat Keluarga** — kamu otomatis jadi Admin

**Opsi B — Gabung dengan keluarga yang sudah ada**:
1. Minta admin keluarga mengirim undangan ke email kamu
2. Pilih tab **Gabung dengan Kode**
3. Tempel kode undangan 6-karakter dari admin
4. Klik **Gabung Keluarga**

### 3. Lengkapi Profil
1. Klik menu **Profil** (ikon orang) di sidebar
2. Klik foto profil untuk upload foto baru (max 2 MB)
3. Isi **Tanggal Lahir** dan **Deskripsi / Bio**
4. Klik **Simpan Perubahan**

### 4. Undang Anggota Keluarga (Admin)
1. Buka menu **Keluarga** di sidebar
2. Scroll ke bagian **Undang Anggota**
3. Masukkan email anggota baru
4. Klik **Buat Undangan** — sistem akan generate **kode 6-karakter**
5. Bagikan kode tersebut ke anggota keluarga via WhatsApp / email
6. Mereka tinggal daftar akun lalu pakai kode itu di tab "Gabung dengan Kode"

### 5. Kelola Acara
1. Buka menu **Acara** di sidebar
2. Klik **+ Tambah Acara**
3. Isi judul, tanggal, waktu, lokasi, dan deskripsi
4. Acara akan muncul di Dashboard sebagai pengingat dan di Kalender

### 6. Kelola Tugas
1. Buka menu **Tugas** di sidebar
2. Klik **+ Tambah Tugas**
3. Isi nama tugas, deskripsi, deadline (opsional), dan assign ke anggota
4. Update status: **Belum Dimulai** → **Sedang Dikerjakan** → **Selesai**

### 7. Catatan Bersama
1. Buka menu **Catatan**
2. Klik **+ Tambah Catatan**
3. Isi judul dan isi catatan — semua anggota keluarga bisa lihat

### 8. Kalender
- Lihat semua acara dalam tampilan kalender bulanan
- Klik tanggal untuk lihat detail acara hari itu

### 9. Riwayat Aktivitas
- Buka menu **Riwayat** untuk melihat log semua perubahan
- Berguna untuk admin memantau aktivitas keluarga

### 10. Logout
- Hover ke sidebar (desktop) → klik ikon logout
- Atau tap ikon logout di top bar (mobile)

---

## Tips Penggunaan

- **Mobile**: aplikasi fully responsive. Bottom nav bisa di-swipe horizontal untuk akses semua menu.
- **Foto profil sekali, sync ke mana saja**: ubah foto di Profil → otomatis update di sidebar, Keluarga, dan dashboard.
- **Kode undangan**: kode hanya valid untuk email yang ditentukan admin. Kalau mau ganti email, minta admin buat undangan baru.

---

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Supabase** (Auth + Postgres + Storage)
- **Tailwind CSS 4**
- **OGL** (WebGL shaders untuk Iridescence + Grainient background)
- **GSAP** (Target Cursor)
- **Plus Jakarta Sans** + **Nunito** + **Poppins** (typography)

---

## Pengembangan Lokal

```bash
# Install dependencies
npm install

# Set environment variables di .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Run dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Database Migrations

Setiap kali ada file baru di `supabase/migrations/`, jalankan SQL-nya di Supabase Dashboard → SQL Editor.

---

## Kontak

- **Email**: [dzacky98ku@gmail.com](mailto:dzacky98ku@gmail.com)
- **WhatsApp**: [+62 895-6053-52141](https://wa.me/62895605352141)
- **Lokasi**: Bandung, Indonesia

---

© 2026 Smart Family Hub · Dryhus Dzacky Damingtyas
