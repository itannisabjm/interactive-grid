# InteractiveGrid

**Versi: 2.2.2**

Plugin JavaScript ringan untuk membuat tabel/grafik interaktif berbasis **HTML + CSS + JavaScript murni**, tanpa framework dan tanpa dependency eksternal.

Fitur utama:

- Tanda ditempatkan tepat pada **persimpangan garis grid**.
- Setiap koordinat dapat berisi **●**, **X**, atau **● + X sekaligus**.
- Popup pemilihan penanda memiliki tombol teks **Close** di kanan atas untuk menutup popup tanpa memilih atau menghapus tanda.
- Koordinat yang dibuat berurutan otomatis dihubungkan menjadi garis grafik, termasuk grafik naik/turun.
- Jika sebuah koordinat dihapus seluruhnya, garis otomatis menyambungkan koordinat sebelum dan sesudahnya.
- Bisa menghapus hanya ● atau hanya X pada koordinat yang memiliki dua tanda.
- API untuk tambah/hapus/get/set/clear/undo/JSON.
- Keterangan jumlah tanda/koordinat tampil sejajar di sebelah kanan tombol **Hapus Semua** dan dapat diatur dengan `showStatus`.
- Penanda biasa/interaktif dapat diatur **warna umum (`markColor`), warna khusus dot (`dotColor`), warna khusus X (`xColor`), ukuran dot, ukuran X, dan ketebalan X**, secara global maupun per tanda.
- Label angka sumbu X dan Y dapat diatur frekuensinya dengan `colJoinCount`

> `colJoinCount` adalah nama baru dari `xLabelStep`. Fungsi dan perilakunya sama persis. Nama lama tetap diterima sebagai alias kompatibilitas.
 dan `yLabelStep` tanpa mengubah jumlah kolom/baris atau koordinat data.
- Mendukung satu atau lebih **teks vertikal di sebelah kiri sumbu Y**, dengan pengaturan teks, warna, ukuran font, font weight, font family, dan lebar area.
- Lebar kolom dapat diatur secara global dengan `colWidth`, lalu dioverride per kolom melalui `columnsConfig` / `colWidths` / `columnWidths`.
- Tinggi baris dapat diatur secara global dengan `rowHeight`, lalu dioverride per baris melalui `rowsConfig` / `rowHeights`.
- Tabel **Waktu (Jam)** dapat ditampilkan/disembunyikan dengan `showTimeTable`; cell tabel waktu otomatis digabung mengikuti `colJoinCount`.
- Label sumbu X dapat dioverride secara dinamis dengan `xLabels` tanpa mengubah koordinat asli.
- Setiap cell tabel waktu dapat diisi jam. `showTimePicker: true` memakai time picker browser + input manual, sedangkan `false` memakai input teks manual berformat `HH:MM`.
- Posisi angka sumbu X digeser sedikit ke kiri secara default agar tidak tertutup garis vertikal; besar pergeseran dapat diatur dengan `xLabelOffset`.
- **Permanent line/reference line**: garis tetap antara tepat 2 koordinat, marker ujung `dot`/`x`, teks mengikuti kemiringan garis, serta pengaturan warna/ukuran garis, teks, dan marker.
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

      // default semua kolom
      colWidth: 54,

      // contoh override beberapa kolom
      columnsConfig: {
        3: { colWidth: 80 },
        7: { colWidth: 100 }
      },

      // default tinggi semua baris
      rowHeight: 42,

      // contoh override beberapa baris
      rowsConfig: {
        3: { rowHeight: 60 },
        7: { rowHeight: 55 }
      },

      xAxisTitle: 'Waktu',
      xAxisSubtitle: '(Jam)',
      verticalTexts: [
        { text: 'Sentimeter (cm)', fontSize: 22 }
      ]
    });

    // contoh data awal
    grid.addPoint(1, 4, 'dot');
    grid.addPoint(3, 7, 'x');
    grid.addPoint(5, 5, 'dot');
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

  // Pengaturan marker permanen (berlaku untuk kedua ujung)
  markColor: '#111111',
  dotSize: 10,
  xSize: 14,
  markStrokeWidth: 5,

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


### Mengatur ukuran dan warna marker permanent line

Marker permanen sekarang dapat diatur terpisah dari marker data interaktif.

Pengaturan yang berlaku untuk **kedua ujung garis**:

```javascript
grid.addPermanentLine({
  id: 'contoh-marker',
  from: { x: 2, y: 2, type: 'dot' },
  to:   { x: 8, y: 8, type: 'x' },

  lineColor: '#22a957',

  // Warna marker kedua ujung
  markColor: '#7c3aed',

  // Radius tanda bulat dalam pixel
  dotSize: 12,

  // Setengah ukuran X dalam pixel
  xSize: 17,

  // Ketebalan goresan X
  markStrokeWidth: 6,

  text: 'waspada'
});
```

Jika kedua ujung perlu memiliki warna atau ukuran berbeda, atur langsung pada `from` dan `to`:

```javascript
grid.addPermanentLine({
  id: 'marker-berbeda',

  from: {
    x: 2,
    y: 2,
    type: 'dot',
    color: '#2563eb',
    size: 14
  },

  to: {
    x: 8,
    y: 8,
    type: 'x',
    color: '#dc2626',
    size: 20,
    strokeWidth: 7
  },

  lineColor: '#16a34a',
  text: 'waspada',
  textColor: '#111',
  textSize: 30,
  markColor: '#111',
  dotSize: 12,
  xSize: 16
});
```

Prioritas pengaturan marker adalah:

1. `from.color` / `to.color` dan `from.size` / `to.size` jika diberikan.
2. `markColor`, `dotSize`, `xSize`, `markStrokeWidth` milik permanent line.
3. Opsi default plugin `permanentMarkColor`, `permanentDotSize`, `permanentXSize`, dan `permanentMarkStrokeWidth`.

Marker dapat diubah setelah dibuat:

```javascript
grid.updatePermanentLine('waspada', {
  markColor: '#dc2626',
  dotSize: 14,
  xSize: 18,
  markStrokeWidth: 6
});
```

Atau hanya salah satu ujung:

```javascript
grid.updatePermanentLine('waspada', {
  from: { color: '#2563eb', size: 16 },
  to:   { color: '#dc2626', size: 20, strokeWidth: 7 }
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

Format utama tetap sederhana dan kompatibel dengan versi sebelumnya:

```json
[
  { "x": 1, "y": 5, "types": ["dot"] },
  { "x": 2, "y": 7, "types": ["x"] },
  { "x": 3, "y": 6, "types": ["dot", "x"] }
]
```

Urutan array menentukan urutan garis.

### Format data dengan style penanda biasa

Jika sebuah tanda membutuhkan style khusus, plugin menambahkan `styles.dot` dan/atau `styles.x` pada koordinat tersebut:

```json
[
  {
    "x": 2,
    "y": 4,
    "types": ["dot"],
    "styles": {
      "dot": {
        "color": "#2563eb",
        "size": 14
      }
    }
  },
  {
    "x": 5,
    "y": 7,
    "types": ["x"],
    "styles": {
      "x": {
        "color": "#dc2626",
        "size": 18,
        "strokeWidth": 7
      }
    }
  },
  {
    "x": 8,
    "y": 5,
    "types": ["dot", "x"],
    "styles": {
      "dot": { "color": "#111111", "size": 10 },
      "x": { "color": "#7c3aed", "size": 16, "strokeWidth": 5 }
    }
  }
]
```

Karena satu koordinat dapat mempunyai `dot` dan `x` sekaligus, masing-masing tanda dapat mempunyai warna dan ukuran yang berbeda.

Sebagai kompatibilitas, `setData()` juga menerima format satu tanda per item:

```json
[
  { "x": 1, "y": 5, "type": "dot" },
  { "x": 2, "y": 7, "type": "x" }
]
```

`setData()` juga menerima style ringkas di level titik. Contoh:

```javascript
grid.setData([
  {
    x: 2,
    y: 3,
    type: 'dot',
    markColor: '#2563eb',
    dotSize: 14
  },
  {
    x: 5,
    y: 7,
    type: 'x',
    markColor: '#dc2626',
    xSize: 18,
    markStrokeWidth: 7
  }
]);
```

Saat data diambil kembali dengan `getData()`, style khusus dinormalisasi ke dalam properti `styles`.

## Menutup popup pemilihan penanda

Popup **Tambah tanda** sekarang mempunyai tombol teks **Close** di kanan atas. Klik **Close** akan menutup popup tanpa mengubah data pada koordinat tersebut.

Tombol ini tidak memengaruhi perilaku klik di luar popup yang sebelumnya juga dapat menutup menu.

## API

### Membuat instance

```javascript
const grid = new InteractiveGrid('#grafik', options);
```

Target dapat berupa selector CSS atau elemen DOM:

```javascript
new InteractiveGrid(document.getElementById('grafik'));
```

### `addPoint(x, y, type, style?)`

Tambah tanda. Parameter `style` bersifat opsional.

```javascript
grid.addPoint(3, 7, 'dot');
grid.addPoint(3, 7, 'x'); // koordinat yang sama sekarang memiliki ● + X
```

`type`: `dot` atau `x`.

Memberi style khusus pada dot:

```javascript
grid.addPoint(2, 4, 'dot', {
  color: '#2563eb',
  size: 14
});
```

Memberi style khusus pada X:

```javascript
grid.addPoint(5, 7, 'x', {
  color: '#dc2626',
  size: 18,
  strokeWidth: 7
});
```

Nama properti yang sama dengan konfigurasi global juga diterima:

```javascript
grid.addPoint(8, 6, 'x', {
  markColor: '#7c3aed',
  xSize: 16,
  markStrokeWidth: 6
});
```

Jika pada satu koordinat terdapat `dot` dan `x`, style keduanya independen:

```javascript
grid.addPoint(4, 6, 'dot', { color: '#111', size: 10 });
grid.addPoint(4, 6, 'x',   { color: '#e11d48', size: 17, strokeWidth: 5 });
```

### `updatePointMark(x, y, type, style)` / `setPointStyle(...)`

Mengubah style tanda biasa yang sudah ada tanpa mengubah koordinat atau urutan garis:

```javascript
grid.updatePointMark(5, 7, 'x', {
  color: '#f59e0b',
  size: 20,
  strokeWidth: 8
});
```

`setPointStyle()` adalah alias dari `updatePointMark()`:

```javascript
grid.setPointStyle(2, 4, 'dot', {
  color: '#16a34a',
  size: 13
});
```

Perubahan style masuk ke history sehingga dapat dikembalikan dengan `undo()`.

### `resetPointMarkStyle(x, y, type)`

Menghapus style khusus dari sebuah tanda dan mengembalikannya ke default global plugin:

```javascript
grid.resetPointMarkStyle(5, 7, 'x');
```

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
{
  x: 3,
  y: 7,
  types: ['dot', 'x'],
  styles: {
    dot: { color: '#2563eb', size: 12 },
    x: { color: '#dc2626', size: 17, strokeWidth: 6 }
  }
}
```

Jika tidak ada style khusus, properti `styles` tidak ditambahkan.

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

### API posisi label sumbu X

```javascript
grid.setXLabelOffset(-8);
const offset = grid.getXLabelOffset();
```

Nilai negatif menggeser label ke kiri; nilai positif ke kanan.

### Input jam pada cell tabel waktu: `showTimePicker`

Setiap cell pada tabel **Waktu (Jam)** sekarang dapat diisi data jam.

Format yang digunakan adalah:

```text
HH:MM
```

Contoh dengan kolom sempit:

```javascript
const grid = new InteractiveGrid('#grafik', {
  colWidth: 24,
  colJoinCount: 1,
  showTimeTable: true,
  showTimePicker: false
});
```

Pada kondisi ini input manual tetap memakai seluruh lebar `24px`. Ukuran font juga diperkecil otomatis untuk cell sempit agar teks `HH:MM` lebih mudah terlihat.

contoh:

```text
07:30
08:00
13:45
23:59
```

Nilai jam yang valid adalah `00:00` sampai `23:59`.

#### Menggunakan time picker

Default:

```javascript
showTimePicker: true
```

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  showTimeTable: true,
  showTimePicker: true
});
```

Pada mode ini plugin menggunakan:

```html
<input type="time">
```

sehingga browser dapat menampilkan **time picker**. Pada browser yang mendukungnya, pengguna juga tetap dapat mengetik jam secara manual.

#### Hanya input manual

Jika:

```javascript
showTimePicker: false
```

plugin menggunakan input teks biasa. Pada mode ini, **lebar input dibuat 100% sama dengan lebar cell tabel waktu**, tanpa padding horizontal pada wrapper. Jadi border kiri dan kanan input tepat mengikuti batas cell, termasuk ketika `colWidth` dibuat kecil. Pengguna mengisi jam dengan keyboard.

Setelah **dua digit pertama** diketik, tanda `:` otomatis ditambahkan:

```text
0
08:
08:3
08:30
```

Jadi user cukup mengetik `0830` dan hasil akhirnya menjadi `08:30`. Saat Backspace/Delete digunakan, plugin tidak memaksa menambahkan `:` kembali sehingga nilai tetap mudah diedit.

Saat input selesai (`blur` / `change`), nilai seperti:

```text
8:5
```

akan dinormalisasi menjadi:

```text
08:05
```

Jika nilainya tidak valid, misalnya `25:90`, input diberi tanda invalid dan tidak disimpan sebagai nilai valid baru.

#### Data awal

Data dapat diberikan saat membuat grid:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  colJoinCount: 2,
  showTimeTable: true,
  showTimePicker: true,

  timeData: [
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00'
  ]
});
```

Array di atas mengikuti urutan cell tabel waktu dari kiri ke kanan.

Format object juga dapat digunakan dengan `startColumn` sebagai key:

```javascript
timeData: {
  1: '08:00',
  3: '10:00',
  5: '12:00'
}
```

Untuk `colJoinCount: 2`, start column cell adalah `1, 3, 5, ...`.

#### API data waktu

Mengambil seluruh data:

```javascript
const dataWaktu = grid.getTimeData();
```

Contoh hasil:

```javascript
[
  {
    startColumn: 1,
    endColumn: 2,
    fromX: 0,
    toX: 2,
    value: '08:00'
  },
  {
    startColumn: 3,
    endColumn: 4,
    fromX: 2,
    toX: 4,
    value: '10:00'
  }
]
```

Mengisi seluruh data:

```javascript
grid.setTimeData([
  '08:00',
  '10:00',
  '12:00'
]);
```

Mengisi satu cell berdasarkan `startColumn`:

```javascript
grid.setTimeValue(1, '08:00');
grid.setTimeValue(3, '10:00');
```

Membaca satu nilai:

```javascript
const jam = grid.getTimeValue(1);
```

Menghapus seluruh nilai waktu:

```javascript
grid.clearTimeData();
```

#### Mengubah mode picker setelah grid dibuat

```javascript
grid.setShowTimePicker(true);
grid.setShowTimePicker(false);
```

Membaca pengaturannya:

```javascript
const pickerAktif = grid.getShowTimePicker();
```

#### Event perubahan waktu

Plugin mengirim event:

```javascript
document.querySelector('#grafik').addEventListener('interactivegrid:timechange', function (e) {
  console.log(e.detail.group);
  console.log(e.detail.value);
  console.log(e.detail.data);
});
```

Atau callback:

```javascript
const grid = new InteractiveGrid('#grafik', {
  onTimeChange(data, group, value) {
    console.log('Data waktu:', data);
  }
});
```

Data waktu juga ikut masuk ke `getAllData()` / `toFullJSON()` sebagai `timeData`.


### Keterangan jumlah tanda / koordinat: `showStatus`

Keterangan seperti:

```text
3 tanda pada 2 koordinat.
```

sekarang ditempatkan **di sebelah kanan tombol `Hapus Semua`** dan sejajar secara vertikal dengan tombol toolbar.

Default:

```javascript
showStatus: true
```

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  showToolbar: true,
  showStatus: true
});
```

Jika tidak ingin menampilkan keterangan:

```javascript
showStatus: false
```

Status akan tetap diperbarui oleh plugin ketika titik ditambah, dihapus, di-load melalui `setData()`, di-undo, atau di-clear; hanya tampilannya yang disembunyikan.

Dapat diubah setelah grid dibuat:

```javascript
grid.setShowStatus(false); // sembunyikan
grid.setShowStatus(true);  // tampilkan kembali
```

Membaca status pengaturan:

```javascript
const visible = grid.getShowStatus();
```

> Jika `showToolbar: false`, seluruh toolbar termasuk tombol dan keterangan status ikut tersembunyi.


### API label sumbu X dinamis

```javascript
grid.setXLabels(data);
grid.getXLabels();

grid.setXLabel(x, value);
grid.getXLabel(x);
grid.removeXLabel(x);
grid.clearXLabels();
```

Object `xLabels` menggunakan nilai koordinat X publik sebagai key. Array mengikuti urutan label yang tampil berdasarkan `colJoinCount` saat `setXLabels()` dipanggil.


### API tabel waktu

```javascript
grid.setShowTimeTable(true);
grid.setShowTimeTable(false);

grid.getShowTimeTable();
grid.getTimeTableGroups();
```

`getTimeTableGroups()` berguna jika aplikasi perlu mengetahui cell tabel waktu mana yang mewakili rentang kolom tertentu.


### API tinggi baris

API utama sekarang menggunakan nama `rowHeight`.

```javascript
// default global
grid.getRowHeight();
grid.setRowHeight(48);

// baris tertentu
grid.getRowHeight(3);
grid.setRowHeight(3, 70);

grid.getRowHeights();
grid.resetRowHeight(3);
grid.setRowHeights({
  2: { rowHeight: 60 },
  5: { rowHeight: 80 }
});

grid.getRowLayout();
grid.setRowLayout(layout);
```

`getRowHeight()` tanpa parameter membaca tinggi default.  
`getRowHeight(3)` membaca tinggi aktual baris ke-3.

`setRowHeight(48)` mengubah tinggi default semua baris yang tidak memiliki override.  
`setRowHeight(3, 70)` mengatur tinggi khusus baris ke-3.

Nomor baris menggunakan **1-based indexing dari bawah ke atas**.

API lama berbasis nama `rowWidth` masih dipertahankan sebagai alias kompatibilitas, tetapi tidak disarankan untuk kode baru.

### API lebar kolom

```javascript
grid.getColWidth();
grid.setColWidth(width);

grid.getColumnWidth(columnNumber);
grid.getColumnWidths();

grid.setColumnWidth(columnNumber, width);
grid.resetColumnWidth(columnNumber);
grid.setColumnWidths(config);

grid.getColumnLayout();
grid.setColumnLayout(layout);
```

Nomor kolom pada API `getColumnWidth()`, `setColumnWidth()`, dan `resetColumnWidth()` menggunakan **1-based indexing**.


### API vertical text

```javascript
grid.addVerticalText(config);
grid.updateVerticalText(id, patch);
grid.removeVerticalText(id);
grid.setVerticalTexts(array);
grid.getVerticalTexts();
grid.clearVerticalTexts();
```

`addVerticalText()` mengembalikan `id` teks yang dibuat. Setiap perubahan layout akan langsung dirender ulang.


### `setColJoinCount(step)` / `getColJoinCount()`

Mengubah frekuensi angka sumbu X tanpa membuat ulang instance:

```javascript
grid.setColJoinCount(2);
```

Membaca nilai saat ini:

```javascript
const step = grid.getColJoinCount();
```

Nilai harus lebih besar dari `0`. Nilai desimal dibulatkan ke bawah, dengan minimum `1`.


### `setYLabelStep(step)` / `getYLabelStep()`

Mengubah frekuensi angka sumbu Y tanpa membuat ulang instance:

```javascript
grid.setYLabelStep(2);
```

Membaca nilai saat ini:

```javascript
const step = grid.getYLabelStep();
```

Nilai harus lebih besar dari `0`. Nilai desimal dibulatkan ke bawah, dengan minimum `1`.

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
  colJoinCount: 1,

  // opsional: override teks label X berdasarkan koordinat publik
  xLabels: null, // tampilkan angka X setiap 1 kolom; alias: step
  xLabelOffset: -6, // geser label X 6px ke kiri
  yStart: 0,
  yLabelStep: 1, // tampilkan angka Y setiap 1 baris

  verticalTexts: [],
  verticalTextWidth: 44,
  verticalTextColor: '#111',
  verticalTextFontSize: 18,
  verticalTextFontWeight: '600',
  verticalTextFontFamily: 'Arial, Helvetica, sans-serif',

  colWidth: 54,
  // cellWidth: 54, // alias kompatibilitas versi lama

  // override per kolom (kolom dihitung mulai dari 1)
  columnsConfig: {
    3: { colWidth: 80 },
    7: { colWidth: 100 }
  },

  rowHeight: 42,
  // cellHeight: 42, // alias kompatibilitas versi lama

  // override per baris (baris dihitung mulai dari 1, dari bawah)
  rowsConfig: {
    3: { rowHeight: 60 },
    7: { rowHeight: 55 }
  },

  xAxisTitle: 'Waktu',
  xAxisSubtitle: '(Jam)',

  showTimeTable: true,
  showTimePicker: true,
  timeInputPlaceholder: 'HH:MM',

  showToolbar: true,
  showStatus: true, // tampilkan keterangan jumlah tanda/koordinat di toolbar
  showUndo: true,
  showClear: true,

  lineWidth: 4,
  lineColor: '#18a94d',

  // default penanda biasa/interaktif
  markColor: '#111',
  dotColor: null, // jika null/kosong -> memakai markColor
  xColor: null,   // jika null/kosong -> memakai markColor
  dotSize: 10,
  xSize: 13,
  markStrokeWidth: 5,

  onChange(data, reason) {
    console.log(reason, data);
  },

  onSelect(info) {
    console.log('Koordinat dipilih:', info);
  }
});
```

### Style default penanda biasa

Opsi utama untuk penanda yang dibuat pengguna:

| Opsi | Fungsi |
|---|---|
| `markColor` | warna fallback/default untuk `dot` dan `x` |
| `dotColor` | warna global khusus `dot`; jika tidak diisi/null/kosong maka memakai `markColor` |
| `xColor` | warna global khusus `x`; jika tidak diisi/null/kosong maka memakai `markColor` |
| `dotSize` | radius tanda bulat dalam pixel |
| `xSize` | setengah panjang diagonal tanda X dalam pixel |
| `markStrokeWidth` | ketebalan garis tanda X dalam pixel |

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  markColor: '#111111',
  dotColor: '#2563eb',
  xColor: '#dc2626',
  dotSize: 12,
  xSize: 17,
  markStrokeWidth: 6
});
```

`markSize` dan `xMarkSize` dari versi lama masih didukung sebagai alias untuk `dotSize` dan `xSize`, tetapi untuk kode baru disarankan menggunakan `dotSize` dan `xSize`.

Urutan prioritas warna penanda biasa adalah:

1. Warna khusus per tanda (`style.color`) jika diberikan melalui API seperti `addPoint()` / `updatePointMark()`.
2. `dotColor` untuk penanda `dot`, atau `xColor` untuk penanda `x`.
3. `markColor` sebagai fallback terakhir.

Contoh yang diminta:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  xAxisTitle: 'Waktu',
  xAxisSubtitle: '(Jam)',

  lineColor: '#18a94d',
  lineWidth: 4,

  markColor: '#111111',
  xColor: '#dc2626',
  dotColor: '#2563eb',
  dotSize: 6,
  xSize: 7,
  markStrokeWidth: 6
});
```

Jika `xColor` dihapus, `null`, atau string kosong, warna X otomatis memakai `markColor`. Hal yang sama berlaku untuk `dotColor`.

### Mengatur interval angka sumbu X: `colJoinCount`

`colJoinCount` menentukan **setiap berapa kolom angka pada sumbu X ditampilkan**.

Default:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  xStart: 0,
  colJoinCount: 1
});
```

Dengan `columns: 17`, koordinat X tetap `0..16`. Karena `colJoinCount: 1`, semua angka tampil:

```text
0  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  16
```

Jika:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  xStart: 0,
  colJoinCount: 2
});
```

maka angka yang terlihat menjadi:

```text
0     2     4     6     8     10     12     14     16
```

Grid tetap memiliki semua kolom dan semua koordinat `0..16`. Jadi koordinat seperti `(1,5)`, `(3,7)`, atau `(15,4)` tetap dapat dipilih walaupun angka `1`, `3`, dan `15` tidak ditampilkan.

Alias singkat `step` juga dapat digunakan:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  step: 2
});
```

`colJoinCount` adalah nama yang direkomendasikan. Jika `colJoinCount` dan `step` diberikan bersamaan, `colJoinCount` memiliki prioritas.

Contoh:

```javascript
colJoinCount: 3
```

menampilkan:

```text
0        3        6        9        12        15
```

Jika `xStart` bukan `0`, step dihitung berdasarkan urutan kolom dari titik awal. Contoh:

```javascript
xStart: 1,
columns: 10,
colJoinCount: 2
```

menampilkan:

```text
1     3     5     7     9
```

> `colJoinCount` hanya mengubah tampilan label angka. Jumlah kolom, posisi grid, koordinat klik, data, garis interaktif, dan permanent line tidak berubah.

Nilainya juga dapat diubah setelah instance dibuat:

```javascript
grid.setColJoinCount(2);
console.log(grid.getColJoinCount()); // 2
```


### Mengatur interval angka sumbu Y: `yLabelStep`

`yLabelStep` mempunyai fungsi yang sama seperti `colJoinCount`, tetapi berlaku pada **label angka sumbu Y**.

Default:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  yStart: 0,
  yLabelStep: 1
});
```

Dengan `rows: 11`, koordinat Y tetap `0..10`. Karena `yLabelStep: 1`, semua angka tampil:

```text
10
 9
 8
 7
 6
 5
 4
 3
 2
 1
 0
```

Jika diubah menjadi:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  yStart: 0,
  yLabelStep: 2
});
```

maka angka yang ditampilkan menjadi:

```text
10
 8
 6
 4
 2
 0
```

Baris di antara angka tersebut **tetap ada**. Jadi koordinat seperti `(5,9)`, `(5,7)`, `(5,5)`, atau `(5,1)` tetap valid dan tetap dapat dipilih walaupun label `9`, `7`, `5`, dan `1` tidak ditampilkan.

Contoh lain:

```javascript
yLabelStep: 3
```

dengan `rows: 11` dan `yStart: 0` akan menampilkan:

```text
9
6
3
0
```

Jika `yStart` bukan `0`, interval dihitung berdasarkan urutan baris dari `yStart`. Contoh:

```javascript
yStart: 1,
rows: 10,
yLabelStep: 2
```

koordinat Y tersedia dari `1..10`, sedangkan label yang ditampilkan adalah:

```text
9
7
5
3
1
```

> `yLabelStep` hanya mengubah tampilan label angka sumbu Y. Jumlah baris, posisi grid, koordinat klik, data, garis interaktif, dan permanent line tidak berubah.

Nilainya juga dapat diubah setelah instance dibuat:

```javascript
grid.setYLabelStep(2);
console.log(grid.getYLabelStep()); // 2
```

### Menggunakan `colJoinCount` dan `yLabelStep` bersamaan

Keduanya dapat digunakan sekaligus:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  xStart: 0,
  yStart: 0,

  colJoinCount: 2,
  yLabelStep: 2
});
```

Pada contoh tersebut:

- Sumbu X menampilkan `0, 2, 4, 6, 8, 10, 12, 14, 16`.
- Sumbu Y menampilkan `0, 2, 4, 6, 8, 10`.
- Seluruh koordinat di antara label tetap tersedia untuk penanda dan garis.


### Teks vertikal di sebelah kiri sumbu Y

Gunakan `verticalTexts` untuk menambahkan teks vertikal di sebelah kiri angka sumbu Y, seperti **Sentimeter (cm)** pada grafik pengukuran.

Contoh satu teks:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  verticalTexts: [
    {
      id: 'satuan',
      text: 'Sentimeter (cm)',
      color: '#111111',
      fontSize: 24,
      fontWeight: '700',
      width: 54
    }
  ]
});
```

Teks otomatis diputar vertikal dan ditempatkan di sebelah kiri label angka Y. Area grafik akan bergeser ke kanan secara otomatis agar teks tidak menimpa angka Y.

#### Lebih dari satu teks vertikal

`verticalTexts` dapat berisi lebih dari satu item:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  verticalTexts: [
    {
      id: 'judul',
      text: 'Pertumbuhan',
      color: '#444',
      fontSize: 18,
      fontWeight: '600',
      width: 42
    },
    {
      id: 'satuan',
      text: 'Sentimeter (cm)',
      color: '#111',
      fontSize: 24,
      fontWeight: '700',
      width: 54
    }
  ]
});
```

Urutan array adalah dari **kiri ke kanan**. Pada contoh di atas, `Pertumbuhan` berada paling kiri dan `Sentimeter (cm)` berada lebih dekat ke angka sumbu Y.

Setiap item mendukung:

| Properti | Fungsi |
|---|---|
| `id` | ID unik; opsional, otomatis dibuat bila tidak diisi |
| `text` | isi teks vertikal |
| `color` | warna teks |
| `fontSize` | ukuran font dalam pixel |
| `fontWeight` | misalnya `400`, `600`, `700`, `bold` |
| `fontFamily` | jenis font |
| `width` | lebar jalur/ruang untuk teks tersebut dalam pixel |

Nilai default global:

```javascript
const grid = new InteractiveGrid('#grafik', {
  verticalTextWidth: 44,
  verticalTextColor: '#111',
  verticalTextFontSize: 18,
  verticalTextFontWeight: '600',
  verticalTextFontFamily: 'Arial, Helvetica, sans-serif',

  verticalTexts: [
    'Sentimeter (cm)'
  ]
});
```

Item juga boleh berupa string sederhana:

```javascript
verticalTexts: [
  'Pertumbuhan',
  'Sentimeter (cm)'
]
```

#### API teks vertikal

Tambah satu teks setelah grid dibuat:

```javascript
const id = grid.addVerticalText({
  id: 'satuan',
  text: 'Sentimeter (cm)',
  color: '#111',
  fontSize: 24,
  fontWeight: '700',
  width: 54
});
```

Mengubah teks:

```javascript
grid.updateVerticalText('satuan', {
  text: 'Centimeter (cm)',
  color: '#2563eb',
  fontSize: 26
});
```

Menghapus satu:

```javascript
grid.removeVerticalText('satuan');
```

Mengganti seluruh daftar:

```javascript
grid.setVerticalTexts([
  { id: 'label-1', text: 'Pertumbuhan' },
  { id: 'label-2', text: 'Sentimeter (cm)', fontSize: 24 }
]);
```

Mengambil data:

```javascript
const labels = grid.getVerticalTexts();
```

Menghapus semuanya:

```javascript
grid.clearVerticalTexts();
```

Perubahan jumlah teks atau `width` akan otomatis menghitung ulang ruang di sebelah kiri grafik, sehingga label Y, grid, overlay, titik, garis, dan area klik tetap sejajar.


### Menggeser label angka sumbu X: `xLabelOffset`

Secara default label angka pada sumbu X digeser sedikit ke kiri agar angka tidak tepat berada di atas garis vertikal grid.

Default:

```javascript
xLabelOffset: -6
```

Nilai negatif menggeser ke kiri, nilai positif menggeser ke kanan.

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  colJoinCount: 2,
  xLabelOffset: -6
});
```

Jika ingin lebih jauh ke kiri:

```javascript
xLabelOffset: -10
```

Jika ingin kembali tepat di tengah garis vertikal:

```javascript
xLabelOffset: 0
```

Perubahan ini hanya memengaruhi posisi visual angka sumbu X. Posisi grid, marker, garis, permanent line, area klik, dan tabel waktu tidak berubah.

Nilai juga dapat diubah setelah grid dibuat:

```javascript
grid.setXLabelOffset(-8);
console.log(grid.getXLabelOffset());
```

### Label sumbu X dinamis: `xLabels`

`xLabels` digunakan untuk mengubah **teks yang ditampilkan** pada sumbu X tanpa mengubah koordinat X sebenarnya.

Default:

```javascript
xLabels: null
```

Jika `xLabels` tidak diatur, perilaku tetap seperti biasa. Contoh:

```javascript
xStart: 0,
colJoinCount: 2
```

menampilkan:

```text
0  2  4  6  8  10  12  14  16
```

#### Format object

Key menggunakan **nilai koordinat X publik**:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  xStart: 0,
  colJoinCount: 2,

  xLabels: {
    0: 'Awal',
    2: '2 Jam',
    4: '4 Jam',
    6: '6 Jam',
    8: '8 Jam',
    10: '10 Jam',
    12: '12 Jam',
    14: '14 Jam',
    16: '16 Jam'
  }
});
```

Koordinat internal tetap `0, 2, 4, ... 16`; yang berubah hanya teks label yang terlihat.

Object boleh parsial. Contoh:

```javascript
xLabels: {
  0: 'Lahir',
  4: '4 Jam',
  8: '8 Jam'
}
```

Label lain yang tidak dioverride tetap menggunakan nilai koordinat default.

#### Format array

Array mengikuti **urutan label yang tampil berdasarkan `colJoinCount`**.

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  xStart: 0,
  colJoinCount: 2,

  xLabels: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8'
  ]
});
```

Dengan `colJoinCount: 2`, array tersebut dipetakan ke koordinat:

```text
0, 2, 4, 6, 8, 10, 12, 14, 16
```

sehingga tampilan label menjadi:

```text
0  1  2  3  4  5  6  7  8
```

#### API runtime

Ganti seluruh label:

```javascript
grid.setXLabels({
  0: 'Awal',
  2: 'Tahap 1',
  4: 'Tahap 2'
});
```

Ambil seluruh override:

```javascript
const labels = grid.getXLabels();
```

Ubah satu label:

```javascript
grid.setXLabel(4, 'Empat Jam');
```

Baca satu label efektif:

```javascript
const label = grid.getXLabel(4);
```

Jika koordinat tersebut tidak memiliki override, `getXLabel()` mengembalikan nilai koordinat default.

Hapus override satu label:

```javascript
grid.removeXLabel(4);
```

Hapus semua override:

```javascript
grid.clearXLabels();
```

`xLabels` hanya memengaruhi tampilan label. Marker, permanent line, koordinat klik, `timeData`, dan struktur tabel waktu tetap menggunakan koordinat asli.


### Tabel Waktu di bawah grafik: `showTimeTable`

Gunakan `showTimeTable` untuk mengatur apakah tabel **Waktu (Jam)** di bawah tabel utama ditampilkan.

Default:

```javascript
showTimeTable: true
```

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  colJoinCount: 2,
  showTimeTable: true,

  xAxisTitle: 'Waktu',
  xAxisSubtitle: '(Jam)'
});
```

Saat `showTimeTable: true`, tabel waktu ditempatkan langsung di bawah baris label sumbu X sehingga secara visual menyatu dengan tabel utama.

Jika:

```javascript
showTimeTable: false
```

maka bagian tabel **Waktu (Jam)** tidak dirender/ditampilkan. Grafik utama dan label sumbu X tetap ada.

#### Jumlah cell tabel waktu mengikuti `colJoinCount`

Tabel waktu menggunakan jumlah kolom utama sebagai dasar.

Jika:

```javascript
columns: 17,
colJoinCount: 1
```

maka ada 16 interval/kolom utama (`X=0..16`) dan tabel waktu mempunyai 16 cell.

Jika:

```javascript
columns: 17,
colJoinCount: 2
```

maka setiap **2 kolom utama digabung menjadi 1 cell tabel waktu**, sehingga tabel waktu mempunyai 8 cell:

```text
kolom utama : |1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|
tabel waktu : |---1---|---2---|---3---|---4---|---5---|---6---|---7---|---8---|
```

Jika jumlah interval tidak habis dibagi `colJoinCount`, cell terakhir berisi sisa kolom.

Contoh:

```javascript
columns: 10,     // 9 interval
colJoinCount: 2
```

menghasilkan grup:

```text
2 + 2 + 2 + 2 + 1 kolom
```

#### Tetap kompatibel dengan `colWidth`

Jika masing-masing kolom mempunyai lebar berbeda, lebar cell tabel waktu adalah **jumlah lebar kolom utama yang digabung**.

Contoh:

```javascript
colWidth: 50,

columnsConfig: {
  2: { colWidth: 80 },
  3: { colWidth: 70 }
},

colJoinCount: 2
```

cell tabel waktu pertama menggabungkan kolom 1 dan 2:

```text
50 + 80 = 130px
```

cell berikutnya menggabungkan kolom 3 dan 4:

```text
70 + 50 = 120px
```

Jadi garis tabel waktu selalu tepat sejajar dengan batas grup pada tabel utama.

#### API

Tampilkan/sembunyikan tabel waktu setelah grid dibuat:

```javascript
grid.setShowTimeTable(true);
grid.setShowTimeTable(false);
```

Membaca status:

```javascript
const visible = grid.getShowTimeTable();
```

Melihat pembagian/grup tabel waktu:

```javascript
const groups = grid.getTimeTableGroups();
```

Contoh hasil untuk `columns: 17` dan `colJoinCount: 2`:

```javascript
[
  {
    startColumn: 1,
    endColumn: 2,
    fromX: 0,
    toX: 2,
    width: 108
  },
  // ...
]
```

Mengubah `colJoinCount` melalui:

```javascript
grid.setColJoinCount(2);
```

akan langsung mengubah batas merge cell tabel waktu.


### Mengatur lebar kolom: `colWidth`

`colWidth` adalah **lebar default setiap kolom** pada grid.

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  colWidth: 54
});
```

Dengan `columns: 17`, tersedia koordinat X `0..16`, sehingga secara visual ada **16 kolom/cell horizontal**:

```text
kolom 1  = antara X=0 dan X=1
kolom 2  = antara X=1 dan X=2
...
kolom 16 = antara X=15 dan X=16
```

Jika tidak ada konfigurasi khusus, seluruh 16 kolom memakai `colWidth: 54`.

#### Lebar khusus per kolom

Gunakan `columnsConfig` untuk memberi lebar tertentu pada kolom tertentu:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  colWidth: 54,

  columnsConfig: {
    3: { colWidth: 80 },
    7: { colWidth: 100 },
    12: { colWidth: 40 }
  }
});
```

Artinya:

```text
kolom 1  = 54px
kolom 2  = 54px
kolom 3  = 80px   <- override
kolom 4  = 54px
...
kolom 7  = 100px  <- override
...
kolom 12 = 40px   <- override
...
```

Kolom yang tidak mempunyai `colWidth` khusus otomatis mengikuti nilai global `colWidth`.

Nomor kolom pada `columnsConfig` adalah **1-based**.

#### Format array

`columnsConfig` juga dapat berupa array. Pada array, index `0` mewakili kolom 1:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 6, // X = 0..5, berarti ada 5 kolom/cell
  colWidth: 54,

  columnsConfig: [
    { colWidth: 60 }, // kolom 1
    null,             // kolom 2 -> 54
    { colWidth: 90 }, // kolom 3
    null,             // kolom 4 -> 54
    { colWidth: 70 }  // kolom 5
  ]
});
```

#### Alias `colWidths` dan `columnWidths`

Untuk konfigurasi yang lebih ringkas, nilai angka langsung juga didukung:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 6,
  colWidth: 54,

  colWidths: [
    60,  // kolom 1
    54,  // kolom 2
    90,  // kolom 3
    54,  // kolom 4
    70   // kolom 5
  ]
});
```

Atau object 1-based:

```javascript
columnWidths: {
  3: 90,
  5: 70
}
```

Urutan prioritas saat constructor dibuat adalah:

1. `colWidth` sebagai default.
2. `colWidths`.
3. `columnWidths`.
4. `columnsConfig` sebagai override terakhir.

Jika konfigurasi lama masih memakai:

```javascript
cellWidth: 54
```

plugin tetap menerimanya sebagai alias dari `colWidth`. Untuk kode baru disarankan menggunakan `colWidth`.

#### Dampak ke koordinat dan garis

Lebar kolom yang berbeda tidak mengubah nilai koordinat. Contoh:

```javascript
columnsConfig: {
  3: { colWidth: 100 }
}
```

hanya membuat jarak visual antara X=2 dan X=3 lebih lebar.

Semua bagian plugin akan ikut menyesuaikan otomatis:

- garis vertikal grid;
- label angka X;
- bagian kotak `Waktu`;
- posisi marker ● dan X;
- hover/klik mouse;
- permanent line;
- garis penghubung antar titik;
- posisi teks permanent line.

#### API lebar kolom

Mengubah default global:

```javascript
grid.setColWidth(60);
```

Membaca default global:

```javascript
grid.getColWidth();
```

Mengatur satu kolom:

```javascript
grid.setColumnWidth(3, 90);
```

Membaca satu kolom:

```javascript
grid.getColumnWidth(3);
```

Mengambil seluruh lebar aktual:

```javascript
const widths = grid.getColumnWidths();
// contoh: [54, 54, 90, 54, ...]
```

Mengembalikan kolom tertentu ke default `colWidth`:

```javascript
grid.resetColumnWidth(3);
```

Mengganti semua override sekaligus:

```javascript
grid.setColumnWidths({
  2: { colWidth: 70 },
  5: { colWidth: 100 }
});
```

Mengambil konfigurasi layout kolom:

```javascript
const layout = grid.getColumnLayout();
```

Contoh hasil:

```javascript
{
  colWidth: 54,
  columnsConfig: {
    2: { colWidth: 70 },
    5: { colWidth: 100 }
  }
}
```

Memuat kembali:

```javascript
grid.setColumnLayout(layout);
```

`getAllData()` / `toFullJSON()` juga menyertakan `columnLayout`, sehingga konfigurasi lebar kolom dapat ikut disimpan apabila diperlukan.


### Mengatur tinggi baris: `rowHeight`

`rowHeight` adalah **tinggi default setiap baris/cell vertikal** pada grid. `rowHeight` mengatur tinggi visual default setiap baris.

Nilai default jika tidak diatur adalah:

```javascript
rowHeight: 42
```

Contoh:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,
  rowHeight: 42
});
```

Dengan `rows: 11`, tersedia koordinat Y `0..10`, sehingga secara visual terdapat **10 baris/cell**:

```text
baris 1  = antara Y=0 dan Y=1
baris 2  = antara Y=1 dan Y=2
baris 3  = antara Y=2 dan Y=3
...
baris 10 = antara Y=9 dan Y=10
```

Penomoran baris menggunakan **1-based indexing dari bawah ke atas**. Jadi `baris 1` adalah area paling bawah.

Jika tidak ada konfigurasi khusus, semua baris memakai nilai global `rowHeight`.

#### Tinggi khusus per baris

Gunakan `rowsConfig`:

```javascript
const grid = new InteractiveGrid('#grafik', {
  columns: 17,
  rows: 11,

  rowHeight: 42,

  rowsConfig: {
    2: { rowHeight: 60 },
    5: { rowHeight: 80 },
    9: { rowHeight: 50 }
  }
});
```

Artinya:

```text
baris 1  = 42px
baris 2  = 60px   <- override
baris 3  = 42px
baris 4  = 42px
baris 5  = 80px   <- override
...
baris 9  = 50px   <- override
baris 10 = 42px
```

Baris yang tidak mempunyai `rowHeight` khusus otomatis mengikuti nilai global `rowHeight`.

#### Format array

`rowsConfig` juga dapat berupa array. Index `0` mewakili baris 1:

```javascript
const grid = new InteractiveGrid('#grafik', {
  rows: 6, // Y = 0..5, berarti ada 5 baris/cell
  rowHeight: 42,

  rowsConfig: [
    { rowHeight: 50 }, // baris 1
    null,             // baris 2 -> 42
    { rowHeight: 70 }, // baris 3
    null,             // baris 4 -> 42
    { rowHeight: 55 }  // baris 5
  ]
});
```

#### Alias ringkas `rowHeights`

Nilai angka langsung juga didukung:

```javascript
const grid = new InteractiveGrid('#grafik', {
  rows: 6,
  rowHeight: 42,

  rowHeights: [
    50, // baris 1
    42, // baris 2
    70, // baris 3
    42, // baris 4
    55  // baris 5
  ]
});
```

Atau object 1-based:

```javascript
rowHeights: {
  2: 60,
  5: 80
}
```

Untuk kompatibilitas dengan versi sebelumnya, plugin masih menerima:

```javascript
rowWidth: 42
```

dan konfigurasi yang lebih lama:

```javascript
cellHeight: 42
```

Keduanya diperlakukan sebagai alias dari `rowHeight`. Untuk kode baru gunakan `rowHeight`.

#### Dampak ke koordinat dan garis

Tinggi baris yang berbeda tidak mengubah nilai koordinat. Contoh:

```javascript
rowsConfig: {
  3: { rowHeight: 80 }
}
```

hanya membuat jarak visual antara Y=2 dan Y=3 lebih tinggi.

Semua bagian plugin ikut menyesuaikan otomatis:

- garis horizontal grid;
- label angka Y;
- posisi marker ● dan X;
- hover dan klik mouse/touch;
- permanent line;
- garis penghubung antar titik;
- posisi teks permanent line;
- vertical text di sisi kiri tetap berada pada area grafik yang benar.

`colJoinCount`, `yLabelStep`, dan pengaturan lebar kolom tetap bekerja bersama pengaturan ini.

#### API tinggi baris

Mengubah tinggi default semua baris:

```javascript
grid.setRowHeight(48);
```

Membaca default:

```javascript
grid.getRowHeight();
```

Mengatur satu baris:

```javascript
grid.setRowHeight(3, 70);
```

Membaca tinggi aktual satu baris:

```javascript
grid.getRowHeight(3);
```

Mengambil seluruh tinggi aktual:

```javascript
const heights = grid.getRowHeights();
```

Mengembalikan satu baris ke default `rowHeight`:

```javascript
grid.resetRowHeight(3);
```

Mengganti semua override:

```javascript
grid.setRowHeights({
  2: { rowHeight: 60 },
  5: { rowHeight: 80 }
});
```

Mengambil konfigurasi layout baris:

```javascript
const layout = grid.getRowLayout();
```

Contoh hasil:

```javascript
{
  rowHeight: 42,
  rowsConfig: {
    2: { rowHeight: 60 },
    5: { rowHeight: 80 }
  }
}
```

Memuat kembali:

```javascript
grid.setRowLayout(layout);
```

`getAllData()` / `toFullJSON()` juga menyertakan `rowLayout`, sehingga konfigurasi tinggi baris dapat ikut disimpan ke database jika diperlukan.


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
- `style`
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
- dot_color / dot_size (opsional)
- x_color / x_size / x_stroke_width (opsional)
```

`sequence` penting karena urutan titik menentukan jalur garis. Jika tidak perlu melakukan query style per tanda, lebih sederhana menyimpan seluruh `getData()` sebagai JSON.

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
console.log(InteractiveGrid.VERSION); // 2.2.2
```

## Lisensi

Kode ini dapat digunakan dan dimodifikasi pada proyek internal Anda. Jika nantinya plugin akan didistribusikan sebagai library publik, sebaiknya tambahkan file lisensi formal (misalnya MIT) dan versioning/changelog.



## `showDotOnTop`

Gunakan `showDotOnTop: true` jika satu koordinat dapat berisi tanda `dot` dan `x` sekaligus dan Anda ingin titik bulat berada di lapisan paling atas.

```javascript
const grid = new InteractiveGrid('#grafik', {
  markColor: '#111111',
  xColor: '#dc2626',
  dotColor: '#2563eb',
  dotSize: 6,
  xSize: 7,
  markStrokeWidth: 6,
  showDotOnTop: true
});
```

Perilaku:

- `showDotOnTop: false` (default): urutan kompatibel versi sebelumnya, yaitu dot digambar lebih dahulu lalu X, sehingga X berada di atas dot.
- `showDotOnTop: true`: X digambar lebih dahulu lalu dot, sehingga dot berada di atas X dan tetap terlihat lebih jelas.
- Properti ini hanya mengatur urutan/lapisan render penanda biasa pada koordinat yang sama. Data, urutan garis, ukuran, dan warna masing-masing penanda tidak berubah.

## Changelog

### v2.2.2
- Pada `showTimeTable: true` dan `showTimePicker: false`, input waktu sekarang memakai lebar penuh cell tabel waktu.
- Padding horizontal wrapper dihilangkan pada mode manual sehingga border kiri/kanan input tepat mengikuti batas cell.
- Border radius input manual dibuat `0` agar terlihat menyatu dengan tabel waktu.
- Ukuran font input manual otomatis mengecil pada cell sempit, termasuk konfigurasi seperti `colWidth: 24`, agar format `HH:MM` lebih mudah terlihat.
- Mode time picker (`showTimePicker: true`) tidak berubah.
- Semua fitur versi sebelumnya tetap kompatibel.


### v2.2.1
- Menambahkan tombol teks **Close** di kanan atas popup pemilihan penanda.
- Klik **Close** menjalankan `_hideMenu()` sehingga popup ditutup tanpa menambah atau menghapus tanda.
- Tombol Close diberi `aria-label` dan focus style untuk aksesibilitas keyboard.
- Semua fitur versi sebelumnya tetap kompatibel.


### v2.2.0
- Menambahkan properti `xLabels` untuk mengubah teks label sumbu X tanpa mengubah koordinat asli.
- `xLabels` mendukung object berdasarkan nilai koordinat X publik, misalnya `{ 0: 'Awal', 2: '2 Jam' }`.
- `xLabels` juga mendukung array yang mengikuti urutan label tampil berdasarkan `colJoinCount`.
- Override boleh parsial; label yang tidak dioverride tetap menggunakan nilai koordinat default.
- Menambahkan API `setXLabels()`, `getXLabels()`, `setXLabel()`, `getXLabel()`, `removeXLabel()`, dan `clearXLabels()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.xLabels`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


### v2.1.0
- Mengganti nama properti utama `xLabelStep` menjadi `colJoinCount`.
- Fungsi `colJoinCount` sama persis dengan `xLabelStep` sebelumnya: mengatur interval label sumbu X dan jumlah kolom utama yang digabung pada tabel Waktu.
- Default tetap `colJoinCount: 1`.
- Menambahkan API utama `setColJoinCount(count)` dan `getColJoinCount()`.
- `xLabelStep`, `setXLabelStep()`, dan `getXLabelStep()` tetap didukung sebagai alias kompatibilitas agar implementasi lama tidak rusak.
- `step` lama juga tetap diterima sebagai alias.
- Semua fitur versi sebelumnya tetap kompatibel.


### v2.0.1
- Pada `showTimePicker: false`, tanda `:` otomatis ditambahkan setelah dua digit pertama.
- Mengetik `08` langsung menjadi `08:`; melanjutkan `30` menghasilkan `08:30`.
- Input/paste empat digit seperti `0830` otomatis menjadi `08:30`.
- Backspace/Delete tetap dapat digunakan normal tanpa `:` dipaksa muncul kembali saat penghapusan.
- Validasi akhir tetap menggunakan format `HH:MM` (`00:00` sampai `23:59`).
- Semua fitur versi sebelumnya tetap kompatibel.


### v2.0.0
- Setiap cell tabel **Waktu (Jam)** sekarang dapat diisi nilai jam.
- Menambahkan `showTimePicker` dengan default `true`.
- `showTimePicker: true` menggunakan input `type=time`, sehingga browser dapat menyediakan time picker dan tetap mendukung input keyboard sesuai kemampuan browser.
- `showTimePicker: false` menggunakan input teks manual dengan format `HH:MM`.
- Input manual dinormalisasi, misalnya `8:5` menjadi `08:05`, dengan rentang valid `00:00` sampai `23:59`.
- Menambahkan `timeData` untuk data awal.
- Menambahkan API `getTimeData()`, `setTimeData()`, `clearTimeData()`, `getTimeValue()`, `setTimeValue()`, `getShowTimePicker()`, dan `setShowTimePicker()`.
- Menambahkan callback `onTimeChange` dan event DOM `interactivegrid:timechange`.
- Input waktu mengikuti merge cell berdasarkan `colJoinCount` dan tetap mendukung `colWidth` yang berbeda per kolom.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `timeData` dan `viewConfig.showTimePicker`.
- Semua fitur versi sebelumnya tetap kompatibel.


### v1.9.2
- Memindahkan keterangan jumlah tanda/koordinat ke toolbar, tepat di sebelah kanan tombol **Hapus Semua**.
- Keterangan status sekarang sejajar secara vertikal dengan tombol `Undo` dan `Hapus Semua`.
- `showStatus: true/false` tetap menjadi properti untuk menampilkan atau menyembunyikan keterangan.
- Menambahkan API `setShowStatus()` dan `getShowStatus()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.showStatus`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


### v1.9.1
- Menggeser label angka sumbu X sedikit ke kiri secara default agar tidak tertutup garis vertikal grid.
- Menambahkan properti `xLabelOffset` dengan default `-6` pixel.
- Nilai negatif menggeser label ke kiri, nilai positif ke kanan, dan `0` mengembalikan label tepat ke tengah garis.
- Menambahkan API `setXLabelOffset(offset)` dan `getXLabelOffset()`.
- Perubahan hanya memengaruhi posisi visual label X; grid, koordinat, marker, garis, permanent line, dan tabel waktu tetap tidak berubah.


### v1.9.0
- Menambahkan properti `showTimeTable` dengan default `true`.
- Jika `showTimeTable: false`, tabel **Waktu (Jam)** di bawah grafik disembunyikan dan tinggi layout menyesuaikan otomatis.
- Baris label X dan tabel waktu sekarang dibuat menyatu secara visual dengan tabel utama.
- Cell tabel waktu otomatis digabung berdasarkan `colJoinCount`.
- `colJoinCount: 1` menghasilkan satu cell tabel waktu untuk setiap kolom utama; `colJoinCount: 2` menggabungkan dua kolom utama per cell; dan seterusnya.
- Merge tabel waktu mendukung `colWidth` dan lebar khusus per kolom, karena batas cell dihitung dari posisi X kumulatif.
- Menambahkan API `setShowTimeTable()`, `getShowTimeTable()`, dan `getTimeTableGroups()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.showTimeTable`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


### v1.8.0
- Mengganti nama properti utama `rowWidth` menjadi `rowHeight` agar lebih tepat secara semantik.
- Default tinggi baris sekarang ditulis sebagai `rowHeight: 42`.
- `rowsConfig` sekarang menggunakan `{ rowHeight: ... }`.
- Alias ringkas utama untuk banyak baris adalah `rowHeights`.
- API utama disederhanakan: `getRowHeight()` / `setRowHeight(height)` untuk default global, serta `getRowHeight(rowNumber)` / `setRowHeight(rowNumber, height)` untuk baris tertentu.
- `getRowLayout()` sekarang menghasilkan `rowHeight` dan `rowsConfig` dengan properti `rowHeight`.
- `setRowLayout()` menerima format baru `rowHeight`, tetapi tetap dapat membaca `rowWidth` lama.
- `rowWidth`, `rowWidths`, `getRowWidth()`, `setRowWidth()`, dan alias v1.7.0 tetap didukung untuk kompatibilitas, tetapi dianggap deprecated.
- `cellHeight` juga tetap didukung sebagai alias lama.
- Semua fitur lain tetap kompatibel.


### v1.7.0
- Menambahkan `rowHeight` sebagai tinggi default setiap baris/cell vertikal, dengan default `42`.
- `cellHeight` tetap didukung sebagai alias kompatibilitas versi lama.
- Menambahkan tinggi per baris melalui `rowsConfig` dan `rowHeights`.
- Penomoran baris adalah 1-based dari bawah: baris 1 berada antara Y=0 dan Y=1.
- Garis horizontal grid, label Y, koordinat mouse/touch, marker, garis biasa, permanent line, dan teks permanent line sekarang memakai posisi Y kumulatif sehingga tinggi setiap baris boleh berbeda.
- Menambahkan API `getRowHeight()`, `setRowHeight()`, `getRowHeight()`, `getRowHeight()`, `getRowHeights()`, `getRowHeights()`, `setRowHeight()`, `setRowHeight()`, `resetRowHeight()`, `resetRowHeight()`, `setRowHeights()`, `getRowLayout()`, dan `setRowLayout()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `rowLayout`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


### v1.6.0
- Menambahkan `colWidth` sebagai lebar default kolom.
- `cellWidth` tetap didukung sebagai alias kompatibilitas versi lama.
- Menambahkan lebar per kolom melalui `columnsConfig`, `colWidths`, dan `columnWidths`.
- `columnsConfig` mendukung object 1-based maupun array; setiap item dapat memiliki `{ colWidth }`.
- Grid vertikal, label X, area `Waktu`, koordinat mouse/touch, marker, garis biasa, dan permanent line sekarang memakai posisi X kumulatif sehingga lebar setiap kolom boleh berbeda.
- Menambahkan API `getColWidth()`, `setColWidth()`, `getColumnWidth()`, `getColumnWidths()`, `setColumnWidth()`, `resetColumnWidth()`, `setColumnWidths()`, `getColumnLayout()`, dan `setColumnLayout()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `columnLayout`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


### v1.5.0
- Menambahkan `verticalTexts` untuk menampilkan satu atau lebih teks vertikal di sebelah kiri label sumbu Y.
- Teks vertikal mendukung `text`, `color`, `fontSize`, `fontWeight`, `fontFamily`, dan `width`.
- Menambahkan default global `verticalTextWidth`, `verticalTextColor`, `verticalTextFontSize`, `verticalTextFontWeight`, dan `verticalTextFontFamily`.
- Layout kiri grafik dihitung ulang secara otomatis saat jumlah atau lebar vertical text berubah.
- Menambahkan API `addVerticalText()`, `updateVerticalText()`, `removeVerticalText()`, `setVerticalTexts()`, `getVerticalTexts()`, dan `clearVerticalTexts()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `verticalTexts`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur lama (`colJoinCount`, `yLabelStep`, permanent line, marker, undo, dan data interaktif) tetap kompatibel.


### v1.4.0
- Menambahkan `yLabelStep` untuk mengatur setiap berapa baris angka sumbu Y ditampilkan.
- Default `yLabelStep: 1`, sehingga perilaku versi sebelumnya tetap sama.
- `yLabelStep` hanya memengaruhi label angka sumbu Y; jumlah baris, koordinat, marker, garis interaktif, dan permanent line tetap sama.
- Menambahkan API `setYLabelStep(step)` dan `getYLabelStep()`.
- `colJoinCount` dan `yLabelStep` dapat digunakan secara bersamaan.


### v1.3.0
- Menambahkan `colJoinCount` untuk mengatur setiap berapa kolom angka sumbu X ditampilkan.
- Menambahkan `step` sebagai alias dari `colJoinCount`.
- Default tetap `colJoinCount: 1`, sehingga perilaku lama tidak berubah.
- Pengaturan ini hanya memengaruhi label angka; grid, koordinat, data, marker, dan garis tetap sama.
- Menambahkan API `setColJoinCount(step)` dan `getColJoinCount()`.


### v1.2.2
- Menambahkan `xColor` sebagai warna global khusus penanda X.
- Menambahkan `dotColor` sebagai warna global khusus penanda titik bulat.
- Jika `xColor` / `dotColor` tidak diisi, `null`, atau string kosong, warna otomatis fallback ke `markColor`.
- Style warna khusus per tanda (`style.color`) tetap memiliki prioritas tertinggi.
- Preview ● dan X pada menu pilihan mengikuti `dotColor` / `xColor` beserta fallback-nya.

### v1.2.0
- Penanda biasa/interaktif sekarang mendukung `markColor`, `dotSize`, `xSize`, dan `markStrokeWidth` seperti permanent line.
- Style dapat ditentukan secara global pada constructor atau secara khusus untuk masing-masing `dot`/`x` pada sebuah koordinat.
- `addPoint(x, y, type, style)` menerima style marker opsional.
- Menambahkan `updatePointMark()` dan alias `setPointStyle()` untuk mengubah style tanda yang sudah ada.
- Menambahkan `resetPointMarkStyle()` untuk kembali ke style default global.
- `getData()`, `setData()`, `toJSON()`, `fromJSON()`, history, dan `undo()` sekarang mempertahankan style tanda biasa.
- Preview ● dan X di menu mengikuti ukuran, warna, dan ketebalan default penanda biasa.
- `markSize` dan `xMarkSize` tetap didukung sebagai alias kompatibilitas dari `dotSize` dan `xSize`.

### v1.1.1
- Permanent line mendukung warna marker melalui `markColor`.
- Ukuran tanda bulat dan X dapat diatur melalui `dotSize` dan `xSize`.
- Ketebalan X dapat diatur melalui `markStrokeWidth`.
- `from` dan `to` dapat memiliki `color`, `size`, dan `strokeWidth` masing-masing.
- `updatePermanentLine()` mendukung perubahan parsial marker pada salah satu ujung tanpa harus mengirim ulang koordinat.

### v1.0.1
- Menambah ruang atas agar label Y tertinggi tidak terpotong.
- Menambah ruang kanan agar label X terakhir tetap terlihat.
- Menambahkan garis batas kanan dan bawah pada area grid, sehingga koordinat terakhir (mis. X=16 dan Y=0) memiliki garis yang jelas.


## Opsi tambahan v1.1.1

```javascript
const grid = new InteractiveGrid('#grafik', {
  // ...opsi lama...
  permanentLineWidth: 4,
  permanentMarkColor: '#111',
  permanentDotSize: 10,
  permanentXSize: 13,
  permanentMarkStrokeWidth: 5,
  permanentTextOffset: 24,
  permanentTextFontFamily: 'Arial, Helvetica, sans-serif'
});
```

Nilai di atas menjadi default jika properti yang sama tidak diberikan pada masing-masing permanent line.

## Catatan integrasi database

Untuk aplikasi PHP/React/SIMRS, disarankan menyimpan `grid.getAllData()` sebagai JSON jika permanent line berbeda untuk setiap record/pasien/form. Jika permanent line adalah standar tetap aplikasi, Anda juga dapat menyimpannya di konfigurasi frontend dan hanya menyimpan `grid.getData()` ke database.

Jika data berasal dari backend, selalu lakukan validasi koordinat, tipe marker (`dot`/`x`), warna, ukuran teks, dan panjang teks di sisi server sebelum menyimpannya.
