# CHANGELOG

Riwayat perubahan **InteractiveGrid**.

> Mulai v2.9.2, seluruh catatan perubahan versi baru ditambahkan ke file ini. README hanya berisi dokumentasi penggunaan dan referensi fitur.

## v2.9.2
- Memindahkan seluruh catatan changelog dari `README.md` ke file khusus `CHANGELOG.md`.
- Menambahkan `CHANGELOG.md` ke paket distribusi InteractiveGrid.
- Mulai versi ini, seluruh perubahan berikutnya harus dicatat di `CHANGELOG.md`, bukan di README.
- Dokumentasi penggunaan di README tetap dipertahankan.
- Semua fitur versi sebelumnya tetap kompatibel.

## v2.9.1
- Merapikan popup mode note-only saat `clickDrawToDraw: true` dan drawing belum aktif.
- Header popup sekarang menampilkan teks `Catatan koordinat` yang sejajar dengan tombol `Close`.
- Judul `Catatan koordinat` di dalam section note disembunyikan pada mode note-only agar tidak dobel.
- Tombol `Buat Note`, `Edit Note`, dan `Hapus Note` naik sedikit ke atas sehingga tampil lebih rapat dan rapi.
- Saat mode marker aktif kembali, judul header otomatis kembali menjadi `Tambah tanda`.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.9.0
- Menambahkan warna background per-cell melalui `cellColors`.
- Menambahkan warna satu baris penuh melalui `rowColors`.
- Menambahkan warna satu kolom penuh melalui `columnColors`.
- Default semua warna adalah kosong/tanpa warna tambahan.
- Prioritas warna: per-cell > per-baris > per-kolom > background grid default.
- Warna mengikuti geometri dinamis `colWidth`, `rowHeight`, `columnsConfig`, dan `rowsConfig`.
- Menambahkan API `setCellColor()`, `getCellColor()`, `removeCellColor()`, `setCellColors()`, dan `clearCellColors()`.
- Menambahkan API `setRowColor()`, `removeRowColor()`, `setRowColors()`, `getRowColors()`, dan `clearRowColors()`.
- Menambahkan API `setColumnColor()`, `removeColumnColor()`, `setColumnColors()`, `getColumnColors()`, dan `clearColumnColors()`.
- Menambahkan API `getGridColors()`, `setGridColors()`, dan `clearGridColors()`.
- Menambahkan event `interactivegrid:cellcolorschange` dan callback `onCellColorsChange`.
- `getAllData()` / `toFullJSON()` menyimpan konfigurasi pada `gridColors` dan `setAllData()` / `fromFullJSON()` memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.8.1
- Merapikan tata letak tombol pada bagian `Catatan koordinat`.
- `Buat Note` atau `Edit Note` ditempatkan di sisi kiri.
- `Hapus Note` ditempatkan di sisi kanan.
- Saat `Edit Note` dan `Hapus Note` sama-sama tampil, keduanya kini sejajar pada satu baris.
- Menambahkan jarak kecil di atas baris tombol note agar tidak terlalu menempel pada judul.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.8.0
- Menambahkan properti `tableAlign` untuk mengatur posisi horizontal seluruh tabel/chart.
- Mendukung nilai `left`, `center`, dan `right`.
- Default adalah `tableAlign: 'center'`.
- `tableAlign` bekerja independen dari `toolbarAlign`, sehingga posisi toolbar dan tabel dapat berbeda.
- Posisi seluruh komponen chart ikut berpindah bersama tabel: grid, sumbu, vertical text, tabel Waktu, marker, drawing, permanent line, dan note.
- Menambahkan API `setTableAlign()` dan `getTableAlign()`.
- `getAllData()` / `toFullJSON()` menyimpan `viewConfig.tableAlign`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Horizontal scroll tetap tersedia jika chart lebih lebar daripada container.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.7.0
- Menambahkan properti `toolbarAlign`.
- Mendukung posisi `left`, `center`, dan `right`.
- Default adalah `toolbarAlign: 'left'`, sehingga tampilan lama tidak berubah.
- `toolbarAlign: 'center'` menempatkan seluruh isi toolbar di tengah.
- Menambahkan API `setToolbarAlign()` dan `getToolbarAlign()`.
- `getAllData()` / `toFullJSON()` menyimpan `viewConfig.toolbarAlign`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.6.1
- Pada `clickDrawToDraw: true`, indikator hijau di persimpangan grid tetap tampil saat hover walaupun drawing belum aktif.
- Klik koordinat sebelum menekan `Draw` tetap tidak dapat membuat atau menghapus marker ●/X.
- Jika `showNotes: true`, popup pada kondisi terkunci sekarang hanya menampilkan fitur note dan tombol `Close`.
- Teks `Tambah tanda`, pilihan ●/X, serta bagian hapus marker disembunyikan sampai drawing aktif.
- Koordinat tanpa note menampilkan `Buat Note`; koordinat dengan note menampilkan `Edit Note` dan `Hapus Note`.
- Setelah `Draw` aktif, popup marker kembali tampil normal seperti sebelumnya.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.6.0
- Menambahkan properti `clickDrawToDraw` dengan default `false`.
- Jika `clickDrawToDraw: false`, perilaku tetap seperti sebelumnya: user dapat langsung menambahkan marker setelah halaman dimuat tanpa menekan Draw.
- Jika `clickDrawToDraw: true`, penambahan/penghapusan marker hanya tersedia ketika ada drawing aktif setelah tombol `Draw` diklik.
- Setelah `Stop Draw`, marker kembali terkunci sampai `Draw` diklik lagi.
- Hover plus disembunyikan ketika mode wajib Draw sedang terkunci.
- Jika `showNotes: true`, popup note tetap dapat digunakan walaupun drawing belum aktif; bagian marker disembunyikan.
- Menambahkan API `setClickDrawToDraw()` dan `getClickDrawToDraw()`.
- `getAllData()` / `toFullJSON()` menyimpan `viewConfig.clickDrawToDraw` dan `setAllData()` / `fromFullJSON()` memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.5.0
- Menambahkan multi drawing / multi series yang memungkinkan beberapa garis terpisah dalam satu grid.
- Menambahkan tombol `Draw` dan `Stop Draw` pada toolbar.
- Klik `Draw` selalu membuat drawing baru; drawing sebelumnya tidak akan tersambung dengan drawing baru.
- Marker yang dipilih saat drawing aktif masuk ke drawing aktif, bukan ke jalur legacy.
- Setiap drawing mendukung `lineColor`, `lineWidth`, warna/ukuran dot dan X, serta stroke marker sendiri.
- Menambahkan API `startDrawing()`, `stopDrawing()`, `activateDrawing()`, `getActiveDrawingId()`, `getDrawing()`, `getDrawings()`, `setDrawings()`, `addDrawingPoint()`, `removeDrawingPoint()`, `updateDrawing()`, `removeDrawing()`, dan `clearDrawings()`.
- Menambahkan event `interactivegrid:drawingschange` dan callback `onDrawingsChange`.
- `Undo` sekarang menyimpan snapshot legacy points + drawings + drawing aktif.
- `Hapus Semua` menghapus seluruh data interaktif legacy dan drawings tanpa menghapus permanent line, note, atau tabel waktu.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `drawings`.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.4.0
- Menambahkan penanda hubungan antara note dan titik koordinat.
- Default note menggunakan `notePointerType: 'triangle'` dengan `notePointer: true`.
- Menambahkan titik anchor koordinat melalui `showNoteAnchorDot: true`.
- Mendukung pointer `triangle`, `line`, `dot`, dan `none`.
- Menambahkan opsi `notePointerColor`, `notePointerSize`, `noteAnchorDotColor`, dan `noteAnchorDotSize`.
- Menambahkan `notePosition: 'auto'` yang memilih posisi kanan/kiri berdasarkan ruang; juga mendukung `right` dan `left`.
- Menambahkan API `setNotePointer()`, `getNotePointer()`, `setNotePointerType()`, `getNotePointerType()`, `setShowNoteAnchorDot()`, `getShowNoteAnchorDot()`, `setNotePosition()`, dan `getNotePosition()`.
- Posisi layer note sekarang diselaraskan dengan top padding grid sehingga pointer, titik anchor, dan koordinat tetap tepat.
- `getAllData()` / `toFullJSON()` menyimpan konfigurasi pointer note di `viewConfig`.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.3.0
- Menambahkan fitur catatan per koordinat melalui properti `showNotes`.
- Default `showNotes: false`.
- Jika koordinat belum memiliki catatan, popup penanda menampilkan tombol `Buat Note`.
- Jika koordinat sudah memiliki catatan, popup menampilkan `Edit Note` dan `Hapus Note`.
- Menambahkan editor catatan dengan tombol `Simpan` / `Batal`, shortcut `Ctrl/Cmd+Enter`, dan `Escape`.
- Catatan yang tersimpan ditampilkan sebagai kotak teks di dekat koordinat terkait.
- Catatan dapat dibuat pada koordinat meskipun tidak ada marker ● atau X.
- Menambahkan opsi `notes`, `noteWidth`, `noteMinHeight`, `notePlaceholder`, dan callback `onNotesChange`.
- Menambahkan API `setNote()`, `addNote()`, `updateNote()`, `getNote()`, `getNotes()`, `removeNote()`, `setNotes()`, `clearNotes()`, `setShowNotes()`, dan `getShowNotes()`.
- Menambahkan event `interactivegrid:noteschange`.
- `getAllData()` / `toFullJSON()` sekarang menyimpan `notes` dan `viewConfig.showNotes`.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.2.2
- Pada `showTimeTable: true` dan `showTimePicker: false`, input waktu sekarang memakai lebar penuh cell tabel waktu.
- Padding horizontal wrapper dihilangkan pada mode manual sehingga border kiri/kanan input tepat mengikuti batas cell.
- Border radius input manual dibuat `0` agar terlihat menyatu dengan tabel waktu.
- Ukuran font input manual otomatis mengecil pada cell sempit, termasuk konfigurasi seperti `colWidth: 24`, agar format `HH:MM` lebih mudah terlihat.
- Mode time picker (`showTimePicker: true`) tidak berubah.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.2.1
- Menambahkan tombol teks **Close** di kanan atas popup pemilihan penanda.
- Klik **Close** menjalankan `_hideMenu()` sehingga popup ditutup tanpa menambah atau menghapus tanda.
- Tombol Close diberi `aria-label` dan focus style untuk aksesibilitas keyboard.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.2.0
- Menambahkan properti `xLabels` untuk mengubah teks label sumbu X tanpa mengubah koordinat asli.
- `xLabels` mendukung object berdasarkan nilai koordinat X publik, misalnya `{ 0: 'Awal', 2: '2 Jam' }`.
- `xLabels` juga mendukung array yang mengikuti urutan label tampil berdasarkan `colJoinCount`.
- Override boleh parsial; label yang tidak dioverride tetap menggunakan nilai koordinat default.
- Menambahkan API `setXLabels()`, `getXLabels()`, `setXLabel()`, `getXLabel()`, `removeXLabel()`, dan `clearXLabels()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.xLabels`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.1.0
- Mengganti nama properti utama `xLabelStep` menjadi `colJoinCount`.
- Fungsi `colJoinCount` sama persis dengan `xLabelStep` sebelumnya: mengatur interval label sumbu X dan jumlah kolom utama yang digabung pada tabel Waktu.
- Default tetap `colJoinCount: 1`.
- Menambahkan API utama `setColJoinCount(count)` dan `getColJoinCount()`.
- `xLabelStep`, `setXLabelStep()`, dan `getXLabelStep()` tetap didukung sebagai alias kompatibilitas agar implementasi lama tidak rusak.
- `step` lama juga tetap diterima sebagai alias.
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.0.1
- Pada `showTimePicker: false`, tanda `:` otomatis ditambahkan setelah dua digit pertama.
- Mengetik `08` langsung menjadi `08:`; melanjutkan `30` menghasilkan `08:30`.
- Input/paste empat digit seperti `0830` otomatis menjadi `08:30`.
- Backspace/Delete tetap dapat digunakan normal tanpa `:` dipaksa muncul kembali saat penghapusan.
- Validasi akhir tetap menggunakan format `HH:MM` (`00:00` sampai `23:59`).
- Semua fitur versi sebelumnya tetap kompatibel.


## v2.0.0
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


## v1.9.2
- Memindahkan keterangan jumlah tanda/koordinat ke toolbar, tepat di sebelah kanan tombol **Hapus Semua**.
- Keterangan status sekarang sejajar secara vertikal dengan tombol `Undo` dan `Hapus Semua`.
- `showStatus: true/false` tetap menjadi properti untuk menampilkan atau menyembunyikan keterangan.
- Menambahkan API `setShowStatus()` dan `getShowStatus()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.showStatus`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v1.9.1
- Menggeser label angka sumbu X sedikit ke kiri secara default agar tidak tertutup garis vertikal grid.
- Menambahkan properti `xLabelOffset` dengan default `-6` pixel.
- Nilai negatif menggeser label ke kiri, nilai positif ke kanan, dan `0` mengembalikan label tepat ke tengah garis.
- Menambahkan API `setXLabelOffset(offset)` dan `getXLabelOffset()`.
- Perubahan hanya memengaruhi posisi visual label X; grid, koordinat, marker, garis, permanent line, dan tabel waktu tetap tidak berubah.


## v1.9.0
- Menambahkan properti `showTimeTable` dengan default `true`.
- Jika `showTimeTable: false`, tabel **Waktu (Jam)** di bawah grafik disembunyikan dan tinggi layout menyesuaikan otomatis.
- Baris label X dan tabel waktu sekarang dibuat menyatu secara visual dengan tabel utama.
- Cell tabel waktu otomatis digabung berdasarkan `colJoinCount`.
- `colJoinCount: 1` menghasilkan satu cell tabel waktu untuk setiap kolom utama; `colJoinCount: 2` menggabungkan dua kolom utama per cell; dan seterusnya.
- Merge tabel waktu mendukung `colWidth` dan lebar khusus per kolom, karena batas cell dihitung dari posisi X kumulatif.
- Menambahkan API `setShowTimeTable()`, `getShowTimeTable()`, dan `getTimeTableGroups()`.
- `getAllData()` / `toFullJSON()` sekarang menyertakan `viewConfig.showTimeTable`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v1.8.0
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


## v1.7.0
- Menambahkan `rowHeight` sebagai tinggi default setiap baris/cell vertikal, dengan default `42`.
- `cellHeight` tetap didukung sebagai alias kompatibilitas versi lama.
- Menambahkan tinggi per baris melalui `rowsConfig` dan `rowHeights`.
- Penomoran baris adalah 1-based dari bawah: baris 1 berada antara Y=0 dan Y=1.
- Garis horizontal grid, label Y, koordinat mouse/touch, marker, garis biasa, permanent line, dan teks permanent line sekarang memakai posisi Y kumulatif sehingga tinggi setiap baris boleh berbeda.
- Menambahkan API `getRowHeight()`, `setRowHeight()`, `getRowHeight()`, `getRowHeight()`, `getRowHeights()`, `getRowHeights()`, `setRowHeight()`, `setRowHeight()`, `resetRowHeight()`, `resetRowHeight()`, `setRowHeights()`, `getRowLayout()`, dan `setRowLayout()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `rowLayout`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v1.6.0
- Menambahkan `colWidth` sebagai lebar default kolom.
- `cellWidth` tetap didukung sebagai alias kompatibilitas versi lama.
- Menambahkan lebar per kolom melalui `columnsConfig`, `colWidths`, dan `columnWidths`.
- `columnsConfig` mendukung object 1-based maupun array; setiap item dapat memiliki `{ colWidth }`.
- Grid vertikal, label X, area `Waktu`, koordinat mouse/touch, marker, garis biasa, dan permanent line sekarang memakai posisi X kumulatif sehingga lebar setiap kolom boleh berbeda.
- Menambahkan API `getColWidth()`, `setColWidth()`, `getColumnWidth()`, `getColumnWidths()`, `setColumnWidth()`, `resetColumnWidth()`, `setColumnWidths()`, `getColumnLayout()`, dan `setColumnLayout()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `columnLayout`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur versi sebelumnya tetap kompatibel.


## v1.5.0
- Menambahkan `verticalTexts` untuk menampilkan satu atau lebih teks vertikal di sebelah kiri label sumbu Y.
- Teks vertikal mendukung `text`, `color`, `fontSize`, `fontWeight`, `fontFamily`, dan `width`.
- Menambahkan default global `verticalTextWidth`, `verticalTextColor`, `verticalTextFontSize`, `verticalTextFontWeight`, dan `verticalTextFontFamily`.
- Layout kiri grafik dihitung ulang secara otomatis saat jumlah atau lebar vertical text berubah.
- Menambahkan API `addVerticalText()`, `updateVerticalText()`, `removeVerticalText()`, `setVerticalTexts()`, `getVerticalTexts()`, dan `clearVerticalTexts()`.
- `getAllData()` / `toFullJSON()` sekarang juga menyertakan `verticalTexts`, dan `setAllData()` / `fromFullJSON()` dapat memuatnya kembali.
- Semua fitur lama (`colJoinCount`, `yLabelStep`, permanent line, marker, undo, dan data interaktif) tetap kompatibel.


## v1.4.0
- Menambahkan `yLabelStep` untuk mengatur setiap berapa baris angka sumbu Y ditampilkan.
- Default `yLabelStep: 1`, sehingga perilaku versi sebelumnya tetap sama.
- `yLabelStep` hanya memengaruhi label angka sumbu Y; jumlah baris, koordinat, marker, garis interaktif, dan permanent line tetap sama.
- Menambahkan API `setYLabelStep(step)` dan `getYLabelStep()`.
- `colJoinCount` dan `yLabelStep` dapat digunakan secara bersamaan.


## v1.3.0
- Menambahkan `colJoinCount` untuk mengatur setiap berapa kolom angka sumbu X ditampilkan.
- Menambahkan `step` sebagai alias dari `colJoinCount`.
- Default tetap `colJoinCount: 1`, sehingga perilaku lama tidak berubah.
- Pengaturan ini hanya memengaruhi label angka; grid, koordinat, data, marker, dan garis tetap sama.
- Menambahkan API `setColJoinCount(step)` dan `getColJoinCount()`.


## v1.2.2
- Menambahkan `xColor` sebagai warna global khusus penanda X.
- Menambahkan `dotColor` sebagai warna global khusus penanda titik bulat.
- Jika `xColor` / `dotColor` tidak diisi, `null`, atau string kosong, warna otomatis fallback ke `markColor`.
- Style warna khusus per tanda (`style.color`) tetap memiliki prioritas tertinggi.
- Preview ● dan X pada menu pilihan mengikuti `dotColor` / `xColor` beserta fallback-nya.

## v1.2.0
- Penanda biasa/interaktif sekarang mendukung `markColor`, `dotSize`, `xSize`, dan `markStrokeWidth` seperti permanent line.
- Style dapat ditentukan secara global pada constructor atau secara khusus untuk masing-masing `dot`/`x` pada sebuah koordinat.
- `addPoint(x, y, type, style)` menerima style marker opsional.
- Menambahkan `updatePointMark()` dan alias `setPointStyle()` untuk mengubah style tanda yang sudah ada.
- Menambahkan `resetPointMarkStyle()` untuk kembali ke style default global.
- `getData()`, `setData()`, `toJSON()`, `fromJSON()`, history, dan `undo()` sekarang mempertahankan style tanda biasa.
- Preview ● dan X di menu mengikuti ukuran, warna, dan ketebalan default penanda biasa.
- `markSize` dan `xMarkSize` tetap didukung sebagai alias kompatibilitas dari `dotSize` dan `xSize`.

## v1.1.1
- Permanent line mendukung warna marker melalui `markColor`.
- Ukuran tanda bulat dan X dapat diatur melalui `dotSize` dan `xSize`.
- Ketebalan X dapat diatur melalui `markStrokeWidth`.
- `from` dan `to` dapat memiliki `color`, `size`, dan `strokeWidth` masing-masing.
- `updatePermanentLine()` mendukung perubahan parsial marker pada salah satu ujung tanpa harus mengirim ulang koordinat.

## v1.0.1
- Menambah ruang atas agar label Y tertinggi tidak terpotong.
- Menambah ruang kanan agar label X terakhir tetap terlihat.
- Menambahkan garis batas kanan dan bawah pada area grid, sehingga koordinat terakhir (mis. X=16 dan Y=0) memiliki garis yang jelas.
