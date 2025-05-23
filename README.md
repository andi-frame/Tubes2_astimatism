﻿# Tubes2_astimatism
## 🧪 Astimatism - Pencarian Resep Little Alchemy 2

**Astimatism** adalah aplikasi pencari kombinasi resep elemen dalam game *Little Alchemy 2*, menggunakan algoritma pencarian graf seperti BFS dan DFS untuk menghasilkan jalur pembuatan elemen secara otomatis.
Aplikasi ini mendukung dua algoritma pencarian utama untuk menemukan kombinasi resep elemen di Little Alchemy 2, yaitu **Breadth-First Search (BFS)** dan **Depth-First Search (DFS)**.

#### 📘 Breadth-First Search (BFS)
BFS adalah algoritma pencarian yang menelusuri graf secara menyeluruh berdasarkan tingkat (level). Algoritma ini menggunakan struktur data **queue** untuk menjelajahi node dari yang paling dekat ke elemen target.

- Menemukan resep dengan kombinasi terpendek terlebih dahulu.
- Cocok untuk mencari solusi paling sederhana.
- Menjamin hasil dengan kedalaman minimum jika solusi ditemukan.

#### 📗 Depth-First Search (DFS)
DFS menelusuri graf secara mendalam terlebih dahulu sebelum kembali (*backtracking*) dan menjelajahi cabang lain. Algoritma ini menggunakan pendekatan rekursif untuk membangun pohon pencarian.

- Menemukan jalur resep secara mendalam hingga mencapai elemen dasar.
- Cocok untuk eksplorasi kombinasi unik atau struktur graf yang dalam.
- Tidak selalu menghasilkan jalur terpendek, namun dapat menemukan solusi yang tidak langsung terlihat oleh BFS.

Kedua algoritma dapat digunakan untuk mode *single recipe* maupun *multiple recipe*, dan telah dioptimalkan agar mendukung performa pencarian yang cepat dan akurat.


## Getting Started

### Frontend
First add the .env file, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Backend
First add the .env file, then:

```bash
go mod download
air
```

For development stage, server is running at [http://localhost:8080](http://localhost:8080)

Author
- Andi Farhan Hidayat 13523128
- Ahmad Syafiq 13523135
- Rafael Marchel Darma Wijaya 13523146
