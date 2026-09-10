/* InteractiveGrid v2.8.0
 * Framework-agnostic interactive grid chart.
 * Global: window.InteractiveGrid
 * CommonJS: module.exports = InteractiveGrid
 */
(function (global, factory) {
  var InteractiveGrid = factory();
  if (typeof module === 'object' && module.exports) module.exports = InteractiveGrid;
  if (global) global.InteractiveGrid = InteractiveGrid;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var DEFAULTS = {
    columns: 17,          // x = 0..16
    rows: 11,             // y = 0..10
    xStart: 0,
    // Jumlah kolom utama yang digabung untuk label sumbu X dan cell tabel waktu.
    // Contoh colJoinCount: 2 -> label: 0, 2, 4, 6, ...
    colJoinCount: 1,
    // Geser posisi label angka sumbu X secara horizontal (pixel).
    // Nilai negatif = ke kiri, positif = ke kanan.
    xLabelOffset: -6,

    // Override teks label sumbu X tanpa mengubah koordinat sebenarnya.
    // Object: { 0: 'Awal', 2: '2 Jam', 4: '4 Jam' }
    // Array: mengikuti urutan label yang tampil berdasarkan colJoinCount.
    xLabels: null,

    // Alias kompatibilitas versi lama.
    xLabelStep: null,
    step: null,
    yStart: 0,
    // Jarak antar label angka pada sumbu Y.
    // Contoh yLabelStep: 2 -> label: 0, 2, 4, 6, ...
    yLabelStep: 1,

    // Teks vertikal di sebelah kiri label angka sumbu Y.
    // Dapat berupa string atau object: { id, text, color, fontSize, fontWeight, width, fontFamily }.
    verticalTexts: [],
    verticalTextWidth: 44,
    verticalTextColor: '#111',
    verticalTextFontSize: 18,
    verticalTextFontWeight: '600',
    verticalTextFontFamily: 'Arial, Helvetica, sans-serif',

    // Lebar default setiap kolom/cell horizontal.
    // `cellWidth` tetap didukung sebagai alias kompatibilitas versi lama.
    colWidth: 54,
    cellWidth: 54,

    // Override lebar per kolom. Kolom dihitung 1-based:
    // kolom 1 = area antara X pertama dan X kedua.
    // Format yang didukung:
    // columnsConfig: { 2: { colWidth: 80 }, 5: { colWidth: 100 } }
    // columnsConfig: [null, { colWidth: 80 }, ...]
    // colWidths / columnWidths juga didukung sebagai alias ringkas.
    columnsConfig: null,
    colWidths: null,
    columnWidths: null,

    // Tinggi default setiap baris/cell vertikal.
    // `rowHeight` adalah nama utama.
    // `rowWidth` dan `cellHeight` tetap didukung sebagai alias kompatibilitas versi lama.
    rowHeight: 42,
    rowWidth: null,
    cellHeight: 42,

    // Override tinggi per baris. Baris dihitung 1-based dari bawah:
    // baris 1 = area antara Y pertama dan Y kedua (mis. Y=0 ke Y=1).
    // Format yang didukung:
    // rowsConfig: { 2: { rowHeight: 60 }, 5: { rowHeight: 80 } }
    // rowsConfig: [null, { rowHeight: 60 }, ...]
    // rowHeights adalah alias ringkas utama; rowWidths tetap diterima untuk kompatibilitas.
    rowsConfig: null,
    rowHeights: null,
    rowWidths: null,

    xAxisTitle: 'Waktu',
    xAxisSubtitle: '(Jam)',

    // Tabel waktu di bawah sumbu X.
    // Jika true, tabel waktu ditampilkan dan cell-nya mengikuti colJoinCount.
    // Jika false, tabel waktu disembunyikan.
    showTimeTable: true,

    // Input jam pada setiap cell tabel waktu.
    // true  = input type=time (picker browser + bisa diketik manual bila browser mendukung)
    // false = input text manual dengan validasi/normalisasi HH:MM
    showTimePicker: true,
    timeInputPlaceholder: 'HH:MM',
    timeData: [],
    onTimeChange: null,

    // Catatan pada koordinat tertentu.
    showNotes: false,
    notes: [],
    noteWidth: 220,
    noteMinHeight: 86,
    notePlaceholder: 'Tulis catatan...',

    // Penanda hubungan note dengan koordinat.
    notePointer: true,
    notePointerType: 'triangle', // triangle | line | dot | none
    notePointerColor: '#111111',
    notePointerSize: 14,
    showNoteAnchorDot: true,
    noteAnchorDotColor: '#111111',
    noteAnchorDotSize: 4,
    notePosition: 'auto', // auto | right | left

    onNotesChange: null,

    showToolbar: true,
    showStatus: true,
    showUndo: true,
    showClear: true,

    // Posisi isi toolbar: left | center | right.
    // Default tetap left agar kompatibel dengan tampilan sebelumnya.
    toolbarAlign: 'left',

    // Posisi tabel/chart di dalam container: left | center | right.
    // Default center.
    tableAlign: 'center',

    // Multi drawing / multi series.
    showDrawControls: true,
    drawButtonText: 'Draw',
    stopDrawButtonText: 'Stop Draw',

    // Jika true, user harus klik Draw / startDrawing() sebelum dapat
    // menambahkan atau menghapus marker pada grid.
    // Jika false, perilaku legacy tetap aktif setelah halaman dimuat.
    clickDrawToDraw: false,

    drawings: [],
    onDrawingsChange: null,
    lineWidth: 4,
    // Penanda biasa/interaktif. dotSize/xSize adalah nama utama.
    // markSize/xMarkSize dipertahankan sebagai alias kompatibilitas versi lama.
    dotSize: 10,
    xSize: 13,
    markSize: 10,
    xMarkSize: 13,
    markStrokeWidth: 5,
    lineColor: '#18a94d',
    markColor: '#111',
    // Warna khusus per tipe penanda biasa. Jika null/kosong, fallback ke markColor.
    dotColor: null,
    xColor: null,
    // Jika true dan dot + X berada pada koordinat yang sama, dot dirender terakhir (di atas X).
    showDotOnTop: false,
    permanentLineWidth: 4,
    permanentMarkColor: '#111',
    permanentDotSize: 10,
    permanentXSize: 13,
    permanentMarkStrokeWidth: 5,
    permanentTextOffset: 24,
    permanentTextFontFamily: 'Arial, Helvetica, sans-serif',
    onChange: null,
    onSelect: null
  };

  function merge(a, b) {
    var out = {};
    Object.keys(a).forEach(function (k) { out[k] = a[k]; });
    if (b) Object.keys(b).forEach(function (k) { out[k] = b[k]; });
    return out;
  }

  function cloneMarkStyles(styles) {
    styles = styles || {};
    var out = {};
    ['dot', 'x'].forEach(function (type) {
      if (!styles[type]) return;
      out[type] = {};
      if (styles[type].color != null) out[type].color = styles[type].color;
      if (styles[type].size != null) out[type].size = styles[type].size;
      if (styles[type].strokeWidth != null) out[type].strokeWidth = styles[type].strokeWidth;
    });
    return out;
  }

  function clonePoints(points) {
    return points.map(function (p) {
      var out = { x: p.x, y: p.y, types: p.types.slice() };
      var styles = cloneMarkStyles(p.styles);
      if (Object.keys(styles).length) out.styles = styles;
      return out;
    });
  }

  function clonePermanent(items) {
    return items.map(function (item) {
      return {
        id: item.id,
        from: { x: item.from.x, y: item.from.y, type: item.from.type, color: item.from.color, size: item.from.size, strokeWidth: item.from.strokeWidth },
        to: { x: item.to.x, y: item.to.y, type: item.to.type, color: item.to.color, size: item.to.size, strokeWidth: item.to.strokeWidth },
        lineColor: item.lineColor,
        lineWidth: item.lineWidth,
        markColor: item.markColor,
        dotSize: item.dotSize,
        xSize: item.xSize,
        markStrokeWidth: item.markStrokeWidth,
        text: item.text,
        textColor: item.textColor,
        textSize: item.textSize,
        textOffset: item.textOffset,
        textFontFamily: item.textFontFamily
      };
    });
  }

  function cloneDrawings(drawings) {
    return (drawings || []).map(function (d) {
      return {
        id: d.id,
        lineColor: d.lineColor,
        lineWidth: d.lineWidth,
        markColor: d.markColor,
        dotColor: d.dotColor,
        xColor: d.xColor,
        dotSize: d.dotSize,
        xSize: d.xSize,
        markStrokeWidth: d.markStrokeWidth,
        showDotOnTop: !!d.showDotOnTop,
        points: clonePoints(d.points || [])
      };
    });
  }

  function cloneVerticalTexts(items) {
    return (items || []).map(function (item) {
      return {
        id: item.id,
        text: item.text,
        color: item.color,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        fontFamily: item.fontFamily,
        width: item.width
      };
    });
  }

  function isValidType(type) { return type === 'dot' || type === 'x'; }

  function InteractiveGrid(target, options) {
    if (!(this instanceof InteractiveGrid)) return new InteractiveGrid(target, options);
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) throw new Error('InteractiveGrid: target element tidak ditemukan.');

    this.options = merge(DEFAULTS, options || {});

    // colJoinCount adalah nama utama. xLabelStep dan step tetap diterima sebagai alias kompatibilitas.
    var requestedColJoinCount = null;
    if (options && options.colJoinCount != null) requestedColJoinCount = Number(options.colJoinCount);
    else if (options && options.xLabelStep != null) requestedColJoinCount = Number(options.xLabelStep);
    else if (options && options.step != null) requestedColJoinCount = Number(options.step);
    else requestedColJoinCount = Number(this.options.colJoinCount);

    if (!(requestedColJoinCount > 0)) requestedColJoinCount = 1;
    requestedColJoinCount = Math.max(1, Math.floor(requestedColJoinCount));
    this.options.colJoinCount = requestedColJoinCount;
    this.options.xLabelStep = requestedColJoinCount;
    this.options.step = requestedColJoinCount;

    this.options.xLabelOffset = Number(this.options.xLabelOffset);
    if (!Number.isFinite(this.options.xLabelOffset)) this.options.xLabelOffset = -6;

    this.xLabels = {};
    this._setXLabelsInternal(this.options.xLabels);

    // yLabelStep mengatur frekuensi label angka pada sumbu Y.
    this.options.yLabelStep = Number(this.options.yLabelStep);
    if (!(this.options.yLabelStep > 0)) this.options.yLabelStep = 1;
    this.options.yLabelStep = Math.max(1, Math.floor(this.options.yLabelStep));

    // colWidth adalah nama utama untuk lebar default kolom.
    // Jika colWidth tidak diberikan tetapi cellWidth lama diberikan, gunakan cellWidth.
    var requestedColWidth = null;
    if (options && options.colWidth != null) requestedColWidth = Number(options.colWidth);
    else if (options && options.cellWidth != null) requestedColWidth = Number(options.cellWidth);
    else requestedColWidth = Number(this.options.colWidth);

    if (!(requestedColWidth > 0)) requestedColWidth = 54;
    this.options.colWidth = requestedColWidth;
    this.options.cellWidth = requestedColWidth; // alias kompatibilitas

    this._columnWidthOverrides = {};
    this._loadColumnWidthOverrides(this.options.colWidths);
    this._loadColumnWidthOverrides(this.options.columnWidths);
    this._loadColumnWidthOverrides(this.options.columnsConfig);

    // rowHeight adalah nama utama untuk tinggi default baris.
    // Prioritas: rowHeight -> rowWidth lama -> cellHeight lama -> default 42.
    var requestedRowHeight = null;
    if (options && options.rowHeight != null) requestedRowHeight = Number(options.rowHeight);
    else if (options && options.rowWidth != null) requestedRowHeight = Number(options.rowWidth);
    else if (options && options.cellHeight != null) requestedRowHeight = Number(options.cellHeight);
    else requestedRowHeight = Number(this.options.rowHeight);

    if (!(requestedRowHeight > 0)) requestedRowHeight = 42;
    this.options.rowHeight = requestedRowHeight;
    this.options.rowWidth = requestedRowHeight; // alias kompatibilitas
    this.options.cellHeight = requestedRowHeight; // alias kompatibilitas

    this._rowHeightOverrides = {};
    this._loadRowHeightOverrides(this.options.rowWidths);
    this._loadRowHeightOverrides(this.options.rowHeights);
    this._loadRowHeightOverrides(this.options.rowsConfig);

    // Alias opsi lama -> nama baru, tanpa merusak implementasi lama.
    if (options && options.dotSize == null && options.markSize != null) this.options.dotSize = Number(options.markSize);
    if (options && options.xSize == null && options.xMarkSize != null) this.options.xSize = Number(options.xMarkSize);
    this.options.markSize = this.options.dotSize;
    this.options.xMarkSize = this.options.xSize;
    this.points = [];

    this.drawings = [];
    this.activeDrawingId = null;
    this._drawingSeq = 0;
    this._setDrawingsInternal(this.options.drawings);

    this.permanentData = [];
    this._permanentSeq = 0;

    this.verticalTexts = [];
    this._verticalTextSeq = 0;
    this._setVerticalTextsInternal(this.options.verticalTexts);

    this.timeData = {};
    this._setTimeDataInternal(this.options.timeData);

    this.notes = {};
    this._setNotesInternal(this.options.notes);

    this.history = [];
    this.pendingCell = null;
    this.destroyed = false;
    this._bound = [];

    var toolbarAlign = String(this.options.toolbarAlign || 'left').toLowerCase();
    if (['left', 'center', 'right'].indexOf(toolbarAlign) < 0) toolbarAlign = 'left';
    this.options.toolbarAlign = toolbarAlign;

    var tableAlign = String(this.options.tableAlign || 'center').toLowerCase();
    if (['left', 'center', 'right'].indexOf(tableAlign) < 0) tableAlign = 'center';
    this.options.tableAlign = tableAlign;

    this._build();
    this._bindEvents();
    this.render();
  }

  InteractiveGrid.prototype._columnNumberFromKey = function (key, isArray) {
    var n = Number(key);
    if (!Number.isInteger(n)) return null;
    // Array: index 0 = kolom 1. Object: key 1 = kolom 1.
    return isArray ? (n + 1) : n;
  };

  InteractiveGrid.prototype._extractColumnWidth = function (value) {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      value = value.colWidth;
    }
    value = Number(value);
    return value > 0 ? value : null;
  };

  InteractiveGrid.prototype._loadColumnWidthOverrides = function (source) {
    if (source == null) return;

    var self = this;
    var maxColumn = Math.max(0, Number(this.options.columns) - 1);

    if (Array.isArray(source)) {
      source.forEach(function (value, index) {
        var columnNumber = self._columnNumberFromKey(index, true);
        var width = self._extractColumnWidth(value);
        if (columnNumber >= 1 && columnNumber <= maxColumn && width != null) {
          self._columnWidthOverrides[columnNumber] = width;
        }
      });
      return;
    }

    if (typeof source === 'object') {
      Object.keys(source).forEach(function (key) {
        var columnNumber = self._columnNumberFromKey(key, false);
        var width = self._extractColumnWidth(source[key]);
        if (columnNumber >= 1 && columnNumber <= maxColumn && width != null) {
          self._columnWidthOverrides[columnNumber] = width;
        }
      });
    }
  };

  InteractiveGrid.prototype._rebuildColumnGeometry = function () {
    var o = this.options;
    var count = Math.max(0, o.columns - 1);
    var widths = [];
    var positions = [0];
    var total = 0;

    for (var i = 1; i <= count; i++) {
      var width = Number(this._columnWidthOverrides[i]);
      if (!(width > 0)) width = Number(o.colWidth);
      if (!(width > 0)) width = 54;

      widths.push(width);
      total += width;
      positions.push(total);
    }

    this._columnWidths = widths;
    this._xPositions = positions;
    this._gridWidth = total;
  };

  InteractiveGrid.prototype._normalizeTimeValue = function (value, allowEmpty) {
    if (value == null) return allowEmpty ? '' : null;
    value = String(value).trim();
    if (!value) return allowEmpty ? '' : null;

    // Terima H:M, H:MM, HH:M, HH:MM lalu normalisasi menjadi HH:MM.
    var m = value.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
    if (!m) return null;

    var h = Number(m[1]);
    var min = Number(m[2]);
    if (!Number.isInteger(h) || !Number.isInteger(min) || h < 0 || h > 23 || min < 0 || min > 59) {
      return null;
    }

    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  };

  InteractiveGrid.prototype._formatManualTimeTyping = function (value, inputType) {
    value = String(value == null ? '' : value);
    var cleaned = value.replace(/[^0-9:]/g, '');

    if (/^\d{3,4}$/.test(cleaned) && cleaned.indexOf(':') < 0) {
      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }

    var isDeleting =
      inputType === 'deleteContentBackward' ||
      inputType === 'deleteContentForward' ||
      inputType === 'deleteByCut';

    if (!isDeleting && /^\d{2}$/.test(cleaned)) {
      cleaned += ':';
    }

    return cleaned.slice(0, 5);
  };

  InteractiveGrid.prototype._setTimeDataInternal = function (data) {
    this.timeData = {};
    if (data == null) return;

    var self = this;

    // Array string: index 0 = group/cell waktu pertama.
    if (Array.isArray(data)) {
      data.forEach(function (item, index) {
        var startColumn = index + 1;
        var value = item;

        if (item && typeof item === 'object') {
          startColumn = Number(item.startColumn != null ? item.startColumn : (item.column != null ? item.column : startColumn));
          value = item.value != null ? item.value : item.time;
        }

        var normalized = self._normalizeTimeValue(value, true);
        if (Number.isInteger(startColumn) && startColumn >= 1 && normalized != null) {
          self.timeData[startColumn] = normalized;
        }
      });
      return;
    }

    // Object: key = startColumn, value = jam.
    if (typeof data === 'object') {
      Object.keys(data).forEach(function (key) {
        var startColumn = Number(key);
        var value = data[key];
        if (value && typeof value === 'object') value = value.value != null ? value.value : value.time;
        var normalized = self._normalizeTimeValue(value, true);
        if (Number.isInteger(startColumn) && startColumn >= 1 && normalized != null) {
          self.timeData[startColumn] = normalized;
        }
      });
    }
  };

  InteractiveGrid.prototype._emitTimeChange = function (group, value) {
    var detail = {
      group: group,
      value: value,
      data: this.getTimeData()
    };

    this.el.dispatchEvent(new CustomEvent('interactivegrid:timechange', { detail: detail }));
    if (typeof this.options.onTimeChange === 'function') {
      this.options.onTimeChange(detail.data, group, value);
    }
  };

  InteractiveGrid.prototype._renderTimeInputs = function () {
    if (!this.dom || !this.dom.timeCells) return;

    var container = this.dom.timeCells;
    var oldInputs = container.querySelectorAll('.ig-time-input-wrap');
    for (var oi = 0; oi < oldInputs.length; oi++) oldInputs[oi].remove();

    if (!this.options.showTimeTable) return;

    var groups = this.getTimeTableGroups();
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var startIndex = group.startColumn - 1;
      var left = this._xPositions[startIndex];

      var wrap = document.createElement('div');
      wrap.className = 'ig-time-input-wrap' + (this.options.showTimePicker ? '' : ' ig-time-input-wrap-manual');
      wrap.style.left = left + 'px';
      wrap.style.width = group.width + 'px';
      wrap.setAttribute('data-start-column', group.startColumn);
      wrap.setAttribute('data-end-column', group.endColumn);

      var input = document.createElement('input');
      input.className = 'ig-time-input' + (this.options.showTimePicker ? '' : ' ig-time-input-manual');
      input.type = this.options.showTimePicker ? 'time' : 'text';
      input.value = this.timeData[group.startColumn] || '';
      input.setAttribute('data-start-column', group.startColumn);
      input.setAttribute('aria-label', 'Waktu kolom ' + group.startColumn + ' sampai ' + group.endColumn);

      if (this.options.showTimePicker) {
        input.step = '60';
      } else {
        input.inputMode = 'numeric';
        input.placeholder = this.options.timeInputPlaceholder || 'HH:MM';
        input.maxLength = 5;
        input.setAttribute('pattern', '[0-2][0-9]:[0-5][0-9]');

        // Mode manual memakai seluruh lebar cell. Untuk cell sangat sempit,
        // kecilkan font otomatis agar format HH:MM tetap terlihat sebanyak mungkin.
        var manualFontSize = 13;
        if (group.width < 44) manualFontSize = 11;
        if (group.width < 34) manualFontSize = 9;
        if (group.width < 28) manualFontSize = 8;
        input.style.fontSize = manualFontSize + 'px';
      }

      wrap.appendChild(input);
      container.appendChild(wrap);
    }
  };

  InteractiveGrid.prototype._renderColumnGuides = function () {
    if (!this.dom || !this.dom.grid || !this.dom.timeCells || !this.dom.xLabels) return;

    // Hapus guide lama tanpa menghapus label angka X.
    var oldGrid = this.dom.grid.querySelectorAll('.ig-grid-vline');
    for (var gi = 0; gi < oldGrid.length; gi++) oldGrid[gi].remove();

    var oldTime = this.dom.timeCells.querySelectorAll('.ig-time-vline');
    for (var ti = 0; ti < oldTime.length; ti++) oldTime[ti].remove();

    var oldAxis = this.dom.xLabels.querySelectorAll('.ig-x-axis-vline');
    for (var ai = 0; ai < oldAxis.length; ai++) oldAxis[ai].remove();

    // Grid utama: garis vertikal tetap muncul di setiap kolom.
    for (var i = 1; i < this.options.columns - 1; i++) {
      var x = this._xPositions[i];

      var gridLine = document.createElement('span');
      gridLine.className = 'ig-grid-vline';
      gridLine.style.left = x + 'px';
      this.dom.grid.appendChild(gridLine);
    }

    // Tabel waktu + baris label X: merge berdasarkan colJoinCount.
    // colJoinCount=1 -> setiap kolom terpisah.
    // colJoinCount=2 -> setiap 2 kolom utama menjadi 1 cell tabel waktu.
    var step = Number(this.options.colJoinCount);
    if (!(step > 0)) step = 1;
    step = Math.max(1, Math.floor(step));

    for (var boundary = step; boundary < this.options.columns - 1; boundary += step) {
      var bx = this._xPositions[boundary];

      var axisLine = document.createElement('span');
      axisLine.className = 'ig-x-axis-vline';
      axisLine.style.left = bx + 'px';
      this.dom.xLabels.appendChild(axisLine);

      var timeLine = document.createElement('span');
      timeLine.className = 'ig-time-vline';
      timeLine.style.left = bx + 'px';
      this.dom.timeCells.appendChild(timeLine);
    }

    this._renderTimeInputs();
  };

  InteractiveGrid.prototype._refreshColumnLayout = function () {
    if (!this.dom) return this;
    this.el.style.setProperty('--ig-cell-w', this.options.colWidth + 'px');
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype._rowNumberFromKey = function (key, isArray) {
    var n = Number(key);
    if (!Number.isInteger(n)) return null;
    // Array: index 0 = baris 1. Object: key 1 = baris 1.
    return isArray ? (n + 1) : n;
  };

  InteractiveGrid.prototype._extractRowHeight = function (value) {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      value = value.rowHeight != null ? value.rowHeight : value.rowWidth;
    }
    value = Number(value);
    return value > 0 ? value : null;
  };

  InteractiveGrid.prototype._loadRowHeightOverrides = function (source) {
    if (source == null) return;

    var self = this;
    var maxRow = Math.max(0, Number(this.options.rows) - 1);

    if (Array.isArray(source)) {
      source.forEach(function (value, index) {
        var rowNumber = self._rowNumberFromKey(index, true);
        var height = self._extractRowHeight(value);
        if (rowNumber >= 1 && rowNumber <= maxRow && height != null) {
          self._rowHeightOverrides[rowNumber] = height;
        }
      });
      return;
    }

    if (typeof source === 'object') {
      Object.keys(source).forEach(function (key) {
        var rowNumber = self._rowNumberFromKey(key, false);
        var height = self._extractRowHeight(source[key]);
        if (rowNumber >= 1 && rowNumber <= maxRow && height != null) {
          self._rowHeightOverrides[rowNumber] = height;
        }
      });
    }
  };

  InteractiveGrid.prototype._rebuildRowGeometry = function () {
    var o = this.options;
    var count = Math.max(0, o.rows - 1);
    var heights = [];
    var cumulative = [0];
    var total = 0;

    // row 1 = antara Y=0 dan Y=1, sehingga cumulative dihitung dari bawah.
    for (var i = 1; i <= count; i++) {
      var height = Number(this._rowHeightOverrides[i]);
      if (!(height > 0)) height = Number(o.rowHeight);
      if (!(height > 0)) height = 42;

      heights.push(height);
      total += height;
      cumulative.push(total);
    }

    this._rowHeights = heights;
    this._yCumulative = cumulative;
    this._gridHeight = total;

    // Posisi layar untuk setiap koordinat Y, dari atas ke bawah.
    this._yPositions = [];
    for (var y = 0; y < o.rows; y++) {
      this._yPositions[y] = total - cumulative[y];
    }
  };

  InteractiveGrid.prototype._renderRowGuides = function () {
    if (!this.dom || !this.dom.grid) return;

    // Hapus hanya horizontal guide yang dibuat JS; vertical guide dipertahankan.
    var old = this.dom.grid.querySelectorAll('.ig-grid-hline');
    for (var i = 0; i < old.length; i++) old[i].remove();

    // Batas paling atas/bawah ditangani border CSS.
    for (var y = 1; y < this.options.rows - 1; y++) {
      var py = this._yPositions[y];

      var line = document.createElement('span');
      line.className = 'ig-grid-hline';
      line.style.top = py + 'px';
      this.dom.grid.appendChild(line);
    }
  };

  InteractiveGrid.prototype._refreshRowHeightLayout = function () {
    if (!this.dom) return this;
    this.el.style.setProperty('--ig-cell-h', this.options.rowHeight + 'px');
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype._build = function () {
    var o = this.options;
    this.el.innerHTML = '';
    this.el.classList.add('ig-root');
    this.el.style.setProperty('--ig-cell-w', o.colWidth + 'px');
    this.el.style.setProperty('--ig-cell-h', o.rowHeight + 'px');
    this.el.style.setProperty('--ig-x-label-offset', o.xLabelOffset + 'px');
    this.el.style.setProperty('--ig-line', o.lineColor);
    this.el.style.setProperty('--ig-mark', o.markColor);
    this.el.style.setProperty('--ig-dot-color', (o.dotColor != null && String(o.dotColor).trim()) ? o.dotColor : o.markColor);
    this.el.style.setProperty('--ig-x-color', (o.xColor != null && String(o.xColor).trim()) ? o.xColor : o.markColor);
    this.el.style.setProperty('--ig-dot-size', o.dotSize + 'px');
    this.el.style.setProperty('--ig-x-size', o.xSize + 'px');
    this.el.style.setProperty('--ig-mark-stroke-width', o.markStrokeWidth + 'px');

    var toolbar = document.createElement('div');
    toolbar.className = 'ig-toolbar' + (o.showToolbar ? '' : ' ig-hidden');
    toolbar.innerHTML =
      '<button type="button" class="ig-draw">' + this._escape(o.drawButtonText || 'Draw') + '</button>' +
      '<button type="button" class="ig-stop-draw">' + this._escape(o.stopDrawButtonText || 'Stop Draw') + '</button>' +
      '<button type="button" class="ig-undo">Undo</button>' +
      '<button type="button" class="ig-clear">Hapus Semua</button>' +
      '<span class="ig-status' + (o.showStatus ? '' : ' ig-hidden') + '" aria-live="polite"></span>';

    var scroll = document.createElement('div');
    scroll.className = 'ig-scroll';
    var chart = document.createElement('div');
    chart.className = 'ig-chart';
    scroll.appendChild(chart);

    chart.innerHTML =
      '<div class="ig-vertical-texts" aria-hidden="true"></div>' +
      '<div class="ig-y-labels"></div>' +
      '<div class="ig-grid"></div>' +
      '<div class="ig-x-labels"></div>' +
      '<div class="ig-time-label"></div>' +
      '<div class="ig-time-cells"></div>' +
      '<svg class="ig-overlay" aria-hidden="true"></svg>' +
      '<div class="ig-notes-layer"></div>' +
      '<div class="ig-interaction" aria-label="Area interaksi grafik"></div>' +
      '<div class="ig-hover-plus" aria-hidden="true"></div>' +
      '<div class="ig-menu" role="dialog" aria-label="Pilihan tanda">' +
        '<div class="ig-menu-header">' +
          '<div class="ig-menu-title">Tambah tanda</div>' +
          '<button type="button" class="ig-menu-close" aria-label="Tutup popup">Close</button>' +
        '</div>' +
        '<div class="ig-menu-section ig-add-section">' +
          '<button type="button" class="ig-choice" data-type="dot" title="Tambah titik bulat"><span class="ig-dot-preview"></span></button>' +
          '<button type="button" class="ig-choice" data-type="x" title="Tambah tanda X"><span class="ig-x-preview"></span></button>' +
        '</div>' +
        '<div class="ig-menu-section ig-delete-section">' +
          '<div class="ig-menu-title">Hapus tanda di koordinat ini</div>' +
          '<button type="button" class="ig-delete" data-delete-type="dot">Hapus ●</button>' +
          '<button type="button" class="ig-delete" data-delete-type="x">Hapus X</button>' +
          '<button type="button" class="ig-delete-all" data-delete-type="all">Hapus semua di titik</button>' +
        '</div>' +
        '<div class="ig-menu-section ig-note-section">' +
          '<div class="ig-menu-title">Catatan koordinat</div>' +
          '<button type="button" class="ig-note-action ig-note-create" data-note-action="create">Buat Note</button>' +
          '<button type="button" class="ig-note-action ig-note-edit" data-note-action="edit">Edit Note</button>' +
          '<button type="button" class="ig-note-action ig-note-delete" data-note-action="delete">Hapus Note</button>' +
        '</div>' +
      '</div>' +
      '<div class="ig-note-editor" role="dialog" aria-label="Editor catatan">' +
        '<div class="ig-note-editor-title">Catatan</div>' +
        '<textarea class="ig-note-editor-text"></textarea>' +
        '<div class="ig-note-editor-actions">' +
          '<button type="button" class="ig-note-save">Simpan</button>' +
          '<button type="button" class="ig-note-cancel">Batal</button>' +
        '</div>' +
      '</div>';

    this.el.appendChild(toolbar);
    this.el.appendChild(scroll);

    this.dom = {
      toolbar: toolbar,
      draw: toolbar.querySelector('.ig-draw'),
      stopDraw: toolbar.querySelector('.ig-stop-draw'),
      undo: toolbar.querySelector('.ig-undo'),
      clear: toolbar.querySelector('.ig-clear'),
      scroll: scroll,
      chart: chart,
      grid: chart.querySelector('.ig-grid'),
      verticalTexts: chart.querySelector('.ig-vertical-texts'),
      yLabels: chart.querySelector('.ig-y-labels'),
      xLabels: chart.querySelector('.ig-x-labels'),
      timeLabel: chart.querySelector('.ig-time-label'),
      timeCells: chart.querySelector('.ig-time-cells'),
      overlay: chart.querySelector('.ig-overlay'),
      notesLayer: chart.querySelector('.ig-notes-layer'),
      interaction: chart.querySelector('.ig-interaction'),
      hoverPlus: chart.querySelector('.ig-hover-plus'),
      menu: chart.querySelector('.ig-menu'),
      menuHeaderTitle: chart.querySelector('.ig-menu-header .ig-menu-title'),
      deleteSection: chart.querySelector('.ig-delete-section'),
      noteSection: chart.querySelector('.ig-note-section'),
      noteCreate: chart.querySelector('.ig-note-create'),
      noteEdit: chart.querySelector('.ig-note-edit'),
      noteDelete: chart.querySelector('.ig-note-delete'),
      noteEditor: chart.querySelector('.ig-note-editor'),
      noteEditorText: chart.querySelector('.ig-note-editor-text'),
      noteSave: chart.querySelector('.ig-note-save'),
      noteCancel: chart.querySelector('.ig-note-cancel'),
      status: toolbar.querySelector('.ig-status')
    };

    if (!o.showDrawControls) {
      this.dom.draw.classList.add('ig-hidden');
      this.dom.stopDraw.classList.add('ig-hidden');
    }
    if (!o.showUndo) this.dom.undo.classList.add('ig-hidden');
    if (!o.showClear) this.dom.clear.classList.add('ig-hidden');

    this._applyToolbarAlign();
    this._applyTableAlign();
    this._updateDrawToolbar();
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
  };

  InteractiveGrid.prototype._layout = function () {
    var o = this.options;
    var yLabelW = 48, axisH = 38, timeH = 54;
    var verticalTextW = this._getVerticalTextsWidth();
    var gridLeft = verticalTextW + yLabelW;

    this._rebuildColumnGeometry();
    this._rebuildRowGeometry();

    // Ruang ekstra di atas mengikuti setengah tinggi baris teratas agar label Y tertinggi tidak terpotong.
    // Ruang di kanan mengikuti setengah lebar kolom terakhir agar label X terakhir tetap terlihat.
    var topRowHeight = this._rowHeights.length
      ? this._rowHeights[this._rowHeights.length - 1]
      : o.rowHeight;
    var topPad = Math.ceil(topRowHeight / 2) + 4;

    var lastColWidth = this._columnWidths.length
      ? this._columnWidths[this._columnWidths.length - 1]
      : o.colWidth;
    var rightPad = Math.ceil(lastColWidth / 2) + 4;
    var gridW = this._gridWidth;
    var gridH = this._gridHeight;
    var chartW = gridLeft + gridW + rightPad;
    var effectiveTimeH = o.showTimeTable ? timeH : 0;
    var chartH = topPad + gridH + axisH + effectiveTimeH;

    this._metrics = {
      labelW: gridLeft,
      yLabelW: yLabelW,
      verticalTextW: verticalTextW,
      gridLeft: gridLeft,
      axisH: axisH, timeH: effectiveTimeH,
      topPad: topPad, rightPad: rightPad, gridW: gridW, gridH: gridH
    };

    // Posisi kiri komponen utama dibuat dinamis agar teks vertikal tidak menimpa label Y.
    this.el.style.setProperty('--ig-y-label-w', yLabelW + 'px');
    this.el.style.setProperty('--ig-vertical-w', verticalTextW + 'px');
    this.el.style.setProperty('--ig-grid-left', gridLeft + 'px');

    this.dom.chart.style.width = chartW + 'px';
    this.dom.chart.style.height = chartH + 'px';
    this.dom.grid.style.top = topPad + 'px';
    this.dom.grid.style.width = gridW + 'px';
    this.dom.grid.style.height = gridH + 'px';
    this.dom.interaction.style.top = topPad + 'px';
    this.dom.interaction.style.width = gridW + 'px';
    this.dom.interaction.style.height = gridH + 'px';
    this.dom.overlay.setAttribute('width', gridW);
    this.dom.overlay.setAttribute('height', gridH);
    this.dom.overlay.style.top = topPad + 'px';
    this.dom.overlay.style.width = gridW + 'px';
    this.dom.overlay.style.height = gridH + 'px';

    this.dom.notesLayer.style.top = topPad + 'px';
    this.dom.notesLayer.style.width = gridW + 'px';
    this.dom.notesLayer.style.height = gridH + 'px';

    this.dom.verticalTexts.style.top = topPad + 'px';
    this.dom.verticalTexts.style.width = verticalTextW + 'px';
    this.dom.verticalTexts.style.height = gridH + 'px';

    this.dom.yLabels.style.top = topPad + 'px';
    this.dom.yLabels.style.height = gridH + 'px';
    this.dom.yLabels.style.transform = 'none';

    this.dom.xLabels.style.top = (topPad + gridH) + 'px';
    this.dom.xLabels.style.width = gridW + 'px';
    this.dom.xLabels.style.height = axisH + 'px';
    this.dom.xLabels.style.transform = 'none';

    this.dom.timeLabel.style.top = (topPad + gridH + axisH) + 'px';
    this.dom.timeLabel.style.height = effectiveTimeH + 'px';
    this.dom.timeCells.style.top = (topPad + gridH + axisH) + 'px';
    this.dom.timeCells.style.width = gridW + 'px';
    this.dom.timeCells.style.height = effectiveTimeH + 'px';

    this.dom.timeLabel.style.display = o.showTimeTable ? 'flex' : 'none';
    this.dom.timeCells.style.display = o.showTimeTable ? 'block' : 'none';

    this._renderColumnGuides();
    this._renderRowGuides();
  };

  InteractiveGrid.prototype._normalizeVerticalText = function (item, fallbackId) {
    var o = this.options;

    if (typeof item === 'string' || typeof item === 'number') {
      item = { text: String(item) };
    }
    item = item || {};

    var id = item.id != null && String(item.id).trim()
      ? String(item.id)
      : fallbackId;

    var width = Number(item.width);
    if (!(width > 0)) width = Number(o.verticalTextWidth);
    if (!(width > 0)) width = 44;

    var fontSize = Number(item.fontSize);
    if (!(fontSize > 0)) fontSize = Number(o.verticalTextFontSize);
    if (!(fontSize > 0)) fontSize = 18;

    return {
      id: id,
      text: item.text == null ? '' : String(item.text),
      color: item.color || o.verticalTextColor || '#111',
      fontSize: fontSize,
      fontWeight: item.fontWeight != null ? String(item.fontWeight) : String(o.verticalTextFontWeight || '600'),
      fontFamily: item.fontFamily || o.verticalTextFontFamily || 'Arial, Helvetica, sans-serif',
      width: width
    };
  };

  InteractiveGrid.prototype._setVerticalTextsInternal = function (data) {
    if (data == null) data = [];
    if (!Array.isArray(data)) data = [data];

    var normalized = [];
    var ids = {};

    for (var i = 0; i < data.length; i++) {
      this._verticalTextSeq += 1;
      var item = this._normalizeVerticalText(data[i], 'vertical-text-' + this._verticalTextSeq);

      if (ids[item.id]) {
        throw new Error('InteractiveGrid: id vertical text harus unik: ' + item.id);
      }

      ids[item.id] = true;
      normalized.push(item);
    }

    this.verticalTexts = normalized;
  };

  InteractiveGrid.prototype._getVerticalTextsWidth = function () {
    var total = 0;
    for (var i = 0; i < this.verticalTexts.length; i++) {
      total += Number(this.verticalTexts[i].width) || 0;
    }
    return total;
  };

  InteractiveGrid.prototype._renderVerticalTexts = function () {
    if (!this.dom || !this.dom.verticalTexts) return;

    var container = this.dom.verticalTexts;
    container.innerHTML = '';

    var left = 0;
    for (var i = 0; i < this.verticalTexts.length; i++) {
      var item = this.verticalTexts[i];

      var lane = document.createElement('div');
      lane.className = 'ig-vertical-text-lane';
      lane.style.left = left + 'px';
      lane.style.width = item.width + 'px';

      var text = document.createElement('div');
      text.className = 'ig-vertical-text';
      text.textContent = item.text;
      text.style.color = item.color;
      text.style.fontSize = item.fontSize + 'px';
      text.style.fontWeight = item.fontWeight;
      text.style.fontFamily = item.fontFamily;
      text.setAttribute('data-vertical-text-id', item.id);

      lane.appendChild(text);
      container.appendChild(lane);
      left += item.width;
    }
  };

  InteractiveGrid.prototype._setXLabelsInternal = function (data) {
    this.xLabels = {};
    if (data == null) return;

    var self = this;
    var joinCount = Number(this.options.colJoinCount);
    if (!(joinCount > 0)) joinCount = 1;
    joinCount = Math.max(1, Math.floor(joinCount));

    // Array mengikuti urutan label yang tampil: 0, joinCount, 2*joinCount, dst.
    if (Array.isArray(data)) {
      data.forEach(function (value, index) {
        if (value === undefined) return;
        var publicX = self.options.xStart + (index * joinCount);
        if (publicX > self.options.xStart + self.options.columns - 1) return;
        self.xLabels[String(publicX)] = value == null ? '' : String(value);
      });
      return;
    }

    // Object menggunakan nilai koordinat X publik sebagai key.
    if (typeof data === 'object') {
      Object.keys(data).forEach(function (key) {
        var publicX = Number(key);
        if (!Number.isFinite(publicX)) return;
        if (publicX < self.options.xStart || publicX > self.options.xStart + self.options.columns - 1) return;
        var value = data[key];
        self.xLabels[String(publicX)] = value == null ? '' : String(value);
      });
    }
  };

  InteractiveGrid.prototype._resolveXLabel = function (publicX) {
    var key = String(publicX);
    if (Object.prototype.hasOwnProperty.call(this.xLabels, key)) {
      return this.xLabels[key];
    }
    return publicX;
  };

  InteractiveGrid.prototype._renderLabels = function () {
    var o = this.options;
    var xHTML = '', yHTML = '';

    var xStep = Number(o.colJoinCount);
    if (!(xStep > 0)) xStep = 1;
    xStep = Math.max(1, Math.floor(xStep));

    var yStep = Number(o.yLabelStep);
    if (!(yStep > 0)) yStep = 1;
    yStep = Math.max(1, Math.floor(yStep));

    // Hanya frekuensi label yang berubah; grid dan koordinat tetap sama.
    // Posisi label X mengikuti posisi kumulatif lebar masing-masing kolom.
    for (var x = 0; x < o.columns; x++) {
      var showXLabel = (x % xStep) === 0;
      var left = this._xPositions && this._xPositions[x] != null
        ? this._xPositions[x]
        : x * o.colWidth;
      var publicX = o.xStart + x;
      var labelValue = showXLabel ? this._resolveXLabel(publicX) : '';
      xHTML += '<div style="left:' + left + 'px">' +
        (showXLabel ? this._escape(labelValue) : '') +
        '</div>';
    }

    // Posisi label Y mengikuti posisi kumulatif tinggi masing-masing baris.
    // Interval tetap dihitung dari yStart.
    for (var y = o.rows - 1; y >= 0; y--) {
      var showYLabel = (y % yStep) === 0;
      var top = this._yPositions && this._yPositions[y] != null
        ? this._yPositions[y]
        : (o.rows - 1 - y) * o.rowHeight;

      yHTML += '<div style="top:' + top + 'px">' +
        (showYLabel ? this._escape(o.yStart + y) : '') +
        '</div>';
    }

    this.dom.xLabels.innerHTML = xHTML;
    this.dom.yLabels.innerHTML = yHTML;
    this.dom.timeLabel.innerHTML = this._escape(o.xAxisTitle) + '<br>' + this._escape(o.xAxisSubtitle);

    // innerHTML pada xLabels menghapus guide merge, jadi gambar ulang.
    this._renderColumnGuides();
  };

  InteractiveGrid.prototype._escape = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  };

  InteractiveGrid.prototype._bind = function (el, event, fn, opts) {
    el.addEventListener(event, fn, opts);
    this._bound.push([el, event, fn, opts]);
  };

  InteractiveGrid.prototype._normalizeDrawing = function (data, fallbackId) {
    data = data || {};
    var id = data.id != null && String(data.id).trim() ? String(data.id) : fallbackId;
    var out = {
      id: id,
      lineColor: data.lineColor || this.options.lineColor,
      lineWidth: Number(data.lineWidth) > 0 ? Number(data.lineWidth) : this.options.lineWidth,
      markColor: data.markColor || this.options.markColor,
      dotColor: data.dotColor != null ? data.dotColor : this.options.dotColor,
      xColor: data.xColor != null ? data.xColor : this.options.xColor,
      dotSize: Number(data.dotSize) > 0 ? Number(data.dotSize) : this.options.dotSize,
      xSize: Number(data.xSize) > 0 ? Number(data.xSize) : this.options.xSize,
      markStrokeWidth: Number(data.markStrokeWidth) > 0 ? Number(data.markStrokeWidth) : this.options.markStrokeWidth,
      showDotOnTop: data.showDotOnTop != null ? !!data.showDotOnTop : !!this.options.showDotOnTop,
      points: []
    };

    var pts = Array.isArray(data.points) ? data.points : [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i] || {};
      var x = Number(p.x), y = Number(p.y);
      if (!this._validCoord(x, y)) continue;
      var types = Array.isArray(p.types) ? p.types.filter(isValidType) : (isValidType(p.type) ? [p.type] : []);
      types = types.filter(function (v, idx, arr) { return arr.indexOf(v) === idx; });
      if (!types.length) continue;
      var np = { x: x, y: y, types: types.slice() };
      var styles = cloneMarkStyles(p.styles);
      if (Object.keys(styles).length) np.styles = styles;
      out.points.push(np);
    }
    return out;
  };

  InteractiveGrid.prototype._setDrawingsInternal = function (data) {
    this.drawings = [];
    if (!Array.isArray(data)) return;
    var used = {};
    for (var i = 0; i < data.length; i++) {
      this._drawingSeq += 1;
      var drawing = this._normalizeDrawing(data[i], 'draw-' + this._drawingSeq);
      if (used[drawing.id]) drawing.id = drawing.id + '-' + this._drawingSeq;
      used[drawing.id] = true;
      this.drawings.push(drawing);
    }
  };

  InteractiveGrid.prototype._findDrawing = function (id) {
    id = String(id);
    for (var i = 0; i < this.drawings.length; i++) {
      if (this.drawings[i].id === id) return this.drawings[i];
    }
    return null;
  };

  InteractiveGrid.prototype._findDrawingPoint = function (drawing, x, y) {
    if (!drawing) return null;
    for (var i = 0; i < drawing.points.length; i++) {
      if (drawing.points[i].x === x && drawing.points[i].y === y) return drawing.points[i];
    }
    return null;
  };

  InteractiveGrid.prototype._activeDrawing = function () {
    return this.activeDrawingId ? this._findDrawing(this.activeDrawingId) : null;
  };

  InteractiveGrid.prototype._applyToolbarAlign = function () {
    if (!this.dom || !this.dom.toolbar) return this;

    var align = String(this.options.toolbarAlign || 'left').toLowerCase();
    if (['left', 'center', 'right'].indexOf(align) < 0) align = 'left';

    this.options.toolbarAlign = align;
    this.dom.toolbar.classList.remove(
      'ig-toolbar-left',
      'ig-toolbar-center',
      'ig-toolbar-right'
    );
    this.dom.toolbar.classList.add('ig-toolbar-' + align);
    return this;
  };

  InteractiveGrid.prototype._applyTableAlign = function () {
    if (!this.dom || !this.dom.scroll || !this.dom.chart) return this;

    var align = String(this.options.tableAlign || 'center').toLowerCase();
    if (['left', 'center', 'right'].indexOf(align) < 0) align = 'center';

    this.options.tableAlign = align;
    this.dom.scroll.classList.remove(
      'ig-table-left',
      'ig-table-center',
      'ig-table-right'
    );
    this.dom.scroll.classList.add('ig-table-' + align);
    return this;
  };

  InteractiveGrid.prototype._canEditMarks = function () {
    return !this.options.clickDrawToDraw || !!this._activeDrawing();
  };

  InteractiveGrid.prototype._updateInteractionMode = function () {
    if (!this.dom || !this.dom.interaction) return;
    var locked = !!this.options.clickDrawToDraw && !this._activeDrawing();
    this.dom.interaction.classList.toggle('ig-draw-locked', locked);
    this.el.classList.toggle('ig-draw-locked', locked);
  };

  InteractiveGrid.prototype._updateDrawToolbar = function () {
    if (!this.dom || !this.dom.draw || !this.dom.stopDraw) return;
    var active = !!this._activeDrawing();
    this.dom.draw.classList.toggle('ig-draw-active', active);
    this.dom.draw.setAttribute('aria-pressed', active ? 'true' : 'false');
    this.dom.draw.textContent = active ? (this.options.drawButtonText || 'Draw') + ' +' : (this.options.drawButtonText || 'Draw');
    this.dom.stopDraw.disabled = !active;
    this._updateInteractionMode();
  };

  InteractiveGrid.prototype._emitDrawingsChange = function (reason, drawing) {
    var detail = {
      reason: reason,
      drawing: drawing ? cloneDrawings([drawing])[0] : null,
      activeDrawingId: this.activeDrawingId,
      drawings: this.getDrawings()
    };
    this.el.dispatchEvent(new CustomEvent('interactivegrid:drawingschange', { detail: detail }));
    if (typeof this.options.onDrawingsChange === 'function') {
      this.options.onDrawingsChange(detail.drawings, reason, detail.drawing, detail.activeDrawingId);
    }
  };

  InteractiveGrid.prototype._noteKey = function (x, y) {
    return String(Number(x)) + ',' + String(Number(y));
  };

  InteractiveGrid.prototype._normalizeNote = function (item) {
    item = item || {};
    var x = Number(item.x), y = Number(item.y);
    if (!this._validCoord(x, y)) return null;
    var text = item.text == null ? '' : String(item.text);
    return { x: x, y: y, text: text };
  };

  InteractiveGrid.prototype._setNotesInternal = function (data) {
    this.notes = {};
    if (data == null) return;

    if (!Array.isArray(data) && typeof data === 'object') {
      var arr = [];
      Object.keys(data).forEach(function (key) {
        var value = data[key];
        if (value && typeof value === 'object' && value.x != null && value.y != null) {
          arr.push(value);
          return;
        }
        var parts = String(key).split(',');
        if (parts.length === 2) {
          arr.push({ x: Number(parts[0]), y: Number(parts[1]), text: value });
        }
      });
      data = arr;
    }

    if (!Array.isArray(data)) return;

    for (var i = 0; i < data.length; i++) {
      var note = this._normalizeNote(data[i]);
      if (!note) continue;
      this.notes[this._noteKey(note.x, note.y)] = note;
    }
  };

  InteractiveGrid.prototype._getNoteInternal = function (x, y) {
    return this.notes[this._noteKey(x, y)] || null;
  };

  InteractiveGrid.prototype._emitNotesChange = function (reason, note) {
    var detail = {
      reason: reason,
      note: note ? { x: note.x, y: note.y, text: note.text } : null,
      data: this.getNotes()
    };
    this.el.dispatchEvent(new CustomEvent('interactivegrid:noteschange', { detail: detail }));
    if (typeof this.options.onNotesChange === 'function') {
      this.options.onNotesChange(detail.data, reason, detail.note);
    }
  };

  InteractiveGrid.prototype._renderNotes = function () {
    if (!this.dom || !this.dom.notesLayer) return;

    var layer = this.dom.notesLayer;
    layer.innerHTML = '';

    if (!this.options.showNotes) return;

    var gridW = this._metrics ? this._metrics.gridW : this._gridWidth || 0;
    var gridH = this._metrics ? this._metrics.gridH : this._gridHeight || 0;

    // SVG khusus pointer/garis/titik anchor note.
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ig-note-connectors');
    svg.setAttribute('width', gridW);
    svg.setAttribute('height', gridH);
    svg.setAttribute('viewBox', '0 0 ' + gridW + ' ' + gridH);
    layer.appendChild(svg);

    var keys = Object.keys(this.notes);
    for (var i = 0; i < keys.length; i++) {
      var note = this.notes[keys[i]];
      if (!note || !note.text) continue;

      var internal = this._internalXY(note.x, note.y);
      var p = this._coords(internal.x, internal.y);

      var noteWidth = Number(this.options.noteWidth) > 0 ? Number(this.options.noteWidth) : 220;
      var noteMinHeight = Number(this.options.noteMinHeight) > 0 ? Number(this.options.noteMinHeight) : 86;
      var pointerSize = Number(this.options.notePointerSize) > 0 ? Number(this.options.notePointerSize) : 14;
      var pointerColor = this.options.notePointerColor || '#111111';

      // Pilih sisi note. Auto mencoba kanan, lalu kiri jika ruang kanan tidak cukup.
      var requestedPosition = String(this.options.notePosition || 'auto').toLowerCase();
      var side = requestedPosition === 'left' ? 'left' : 'right';

      if (requestedPosition === 'auto') {
        var roomRight = gridW - p.px;
        var roomLeft = p.px;
        side = roomRight >= noteWidth + pointerSize + 16 || roomRight >= roomLeft ? 'right' : 'left';
      }

      var gap = Math.max(10, Math.ceil(pointerSize * 0.75));
      var cardLeft = side === 'right'
        ? p.px + gap
        : p.px - noteWidth - gap;

      // Jaga card tetap sedekat mungkin dengan area grid.
      if (cardLeft < 0) cardLeft = 0;
      if (cardLeft + noteWidth > gridW) cardLeft = Math.max(0, gridW - noteWidth);

      var cardTop = p.py - 10;
      if (cardTop < 0) cardTop = 0;
      if (cardTop + noteMinHeight > gridH) cardTop = Math.max(0, gridH - noteMinHeight);

      var card = document.createElement('div');
      card.className = 'ig-note-card ig-note-card-' + side;
      card.setAttribute('data-note-x', note.x);
      card.setAttribute('data-note-y', note.y);
      card.style.left = cardLeft + 'px';
      card.style.top = cardTop + 'px';
      card.style.width = noteWidth + 'px';
      card.style.minHeight = noteMinHeight + 'px';
      card.textContent = note.text;
      layer.appendChild(card);

      var pointerEnabled = this.options.notePointer !== false;
      var pointerType = String(this.options.notePointerType || 'triangle').toLowerCase();
      if (['triangle', 'line', 'dot', 'none'].indexOf(pointerType) < 0) pointerType = 'triangle';

      // Titik anchor dapat berdiri sendiri atau dipakai bersama triangle/line.
      var showAnchor = !!this.options.showNoteAnchorDot || pointerType === 'dot';
      if (showAnchor) {
        var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', p.px);
        dot.setAttribute('cy', p.py);
        dot.setAttribute('r', Number(this.options.noteAnchorDotSize) > 0 ? Number(this.options.noteAnchorDotSize) : 4);
        dot.setAttribute('fill', this.options.noteAnchorDotColor || pointerColor);
        dot.setAttribute('class', 'ig-note-anchor-dot');
        svg.appendChild(dot);
      }

      if (!pointerEnabled || pointerType === 'none' || pointerType === 'dot') continue;

      // Titik sambungan berada di sisi card yang menghadap koordinat.
      var edgeX = side === 'right' ? cardLeft : cardLeft + noteWidth;
      var edgeY = Math.max(cardTop + 10, Math.min(p.py, cardTop + noteMinHeight - 10));

      if (pointerType === 'line') {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p.px);
        line.setAttribute('y1', p.py);
        line.setAttribute('x2', edgeX);
        line.setAttribute('y2', edgeY);
        line.setAttribute('stroke', pointerColor);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('class', 'ig-note-pointer-line');
        svg.appendChild(line);
      } else if (pointerType === 'triangle') {
        var half = pointerSize / 2;
        var baseX = edgeX;
        var tipX = side === 'right'
          ? Math.max(p.px + 1, edgeX - pointerSize)
          : Math.min(p.px - 1, edgeX + pointerSize);

        var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute(
          'points',
          tipX + ',' + p.py + ' ' +
          baseX + ',' + (edgeY - half) + ' ' +
          baseX + ',' + (edgeY + half)
        );
        polygon.setAttribute('fill', '#ffffff');
        polygon.setAttribute('stroke', pointerColor);
        polygon.setAttribute('stroke-width', '2');
        polygon.setAttribute('class', 'ig-note-pointer-triangle');
        svg.appendChild(polygon);
      }
    }
  };

  InteractiveGrid.prototype._openNoteEditor = function (cell) {
    if (!this.options.showNotes) return this;

    this._editingNoteCell = { x: cell.x, y: cell.y };
    var existing = this._getNoteInternal(cell.x, cell.y);
    this.dom.noteEditorText.value = existing ? existing.text : '';
    this.dom.noteEditorText.placeholder = this.options.notePlaceholder || 'Tulis catatan...';
    this.dom.noteEditor.classList.add('ig-show');

    var internal = this._internalXY(cell.x, cell.y);
    var p = this._coords(internal.x, internal.y);
    var m = this._metrics || { labelW: 48, topPad: 0 };

    var x = m.labelW + p.px + 12;
    var y = m.topPad + p.py - 12;
    var ew = Number(this.options.noteWidth) > 0 ? Number(this.options.noteWidth) : 220;
    var eh = Math.max(130, Number(this.options.noteMinHeight) + 54 || 140);
    x = Math.max(4, Math.min(x, this.dom.chart.clientWidth - ew - 8));
    y = Math.max(4, Math.min(y, this.dom.chart.clientHeight - eh - 8));

    this.dom.noteEditor.style.left = x + 'px';
    this.dom.noteEditor.style.top = y + 'px';
    this.dom.noteEditor.style.width = ew + 'px';

    var self = this;
    setTimeout(function () {
      self.dom.noteEditorText.focus();
      self.dom.noteEditorText.setSelectionRange(
        self.dom.noteEditorText.value.length,
        self.dom.noteEditorText.value.length
      );
    }, 0);

    return this;
  };

  InteractiveGrid.prototype._closeNoteEditor = function () {
    if (this.dom && this.dom.noteEditor) this.dom.noteEditor.classList.remove('ig-show');
    this._editingNoteCell = null;
    return this;
  };

  InteractiveGrid.prototype._bindEvents = function () {
    var self = this;
    var d = this.dom;

    this._bind(d.interaction, 'mousemove', function (e) {
      // Hover koordinat tetap ditampilkan walaupun clickDrawToDraw=true.
      // Yang dikunci hanya aksi tambah/hapus marker, bukan indikator persimpangan grid.
      self._setHover(self._nearest(e));
    });
    this._bind(d.interaction, 'mouseleave', function () { self._setHover(null); });
    this._bind(d.interaction, 'click', function (e) {
      var cell = self._nearest(e);

      // Dalam mode clickDrawToDraw, marker hanya dapat dibuat setelah Draw aktif.
      // Namun popup tetap boleh muncul jika showNotes=true agar fitur note tetap independen.
      if (self.options.clickDrawToDraw && !self._activeDrawing()) {
        self._setHover(cell);
        if (self.options.showNotes) self._showMenu(cell);
        return;
      }

      self._setHover(cell);
      self._showMenu(cell);
    });

    this._bind(d.interaction, 'touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      var cell = self._nearest(e.touches[0]);

      if (self.options.clickDrawToDraw && !self._activeDrawing()) {
        if (self.options.showNotes) self._showMenu(cell);
        e.preventDefault();
        return;
      }

      self._showMenu(cell);
      e.preventDefault();
    }, { passive: false });

    this._bind(d.menu, 'click', function (e) {
      var close = e.target.closest('.ig-menu-close');
      if (close) {
        self._hideMenu();
        return;
      }

      var noteAction = e.target.closest('[data-note-action]');
      if (noteAction && self.pendingCell && self.options.showNotes) {
        var action = noteAction.getAttribute('data-note-action');
        var cellForNote = { x: self.pendingCell.x, y: self.pendingCell.y };

        if (action === 'create' || action === 'edit') {
          self._hideMenu();
          self._openNoteEditor(cellForNote);
          return;
        }

        if (action === 'delete') {
          self.removeNote(cellForNote.x, cellForNote.y);
          self._hideMenu();
          return;
        }
      }

      var add = e.target.closest('[data-type]');
      if (add && self.pendingCell) {
        if (!self._canEditMarks()) {
          self._hideMenu();
          return;
        }
        if (self._activeDrawing()) {
          self.addDrawingPoint(self.pendingCell.x, self.pendingCell.y, add.getAttribute('data-type'));
        } else {
          self.addPoint(self.pendingCell.x, self.pendingCell.y, add.getAttribute('data-type'));
        }
        self._hideMenu();
        return;
      }
      var del = e.target.closest('[data-delete-type]');
      if (del && self.pendingCell) {
        if (!self._canEditMarks()) {
          self._hideMenu();
          return;
        }
        var type = del.getAttribute('data-delete-type');
        if (self._activeDrawing()) {
          self.removeDrawingPoint(self.activeDrawingId, self.pendingCell.x, self.pendingCell.y, type === 'all' ? undefined : type);
        } else {
          self.removePoint(self.pendingCell.x, self.pendingCell.y, type === 'all' ? undefined : type);
        }
        self._hideMenu();
      }
    });

    this._bind(d.noteSave, 'click', function () {
      if (!self._editingNoteCell) return;
      var cell = self._editingNoteCell;
      var text = String(d.noteEditorText.value || '').trim();

      if (!text) {
        self.removeNote(cell.x, cell.y);
      } else {
        self.setNote(cell.x, cell.y, text);
      }
      self._closeNoteEditor();
    });

    this._bind(d.noteCancel, 'click', function () {
      self._closeNoteEditor();
    });

    this._bind(d.noteEditorText, 'keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        self._closeNoteEditor();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        d.noteSave.click();
      }
    });

    this._bind(d.draw, 'click', function () {
      self.startDrawing();
    });
    this._bind(d.stopDraw, 'click', function () {
      self.stopDrawing();
    });
    this._bind(d.undo, 'click', function () { self.undo(); });
    this._bind(d.clear, 'click', function () { self.clear(); });

    // Input data pada tabel waktu.
    this._bind(d.timeCells, 'input', function (e) {
      var input = e.target.closest('.ig-time-input');
      if (!input) return;

      if (!self.options.showTimePicker) {
        // Mode manual: ':' otomatis muncul setelah dua digit jam.
        var formatted = self._formatManualTimeTyping(input.value, e.inputType);
        if (formatted !== input.value) {
          input.value = formatted;
          try {
            input.setSelectionRange(formatted.length, formatted.length);
          } catch (ignore) {}
        }
      }
    });

    this._bind(d.timeCells, 'change', function (e) {
      var input = e.target.closest('.ig-time-input');
      if (!input) return;

      var startColumn = Number(input.getAttribute('data-start-column'));
      var normalized = self._normalizeTimeValue(input.value, true);
      if (normalized == null) {
        input.classList.add('ig-time-invalid');
        return;
      }

      input.classList.remove('ig-time-invalid');
      input.value = normalized;
      self.timeData[startColumn] = normalized;

      var groups = self.getTimeTableGroups();
      var group = null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].startColumn === startColumn) { group = groups[i]; break; }
      }
      self._emitTimeChange(group, normalized);
    });

    this._bind(d.timeCells, 'blur', function (e) {
      var input = e.target.closest('.ig-time-input');
      if (!input) return;

      var startColumn = Number(input.getAttribute('data-start-column'));
      var normalized = self._normalizeTimeValue(input.value, true);

      if (normalized == null) {
        input.classList.add('ig-time-invalid');
        return;
      }

      input.classList.remove('ig-time-invalid');
      input.value = normalized;
      var previous = self.timeData[startColumn] || '';
      self.timeData[startColumn] = normalized;

      if (previous !== normalized) {
        var groups = self.getTimeTableGroups();
        var group = null;
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].startColumn === startColumn) { group = groups[i]; break; }
        }
        self._emitTimeChange(group, normalized);
      }
    }, true);

    this._bind(document, 'mousedown', function (e) {
      if (!self.el.contains(e.target)) self._hideMenu();
    });
    this._bind(window, 'resize', function () { self.render(); });
  };

  InteractiveGrid.prototype._internalXY = function (x, y) {
    return { x: x - this.options.xStart, y: y - this.options.yStart };
  };

  InteractiveGrid.prototype._publicXY = function (x, y) {
    return { x: x + this.options.xStart, y: y + this.options.yStart };
  };

  InteractiveGrid.prototype._validCoord = function (x, y) {
    var i = this._internalXY(x, y);
    return Number.isInteger(x) && Number.isInteger(y) && i.x >= 0 && i.x < this.options.columns && i.y >= 0 && i.y < this.options.rows;
  };

  InteractiveGrid.prototype._coords = function (internalX, internalY) {
    var px = this._xPositions && this._xPositions[internalX] != null
      ? this._xPositions[internalX]
      : internalX * this.options.colWidth;

    var py = this._yPositions && this._yPositions[internalY] != null
      ? this._yPositions[internalY]
      : (this.options.rows - 1 - internalY) * this.options.rowWidth;

    return {
      px: px,
      py: py
    };
  };

  InteractiveGrid.prototype._nearest = function (evt) {
    var r = this.dom.interaction.getBoundingClientRect();
    var lx = Math.max(0, Math.min(r.width, evt.clientX - r.left));
    var ly = Math.max(0, Math.min(r.height, evt.clientY - r.top));

    var ix = 0;
    var bestDistance = Infinity;
    var positions = this._xPositions || [0];
    for (var xi = 0; xi < positions.length; xi++) {
      var distance = Math.abs(lx - positions[xi]);
      if (distance < bestDistance) {
        bestDistance = distance;
        ix = xi;
      }
    }
    ix = Math.max(0, Math.min(this.options.columns - 1, ix));

    var iy = 0;
    var bestYDistance = Infinity;
    var yPositions = this._yPositions || [0];
    for (var yi = 0; yi < yPositions.length; yi++) {
      var yDistance = Math.abs(ly - yPositions[yi]);
      if (yDistance < bestYDistance) {
        bestYDistance = yDistance;
        iy = yi;
      }
    }
    iy = Math.max(0, Math.min(this.options.rows - 1, iy));

    return this._publicXY(ix, iy);
  };

  InteractiveGrid.prototype._setHover = function (cell) {
    if (!cell) { this.dom.hoverPlus.style.opacity = '0'; return; }
    var i = this._internalXY(cell.x, cell.y);
    var p = this._coords(i.x, i.y);
    var m = this._metrics || { labelW: 48, topPad: 0 };
    this.dom.hoverPlus.style.left = (m.labelW + p.px) + 'px';
    this.dom.hoverPlus.style.top = (m.topPad + p.py) + 'px';
    this.dom.hoverPlus.style.opacity = '1';
  };

  InteractiveGrid.prototype._showMenu = function (cell) {
    this.pendingCell = { x: cell.x, y: cell.y };
    var activeDrawing = this._activeDrawing();
    var point = activeDrawing
      ? this._findDrawingPoint(activeDrawing, cell.x, cell.y)
      : this._find(cell.x, cell.y);
    var hasDot = !!(point && point.types.indexOf('dot') >= 0);
    var hasX = !!(point && point.types.indexOf('x') >= 0);

    this.dom.menu.querySelector('[data-type="dot"]').disabled = hasDot;
    this.dom.menu.querySelector('[data-type="x"]').disabled = hasX;
    this.dom.deleteSection.style.display = point ? 'flex' : 'none';
    this.dom.menu.querySelector('[data-delete-type="dot"]').disabled = !hasDot;
    this.dom.menu.querySelector('[data-delete-type="x"]').disabled = !hasX;

    var markerEditingAllowed = this._canEditMarks();
    var addSection = this.dom.menu.querySelector('.ig-add-section') || this.dom.menu.querySelector('.ig-menu-section');
    if (addSection) addSection.style.display = markerEditingAllowed ? '' : 'none';
    this.dom.deleteSection.style.display = markerEditingAllowed && point ? '' : 'none';

    // Ketika clickDrawToDraw=true dan belum ada drawing aktif, popup hanya untuk note.
    // Sembunyikan judul "Tambah tanda" tetapi pertahankan tombol Close.
    if (this.dom.menuHeaderTitle) {
      this.dom.menuHeaderTitle.style.display = markerEditingAllowed ? '' : 'none';
    }

    var note = this._getNoteInternal(cell.x, cell.y);
    this.dom.noteSection.style.display = this.options.showNotes ? 'flex' : 'none';
    this.dom.noteCreate.style.display = this.options.showNotes && !note ? 'inline-flex' : 'none';
    this.dom.noteEdit.style.display = this.options.showNotes && note ? 'inline-flex' : 'none';
    this.dom.noteDelete.style.display = this.options.showNotes && note ? 'inline-flex' : 'none';

    this.dom.menu.classList.add('ig-show');

    var self = this;
    requestAnimationFrame(function () {
      var i = self._internalXY(cell.x, cell.y);
      var p = self._coords(i.x, i.y);
      var m = self._metrics || { labelW: 48, topPad: 0 };
      var x = m.labelW + p.px + 16;
      var y = m.topPad + p.py - 58;
      var mw = self.dom.menu.offsetWidth || 200;
      var mh = self.dom.menu.offsetHeight || 130;
      x = Math.max(4, Math.min(x, self.dom.chart.clientWidth - mw - 4));
      y = Math.max(4, Math.min(y, self.dom.chart.clientHeight - mh - 4));
      self.dom.menu.style.left = x + 'px';
      self.dom.menu.style.top = y + 'px';
    });

    if (typeof this.options.onSelect === 'function') this.options.onSelect({ x: cell.x, y: cell.y, point: point ? clonePoints([point])[0] : null });
  };

  InteractiveGrid.prototype._hideMenu = function () {
    this.dom.menu.classList.remove('ig-show');
    this.pendingCell = null;
  };

  InteractiveGrid.prototype._find = function (x, y) {
    for (var i = 0; i < this.points.length; i++) {
      if (this.points[i].x === x && this.points[i].y === y) return this.points[i];
    }
    return null;
  };

  InteractiveGrid.prototype._pushHistory = function () {
    this.history.push({
      points: clonePoints(this.points),
      drawings: cloneDrawings(this.drawings),
      activeDrawingId: this.activeDrawingId
    });
    if (this.history.length > 100) this.history.shift();
  };

  InteractiveGrid.prototype._emitChange = function (reason) {
    var detail = { reason: reason, data: this.getData() };
    this.el.dispatchEvent(new CustomEvent('interactivegrid:change', { detail: detail }));
    if (typeof this.options.onChange === 'function') this.options.onChange(detail.data, reason);
  };

  InteractiveGrid.prototype._svg = function (name, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    this.dom.overlay.appendChild(el);
    return el;
  };

  InteractiveGrid.prototype._drawMark = function (p, type, color, options) {
    options = options || {};
    if (type === 'dot') {
      this._svg('circle', {
        cx: p.px,
        cy: p.py,
        r: options.markSize != null ? options.markSize : this.options.dotSize,
        fill: color
      });
      return;
    }
    if (type === 'x') {
      var s = options.xMarkSize != null ? options.xMarkSize : this.options.xSize;
      var sw = options.markStrokeWidth != null ? options.markStrokeWidth : this.options.markStrokeWidth;
      this._svg('line', { x1:p.px-s, y1:p.py-s, x2:p.px+s, y2:p.py+s, stroke:color, 'stroke-width':sw, 'stroke-linecap':'round' });
      this._svg('line', { x1:p.px+s, y1:p.py-s, x2:p.px-s, y2:p.py+s, stroke:color, 'stroke-width':sw, 'stroke-linecap':'round' });
    }
  };

  InteractiveGrid.prototype._renderPermanent = function () {
    for (var i = 0; i < this.permanentData.length; i++) {
      var item = this.permanentData[i];
      var ia = this._internalXY(item.from.x, item.from.y);
      var ib = this._internalXY(item.to.x, item.to.y);
      var p1 = this._coords(ia.x, ia.y);
      var p2 = this._coords(ib.x, ib.y);

      this._svg('line', {
        x1: p1.px,
        y1: p1.py,
        x2: p2.px,
        y2: p2.py,
        stroke: item.lineColor,
        'stroke-width': item.lineWidth,
        'stroke-linecap': 'round',
        'data-permanent-id': item.id
      });

      var fromColor = item.from.color || item.markColor;
      var toColor = item.to.color || item.markColor;
      var fromSize = Number(item.from.size) > 0 ? Number(item.from.size) : (item.from.type === 'x' ? item.xSize : item.dotSize);
      var toSize = Number(item.to.size) > 0 ? Number(item.to.size) : (item.to.type === 'x' ? item.xSize : item.dotSize);
      var fromStroke = Number(item.from.strokeWidth) > 0 ? Number(item.from.strokeWidth) : item.markStrokeWidth;
      var toStroke = Number(item.to.strokeWidth) > 0 ? Number(item.to.strokeWidth) : item.markStrokeWidth;

      this._drawMark(p1, item.from.type, fromColor, {
        markSize: fromSize,
        xMarkSize: fromSize,
        markStrokeWidth: fromStroke
      });
      this._drawMark(p2, item.to.type, toColor, {
        markSize: toSize,
        xMarkSize: toSize,
        markStrokeWidth: toStroke
      });

      if (item.text) {
        var ax = p1.px, ay = p1.py, bx = p2.px, by = p2.py;
        // Orientasikan perhitungan dari kiri ke kanan supaya "atas" konsisten.
        if (bx < ax) { var tx=ax; ax=bx; bx=tx; var ty=ay; ay=by; by=ty; }
        var dx = bx - ax, dy = by - ay;
        var len = Math.sqrt(dx*dx + dy*dy) || 1;
        var mx = (ax + bx) / 2;
        var my = (ay + by) / 2;
        var nx = dy / len;
        var ny = -dx / len;
        var textX = mx + nx * item.textOffset;
        var textY = my + ny * item.textOffset;
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle > 90 || angle < -90) angle += 180;
        var textEl = this._svg('text', {
          x: textX,
          y: textY,
          fill: item.textColor,
          'font-size': item.textSize,
          'font-family': item.textFontFamily,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          transform: 'rotate(' + angle + ' ' + textX + ' ' + textY + ')',
          'data-permanent-id': item.id
        });
        textEl.textContent = item.text;
      }
    }
  };

  InteractiveGrid.prototype._normalizePointMarkStyle = function (type, style) {
    style = style || {};
    var sizeCandidate = style.size;
    if (!(Number(sizeCandidate) > 0)) {
      sizeCandidate = type === 'dot' ? style.dotSize : style.xSize;
    }
    // Alias kompatibilitas bila style dikirim memakai nama opsi lama.
    if (!(Number(sizeCandidate) > 0)) {
      sizeCandidate = type === 'dot' ? style.markSize : style.xMarkSize;
    }
    var out = {};
    var color = style.color != null ? style.color : style.markColor;
    if (color != null && String(color).trim()) out.color = String(color);
    if (Number(sizeCandidate) > 0) out.size = Number(sizeCandidate);
    if (type === 'x' && Number(style.strokeWidth != null ? style.strokeWidth : style.markStrokeWidth) > 0) {
      out.strokeWidth = Number(style.strokeWidth != null ? style.strokeWidth : style.markStrokeWidth);
    }
    return out;
  };

  InteractiveGrid.prototype._resolvePointMarkStyle = function (point, type) {
    var style = point && point.styles && point.styles[type] ? point.styles[type] : {};
    var typeColor = type === 'dot' ? this.options.dotColor : this.options.xColor;
    var fallbackColor = (typeColor != null && String(typeColor).trim()) ? typeColor : this.options.markColor;
    return {
      color: (style.color != null && String(style.color).trim()) ? style.color : fallbackColor,
      size: Number(style.size) > 0 ? Number(style.size) : (type === 'dot' ? this.options.dotSize : this.options.xSize),
      strokeWidth: Number(style.strokeWidth) > 0 ? Number(style.strokeWidth) : this.options.markStrokeWidth
    };
  };

  InteractiveGrid.prototype._resolveDrawingPointMarkStyle = function (drawing, point, type) {
    var style = point && point.styles && point.styles[type] ? point.styles[type] : {};
    var typeColor = type === 'dot' ? drawing.dotColor : drawing.xColor;
    var fallbackColor = (typeColor != null && String(typeColor).trim()) ? typeColor : drawing.markColor;
    return {
      color: (style.color != null && String(style.color).trim()) ? style.color : fallbackColor,
      size: Number(style.size) > 0 ? Number(style.size) : (type === 'dot' ? drawing.dotSize : drawing.xSize),
      strokeWidth: Number(style.strokeWidth) > 0 ? Number(style.strokeWidth) : drawing.markStrokeWidth
    };
  };

  InteractiveGrid.prototype._renderDrawings = function () {
    for (var d = 0; d < this.drawings.length; d++) {
      var drawing = this.drawings[d];

      for (var i = 1; i < drawing.points.length; i++) {
        var a = this._internalXY(drawing.points[i - 1].x, drawing.points[i - 1].y);
        var b = this._internalXY(drawing.points[i].x, drawing.points[i].y);
        var p1 = this._coords(a.x, a.y), p2 = this._coords(b.x, b.y);
        this._svg('line', {
          x1: p1.px, y1: p1.py, x2: p2.px, y2: p2.py,
          stroke: drawing.lineColor,
          'stroke-width': drawing.lineWidth,
          'stroke-linecap': 'round',
          'data-drawing-id': drawing.id
        });
      }

      for (var j = 0; j < drawing.points.length; j++) {
        var pt = drawing.points[j];
        var ii = this._internalXY(pt.x, pt.y);
        var p = this._coords(ii.x, ii.y);
        var hasDot = pt.types.indexOf('dot') >= 0;
        var hasX = pt.types.indexOf('x') >= 0;
        var order = drawing.showDotOnTop ? ['x', 'dot'] : ['dot', 'x'];

        for (var oi = 0; oi < order.length; oi++) {
          var type = order[oi];
          if ((type === 'dot' && !hasDot) || (type === 'x' && !hasX)) continue;
          var st = this._resolveDrawingPointMarkStyle(drawing, pt, type);
          this._drawMark(p, type, st.color, {
            markSize: st.size,
            xMarkSize: st.size,
            markStrokeWidth: st.strokeWidth
          });
        }
      }
    }
  };

  InteractiveGrid.prototype.render = function () {
    if (this.destroyed) return this;
    var ov = this.dom.overlay;
    while (ov.firstChild) ov.removeChild(ov.firstChild);

    this._renderPermanent();
    this._renderDrawings();

    for (var i = 1; i < this.points.length; i++) {
      var a = this._internalXY(this.points[i - 1].x, this.points[i - 1].y);
      var b = this._internalXY(this.points[i].x, this.points[i].y);
      var p1 = this._coords(a.x, a.y), p2 = this._coords(b.x, b.y);
      this._svg('line', { x1:p1.px, y1:p1.py, x2:p2.px, y2:p2.py, stroke:this.options.lineColor, 'stroke-width':this.options.lineWidth, 'stroke-linecap':'round' });
    }

    for (var j = 0; j < this.points.length; j++) {
      var pt = this.points[j];
      var ii = this._internalXY(pt.x, pt.y);
      var p = this._coords(ii.x, ii.y);
      var hasDot = pt.types.indexOf('dot') >= 0;
      var hasX = pt.types.indexOf('x') >= 0;

      // SVG mengikuti urutan render: elemen yang digambar terakhir akan berada di atas.
      // Default mempertahankan perilaku lama (X di atas dot). Jika showDotOnTop=true,
      // X digambar lebih dulu lalu dot sehingga titik bulat tetap terlihat jelas.
      if (this.options.showDotOnTop) {
        if (hasX) {
          var xStyleTopMode = this._resolvePointMarkStyle(pt, 'x');
          this._drawMark(p, 'x', xStyleTopMode.color, { xMarkSize: xStyleTopMode.size, markStrokeWidth: xStyleTopMode.strokeWidth });
        }
        if (hasDot) {
          var dotStyleTopMode = this._resolvePointMarkStyle(pt, 'dot');
          this._drawMark(p, 'dot', dotStyleTopMode.color, { markSize: dotStyleTopMode.size });
        }
      } else {
        if (hasDot) {
          var dotStyle = this._resolvePointMarkStyle(pt, 'dot');
          this._drawMark(p, 'dot', dotStyle.color, { markSize: dotStyle.size });
        }
        if (hasX) {
          var xStyle = this._resolvePointMarkStyle(pt, 'x');
          this._drawMark(p, 'x', xStyle.color, { xMarkSize: xStyle.size, markStrokeWidth: xStyle.strokeWidth });
        }
      }
    }

    this._renderNotes();

    var total = this.points.reduce(function (n, p) { return n + p.types.length; }, 0);
    var coordCount = this.points.length;
    for (var di = 0; di < this.drawings.length; di++) {
      coordCount += this.drawings[di].points.length;
      total += this.drawings[di].points.reduce(function (n, p) { return n + p.types.length; }, 0);
    }
    this.dom.status.textContent = coordCount ? (total + ' tanda pada ' + coordCount + ' koordinat, ' + this.drawings.length + ' drawing.') : 'Belum ada tanda.';
    this._updateDrawToolbar();
    return this;
  };

  InteractiveGrid.prototype.addPoint = function (x, y, type, style) {
    x = Number(x); y = Number(y);
    if (!this._validCoord(x, y)) throw new Error('InteractiveGrid.addPoint: koordinat di luar area grid.');
    if (!isValidType(type)) throw new Error('InteractiveGrid.addPoint: type harus "dot" atau "x".');
    var point = this._find(x, y);
    var exists = point && point.types.indexOf(type) >= 0;
    var normalizedStyle = this._normalizePointMarkStyle(type, style);
    var hasStyle = Object.keys(normalizedStyle).length > 0;
    if (exists && !hasStyle) return this;

    this._pushHistory();
    if (!point) { point = { x:x, y:y, types:[], styles:{} }; this.points.push(point); }
    if (!point.styles) point.styles = {};
    if (!exists) point.types.push(type);
    if (hasStyle) point.styles[type] = normalizedStyle;
    this.render();
    this._emitChange(exists ? 'style' : 'add');
    return this;
  };

  InteractiveGrid.prototype.updatePointMark = function (x, y, type, style) {
    x = Number(x); y = Number(y);
    if (!isValidType(type)) throw new Error('InteractiveGrid.updatePointMark: type harus "dot" atau "x".');
    var point = this._find(x, y);
    if (!point || point.types.indexOf(type) < 0) return this;
    var normalizedStyle = this._normalizePointMarkStyle(type, style);
    this._pushHistory();
    if (!point.styles) point.styles = {};
    point.styles[type] = normalizedStyle;
    this.render();
    this._emitChange('style');
    return this;
  };

  // Alias yang lebih umum untuk API update style.
  InteractiveGrid.prototype.setPointStyle = InteractiveGrid.prototype.updatePointMark;

  InteractiveGrid.prototype.resetPointMarkStyle = function (x, y, type) {
    x = Number(x); y = Number(y);
    if (!isValidType(type)) throw new Error('InteractiveGrid.resetPointMarkStyle: type harus "dot" atau "x".');
    var point = this._find(x, y);
    if (!point || point.types.indexOf(type) < 0 || !point.styles || !point.styles[type]) return this;
    this._pushHistory();
    delete point.styles[type];
    if (!Object.keys(point.styles).length) delete point.styles;
    this.render();
    this._emitChange('style');
    return this;
  };

  InteractiveGrid.prototype.removePoint = function (x, y, type) {
    x = Number(x); y = Number(y);
    var idx = -1;
    for (var i = 0; i < this.points.length; i++) if (this.points[i].x === x && this.points[i].y === y) { idx = i; break; }
    if (idx < 0) return this;
    if (type !== undefined && !isValidType(type)) throw new Error('InteractiveGrid.removePoint: type harus "dot", "x", atau dikosongkan.');
    if (type && this.points[idx].types.indexOf(type) < 0) return this;
    this._pushHistory();
    if (!type) this.points.splice(idx, 1);
    else {
      this.points[idx].types = this.points[idx].types.filter(function (t) { return t !== type; });
      if (this.points[idx].styles) {
        delete this.points[idx].styles[type];
        if (!Object.keys(this.points[idx].styles).length) delete this.points[idx].styles;
      }
      if (!this.points[idx].types.length) this.points.splice(idx, 1);
    }
    this.render(); // otomatis menyambung koordinat sebelum & sesudah yang dihapus
    this._emitChange('remove');
    return this;
  };

  InteractiveGrid.prototype._normalizePermanentItem = function (item, fallbackId) {
    item = item || {};
    var from = item.from || {};
    var to = item.to || {};
    var fx = Number(from.x), fy = Number(from.y), tx = Number(to.x), ty = Number(to.y);
    if (!this._validCoord(fx, fy) || !this._validCoord(tx, ty)) {
      throw new Error('InteractiveGrid: koordinat permanent line di luar area grid.');
    }
    var fromType = isValidType(from.type) ? from.type : 'dot';
    var toType = isValidType(to.type) ? to.type : 'dot';
    var id = item.id != null && String(item.id).trim() ? String(item.id) : fallbackId;
    return {
      id: id,
      from: {
        x: fx, y: fy, type: fromType,
        color: from.color || null,
        size: Number(from.size) > 0 ? Number(from.size) : null,
        strokeWidth: Number(from.strokeWidth) > 0 ? Number(from.strokeWidth) : null
      },
      to: {
        x: tx, y: ty, type: toType,
        color: to.color || null,
        size: Number(to.size) > 0 ? Number(to.size) : null,
        strokeWidth: Number(to.strokeWidth) > 0 ? Number(to.strokeWidth) : null
      },
      lineColor: item.lineColor || this.options.lineColor,
      lineWidth: Number(item.lineWidth) > 0 ? Number(item.lineWidth) : this.options.permanentLineWidth,
      markColor: item.markColor || this.options.permanentMarkColor || this.options.markColor,
      dotSize: Number(item.dotSize) > 0 ? Number(item.dotSize) : this.options.permanentDotSize,
      xSize: Number(item.xSize) > 0 ? Number(item.xSize) : this.options.permanentXSize,
      markStrokeWidth: Number(item.markStrokeWidth) > 0 ? Number(item.markStrokeWidth) : this.options.permanentMarkStrokeWidth,
      text: item.text == null ? '' : String(item.text),
      textColor: item.textColor || this.options.markColor,
      textSize: Number(item.textSize) > 0 ? Number(item.textSize) : 28,
      textOffset: Number.isFinite(Number(item.textOffset)) ? Number(item.textOffset) : this.options.permanentTextOffset,
      textFontFamily: item.textFontFamily || this.options.permanentTextFontFamily
    };
  };

  InteractiveGrid.prototype.addPermanentLine = function (config) {
    this._permanentSeq += 1;
    var item = this._normalizePermanentItem(config, 'permanent-' + this._permanentSeq);
    for (var i = 0; i < this.permanentData.length; i++) {
      if (this.permanentData[i].id === item.id) {
        throw new Error('InteractiveGrid.addPermanentLine: id "' + item.id + '" sudah digunakan.');
      }
    }
    this.permanentData.push(item);
    this.render();
    return item.id;
  };

  InteractiveGrid.prototype.setPermanentData = function (data) {
    if (!Array.isArray(data)) throw new Error('InteractiveGrid.setPermanentData: data harus berupa array.');
    var normalized = [];
    var ids = {};
    for (var i = 0; i < data.length; i++) {
      this._permanentSeq += 1;
      var item = this._normalizePermanentItem(data[i], 'permanent-' + this._permanentSeq);
      if (ids[item.id]) throw new Error('InteractiveGrid.setPermanentData: id permanent harus unik: ' + item.id);
      ids[item.id] = true;
      normalized.push(item);
    }
    this.permanentData = normalized;
    this.render();
    return this;
  };

  InteractiveGrid.prototype.getPermanentData = function () {
    return clonePermanent(this.permanentData);
  };

  InteractiveGrid.prototype.getPermanentLine = function (id) {
    id = String(id);
    for (var i = 0; i < this.permanentData.length; i++) {
      if (this.permanentData[i].id === id) return clonePermanent([this.permanentData[i]])[0];
    }
    return null;
  };

  InteractiveGrid.prototype.updatePermanentLine = function (id, patch) {
    id = String(id);
    for (var i = 0; i < this.permanentData.length; i++) {
      if (this.permanentData[i].id === id) {
        var current = this.permanentData[i];
        patch = patch || {};
        var merged = {
          id: id,
          from: patch.from ? merge(current.from, patch.from) : current.from,
          to: patch.to ? merge(current.to, patch.to) : current.to,
          lineColor: patch.lineColor != null ? patch.lineColor : current.lineColor,
          lineWidth: patch.lineWidth != null ? patch.lineWidth : current.lineWidth,
          markColor: patch.markColor != null ? patch.markColor : current.markColor,
          dotSize: patch.dotSize != null ? patch.dotSize : current.dotSize,
          xSize: patch.xSize != null ? patch.xSize : current.xSize,
          markStrokeWidth: patch.markStrokeWidth != null ? patch.markStrokeWidth : current.markStrokeWidth,
          text: patch.text != null ? patch.text : current.text,
          textColor: patch.textColor != null ? patch.textColor : current.textColor,
          textSize: patch.textSize != null ? patch.textSize : current.textSize,
          textOffset: patch.textOffset != null ? patch.textOffset : current.textOffset,
          textFontFamily: patch.textFontFamily != null ? patch.textFontFamily : current.textFontFamily
        };
        this.permanentData[i] = this._normalizePermanentItem(merged, id);
        this.render();
        return this;
      }
    }
    return this;
  };

  InteractiveGrid.prototype.removePermanentLine = function (id) {
    id = String(id);
    this.permanentData = this.permanentData.filter(function (item) { return item.id !== id; });
    this.render();
    return this;
  };

  InteractiveGrid.prototype.clearPermanentData = function () {
    this.permanentData = [];
    this.render();
    return this;
  };

  InteractiveGrid.prototype.startDrawing = function (config) {
    config = config || {};
    this._pushHistory();
    this._drawingSeq += 1;
    var drawing = this._normalizeDrawing(config, 'draw-' + this._drawingSeq);

    while (this._findDrawing(drawing.id)) {
      this._drawingSeq += 1;
      drawing.id = 'draw-' + this._drawingSeq;
    }

    this.drawings.push(drawing);
    this.activeDrawingId = drawing.id;
    this.render();
    this._emitDrawingsChange('start', drawing);
    return drawing.id;
  };

  InteractiveGrid.prototype.stopDrawing = function () {
    var drawing = this._activeDrawing();
    this.activeDrawingId = null;
    this._updateDrawToolbar();
    if (drawing) this._emitDrawingsChange('stop', drawing);
    return this;
  };

  InteractiveGrid.prototype.activateDrawing = function (id) {
    var drawing = this._findDrawing(id);
    if (!drawing) throw new Error('InteractiveGrid.activateDrawing: drawing tidak ditemukan: ' + id);
    this.activeDrawingId = drawing.id;
    this._updateDrawToolbar();
    this._emitDrawingsChange('activate', drawing);
    return this;
  };

  InteractiveGrid.prototype.getActiveDrawingId = function () {
    return this.activeDrawingId;
  };

  InteractiveGrid.prototype.getDrawings = function () {
    return cloneDrawings(this.drawings);
  };

  InteractiveGrid.prototype.getDrawing = function (id) {
    var drawing = this._findDrawing(id);
    return drawing ? cloneDrawings([drawing])[0] : null;
  };

  InteractiveGrid.prototype.setDrawings = function (data, options) {
    options = options || {};
    if (!options.silent) this._pushHistory();
    this._setDrawingsInternal(data);
    this.activeDrawingId = null;
    this.render();
    if (!options.silent) this._emitDrawingsChange('setDrawings', null);
    return this;
  };

  InteractiveGrid.prototype.addDrawingPoint = function (x, y, type, style, drawingId) {
    x = Number(x); y = Number(y);
    if (!this._validCoord(x, y)) throw new Error('InteractiveGrid.addDrawingPoint: koordinat di luar area grid.');
    if (!isValidType(type)) throw new Error('InteractiveGrid.addDrawingPoint: type harus dot atau x.');

    var drawing = drawingId ? this._findDrawing(drawingId) : this._activeDrawing();
    if (!drawing) throw new Error('InteractiveGrid.addDrawingPoint: tidak ada drawing aktif. Klik Draw atau panggil startDrawing().');

    var point = this._findDrawingPoint(drawing, x, y);
    var exists = point && point.types.indexOf(type) >= 0;
    var normalizedStyle = this._normalizePointMarkStyle(type, style);
    var hasStyle = Object.keys(normalizedStyle).length > 0;
    if (exists && !hasStyle) return this;

    this._pushHistory();
    if (!point) {
      point = { x: x, y: y, types: [], styles: {} };
      drawing.points.push(point);
    }
    if (!point.styles) point.styles = {};
    if (!exists) point.types.push(type);
    if (hasStyle) point.styles[type] = normalizedStyle;

    this.render();
    this._emitDrawingsChange(exists ? 'style' : 'addPoint', drawing);
    return this;
  };

  InteractiveGrid.prototype.removeDrawingPoint = function (drawingId, x, y, type) {
    var drawing = this._findDrawing(drawingId);
    if (!drawing) return this;
    x = Number(x); y = Number(y);

    var idx = -1;
    for (var i = 0; i < drawing.points.length; i++) {
      if (drawing.points[i].x === x && drawing.points[i].y === y) { idx = i; break; }
    }
    if (idx < 0) return this;
    if (type !== undefined && !isValidType(type)) throw new Error('InteractiveGrid.removeDrawingPoint: type harus dot, x, atau dikosongkan.');
    if (type && drawing.points[idx].types.indexOf(type) < 0) return this;

    this._pushHistory();
    if (!type) {
      drawing.points.splice(idx, 1);
    } else {
      drawing.points[idx].types = drawing.points[idx].types.filter(function (t) { return t !== type; });
      if (drawing.points[idx].styles) delete drawing.points[idx].styles[type];
      if (!drawing.points[idx].types.length) drawing.points.splice(idx, 1);
    }

    this.render();
    this._emitDrawingsChange('removePoint', drawing);
    return this;
  };

  InteractiveGrid.prototype.removeDrawing = function (id) {
    var drawing = this._findDrawing(id);
    if (!drawing) return this;
    this._pushHistory();
    this.drawings = this.drawings.filter(function (d) { return d.id !== String(id); });
    if (this.activeDrawingId === String(id)) this.activeDrawingId = null;
    this.render();
    this._emitDrawingsChange('removeDrawing', drawing);
    return this;
  };

  InteractiveGrid.prototype.clearDrawings = function () {
    if (!this.drawings.length) return this;
    this._pushHistory();
    this.drawings = [];
    this.activeDrawingId = null;
    this.render();
    this._emitDrawingsChange('clearDrawings', null);
    return this;
  };

  InteractiveGrid.prototype.updateDrawing = function (id, patch) {
    var drawing = this._findDrawing(id);
    if (!drawing) return this;
    patch = patch || {};
    this._pushHistory();

    if (patch.lineColor != null) drawing.lineColor = patch.lineColor;
    if (Number(patch.lineWidth) > 0) drawing.lineWidth = Number(patch.lineWidth);
    if (patch.markColor != null) drawing.markColor = patch.markColor;
    if (patch.dotColor !== undefined) drawing.dotColor = patch.dotColor;
    if (patch.xColor !== undefined) drawing.xColor = patch.xColor;
    if (Number(patch.dotSize) > 0) drawing.dotSize = Number(patch.dotSize);
    if (Number(patch.xSize) > 0) drawing.xSize = Number(patch.xSize);
    if (Number(patch.markStrokeWidth) > 0) drawing.markStrokeWidth = Number(patch.markStrokeWidth);
    if (patch.showDotOnTop != null) drawing.showDotOnTop = !!patch.showDotOnTop;

    this.render();
    this._emitDrawingsChange('updateDrawing', drawing);
    return this;
  };

  InteractiveGrid.prototype.getNotes = function () {
    var out = [];
    var keys = Object.keys(this.notes);
    for (var i = 0; i < keys.length; i++) {
      var note = this.notes[keys[i]];
      out.push({ x: note.x, y: note.y, text: note.text });
    }
    return out;
  };

  InteractiveGrid.prototype.getNote = function (x, y) {
    var note = this._getNoteInternal(Number(x), Number(y));
    return note ? { x: note.x, y: note.y, text: note.text } : null;
  };

  InteractiveGrid.prototype.setNote = function (x, y, text, options) {
    options = options || {};
    x = Number(x); y = Number(y);
    if (!this._validCoord(x, y)) {
      throw new Error('InteractiveGrid.setNote: koordinat di luar area grid.');
    }

    text = text == null ? '' : String(text).trim();
    if (!text) return this.removeNote(x, y, options);

    var key = this._noteKey(x, y);
    var existed = !!this.notes[key];
    this.notes[key] = { x: x, y: y, text: text };
    this._renderNotes();

    if (!options.silent) this._emitNotesChange(existed ? 'edit' : 'add', this.notes[key]);
    return this;
  };

  InteractiveGrid.prototype.addNote = InteractiveGrid.prototype.setNote;
  InteractiveGrid.prototype.updateNote = InteractiveGrid.prototype.setNote;

  InteractiveGrid.prototype.removeNote = function (x, y, options) {
    options = options || {};
    x = Number(x); y = Number(y);
    var key = this._noteKey(x, y);
    var old = this.notes[key];
    if (!old) return this;

    delete this.notes[key];
    this._renderNotes();
    if (!options.silent) this._emitNotesChange('remove', old);
    return this;
  };

  InteractiveGrid.prototype.setNotes = function (data, options) {
    options = options || {};
    this._setNotesInternal(data);
    this._renderNotes();
    if (!options.silent) this._emitNotesChange('setNotes', null);
    return this;
  };

  InteractiveGrid.prototype.clearNotes = function (options) {
    options = options || {};
    this.notes = {};
    this._renderNotes();
    if (!options.silent) this._emitNotesChange('clear', null);
    return this;
  };

  InteractiveGrid.prototype.setNotePointer = function (show) {
    this.options.notePointer = !!show;
    this._renderNotes();
    return this;
  };

  InteractiveGrid.prototype.getNotePointer = function () {
    return !!this.options.notePointer;
  };

  InteractiveGrid.prototype.setNotePointerType = function (type) {
    type = String(type || '').toLowerCase();
    if (['triangle', 'line', 'dot', 'none'].indexOf(type) < 0) {
      throw new Error('InteractiveGrid.setNotePointerType: type harus triangle, line, dot, atau none.');
    }
    this.options.notePointerType = type;
    this._renderNotes();
    return this;
  };

  InteractiveGrid.prototype.getNotePointerType = function () {
    return this.options.notePointerType;
  };

  InteractiveGrid.prototype.setShowNoteAnchorDot = function (show) {
    this.options.showNoteAnchorDot = !!show;
    this._renderNotes();
    return this;
  };

  InteractiveGrid.prototype.getShowNoteAnchorDot = function () {
    return !!this.options.showNoteAnchorDot;
  };

  InteractiveGrid.prototype.setNotePosition = function (position) {
    position = String(position || '').toLowerCase();
    if (['auto', 'right', 'left'].indexOf(position) < 0) {
      throw new Error('InteractiveGrid.setNotePosition: position harus auto, right, atau left.');
    }
    this.options.notePosition = position;
    this._renderNotes();
    return this;
  };

  InteractiveGrid.prototype.getNotePosition = function () {
    return this.options.notePosition;
  };

  InteractiveGrid.prototype.setShowNotes = function (show) {
    this.options.showNotes = !!show;
    this._renderNotes();
    if (!this.options.showNotes) {
      this._hideMenu();
      this._closeNoteEditor();
    }
    return this;
  };

  InteractiveGrid.prototype.getShowNotes = function () {
    return !!this.options.showNotes;
  };

  InteractiveGrid.prototype.getAllData = function () {
    return {
      points: this.getData(),
      drawings: this.getDrawings(),
      permanent: this.getPermanentData(),
      verticalTexts: this.getVerticalTexts(),
      columnLayout: this.getColumnLayout(),
      rowLayout: this.getRowLayout(),
      timeData: this.getTimeData(),
      notes: this.getNotes(),
      viewConfig: {
        showTimeTable: !!this.options.showTimeTable,
        showTimePicker: !!this.options.showTimePicker,
        showStatus: !!this.options.showStatus,
        showNotes: !!this.options.showNotes,
        clickDrawToDraw: !!this.options.clickDrawToDraw,
        toolbarAlign: this.options.toolbarAlign,
        tableAlign: this.options.tableAlign,
        notePointer: !!this.options.notePointer,
        notePointerType: this.options.notePointerType,
        showNoteAnchorDot: !!this.options.showNoteAnchorDot,
        notePosition: this.options.notePosition,
        xLabels: this.getXLabels()
      }
    };
  };

  InteractiveGrid.prototype.setAllData = function (state, options) {
    state = state || {};
    this.setPermanentData(Array.isArray(state.permanent) ? state.permanent : []);
    if (state.verticalTexts != null) this.setVerticalTexts(state.verticalTexts);
    if (state.columnLayout != null) this.setColumnLayout(state.columnLayout);
    if (state.rowLayout != null) this.setRowLayout(state.rowLayout);
    if (state.viewConfig && state.viewConfig.showTimeTable != null) {
      this.setShowTimeTable(state.viewConfig.showTimeTable);
    }
    if (state.viewConfig && state.viewConfig.showTimePicker != null) {
      this.setShowTimePicker(state.viewConfig.showTimePicker);
    }
    if (state.viewConfig && state.viewConfig.showStatus != null) {
      this.setShowStatus(state.viewConfig.showStatus);
    }
    if (state.viewConfig && state.viewConfig.xLabels != null) {
      this.setXLabels(state.viewConfig.xLabels);
    }
    if (state.timeData != null) this.setTimeData(state.timeData, { silent: true });
    if (state.notes != null) this.setNotes(state.notes, { silent: true });
    if (state.viewConfig && state.viewConfig.showNotes != null) {
      this.setShowNotes(state.viewConfig.showNotes);
    }
    if (state.viewConfig && state.viewConfig.clickDrawToDraw != null) {
      this.options.clickDrawToDraw = !!state.viewConfig.clickDrawToDraw;
    }
    if (state.viewConfig && state.viewConfig.toolbarAlign != null) {
      var restoredToolbarAlign = String(state.viewConfig.toolbarAlign).toLowerCase();
      if (['left', 'center', 'right'].indexOf(restoredToolbarAlign) >= 0) {
        this.options.toolbarAlign = restoredToolbarAlign;
      }
    }
    if (state.viewConfig && state.viewConfig.tableAlign != null) {
      var restoredTableAlign = String(state.viewConfig.tableAlign).toLowerCase();
      if (['left', 'center', 'right'].indexOf(restoredTableAlign) >= 0) {
        this.options.tableAlign = restoredTableAlign;
      }
    }
    if (state.viewConfig && state.viewConfig.notePointer != null) {
      this.options.notePointer = !!state.viewConfig.notePointer;
    }
    if (state.viewConfig && state.viewConfig.notePointerType != null) {
      this.options.notePointerType = state.viewConfig.notePointerType;
    }
    if (state.viewConfig && state.viewConfig.showNoteAnchorDot != null) {
      this.options.showNoteAnchorDot = !!state.viewConfig.showNoteAnchorDot;
    }
    if (state.viewConfig && state.viewConfig.notePosition != null) {
      this.options.notePosition = state.viewConfig.notePosition;
    }
    this._renderNotes();
    this._applyToolbarAlign();
    this._applyTableAlign();
    this._updateDrawToolbar();
    if (state.drawings != null) this.setDrawings(state.drawings, { silent: true });
    this.setData(Array.isArray(state.points) ? state.points : [], options || {});
    return this;
  };

  InteractiveGrid.prototype.toFullJSON = function () {
    return JSON.stringify(this.getAllData());
  };

  InteractiveGrid.prototype.fromFullJSON = function (json, options) {
    return this.setAllData(typeof json === 'string' ? JSON.parse(json) : json, options);
  };

  InteractiveGrid.prototype.getData = function () { return clonePoints(this.points); };

  InteractiveGrid.prototype.setData = function (data, options) {
    options = options || {};
    if (!Array.isArray(data)) throw new Error('InteractiveGrid.setData: data harus berupa array.');
    var normalized = [];
    for (var i = 0; i < data.length; i++) {
      var p = data[i] || {};
      var x = Number(p.x), y = Number(p.y);
      if (!this._validCoord(x, y)) continue;
      var types = Array.isArray(p.types) ? p.types.filter(isValidType) : (isValidType(p.type) ? [p.type] : []);
      types = types.filter(function (v, idx, arr) { return arr.indexOf(v) === idx; });
      if (!types.length) continue;
      var existing = null;
      for (var j = 0; j < normalized.length; j++) if (normalized[j].x === x && normalized[j].y === y) { existing = normalized[j]; break; }
      var pointStyles = {};
      var commonStyle = {
        markColor: p.markColor,
        dotSize: p.dotSize,
        xSize: p.xSize,
        markSize: p.markSize,
        xMarkSize: p.xMarkSize,
        markStrokeWidth: p.markStrokeWidth
      };
      types.forEach(function (t) {
        var mergedStyle = merge(commonStyle, p.styles && p.styles[t] ? p.styles[t] : {});
        var st = this._normalizePointMarkStyle(t, mergedStyle);
        if (Object.keys(st).length) pointStyles[t] = st;
      }, this);
      if (!existing) {
        var np = { x:x, y:y, types:types.slice() };
        if (Object.keys(pointStyles).length) np.styles = pointStyles;
        normalized.push(np);
      } else {
        types.forEach(function (t) {
          if (existing.types.indexOf(t) < 0) existing.types.push(t);
          if (pointStyles[t]) {
            if (!existing.styles) existing.styles = {};
            existing.styles[t] = pointStyles[t];
          }
        });
      }
    }
    if (!options.silent) this._pushHistory();
    this.points = normalized;
    this.render();
    if (!options.silent) this._emitChange('setData');
    return this;
  };

  InteractiveGrid.prototype.clear = function () {
    if (!this.points.length && !this.drawings.length) return this;
    this._pushHistory();
    this.points = [];
    this.drawings = [];
    this.activeDrawingId = null;
    this.render();
    this._emitChange('clear');
    this._emitDrawingsChange('clear', null);
    return this;
  };

  InteractiveGrid.prototype.undo = function () {
    if (!this.history.length) return this;
    var snapshot = this.history.pop();
    if (Array.isArray(snapshot)) {
      this.points = snapshot;
    } else {
      this.points = clonePoints(snapshot.points || []);
      this.drawings = cloneDrawings(snapshot.drawings || []);
      this.activeDrawingId = snapshot.activeDrawingId || null;
    }
    this.render();
    this._emitChange('undo');
    this._emitDrawingsChange('undo', this._activeDrawing());
    return this;
  };

  InteractiveGrid.prototype.getPoint = function (x, y) {
    var p = this._find(Number(x), Number(y));
    return p ? clonePoints([p])[0] : null;
  };

  InteractiveGrid.prototype.hasPoint = function (x, y, type) {
    var p = this._find(Number(x), Number(y));
    if (!p) return false;
    return type ? p.types.indexOf(type) >= 0 : true;
  };

  InteractiveGrid.prototype.toJSON = function () { return JSON.stringify(this.getData()); };

  InteractiveGrid.prototype.fromJSON = function (json, options) {
    return this.setData(typeof json === 'string' ? JSON.parse(json) : json, options);
  };

  InteractiveGrid.prototype.getColWidth = function () {
    return this.options.colWidth;
  };

  InteractiveGrid.prototype.setColWidth = function (width) {
    width = Number(width);
    if (!(width > 0)) {
      throw new Error('InteractiveGrid.setColWidth: width harus lebih besar dari 0.');
    }

    this.options.colWidth = width;
    this.options.cellWidth = width;
    return this._refreshColumnLayout();
  };

  InteractiveGrid.prototype.getColumnWidth = function (columnNumber) {
    columnNumber = Number(columnNumber);
    if (!Number.isInteger(columnNumber) || columnNumber < 1 || columnNumber > this.options.columns - 1) {
      return null;
    }

    if (!this._columnWidths || this._columnWidths.length !== this.options.columns - 1) {
      this._rebuildColumnGeometry();
    }
    return this._columnWidths[columnNumber - 1];
  };

  InteractiveGrid.prototype.getColumnWidths = function () {
    if (!this._columnWidths || this._columnWidths.length !== this.options.columns - 1) {
      this._rebuildColumnGeometry();
    }
    return this._columnWidths.slice();
  };

  InteractiveGrid.prototype.setColumnWidth = function (columnNumber, width) {
    columnNumber = Number(columnNumber);
    width = Number(width);

    if (!Number.isInteger(columnNumber) || columnNumber < 1 || columnNumber > this.options.columns - 1) {
      throw new Error('InteractiveGrid.setColumnWidth: nomor kolom harus 1 sampai ' + (this.options.columns - 1) + '.');
    }
    if (!(width > 0)) {
      throw new Error('InteractiveGrid.setColumnWidth: width harus lebih besar dari 0.');
    }

    this._columnWidthOverrides[columnNumber] = width;
    return this._refreshColumnLayout();
  };

  InteractiveGrid.prototype.resetColumnWidth = function (columnNumber) {
    columnNumber = Number(columnNumber);
    if (!Number.isInteger(columnNumber) || columnNumber < 1 || columnNumber > this.options.columns - 1) {
      throw new Error('InteractiveGrid.resetColumnWidth: nomor kolom harus 1 sampai ' + (this.options.columns - 1) + '.');
    }

    delete this._columnWidthOverrides[columnNumber];
    return this._refreshColumnLayout();
  };

  InteractiveGrid.prototype.setColumnWidths = function (config) {
    this._columnWidthOverrides = {};
    this._loadColumnWidthOverrides(config);
    return this._refreshColumnLayout();
  };

  InteractiveGrid.prototype.getColumnLayout = function () {
    var config = {};
    Object.keys(this._columnWidthOverrides).forEach(function (key) {
      config[key] = { colWidth: Number(this._columnWidthOverrides[key]) };
    }, this);

    return {
      colWidth: this.options.colWidth,
      columnsConfig: config
    };
  };

  InteractiveGrid.prototype.setColumnLayout = function (layout) {
    layout = layout || {};

    if (layout.colWidth != null) {
      var width = Number(layout.colWidth);
      if (!(width > 0)) {
        throw new Error('InteractiveGrid.setColumnLayout: colWidth harus lebih besar dari 0.');
      }
      this.options.colWidth = width;
      this.options.cellWidth = width;
    }

    this._columnWidthOverrides = {};
    this._loadColumnWidthOverrides(layout.colWidths);
    this._loadColumnWidthOverrides(layout.columnWidths);
    this._loadColumnWidthOverrides(layout.columnsConfig);

    return this._refreshColumnLayout();
  };

  // rowHeight API:
  // - getRowHeight() -> tinggi default
  // - getRowHeight(n) -> tinggi aktual baris ke-n
  // - setRowHeight(h) -> ubah tinggi default
  // - setRowHeight(n, h) -> ubah tinggi baris ke-n
  InteractiveGrid.prototype.getRowHeight = function (rowNumber) {
    if (rowNumber == null) return this.options.rowHeight;

    rowNumber = Number(rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > this.options.rows - 1) {
      return null;
    }

    if (!this._rowHeights || this._rowHeights.length !== this.options.rows - 1) {
      this._rebuildRowGeometry();
    }
    return this._rowHeights[rowNumber - 1];
  };

  InteractiveGrid.prototype.setRowHeight = function (arg1, arg2) {
    // Satu argumen: set tinggi default seluruh baris.
    if (arg2 == null) {
      var defaultHeight = Number(arg1);
      if (!(defaultHeight > 0)) {
        throw new Error('InteractiveGrid.setRowHeight: height harus lebih besar dari 0.');
      }

      this.options.rowHeight = defaultHeight;
      this.options.rowWidth = defaultHeight; // alias lama
      this.options.cellHeight = defaultHeight; // alias lama
      return this._refreshRowHeightLayout();
    }

    // Dua argumen: set tinggi baris tertentu.
    var rowNumber = Number(arg1);
    var height = Number(arg2);

    if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > this.options.rows - 1) {
      throw new Error('InteractiveGrid.setRowHeight: nomor baris harus 1 sampai ' + (this.options.rows - 1) + '.');
    }
    if (!(height > 0)) {
      throw new Error('InteractiveGrid.setRowHeight: height harus lebih besar dari 0.');
    }

    this._rowHeightOverrides[rowNumber] = height;
    return this._refreshRowHeightLayout();
  };

  InteractiveGrid.prototype.getRowHeights = function () {
    if (!this._rowHeights || this._rowHeights.length !== this.options.rows - 1) {
      this._rebuildRowGeometry();
    }
    return this._rowHeights.slice();
  };

  InteractiveGrid.prototype.resetRowHeight = function (rowNumber) {
    rowNumber = Number(rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > this.options.rows - 1) {
      throw new Error('InteractiveGrid.resetRowHeight: nomor baris harus 1 sampai ' + (this.options.rows - 1) + '.');
    }

    delete this._rowHeightOverrides[rowNumber];
    return this._refreshRowHeightLayout();
  };

  InteractiveGrid.prototype.setRowHeights = function (config) {
    this._rowHeightOverrides = {};
    this._loadRowHeightOverrides(config);
    return this._refreshRowHeightLayout();
  };

  InteractiveGrid.prototype.getRowLayout = function () {
    var config = {};
    Object.keys(this._rowHeightOverrides).forEach(function (key) {
      config[key] = { rowHeight: Number(this._rowHeightOverrides[key]) };
    }, this);

    return {
      rowHeight: this.options.rowHeight,
      rowsConfig: config
    };
  };

  InteractiveGrid.prototype.setRowLayout = function (layout) {
    layout = layout || {};

    var defaultHeight = layout.rowHeight != null ? layout.rowHeight : layout.rowWidth;
    if (defaultHeight != null) {
      var height = Number(defaultHeight);
      if (!(height > 0)) {
        throw new Error('InteractiveGrid.setRowLayout: rowHeight harus lebih besar dari 0.');
      }
      this.options.rowHeight = height;
      this.options.rowWidth = height; // alias lama
      this.options.cellHeight = height; // alias lama
    }

    this._rowHeightOverrides = {};
    this._loadRowHeightOverrides(layout.rowWidths);
    this._loadRowHeightOverrides(layout.rowHeights);
    this._loadRowHeightOverrides(layout.rowsConfig);

    return this._refreshRowHeightLayout();
  };

  // Alias kompatibilitas v1.7.0 dan sebelumnya.
  InteractiveGrid.prototype.getRowWidth = function (rowNumber) {
    return this.getRowHeight(rowNumber);
  };

  InteractiveGrid.prototype.setRowWidth = function (arg1, arg2) {
    return this.setRowHeight(arg1, arg2);
  };

  InteractiveGrid.prototype.getRowWidthAt = function (rowNumber) {
    return this.getRowHeight(rowNumber);
  };

  InteractiveGrid.prototype.setRowWidthAt = function (rowNumber, height) {
    return this.setRowHeight(rowNumber, height);
  };

  InteractiveGrid.prototype.getRowWidths = function () {
    return this.getRowHeights();
  };

  InteractiveGrid.prototype.setRowWidths = function (config) {
    return this.setRowHeights(config);
  };

  InteractiveGrid.prototype.resetRowWidthAt = function (rowNumber) {
    return this.resetRowHeight(rowNumber);
  };


  InteractiveGrid.prototype.getVerticalTexts = function () {
    return cloneVerticalTexts(this.verticalTexts);
  };

  InteractiveGrid.prototype.setVerticalTexts = function (data) {
    this._setVerticalTextsInternal(data);
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype.addVerticalText = function (config) {
    this._verticalTextSeq += 1;
    var item = this._normalizeVerticalText(config, 'vertical-text-' + this._verticalTextSeq);

    for (var i = 0; i < this.verticalTexts.length; i++) {
      if (this.verticalTexts[i].id === item.id) {
        throw new Error('InteractiveGrid.addVerticalText: id "' + item.id + '" sudah digunakan.');
      }
    }

    this.verticalTexts.push(item);
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return item.id;
  };

  InteractiveGrid.prototype.updateVerticalText = function (id, patch) {
    id = String(id);
    patch = patch || {};

    for (var i = 0; i < this.verticalTexts.length; i++) {
      if (this.verticalTexts[i].id === id) {
        var current = this.verticalTexts[i];
        var merged = {
          id: id,
          text: patch.text != null ? patch.text : current.text,
          color: patch.color != null ? patch.color : current.color,
          fontSize: patch.fontSize != null ? patch.fontSize : current.fontSize,
          fontWeight: patch.fontWeight != null ? patch.fontWeight : current.fontWeight,
          fontFamily: patch.fontFamily != null ? patch.fontFamily : current.fontFamily,
          width: patch.width != null ? patch.width : current.width
        };

        this.verticalTexts[i] = this._normalizeVerticalText(merged, id);
        this._layout();
        this._renderLabels();
        this._renderVerticalTexts();
        this.render();
        return this;
      }
    }

    return this;
  };

  InteractiveGrid.prototype.removeVerticalText = function (id) {
    id = String(id);
    this.verticalTexts = this.verticalTexts.filter(function (item) {
      return item.id !== id;
    });
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype.clearVerticalTexts = function () {
    this.verticalTexts = [];
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype.setTableAlign = function (align) {
    align = String(align || '').toLowerCase();

    if (['left', 'center', 'right'].indexOf(align) < 0) {
      throw new Error('InteractiveGrid.setTableAlign: align harus left, center, atau right.');
    }

    this.options.tableAlign = align;
    this._applyTableAlign();
    return this;
  };

  InteractiveGrid.prototype.getTableAlign = function () {
    return this.options.tableAlign;
  };

  InteractiveGrid.prototype.setToolbarAlign = function (align) {
    align = String(align || '').toLowerCase();

    if (['left', 'center', 'right'].indexOf(align) < 0) {
      throw new Error('InteractiveGrid.setToolbarAlign: align harus left, center, atau right.');
    }

    this.options.toolbarAlign = align;
    this._applyToolbarAlign();
    return this;
  };

  InteractiveGrid.prototype.getToolbarAlign = function () {
    return this.options.toolbarAlign;
  };

  InteractiveGrid.prototype.setClickDrawToDraw = function (enabled) {
    this.options.clickDrawToDraw = !!enabled;

    // Saat diaktifkan, legacy edit langsung dinonaktifkan. Drawing aktif yang sudah
    // berjalan tetap boleh diteruskan sampai Stop Draw dipilih.
    this._hideMenu();
    this._updateDrawToolbar();
    return this;
  };

  InteractiveGrid.prototype.getClickDrawToDraw = function () {
    return !!this.options.clickDrawToDraw;
  };

  InteractiveGrid.prototype.setShowStatus = function (show) {
    this.options.showStatus = !!show;
    if (this.dom && this.dom.status) {
      this.dom.status.classList.toggle('ig-hidden', !this.options.showStatus);
    }
    return this;
  };

  InteractiveGrid.prototype.getShowStatus = function () {
    return !!this.options.showStatus;
  };

  InteractiveGrid.prototype.setShowTimePicker = function (show) {
    this.options.showTimePicker = !!show;
    this._renderTimeInputs();
    return this;
  };

  InteractiveGrid.prototype.getShowTimePicker = function () {
    return !!this.options.showTimePicker;
  };

  InteractiveGrid.prototype.getTimeData = function () {
    var groups = this.getTimeTableGroups();
    var out = [];

    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      out.push({
        startColumn: g.startColumn,
        endColumn: g.endColumn,
        fromX: g.fromX,
        toX: g.toX,
        value: this.timeData[g.startColumn] || ''
      });
    }

    return out;
  };

  InteractiveGrid.prototype.setTimeData = function (data, options) {
    options = options || {};
    this._setTimeDataInternal(data);
    this._renderTimeInputs();

    if (!options.silent) {
      this.el.dispatchEvent(new CustomEvent('interactivegrid:timechange', {
        detail: { group: null, value: null, data: this.getTimeData() }
      }));
      if (typeof this.options.onTimeChange === 'function') {
        this.options.onTimeChange(this.getTimeData(), null, null);
      }
    }
    return this;
  };

  InteractiveGrid.prototype.clearTimeData = function (options) {
    options = options || {};
    this.timeData = {};
    this._renderTimeInputs();

    if (!options.silent) {
      this.el.dispatchEvent(new CustomEvent('interactivegrid:timechange', {
        detail: { group: null, value: null, data: this.getTimeData() }
      }));
      if (typeof this.options.onTimeChange === 'function') {
        this.options.onTimeChange(this.getTimeData(), null, null);
      }
    }
    return this;
  };

  InteractiveGrid.prototype.setTimeValue = function (startColumn, value, options) {
    options = options || {};
    startColumn = Number(startColumn);
    var normalized = this._normalizeTimeValue(value, true);

    if (!Number.isInteger(startColumn) || startColumn < 1 || startColumn > this.options.columns - 1) {
      throw new Error('InteractiveGrid.setTimeValue: startColumn di luar rentang tabel waktu.');
    }
    if (normalized == null) {
      throw new Error('InteractiveGrid.setTimeValue: format waktu harus HH:MM (00:00 sampai 23:59).');
    }

    this.timeData[startColumn] = normalized;
    this._renderTimeInputs();

    if (!options.silent) {
      var groups = this.getTimeTableGroups();
      var group = null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].startColumn === startColumn) { group = groups[i]; break; }
      }
      this._emitTimeChange(group, normalized);
    }
    return this;
  };

  InteractiveGrid.prototype.getTimeValue = function (startColumn) {
    startColumn = Number(startColumn);
    return this.timeData[startColumn] || '';
  };

  InteractiveGrid.prototype.setShowTimeTable = function (show) {
    this.options.showTimeTable = !!show;
    this._layout();
    this._renderLabels();
    this._renderVerticalTexts();
    this.render();
    return this;
  };

  InteractiveGrid.prototype.getShowTimeTable = function () {
    return !!this.options.showTimeTable;
  };

  InteractiveGrid.prototype.getTimeTableGroups = function () {
    if (!this._xPositions || this._xPositions.length !== this.options.columns) {
      this._rebuildColumnGeometry();
    }

    var step = Number(this.options.colJoinCount);
    if (!(step > 0)) step = 1;
    step = Math.max(1, Math.floor(step));

    var groups = [];
    var maxInterval = this.options.columns - 1;

    for (var start = 0; start < maxInterval; start += step) {
      var end = Math.min(start + step, maxInterval);
      groups.push({
        startColumn: start + 1,
        endColumn: end,
        fromX: this.options.xStart + start,
        toX: this.options.xStart + end,
        width: this._xPositions[end] - this._xPositions[start]
      });
    }

    return groups;
  };

  InteractiveGrid.prototype.setXLabels = function (data) {
    this._setXLabelsInternal(data);
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.getXLabels = function () {
    var out = {};
    Object.keys(this.xLabels).forEach(function (key) {
      out[key] = this.xLabels[key];
    }, this);
    return out;
  };

  InteractiveGrid.prototype.setXLabel = function (x, value) {
    x = Number(x);
    if (!Number.isFinite(x) || x < this.options.xStart || x > this.options.xStart + this.options.columns - 1) {
      throw new Error('InteractiveGrid.setXLabel: nilai X di luar area grid.');
    }
    this.xLabels[String(x)] = value == null ? '' : String(value);
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.getXLabel = function (x) {
    x = Number(x);
    if (!Number.isFinite(x)) return null;
    return this._resolveXLabel(x);
  };

  InteractiveGrid.prototype.removeXLabel = function (x) {
    x = Number(x);
    if (!Number.isFinite(x)) return this;
    delete this.xLabels[String(x)];
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.clearXLabels = function () {
    this.xLabels = {};
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.setXLabelOffset = function (offset) {
    offset = Number(offset);
    if (!Number.isFinite(offset)) {
      throw new Error('InteractiveGrid.setXLabelOffset: offset harus berupa angka.');
    }
    this.options.xLabelOffset = offset;
    this.el.style.setProperty('--ig-x-label-offset', offset + 'px');
    return this;
  };

  InteractiveGrid.prototype.getXLabelOffset = function () {
    return this.options.xLabelOffset;
  };

  InteractiveGrid.prototype.setColJoinCount = function (count) {
    count = Number(count);
    if (!(count > 0)) throw new Error('InteractiveGrid.setColJoinCount: count harus lebih besar dari 0.');
    count = Math.max(1, Math.floor(count));
    this.options.colJoinCount = count;
    this.options.xLabelStep = count;
    this.options.step = count;
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.getColJoinCount = function () {
    return this.options.colJoinCount;
  };

  InteractiveGrid.prototype.setXLabelStep = function (step) {
    return this.setColJoinCount(step);
  };

  InteractiveGrid.prototype.getXLabelStep = function () {
    return this.getColJoinCount();
  };

  InteractiveGrid.prototype.setYLabelStep = function (step) {
    step = Number(step);
    if (!(step > 0)) throw new Error('InteractiveGrid.setYLabelStep: step harus lebih besar dari 0.');
    step = Math.max(1, Math.floor(step));
    this.options.yLabelStep = step;
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.getYLabelStep = function () {
    return this.options.yLabelStep;
  };

  InteractiveGrid.prototype.destroy = function () {
    this._bound.forEach(function (b) { b[0].removeEventListener(b[1], b[2], b[3]); });
    this._bound = [];
    this.el.innerHTML = '';
    this.el.classList.remove('ig-root');
    this.destroyed = true;
  };

  InteractiveGrid.VERSION = '2.8.0';
  return InteractiveGrid;
});
