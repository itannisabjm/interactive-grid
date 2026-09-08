# InteractiveGrid

**Versi: 1.1.0**

Plugin JavaScript ringan untuk membuat tabel/grafik interaktif berbasis **HTML + CSS + JavaScript murni**, tanpa framework dan tanpa dependency eksternal.

Fitur utama:

- Tanda ditempatkan tepat pada **persimpangan garis grid**.
- Setiap koordinat dapat berisi **●**, **X**, atau **● + X sekaligus**.
- Koordinat yang dibuat berurutan otomatis dihubungkan menjadi garis grafik, termasuk grafik naik/turun.
- Jika sebuah koordinat dihapus seluruhnya, garis otomatis menyambungkan koordinat sebelum dan sesudahnya.
- Bisa menghapus hanya ● atau hanya X pada koordinat yang memiliki dua tanda.
- API untuk tambah/hapus/get/set/clear/undo/JSON.
- **Permanent line/reference line**: garis tetap antara tepat 2 koordinat, marker ujung `dot`/`x`, teks mengikuti kemiringan garis, serta pengaturan warna/ukuran.
- Event `interactivegrid:change` dan callback `onChange`.
- Mendukung mouse dan sentuhan dasar.
- Bisa digunakan pada HTML biasa, PHP, React, Laravel, Vue, Next.js, dan aplikasi web lain.

## Struktur

```text
interactive-grid/
├── interactive-grid.js
├── interactive-grid.css
└── README.md
```

## 1. Penggunaan pada HTML biasa

Pastikan ketiga file berada dalam folder `interactive-grid`.

```html
<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Contoh InteractiveGrid</title>
  <link rel="stylesheet" href="interactive-grid/interactive-grid.css">
</head>
<body>
  <div id="grafik"></div>

  <script src="interactive-grid/interactive-grid.js"></script>
  <script>
    const grid = new InteractiveGrid('#grafik', {
      columns: 17,
      rows: 11,
      xAxisTitle: 'Waktu',
      xAxisSubtitle: '(Jam)'
    });

    // contoh data awal
    grid.addPoint(1, 4, 'dot');
    grid.addPoint(3, 7, 'x');
    grid.addPoint(5, 5, 'dot');

    grid.addPermanentLine({
      id: 'waspada',

      from: {
        x: 2,
        y: 2,
        type: 'dot'
      },

      to: {
        x: 8,
        y: 8,
        type: 'dot'
      },

      lineColor: '#FF0000',
      lineWidth: 4,

      text: 'waspada',
      textColor: '#111111',
      textSize: 34,
      textOffset: 26
    });
  </script>
</body>
</html>
```

## 2. Penggunaan pada PHP

PHP tidak membutuhkan integrasi khusus karena plugin berjalan di sisi browser.

```php
<?php
// contoh data dari database
$data = [
    ['x' => 1, 'y' => 4, 'types' => ['dot']],
    ['x' => 3, 'y' => 7, 'types' => ['x']],
    ['x' => 5, 'y' => 5, 'types' => ['dot', 'x']],
];
?>

<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="interactive-grid/interactive-grid.css">
</head>
<body>
  <div id="grafik"></div>

  <script src="interactive-grid/interactive-grid.js"></script>
  <script>
    const grid = new InteractiveGrid('#grafik', {
      columns: 17,
      rows: 11
    });

    const dataDariPHP = <?= json_encode($data, JSON_UNESCAPED_UNICODE) ?>;
    grid.setData(dataDariPHP, { silent: true });

    grid.options.onChange = function(data) {
      console.log('Data terbaru:', data);
      // data ini bisa dikirim dengan fetch/AJAX ke endpoint PHP.
    };
  </script>
</body>
</html>
```

### Contoh kirim data ke PHP

```javascript
fetch('simpan-grafik.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(grid.getData())
});
```

`simpan-grafik.php`:

```php
<?php
$data = json_decode(file_get_contents('php://input'), true);

// Validasi data sebelum disimpan ke database.
// Contoh sederhana:
file_put_contents('grafik.json', json_encode($data));

header('Content-Type: application/json');
echo json_encode(['success' => true]);
```

## 3. Penggunaan pada React JS

`interactive-grid.js` dibuat sebagai plugin framework-agnostic dan mengekspos class `window.InteractiveGrid`.

Simpan file plugin misalnya:

```text
src/
├── components/
│   └── InteractiveGridChart.jsx
├── vendor/
│   ├── interactive-grid.js
│   └── interactive-grid.css
```

Component React:

```jsx
import { useEffect, useRef } from 'react';
import '../vendor/interactive-grid.css';
import '../vendor/interactive-grid.js';

export default function InteractiveGridChart({ value = [], onChange }) {
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = new window.InteractiveGrid(containerRef.current, {
      columns: 17,
      rows: 11,
      onChange(data) {
        onChange?.(data);
      }
    });

    grid.setData(value, { silent: true });
    gridRef.current = grid;

    return () => {
      grid.destroy();
      gridRef.current = null;
    };
  }, []);

  // Jika value dari parent dapat berubah dari luar plugin,
  // sinkronkan dengan effect kedua.
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.setData(value, { silent: true });
    }
  }, [value]);

  return <div ref={containerRef} />;
}
```

Penggunaan:

```jsx
import { useState } from 'react';
import InteractiveGridChart from './components/InteractiveGridChart';

export default function App() {
  const [data, setData] = useState([
    { x: 1, y: 5, types: ['dot'] },
    { x: 3, y: 8, types: ['x'] }
  ]);

  return (
    <>
      <InteractiveGridChart value={data} onChange={setData} />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
```

> Pada Next.js, komponen pembungkus harus berjalan di client (`'use client'`) karena plugin menggunakan DOM/browser.

## Permanent line / data permanen

Fitur **data permanen** digunakan untuk membuat garis referensi yang tidak ikut berubah saat pengguna menambah, menghapus, atau melakukan `undo()` pada titik interaktif. Cocok untuk garis batas seperti **Waspada**, **Normal**, **Target**, atau garis acuan lain.

Satu item permanent line selalu mempunyai **tepat 2 titik koordinat**. Masing-masing titik dapat menggunakan tanda `dot` atau `x`.

Contoh seperti gambar: titik `(2,2)` dan `(8,8)`, garis hijau, serta tulisan **waspada** sedikit di atas garis:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11
});

grid.addPermanentLine({
  id: 'waspada',
  from: { x: 2, y: 2, type: 'dot' },
  to:   { x: 8, y: 8, type: 'dot' },

  lineColor: '#20a957',
  lineWidth: 4,

  text: 'waspada',
  textColor: '#111111',
  textSize: 34,
  textOffset: 26
});
```

Teks otomatis diputar mengikuti kemiringan garis dan ditempatkan sedikit di atas garis. `textOffset` mengatur jaraknya dalam pixel.

Marker kedua ujung boleh berbeda:

```javascript
grid.addPermanentLine({
  id: 'batas-1',
  from: { x: 1, y: 4, type: 'dot' },
  to:   { x: 7, y: 7, type: 'x' },
  lineColor: '#d97706',
  text: 'Batas',
  textColor: '#b91c1c',
  textSize: 24
});
```

### Banyak permanent line sekaligus

```javascript
grid.setPermanentData([
  {
    id: 'waspada',
    from: { x: 2, y: 2, type: 'dot' },
    to: { x: 8, y: 8, type: 'dot' },
    lineColor: '#20a957',
    text: 'waspada',
    textColor: '#111',
    textSize: 34,
    textOffset: 26
  },
  {
    id: 'target',
    from: { x: 9, y: 3, type: 'x' },
    to: { x: 14, y: 6, type: 'dot' },
    lineColor: '#2563eb',
    text: 'target',
    textColor: '#2563eb',
    textSize: 22
  }
]);
```

### API permanent line

```javascript
// Tambah satu garis permanen. Mengembalikan id.
const id = grid.addPermanentLine(config);

// Ganti seluruh data permanen.
grid.setPermanentData(array);

// Ambil seluruh data permanen.
const permanent = grid.getPermanentData();

// Ambil satu garis permanen.
const line = grid.getPermanentLine('waspada');

// Update tanpa membuat ulang garis.
grid.updatePermanentLine('waspada', {
  text: 'WASPADA',
  lineColor: '#ef4444',
  textColor: '#ef4444',
  textSize: 30
});

// Hapus satu permanent line.
grid.removePermanentLine('waspada');

// Hapus semua permanent line.
grid.clearPermanentData();
```

`clear()` hanya menghapus **titik interaktif**. Data permanen tetap ada. Begitu juga `undo()` hanya mengembalikan riwayat titik interaktif, sehingga garis referensi tidak ikut hilang. Untuk menghapus data permanen gunakan `removePermanentLine()` atau `clearPermanentData()`.

### Menyimpan titik interaktif + permanent line sekaligus

API lama `getData()` dan `toJSON()` tetap hanya mengembalikan data titik interaktif agar kompatibel dengan versi sebelumnya. Untuk menyimpan seluruh keadaan grafik gunakan:

```javascript
const state = grid.getAllData();

// hasil:
// {
//   points: [...],
//   permanent: [...]
// }

const json = grid.toFullJSON();
```

Untuk memuat kembali:

```javascript
grid.setAllData(state, { silent: true });
// atau
grid.fromFullJSON(json, { silent: true });
```

Contoh format data lengkap:

```json
{
  "points": [
    { "x": 3, "y": 5, "types": ["x"] }
  ],
  "permanent": [
    {
      "id": "waspada",
      "from": { "x": 2, "y": 2, "type": "dot" },
      "to": { "x": 8, "y": 8, "type": "dot" },
      "lineColor": "#20a957",
      "lineWidth": 4,
      "text": "waspada",
      "textColor": "#111111",
      "textSize": 34,
      "textOffset": 26,
      "textFontFamily": "Arial, Helvetica, sans-serif"
    }
  ]
}
```


## Format data

Format utama:

```json
[
  { "x": 1, "y": 5, "types": ["dot"] },
  { "x": 2, "y": 7, "types": ["x"] },
  { "x": 3, "y": 6, "types": ["dot", "x"] }
]
```

Urutan array menentukan urutan garis.

Sebagai kompatibilitas, `setData()` juga menerima format satu tanda per item:

```json
[
  { "x": 1, "y": 5, "type": "dot" },
  { "x": 2, "y": 7, "type": "x" }
]
```

## API

### Membuat instance

```javascript
const grid = new InteractiveGrid('#grafik', options);
```

Target dapat berupa selector CSS atau elemen DOM:

```javascript
new InteractiveGrid(document.getElementById('grafik'));
```

### `addPoint(x, y, type)`

Tambah tanda.

```javascript
grid.addPoint(3, 7, 'dot');
grid.addPoint(3, 7, 'x'); // koordinat yang sama sekarang memiliki ● + X
```

`type`: `dot` atau `x`.

### `removePoint(x, y, type?)`

Hapus tanda tertentu:

```javascript
grid.removePoint(3, 7, 'x');
```

Hapus seluruh koordinat:

```javascript
grid.removePoint(3, 7);
```

Jika koordinat di tengah rangkaian dihapus, garis otomatis disambungkan kembali.

### `getData()`

```javascript
const data = grid.getData();
```

Mengembalikan salinan data, sehingga aman dimodifikasi di luar plugin.

### `setData(data, options?)`

```javascript
grid.setData([
  { x: 1, y: 4, types: ['dot'] },
  { x: 2, y: 6, types: ['x'] }
]);
```

Tanpa memasukkan operasi ke history dan tanpa memicu `onChange`:

```javascript
grid.setData(data, { silent: true });
```

### `getPoint(x, y)`

```javascript
const point = grid.getPoint(3, 7);
```

Hasil contoh:

```javascript
{ x: 3, y: 7, types: ['dot', 'x'] }
```

### `hasPoint(x, y, type?)`

```javascript
grid.hasPoint(3, 7);        // true jika ada tanda apa pun
grid.hasPoint(3, 7, 'dot'); // true jika ada dot
```

### `clear()`

```javascript
grid.clear();
```

### `undo()`

```javascript
grid.undo();
```

History disimpan maksimal 100 perubahan.

### `toJSON()` / `fromJSON()`

```javascript
const json = grid.toJSON();
localStorage.setItem('grafik', json);

grid.fromJSON(localStorage.getItem('grafik'));
```

### `render()`

Memaksa gambar ulang:

```javascript
grid.render();
```

### `destroy()`

Penting pada SPA/React untuk membersihkan event listener:

```javascript
grid.destroy();
```

## Options

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  xStart: 0,
  yStart: 0,
  cellWidth: 54,
  cellHeight: 42,

  xAxisTitle: 'Waktu',
  xAxisSubtitle: '(Jam)',

  showToolbar: true,
  showStatus: true,
  showUndo: true,
  showClear: true,

  lineWidth: 4,
  markSize: 10,
  xMarkSize: 13,
  markStrokeWidth: 5,
  lineColor: '#18a94d',
  markColor: '#111',

  onChange(data, reason) {
    console.log(reason, data);
  },

  onSelect(info) {
    console.log('Koordinat dipilih:', info);
  }
});
```

### Arti `columns` dan `rows`

`columns: 17` berarti tersedia 17 titik X: `0..16`.

`rows: 11` berarti tersedia 11 titik Y: `0..10`.

Jika:

```javascript
xStart: 1,
yStart: 1,
columns: 24,
rows: 10
```

maka X menjadi `1..24` dan Y menjadi `1..10`.

## Event DOM

Selain callback `onChange`, plugin mengirim custom event:

```javascript
document.querySelector('#grafik').addEventListener('interactivegrid:change', function(e) {
  console.log(e.detail.reason);
  console.log(e.detail.data);
});
```

Reason yang tersedia saat ini:

- `add`
- `remove`
- `setData`
- `clear`
- `undo`

## Menyimpan ke database

Untuk database, format yang paling sederhana adalah menyimpan `grid.getData()` sebagai JSON.

Contoh kolom:

```text
id
patient_id / form_id
chart_data JSON/TEXT
created_at
updated_at
```

Jika membutuhkan query per titik, data dapat dinormalisasi menjadi tabel detail:

```text
chart_points
- id
- chart_id
- sequence
- x
- y
- has_dot
- has_x
```

`sequence` penting karena urutan titik menentukan jalur garis.

## Catatan integrasi

1. Muat `interactive-grid.css` satu kali pada halaman.
2. Buat instance setelah container tersedia di DOM.
3. Pada React/Vue/SPA, panggil `destroy()` saat component di-unmount.
4. Jangan menyimpan HTML/SVG hasil render ke database; simpan **data JSON** saja.
5. Validasi kembali koordinat dan tipe tanda di server sebelum disimpan.
6. Jika beberapa grafik digunakan pada satu halaman, buat instance terpisah untuk masing-masing container.

Contoh:

```javascript
const gridA = new InteractiveGrid('#grafik-a');
const gridB = new InteractiveGrid('#grafik-b', { columns: 25, rows: 15 });
```

## Versi

`InteractiveGrid.VERSION`:

```javascript
console.log(InteractiveGrid.VERSION); // 1.0.0
```

## Lisensi

Kode ini dapat digunakan dan dimodifikasi pada proyek internal Anda. Jika nantinya plugin akan didistribusikan sebagai library publik, sebaiknya tambahkan file lisensi formal (misalnya MIT) dan versioning/changelog.


## Changelog

### v1.0.1
- Menambah ruang atas agar label Y tertinggi tidak terpotong.
- Menambah ruang kanan agar label X terakhir tetap terlihat.
- Menambahkan garis batas kanan dan bawah pada area grid, sehingga koordinat terakhir (mis. X=16 dan Y=0) memiliki garis yang jelas.


## Opsi tambahan v1.1.0

```javascript
const grid = new InteractiveGrid('#grafik', {
  // ...opsi lama...
  permanentLineWidth: 4,
  permanentTextOffset: 24,
  permanentTextFontFamily: 'Arial, Helvetica, sans-serif'
});
```

Nilai di atas menjadi default jika properti yang sama tidak diberikan pada masing-masing permanent line.

## Catatan integrasi database

Untuk aplikasi PHP/React/SIMRS, disarankan menyimpan `grid.getAllData()` sebagai JSON jika permanent line berbeda untuk setiap record/pasien/form. Jika permanent line adalah standar tetap aplikasi, Anda juga dapat menyimpannya di konfigurasi frontend dan hanya menyimpan `grid.getData()` ke database.

Jika data berasal dari backend, selalu lakukan validasi koordinat, tipe marker (`dot`/`x`), warna, ukuran teks, dan panjang teks di sisi server sebelum menyimpannya.
