/* =========================================================
   LeakLens — SVG Chart Engine
   All charts render as inline SVG without any external deps
   ========================================================= */

const Charts = (() => {
  const PAL = {
    accent: "#00d4aa",
    blue: "#0098ff",
    red: "#ff6b6b",
    yellow: "#ffd166",
    purple: "#a855f7",
    text2: "#9aa0b8",
    text3: "#5a6278",
    border: "#2a2f3d",
    bg3: "#181b22",
  };

  function svgEl(tag, attrs = {}, children = []) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    children.forEach((c) =>
      typeof c === "string"
        ? el.appendChild(document.createTextNode(c))
        : el.appendChild(c),
    );
    return el;
  }

  /* ── Bar Chart ── */
  function bar(
    containerId,
    { labels, values, colors, height = 180, showValues = true },
  ) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = el.clientWidth || 400,
      H = height,
      pad = { t: 24, r: 16, b: 32, l: 40 };
    const max = Math.max(...values, 1);
    const bCount = labels.length;
    const bW = Math.floor(((W - pad.l - pad.r) / bCount) * 0.55);
    const gap = Math.floor(((W - pad.l - pad.r) / bCount) * 0.45);

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = `width:100%;height:${H}px;display:block`;

    // grid lines
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      const y = pad.t + (1 - f) * (H - pad.t - pad.b);
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", pad.l);
      line.setAttribute("x2", W - pad.r);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", PAL.border);
      line.setAttribute("stroke-width", "0.5");
      svg.appendChild(line);
    });

    labels.forEach((label, i) => {
      const bH = Math.max(
        2,
        Math.floor((values[i] / max) * (H - pad.t - pad.b)),
      );
      const x = pad.l + i * ((W - pad.l - pad.r) / bCount) + gap / 2;
      const y = H - pad.b - bH;
      const col = Array.isArray(colors)
        ? colors[i % colors.length]
        : colors || PAL.accent;

      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", bW);
      rect.setAttribute("height", bH);
      rect.setAttribute("fill", col);
      rect.setAttribute("rx", "4");
      rect.setAttribute("opacity", "0.88");
      svg.appendChild(rect);

      if (showValues) {
        const txt = document.createElementNS(ns, "text");
        txt.setAttribute("x", x + bW / 2);
        txt.setAttribute("y", y - 5);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", col);
        txt.setAttribute("font-size", "10");
        txt.setAttribute("font-weight", "600");
        txt.textContent = values[i];
        svg.appendChild(txt);
      }

      const lbl = document.createElementNS(ns, "text");
      lbl.setAttribute("x", x + bW / 2);
      lbl.setAttribute("y", H - 8);
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("fill", PAL.text3);
      lbl.setAttribute("font-size", "10");
      lbl.textContent = label;
      svg.appendChild(lbl);
    });

    el.innerHTML = "";
    el.appendChild(svg);
  }

  /* ── Line Chart ── */
  function line(containerId, { datasets, labels, height = 180 }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = el.clientWidth || 400,
      H = height;
    const pad = { t: 24, r: 16, b: 32, l: 36 };
    const allVals = datasets.flatMap((d) => d.values);
    const min = Math.min(...allVals) * 0.9;
    const max = Math.max(...allVals) * 1.05;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = `width:100%;height:${H}px;display:block`;

    const defs = document.createElementNS(ns, "defs");
    datasets.forEach((ds, di) => {
      const lg = document.createElementNS(ns, "linearGradient");
      lg.setAttribute("id", `lg${containerId}${di}`);
      lg.setAttribute("x1", "0");
      lg.setAttribute("y1", "0");
      lg.setAttribute("x2", "0");
      lg.setAttribute("y2", "1");
      const s1 = document.createElementNS(ns, "stop");
      s1.setAttribute("offset", "0%");
      s1.setAttribute("stop-color", ds.color);
      s1.setAttribute("stop-opacity", "0.25");
      const s2 = document.createElementNS(ns, "stop");
      s2.setAttribute("offset", "100%");
      s2.setAttribute("stop-color", ds.color);
      s2.setAttribute("stop-opacity", "0");
      lg.appendChild(s1);
      lg.appendChild(s2);
      defs.appendChild(lg);
    });
    svg.appendChild(defs);

    // gridlines
    [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
      const y = pad.t + f * (H - pad.t - pad.b);
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", pad.l);
      l.setAttribute("x2", W - pad.r);
      l.setAttribute("y1", y);
      l.setAttribute("y2", y);
      l.setAttribute("stroke", PAL.border);
      l.setAttribute("stroke-width", "0.5");
      svg.appendChild(l);
    });

    function toX(i) {
      return pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r);
    }
    function toY(v) {
      return pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    }

    datasets.forEach((ds, di) => {
      const pts = ds.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
      const first = { x: toX(0), y: toY(ds.values[0]) };
      const last = {
        x: toX(ds.values.length - 1),
        y: toY(ds.values[ds.values.length - 1]),
      };

      const areaPath = `M${first.x},${H - pad.b} L${ds.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" L")} L${last.x},${H - pad.b} Z`;
      const area = document.createElementNS(ns, "path");
      area.setAttribute("d", areaPath);
      area.setAttribute("fill", `url(#lg${containerId}${di})`);
      svg.appendChild(area);

      const polyline = document.createElementNS(ns, "polyline");
      polyline.setAttribute("points", pts);
      polyline.setAttribute("fill", "none");
      polyline.setAttribute("stroke", ds.color);
      polyline.setAttribute("stroke-width", "2");
      polyline.setAttribute("stroke-linecap", "round");
      polyline.setAttribute("stroke-linejoin", "round");
      svg.appendChild(polyline);

      ds.values.forEach((v, i) => {
        const c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", toX(i));
        c.setAttribute("cy", toY(v));
        c.setAttribute("r", "4");
        c.setAttribute("fill", ds.color);
        svg.appendChild(c);
      });
    });

    labels.forEach((lbl, i) => {
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", toX(i));
      t.setAttribute("y", H - 6);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", PAL.text3);
      t.setAttribute("font-size", "10");
      t.textContent = lbl;
      svg.appendChild(t);
    });

    el.innerHTML = "";
    el.appendChild(svg);
  }

  /* ── Horizontal Bar (for category leakage) ── */
  function hBar(containerId, { labels, values, colors, maxVal }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const max = maxVal || Math.max(...values, 1);
    let html = '<div style="display:flex;flex-direction:column;gap:12px">';
    labels.forEach((lbl, i) => {
      const pct = Math.round((values[i] / max) * 100);
      const col = Array.isArray(colors)
        ? colors[i % colors.length]
        : PAL.accent;
      html += `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
            <span style="color:var(--text2)">${lbl}</span>
            <span style="font-weight:600;color:var(--text)">${
              typeof values[i] === "number" && values[i] > 100
                ? "$" + values[i].toLocaleString()
                : values[i] + (typeof values[i] === "string" ? "" : "%")
            }</span>
          </div>
          <div class="prog-track">
            <div class="prog-fill" style="width:${pct}%;background:${col}"></div>
          </div>
        </div>`;
    });
    html += "</div>";
    el.innerHTML = html;
  }

  /* ── Donut Chart ── */
  function donut(containerId, { segments, size = 120 }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const total = segments.reduce((s, d) => s + d.value, 0);
    const R = size / 2,
      r = R * 0.62,
      cx = R,
      cy = R;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.style.cssText = `width:${size}px;height:${size}px`;

    let angle = -Math.PI / 2;
    segments.forEach((seg) => {
      const sweep = (seg.value / total) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(angle);
      const y1 = cy + R * Math.sin(angle);
      const x2 = cx + R * Math.cos(angle + sweep);
      const y2 = cy + R * Math.sin(angle + sweep);
      const xi1 = cx + r * Math.cos(angle);
      const yi1 = cy + r * Math.sin(angle);
      const xi2 = cx + r * Math.cos(angle + sweep);
      const yi2 = cy + r * Math.sin(angle + sweep);
      const large = sweep > Math.PI ? 1 : 0;

      const path = document.createElementNS(ns, "path");
      path.setAttribute(
        "d",
        `M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large},0 ${xi1},${yi1} Z`,
      );
      path.setAttribute("fill", seg.color);
      path.setAttribute("opacity", "0.9");
      svg.appendChild(path);
      angle += sweep;
    });

    el.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "display:flex;align-items:center;gap:20px;flex-wrap:wrap";
    wrap.appendChild(svg);

    const legend = document.createElement("div");
    legend.style.cssText = "display:flex;flex-direction:column;gap:8px";
    segments.forEach((seg) => {
      const pct = Math.round((seg.value / total) * 100);
      legend.innerHTML += `
        <div style="display:flex;align-items:center;gap:8px;font-size:13px">
          <div style="width:10px;height:10px;border-radius:50%;background:${seg.color};flex-shrink:0"></div>
          <span style="color:var(--text2)">${seg.label}</span>
          <span style="font-weight:700;color:${seg.color};margin-left:auto;padding-left:12px">${pct}%</span>
        </div>`;
    });
    wrap.appendChild(legend);
    el.appendChild(wrap);
  }

  /* ── Scatter Plot ── */
  function scatter(containerId, { points, height = 200 }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = el.clientWidth || 400,
      H = height;
    const pad = { t: 16, r: 16, b: 36, l: 48 };
    const xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    const xMin = Math.min(...xs) * 0.9,
      xMax = Math.max(...xs) * 1.1;
    const yMin = 0,
      yMax = Math.max(...ys) * 1.15;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = `width:100%;height:${H}px;display:block`;

    // Axes
    ["x1", "x2", "y1", "y2"].forEach(() => {});
    const ax = document.createElementNS(ns, "line");
    ax.setAttribute("x1", pad.l);
    ax.setAttribute("x2", W - pad.r);
    ax.setAttribute("y1", H - pad.b);
    ax.setAttribute("y2", H - pad.b);
    ax.setAttribute("stroke", PAL.border);
    ax.setAttribute("stroke-width", "1");
    svg.appendChild(ax);
    const ay = document.createElementNS(ns, "line");
    ay.setAttribute("x1", pad.l);
    ay.setAttribute("x2", pad.l);
    ay.setAttribute("y1", pad.t);
    ay.setAttribute("y2", H - pad.b);
    ay.setAttribute("stroke", PAL.border);
    ay.setAttribute("stroke-width", "1");
    svg.appendChild(ay);

    function toX(v) {
      return pad.l + ((v - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
    }
    function toY(v) {
      return H - pad.b - ((v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
    }

    // x-axis label
    const xl = document.createElementNS(ns, "text");
    xl.setAttribute("x", W / 2);
    xl.setAttribute("y", H - 4);
    xl.setAttribute("text-anchor", "middle");
    xl.setAttribute("fill", PAL.text3);
    xl.setAttribute("font-size", "10");
    xl.textContent = "Amount ($)";
    svg.appendChild(xl);
    const yl = document.createElementNS(ns, "text");
    yl.setAttribute("x", 10);
    yl.setAttribute("y", H / 2);
    yl.setAttribute("text-anchor", "middle");
    yl.setAttribute("fill", PAL.text3);
    yl.setAttribute("font-size", "10");
    yl.setAttribute("transform", `rotate(-90,10,${H / 2})`);
    yl.textContent = "Risk Score";
    svg.appendChild(yl);

    points.forEach((p) => {
      const c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", toX(p.x));
      c.setAttribute("cy", toY(p.y));
      c.setAttribute("r", "6");
      c.setAttribute("fill", p.color || PAL.accent);
      c.setAttribute("fill-opacity", "0.75");
      const t = document.createElementNS(ns, "title");
      t.textContent = p.label || "";
      c.appendChild(t);
      svg.appendChild(c);
    });

    el.innerHTML = "";
    el.appendChild(svg);
  }

  /* ── Confusion Matrix ── */
  function confusionMatrix(containerId, { tn, fp, fn, tp }) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="conf-grid" style="margin-top:.75rem">
        <div></div>
        <div style="text-align:center;font-size:11px;color:var(--text3);padding-bottom:4px">Predicted Normal</div>
        <div style="text-align:center;font-size:11px;color:var(--text3);padding-bottom:4px">Predicted Anomaly</div>
        <div style="font-size:11px;color:var(--text3)">Actual Normal</div>
        <div class="conf-cell conf-tn"><div class="conf-val" style="color:var(--accent)">${tn}</div><div class="conf-label">True Negative</div></div>
        <div class="conf-cell conf-fp"><div class="conf-val" style="color:var(--red)">${fp}</div><div class="conf-label">False Positive</div></div>
        <div style="font-size:11px;color:var(--text3)">Actual Anomaly</div>
        <div class="conf-cell conf-fn"><div class="conf-val" style="color:var(--yellow)">${fn}</div><div class="conf-label">False Negative</div></div>
        <div class="conf-cell conf-tp"><div class="conf-val" style="color:var(--accent)">${tp}</div><div class="conf-label">True Positive</div></div>
      </div>`;
  }

  return { bar, line, hBar, donut, scatter, confusionMatrix };
})();
