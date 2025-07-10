# 🦆 DuckCount - Computer Vision Project

DuckCount adalah proyek Computer Vision yang dibuat untuk mendeteksi dan menghitung jumlah bebek dalam sebuah gambar menggunakan model YOLOv8 dari Ultralytics. Proyek ini bertujuan sebagai eksperimen sederhana dalam bidang deteksi objek dengan deep learning dan pengolahan citra.

---

## 📌 Fitur Utama

- Deteksi objek bebek secara otomatis dari gambar
- Menampilkan bounding box hasil deteksi
- Implementasi YOLOv8 dari Ultralytics
- Dapat dijalankan secara lokal maupun di Google Colab

---

## 🧠 Teknologi yang Digunakan

- Python 3.x
- Ultralytics (YOLOv8)
- OpenCV
- Google Colab
- Matplotlib

---

## 📁 Struktur Proyek

```
DuckCount-ComputerVision/
├── datasets/               # Dataset pelatihan dan pengujian
├── images/                 # Gambar uji deteksi
├── model/                  # Model YOLOv8 (.pt file)
├── src/
│   └── detect_ducks.py     # Script deteksi bebek
├── duckcount.ipynb         # Notebook eksplorasi dan visualisasi
└── README.md               # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan Proyek

### 🔧 1. Clone Repository

```bash
git clone https://github.com/TaQINgs/DuckCount-ComputerVision.git
cd DuckCount-ComputerVision
```

### 📦 2. Instalasi Dependensi

```bash
pip install ultralytics opencv-python matplotlib
```

Atau jalankan langsung di Google Colab menggunakan file `duckcount.ipynb`.

### 🧪 3. Jalankan Deteksi

```bash
python src/detect_ducks.py --source images/test.jpg
```

> Pastikan file model (`.pt`) berada di folder `model/` dan telah disesuaikan dalam kode `detect_ducks.py`.

---

## 🖼️ Contoh Hasil

Berikut adalah contoh hasil deteksi dengan bounding box:

![Contoh Deteksi](images/sample_result.jpg)

---

## 📝 Catatan Tambahan

- Dataset disiapkan dalam format YOLO (gambar dan anotasi .txt)
- Model YOLOv8 dapat dilatih ulang menggunakan Ultralytics CLI atau notebook
- Gambar uji dapat ditambahkan ke folder `images/`
- File `.pt` hasil training sendiri bisa digunakan untuk meningkatkan akurasi

---

## 🤝 Kontribusi

Kontribusi sangat terbuka! Silakan fork repository ini dan ajukan pull request untuk fitur baru, perbaikan bug, atau peningkatan dokumentasi.

---

## 📄 Lisensi

MIT License – silakan digunakan dan dimodifikasi untuk keperluan pembelajaran.

---

Made with ❤️ by [TaQINgs](https://github.com/TaQINgs)
