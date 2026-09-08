/* InteractiveGrid v1.3.0
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
    // Jarak antar label angka pada sumbu X.
    // Contoh xLabelStep: 2 -> label: 0, 2, 4, 6, ...
    xLabelStep: 1,
    // Alias singkat untuk xLabelStep.
    step: null,
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

  function isValidType(type) { return type === 'dot' || type === 'x'; }

  function InteractiveGrid(target, options) {
    if (!(this instanceof InteractiveGrid)) return new InteractiveGrid(target, options);
    this.el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.el) throw new Error('InteractiveGrid: target element tidak ditemukan.');

    this.options = merge(DEFAULTS, options || {});

    // xLabelStep adalah nama utama. `step` adalah alias singkat.
    if (options && options.xLabelStep == null && options.step != null) {
      this.options.xLabelStep = Number(options.step);
    }
    this.options.xLabelStep = Number(this.options.xLabelStep);
    if (!(this.options.xLabelStep > 0)) this.options.xLabelStep = 1;
    this.options.xLabelStep = Math.max(1, Math.floor(this.options.xLabelStep));
    this.options.step = this.options.xLabelStep;

    // Alias opsi lama -> nama baru, tanpa merusak implementasi lama.
    if (options && options.dotSize == null && options.markSize != null) this.options.dotSize = Number(options.markSize);
    if (options && options.xSize == null && options.xMarkSize != null) this.options.xSize = Number(options.xMarkSize);
    this.options.markSize = this.options.dotSize;
    this.options.xMarkSize = this.options.xSize;
    this.points = [];
    this.permanentData = [];
    this._permanentSeq = 0;
    this.history = [];
    this.pendingCell = null;
    this.destroyed = false;
    this._bound = [];

    this._build();
    this._bindEvents();
    this.render();
  }

  InteractiveGrid.prototype._build = function () {
    var o = this.options;
    this.el.innerHTML = '';
    this.el.classList.add('ig-root');
    this.el.style.setProperty('--ig-cell-w', o.cellWidth + 'px');
    this.el.style.setProperty('--ig-cell-h', o.cellHeight + 'px');
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
      '<button type="button" class="ig-undo">Undo</button>' +
      '<button type="button" class="ig-clear">Hapus Semua</button>';

    var scroll = document.createElement('div');
    scroll.className = 'ig-scroll';
    var chart = document.createElement('div');
    chart.className = 'ig-chart';
    scroll.appendChild(chart);

    chart.innerHTML =
      '<div class="ig-y-labels"></div>' +
      '<div class="ig-grid"></div>' +
      '<div class="ig-x-labels"></div>' +
      '<div class="ig-time-label"></div>' +
      '<div class="ig-time-cells"></div>' +
      '<svg class="ig-overlay" aria-hidden="true"></svg>' +
      '<div class="ig-interaction" aria-label="Area interaksi grafik"></div>' +
      '<div class="ig-hover-plus" aria-hidden="true"></div>' +
      '<div class="ig-menu" role="dialog" aria-label="Pilihan tanda">' +
        '<div class="ig-menu-title">Tambah tanda</div>' +
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
      '</div>';

    var status = document.createElement('div');
    status.className = 'ig-status' + (o.showStatus ? '' : ' ig-hidden');

    this.el.appendChild(toolbar);
    this.el.appendChild(scroll);
    this.el.appendChild(status);

    this.dom = {
      toolbar: toolbar,
      undo: toolbar.querySelector('.ig-undo'),
      clear: toolbar.querySelector('.ig-clear'),
      chart: chart,
      grid: chart.querySelector('.ig-grid'),
      yLabels: chart.querySelector('.ig-y-labels'),
      xLabels: chart.querySelector('.ig-x-labels'),
      timeLabel: chart.querySelector('.ig-time-label'),
      timeCells: chart.querySelector('.ig-time-cells'),
      overlay: chart.querySelector('.ig-overlay'),
      interaction: chart.querySelector('.ig-interaction'),
      hoverPlus: chart.querySelector('.ig-hover-plus'),
      menu: chart.querySelector('.ig-menu'),
      deleteSection: chart.querySelector('.ig-delete-section'),
      status: status
    };

    if (!o.showUndo) this.dom.undo.classList.add('ig-hidden');
    if (!o.showClear) this.dom.clear.classList.add('ig-hidden');
    this._layout();
    this._renderLabels();
  };

  InteractiveGrid.prototype._layout = function () {
    var o = this.options;
    var labelW = 48, axisH = 38, timeH = 54;
    // Ruang ekstra di atas mencegah label Y tertinggi (mis. 10) terpotong.
    // Ruang di kanan memberi tempat untuk label X terakhir dan tanda pada batas kanan.
    var topPad = Math.ceil(o.cellHeight / 2) + 4;
    var rightPad = Math.ceil(o.cellWidth / 2) + 4;
    var gridW = (o.columns - 1) * o.cellWidth;
    var gridH = (o.rows - 1) * o.cellHeight;
    var chartW = labelW + gridW + rightPad;
    var chartH = topPad + gridH + axisH + timeH;

    this._metrics = {
      labelW: labelW, axisH: axisH, timeH: timeH,
      topPad: topPad, rightPad: rightPad, gridW: gridW, gridH: gridH
    };

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

    this.dom.yLabels.style.top = topPad + 'px';
    this.dom.yLabels.style.height = gridH + 'px';
    this.dom.yLabels.style.gridTemplateRows = 'repeat(' + o.rows + ', ' + o.cellHeight + 'px)';
    this.dom.yLabels.style.transform = 'translateY(-' + (o.cellHeight / 2) + 'px)';

    this.dom.xLabels.style.top = (topPad + gridH) + 'px';
    this.dom.xLabels.style.width = gridW + 'px';
    this.dom.xLabels.style.height = axisH + 'px';
    this.dom.xLabels.style.gridTemplateColumns = 'repeat(' + o.columns + ', ' + o.cellWidth + 'px)';
    this.dom.xLabels.style.transform = 'translateX(-' + (o.cellWidth / 2) + 'px)';

    this.dom.timeLabel.style.top = (topPad + gridH + axisH) + 'px';
    this.dom.timeLabel.style.height = timeH + 'px';
    this.dom.timeCells.style.top = (topPad + gridH + axisH) + 'px';
    this.dom.timeCells.style.width = gridW + 'px';
    this.dom.timeCells.style.height = timeH + 'px';
  };

  InteractiveGrid.prototype._renderLabels = function () {
    var o = this.options;
    var xHTML = '', yHTML = '';
    var step = Number(o.xLabelStep);
    if (!(step > 0)) step = 1;
    step = Math.max(1, Math.floor(step));

    // Hanya frekuensi label yang berubah; grid dan koordinat tetap sama.
    for (var x = 0; x < o.columns; x++) {
      var showLabel = (x % step) === 0;
      xHTML += '<div>' + (showLabel ? this._escape(o.xStart + x) : '') + '</div>';
    }
    for (var y = o.rows - 1; y >= 0; y--) yHTML += '<div>' + (o.yStart + y) + '</div>';
    this.dom.xLabels.innerHTML = xHTML;
    this.dom.yLabels.innerHTML = yHTML;
    this.dom.timeLabel.innerHTML = this._escape(o.xAxisTitle) + '<br>' + this._escape(o.xAxisSubtitle);
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

  InteractiveGrid.prototype._bindEvents = function () {
    var self = this;
    var d = this.dom;

    this._bind(d.interaction, 'mousemove', function (e) { self._setHover(self._nearest(e)); });
    this._bind(d.interaction, 'mouseleave', function () { self._setHover(null); });
    this._bind(d.interaction, 'click', function (e) {
      var cell = self._nearest(e);
      self._setHover(cell);
      self._showMenu(cell);
    });

    this._bind(d.interaction, 'touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      var cell = self._nearest(e.touches[0]);
      self._showMenu(cell);
      e.preventDefault();
    }, { passive: false });

    this._bind(d.menu, 'click', function (e) {
      var add = e.target.closest('[data-type]');
      if (add && self.pendingCell) {
        self.addPoint(self.pendingCell.x, self.pendingCell.y, add.getAttribute('data-type'));
        self._hideMenu();
        return;
      }
      var del = e.target.closest('[data-delete-type]');
      if (del && self.pendingCell) {
        var type = del.getAttribute('data-delete-type');
        self.removePoint(self.pendingCell.x, self.pendingCell.y, type === 'all' ? undefined : type);
        self._hideMenu();
      }
    });

    this._bind(d.undo, 'click', function () { self.undo(); });
    this._bind(d.clear, 'click', function () { self.clear(); });

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
    return {
      px: internalX * this.options.cellWidth,
      py: (this.options.rows - 1 - internalY) * this.options.cellHeight
    };
  };

  InteractiveGrid.prototype._nearest = function (evt) {
    var r = this.dom.interaction.getBoundingClientRect();
    var lx = Math.max(0, Math.min(r.width, evt.clientX - r.left));
    var ly = Math.max(0, Math.min(r.height, evt.clientY - r.top));
    var ix = Math.max(0, Math.min(this.options.columns - 1, Math.round(lx / this.options.cellWidth)));
    var screenRow = Math.max(0, Math.min(this.options.rows - 1, Math.round(ly / this.options.cellHeight)));
    var iy = this.options.rows - 1 - screenRow;
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
    var point = this._find(cell.x, cell.y);
    var hasDot = !!(point && point.types.indexOf('dot') >= 0);
    var hasX = !!(point && point.types.indexOf('x') >= 0);

    this.dom.menu.querySelector('[data-type="dot"]').disabled = hasDot;
    this.dom.menu.querySelector('[data-type="x"]').disabled = hasX;
    this.dom.deleteSection.style.display = point ? 'flex' : 'none';
    this.dom.menu.querySelector('[data-delete-type="dot"]').disabled = !hasDot;
    this.dom.menu.querySelector('[data-delete-type="x"]').disabled = !hasX;
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
    this.history.push(clonePoints(this.points));
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

  InteractiveGrid.prototype.render = function () {
    if (this.destroyed) return this;
    var ov = this.dom.overlay;
    while (ov.firstChild) ov.removeChild(ov.firstChild);

    this._renderPermanent();

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

    var total = this.points.reduce(function (n, p) { return n + p.types.length; }, 0);
    this.dom.status.textContent = this.points.length ? (total + ' tanda pada ' + this.points.length + ' koordinat.') : 'Belum ada tanda.';
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

  InteractiveGrid.prototype.getAllData = function () {
    return { points: this.getData(), permanent: this.getPermanentData() };
  };

  InteractiveGrid.prototype.setAllData = function (state, options) {
    state = state || {};
    this.setPermanentData(Array.isArray(state.permanent) ? state.permanent : []);
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
    if (!this.points.length) return this;
    this._pushHistory();
    this.points = [];
    this.render();
    this._emitChange('clear');
    return this;
  };

  InteractiveGrid.prototype.undo = function () {
    if (!this.history.length) return this;
    this.points = this.history.pop();
    this.render();
    this._emitChange('undo');
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

  InteractiveGrid.prototype.setXLabelStep = function (step) {
    step = Number(step);
    if (!(step > 0)) throw new Error('InteractiveGrid.setXLabelStep: step harus lebih besar dari 0.');
    step = Math.max(1, Math.floor(step));
    this.options.xLabelStep = step;
    this.options.step = step;
    this._renderLabels();
    return this;
  };

  InteractiveGrid.prototype.getXLabelStep = function () {
    return this.options.xLabelStep;
  };

  InteractiveGrid.prototype.destroy = function () {
    this._bound.forEach(function (b) { b[0].removeEventListener(b[1], b[2], b[3]); });
    this._bound = [];
    this.el.innerHTML = '';
    this.el.classList.remove('ig-root');
    this.destroyed = true;
  };

  InteractiveGrid.VERSION = '1.3.0';
  return InteractiveGrid;
});
