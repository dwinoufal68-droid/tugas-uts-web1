# BookStore — Project UTS Pemrograman Web 1

Aplikasi pemesanan buku online berbasis front-end menggunakan HTML, CSS, dan JavaScript. Data dummy berada pada `data.js` dalam bentuk array dan object JavaScript, tanpa server/database.

## Cara menjalankan
1. Ekstrak ZIP project.
2. Buka folder `BookStore_Project_UTS` di Visual Studio Code.
3. Instal ekstensi Live Server.
4. Klik kanan `login.html` lalu pilih **Open with Live Server**.

## Akun demo
- `rina@gmail.com` / `rina123` (User)
- `agus@gmail.com` / `agus123` (User)
- `siti@gmail.com` / `siti123` (Admin)

## Nomor tracking demo
- `20230012` — Rina Wulandari
- `20230013` — Agus Pranoto

## Halaman
- `login.html`: login, modal lupa password, dan pendaftaran demo.
- `dashboard.html`: greeting berdasarkan waktu lokal dan ringkasan katalog.
- `stok.html`: katalog, pencarian, filter, tambah dan hapus buku.
- `checkout.html`: keranjang, validasi pesanan, metode pembayaran, riwayat.
- `tracking.html`: pencarian nomor DO dan riwayat perjalanan.

## File utama
- `data.js`: `dataPengguna`, `dataKatalogBuku`, `dataTracking`.
- `script.js`: manipulasi DOM dan logika aplikasi.
- `style.css`: tampilan responsif.

## Catatan
Data katalog dan transaksi disimpan di localStorage browser. Pendaftaran pengguna demo hanya berlaku pada sesi halaman dan bukan sistem akun sungguhan. Login menggunakan data dummy di JavaScript, bukan autentikasi aman. Pembayaran dan tracking merupakan simulasi, bukan layanan ekspedisi sungguhan.

## Screenshot dan video
Simpan bukti screenshot pengerjaan di folder `screenshots/`. Tambahkan link video YouTube penjelasan project sebelum pengumpulan.

## Tracking Nomor Pesanan (DO)

1. Buka halaman **Pemesanan** dan tambahkan buku ke keranjang.
2. Isi nama, email, alamat, dan metode pembayaran, lalu klik **Buat Pesanan**.
3. Salin nomor DO yang muncul pada notifikasi, dengan format `DO-YYYYMMDD-XXXXXX`.
4. Buka menu **Pengiriman**, tempel nomor DO tersebut, lalu klik **Cari**.
5. Data transaksi dan tracking disimpan di `localStorage` browser, sehingga tetap tersedia saat berpindah halaman atau me-refresh halaman pada browser yang sama.

**Catatan:** Sistem tracking ini merupakan simulasi untuk tugas front-end. Status dan riwayat pengiriman bukan data langsung dari API ekspedisi. Jangan menghapus data situs/browser jika ingin mempertahankan riwayat pesanan.
