# SSR Logs Dashboard

SSR Logs Dashboard adalah aplikasi web berbasis *Next.js* (Frontend) dan *FastAPI* (Backend) yang digunakan untuk memonitoring, memvisualisasikan, serta menganalisis performa dan kerusakan sistem radar secara otomatis.

Aplikasi ini menggunakan berbagai pendekatan Machine Learning untuk mengubah raw data (log kerusakan) menjadi wawasan *predictive* dan *prescriptive* (prediksi dan saran) yang mudah dipahami.

---

## 📊 Kategori Data (Log Parameter)

Sistem ini memantau 5 parameter utama dari sistem radar:
1. **Failures (Failure Summary)**: Log kerusakan umum atau sistem yang mati total.
2. **Encoder**: Log jumlah peringatan/error yang terjadi pada sistem mekanik/encoder radar.
3. **Netburner**: Log peringatan/error yang berhubungan dengan masalah jaringan atau modul komunikasi Netburner.
4. **Elevation**: Data operasional terkait parameter kemiringan antena (elevasi).
5. **Azimuth**: Data operasional terkait parameter putaran/rotasi antena (azimuth).

---

## 💻 Struktur Sistem

Aplikasi ini dibagi menjadi dua komponen utama:

### 1. Frontend (Next.js + React + TailwindCSS)
Bertugas menampilkan visualisasi data yang responsif.
- **Dashboard (Overview)**: 
  - Menampilkan ringkasan total error untuk masing-masing parameter.
  - Grafik Garis (*Line Chart*) untuk memonitor aktivitas/lonjakan error harian (dapat di-filter berdasarkan rentang waktu).
  - Grafik Batang (*Bar Chart*) untuk melihat radar mana yang paling sering mengalami kerusakan.
  - Tabel rincian untuk tipe kerusakan Elevation, Azimuth, dan Encoder/Netburner.
- **Data Analytics**:
  - Halaman khusus hasil prediksi dan pola yang ditemukan oleh Machine Learning.

### 2. Backend (FastAPI + Python + Scikit-Learn + Polars)
Berada di dalam file `ssr/mlssr.py`. Backend ini mengambil data dari database SQL Server lalu menjalankan pemrosesan *Machine Learning* untuk diekspos sebagai API (`http://127.0.0.1:8000`).

---

## 🤖 Fitur Machine Learning (Data Analytics)

Sistem ini tidak hanya merekam data, tetapi juga menggunakan **Kecerdasan Buatan (Machine Learning)** untuk menarik kesimpulan. Berikut adalah 4 algoritma utama yang digunakan di halaman Analytics:

### 1. Segmentasi Radar (K-Means Clustering)
- **Fungsi**: Secara otomatis mengelompokkan radar berdasarkan tren kerusakannya.
- **Output**: Membagi radar menjadi 3 Kategori secara dinamis:
  - 🟢 **Stabil / Sehat**: Radar dengan jumlah keluhan sangat sedikit/normal.
  - 🟡 **Rawan Encoder**: Radar yang butuh perhatian mekanik (lebih banyak error Encoder).
  - 🔴 **Rawan Netburner**: Radar yang butuh perhatian jaringan/komunikasi (lebih banyak error Netburner).
- **Tampilan**: Ditampilkan dalam bentuk *Scatter Plot*, dan baris tabel dapat di-klik untuk memunculkan daftar detail radar yang termasuk di kategori tersebut.

### 2. Analisis MTBF (Mean Time Between Failures)
- **Fungsi**: Mengukur seberapa sering sebuah komponen rusak.
- **Output**: Menghitung **jarak hari rata-rata** antar kerusakan. Semakin kecil angkanya (misal MTBF = 2 Hari), berarti radar tersebut sangat kritis dan hampir rusak setiap hari.
- **Tampilan**: *Horizontal Bar Chart* berwarna merah-kuning-hijau dan tabel "Top 5 Critical Radars".

### 3. Prediksi Efek Domino (Markov Chain)
- **Fungsi**: Memprediksi rantai kejadian masa depan.
- **Output**: Menjawab pertanyaan: *"Jika komponen A rusak hari ini, seberapa besar probabilitas besoknya komponen B ikut rusak?"*
- **Tampilan**: Disajikan dalam diagram alir *Sankey Diagram* yang estetik, menunjukkan perpindahan dari satu *state* error ke *state* lainnya.

### 4. Pola Kerusakan Bersamaan (Apriori / Association Rules)
- **Fungsi**: Menemukan relasi antar kejadian pada hari yang sama.
- **Output**: Menjawab pertanyaan: *"Jika Encoder rusak hari ini, seberapa yakin kita bahwa Netburner juga ternyata rusak secara bersamaan?"* 
- **Tampilan**: Tabel Aturan (Pemicu -> Dampak) yang dilengkapi metrik **Confidence** (Tingkat Kepastian %) dan **Lift** (Status Kuat/Lemah dari Relasi tersebut).

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan Backend (Machine Learning & API)**
   ```bash
   npm run backend
   # Atau jalankan script python secara manual:
   # python ssr/mlssr.py
   ```
   *Backend akan berjalan di `http://127.0.0.1:8000`*

2. **Jalankan Frontend (Dashboard Next.js)**
   ```bash
   npm run dev
   ```
   *Aplikasi web bisa diakses di `http://localhost:3000`*

## 📝 Catatan Penting
- Semua logika *filter time range* di grafik menggunakan acuan **tanggal paling baru di dalam dataset**, bukan jam sistem komputer lokal. Hal ini dilakukan untuk menghindari data yang terlihat kosong jika database tidak diupdate dengan data hari ini secara real-time.
- Bug *Timezone* dari API JSON (dimana tanggal mundur 1 hari) sudah diperbaiki dengan menghindari penggunaan `.toISOString()` dan menggunakan *Local Date parser* atau ekstrak format `YYYY-MM-DD` secara eksplisit.