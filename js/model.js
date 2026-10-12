// Energiebilanz einer Oberfläche – das Rechenmodell (ohne Zeichnen, ohne DOM).
//
// Jede Fläche ist eine Säule aus 30 Schichten (oben 4 mm dünn, nach unten
// dicker, zusammen knapp 1,8 m). An der Oberfläche gilt die Energiebilanz
//
//   Sonne – reflektiert + Wärmestrahlung vom Himmel – Wärmestrahlung der Fläche
//     – Wärme an die Luft – Verdunstung  =  Wärmestrom in den Boden
//
// Der Wärmestrom in den Boden verteilt sich durch Wärmeleitung nach unten
// (implizites Verfahren, damit auch Wasser mit seiner Durchmischung stabil
// rechnet). Ganz unten bleibt die Temperatur fest.
//
// Bewusst einfach gehalten – genau genug für Größenordnungen und Vergleiche:
// * Sonne: Meinel-Formel für klaren Himmel, Wolken nach Kasten & Czeplak.
// * Himmelsstrahlung: Brutsaert (klar), Unsworth & Monteith (Wolken).
// * Wärme an die Luft: Übergangszahl h = 4 + 3,5·Wind  (W/m²K).
// * Verdunstung: mit derselben Übergangszahl, gebremst durch den Faktor beta
//   des Materials und durch den Wasservorrat (in mm), der dabei aufgebraucht wird.
(function () {
  'use strict';

  var SIGMA = 5.670e-8, LV = 2.45e6, CP = 1005, K0 = 273.15, S0 = 1361;
  var LAT = 50.1;              // Offenbach am Main

  // k: Wärmeleitfähigkeit [W/mK], C: Wärmekapazität [J/m³K], jeweils
  // [trocken, nass]. wMax: wie viel Wasser die Fläche halten kann [mm].
  // beta: wie leicht das Wasser verdunstet (Pflanzen bremsen über ihre Blätter).
  var MATERIALS = {
    asphalt: { name: 'Asphalt',  k: [0.75, 0.75], C: [1.95e6, 1.95e6], albedo: 0.08, eps: 0.95, wMax: 1,  beta: 1,    wet: 'trocken',
      text: 'Dunkel, speichert mittelmäßig, leitet mittelmäßig. Wasser bleibt nur als dünne Pfütze liegen.' },
    beton:   { name: 'Beton',    k: [1.5, 1.8],   C: [2.0e6, 2.2e6],   albedo: 0.35, eps: 0.92, wMax: 2,  beta: 1,    wet: 'trocken',
      text: 'Schwer und dicht: speichert viel Wärme und leitet sie gut in die Tiefe.' },
    sand:    { name: 'Sand',     k: [0.3, 2.0],   C: [1.3e6, 2.6e6],   albedo: 0.35, eps: 0.93, wMax: 8,  beta: 1,    wet: 'trocken',
      text: 'Trocken voller Luft zwischen den Körnern – leitet kaum. Nass leitet er gut und kühlt.' },
    erde:    { name: 'Erde',     k: [0.4, 1.4],   C: [1.3e6, 2.8e6],   albedo: 0.18, eps: 0.95, wMax: 10, beta: 0.8,  wet: 'feucht',
      text: 'Lockerer Boden. Je feuchter, desto mehr Wärme kann er speichern und weiterleiten.' },
    rasen:   { name: 'Rasen',    k: [0.5, 1.0],   C: [2.0e6, 2.6e6],   albedo: 0.23, eps: 0.97, wMax: 40, beta: 0.7, wet: 'feucht',
      text: 'Pflanzen holen Wasser aus dem Boden und verdunsten es über die Blätter.' },
    holz:    { name: 'Holz',     k: [0.15, 0.2],  C: [0.9e6, 1.1e6],   albedo: 0.35, eps: 0.90, wMax: 0.5, beta: 1,   wet: 'trocken',
      text: 'Leicht und voller Luft: leitet Wärme sehr schlecht, die Wärme bleibt oben.' },
    wasser:  { name: 'Wasser',   k: [100, 100],     C: [4.18e6, 4.18e6], albedo: 0.07, eps: 0.97, wMax: Infinity, beta: 1, wet: 'nass',
      text: 'Riesige Wärmekapazität, Wellen mischen die Wärme nach unten – und es verdunstet immer.' }
  };
  var WET = { trocken: 0, feucht: 0.25, nass: 1 };   // Anteil von wMax

  // ---- Gitter ---------------------------------------------------------------
  var N = 30, DZ = [], ZTOP = [];
  (function () { var z = 0, d = 0.004; for (var i = 0; i < N; i++) { DZ.push(d); ZTOP.push(z); z += d; d *= 1.15; } })();

  function qsat(Tc) { var es = 6.112 * Math.exp(17.67 * Tc / (Tc + 243.5)); return 0.622 * es / (1013 - 0.378 * es); }

  // Sonnenhöhe [°] in Offenbach für Tag des Jahres-Deklination [°] und Stunde (Sonnenzeit).
  function sunElevation(decl, hour) {
    var r = Math.PI / 180, H = 15 * (hour - 12) * r;
    var s = Math.sin(LAT * r) * Math.sin(decl * r) + Math.cos(LAT * r) * Math.cos(decl * r) * Math.cos(H);
    return Math.asin(Math.max(-1, Math.min(1, s))) / r;
  }

  // Globalstrahlung auf eine waagrechte Fläche [W/m²]. cloud: 0…1.
  function shortwave(elev, cloud) {
    if (elev <= 0) return 0;
    var s = Math.sin(elev * Math.PI / 180);
    var am = 1 / (s + 0.50572 * Math.pow(elev + 6.07995, -1.6364));
    var direct = S0 * Math.pow(0.7, Math.pow(am, 0.678));
    return 1.1 * direct * s * (1 - 0.75 * Math.pow(cloud, 3.4));
  }

  function longwaveDown(TaC, rh, cloud) {
    var ea = rh * 6.112 * Math.exp(17.67 * TaC / (TaC + 243.5));
    var Ta = TaC + K0;
    var clear = 1.24 * Math.pow(ea / Ta, 1 / 7);
    var eps = (1 - 0.84 * cloud) * clear + 0.84 * cloud;
    return eps * SIGMA * Ta * Ta * Ta * Ta;
  }

  function Column(cfg) {
    this.mat = MATERIALS[cfg.mat] || MATERIALS.beton;
    this.albedo = cfg.albedo != null ? cfg.albedo : this.mat.albedo;
    this.water = this.mat.wMax === Infinity;
    this.W = this.water ? Infinity : this.mat.wMax * (WET[cfg.wet || this.mat.wet] || 0);
    this.W0 = this.W;
    this.T = new Float64Array(N);
  }
  Column.prototype.wetness = function () { return this.water ? 1 : (this.mat.wMax > 0 ? this.W / this.mat.wMax : 0); };
  Column.prototype.evapFactor = function () { return this.water ? 1 : this.mat.beta * Math.min(1, this.wetness() / 0.3); };

  // Energiebilanz an der Oberfläche bei Oberflächentemperatur Ts [°C].
  Column.prototype.fluxes = function (Ts, f) {
    var sw = shortwave(f.elev, f.cloud), ref = this.albedo * sw;
    var lwIn = longwaveDown(f.Ta, f.rh, f.cloud);
    var T = Ts + K0, lwOut = this.mat.eps * SIGMA * T * T * T * T + (1 - this.mat.eps) * lwIn;
    var hc = 4 + 3.5 * f.wind;
    var H = hc * (Ts - f.Ta);
    var LE = Math.max(0, this.evapFactor() * hc * (LV / CP) * (qsat(Ts) - f.rh * qsat(f.Ta)));
    if (!this.water && this.W <= 0) LE = 0;
    var lw = lwOut - lwIn;
    return { sw: sw, ref: ref, lw: lw, h: H, le: LE, g: sw - ref - lw - H - LE };
  };

  // Ein Zeitschritt dt [s] mit dem Wetter f.
  var A = new Float64Array(N), B = new Float64Array(N), Cc = new Float64Array(N), D = new Float64Array(N);
  Column.prototype.step = function (dt, f, Tdeep) {
    var w = Math.min(1, this.wetness());
    var k = this.mat.k[0] + (this.mat.k[1] - this.mat.k[0]) * w;
    var C = this.mat.C[0] + (this.mat.C[1] - this.mat.C[0]) * w;
    var T = this.T;
    var F0 = this.fluxes(T[0], f).g;
    var dF = (this.fluxes(T[0] + 0.05, f).g - F0) / 0.05;   // < 0
    for (var i = 0; i < N; i++) {
      var cap = C * DZ[i] / dt;
      var Kup = i > 0 ? 2 * k / (DZ[i - 1] + DZ[i]) : 0;
      var Kdn = i < N - 1 ? 2 * k / (DZ[i] + DZ[i + 1]) : 2 * k / DZ[i];
      A[i] = -Kup; Cc[i] = i < N - 1 ? -Kdn : 0;
      B[i] = cap + Kup + Kdn;
      D[i] = cap * T[i];
      if (i === N - 1) D[i] += Kdn * Tdeep;
    }
    B[0] -= dF; D[0] += F0 - dF * T[0];
    for (i = 1; i < N; i++) { var m = A[i] / B[i - 1]; B[i] -= m * Cc[i - 1]; D[i] -= m * D[i - 1]; }
    T[N - 1] = D[N - 1] / B[N - 1];
    for (i = N - 2; i >= 0; i--) T[i] = (D[i] - Cc[i] * T[i + 1]) / B[i];
    if (this.water) for (i = 0; i < N; i++) if (T[i] < 0) T[i] = 0;   // gefriert: Eis hält 0 °C fest
    if (!this.water && this.W > 0) {
      var le = this.fluxes(T[0], f).le;
      this.W = Math.max(0, this.W - le / LV * dt);
    }
  };

  // Rechnet einen ganzen Versuch durch.
  // o.cols:     [{mat, albedo?, wet?}]
  // o.weather:  function (t) -> {elev, cloud (0…1), wind (m/s), Ta (°C), rh (0…1)}
  // o.duration: Dauer [s], o.sample: Abstand der gespeicherten Zeitpunkte [s]
  // o.Tinit, o.Tdeep: Anfangs- und Tiefentemperatur [°C]
  // o.spinup:   so lange vorher einschwingen [s] (Wetter periodisch mit 1 Tag)
  function simulate(o) {
    var dt = o.dt || 30;
    var cols = o.cols.map(function (c) { var col = new Column(c); col.T.fill(o.Tinit); return col; });
    if (o.spinup) {
      for (var ts = -o.spinup; ts < 0; ts += dt) {
        var fs = o.weather(((ts % 86400) + 86400) % 86400);
        cols.forEach(function (c) { c.step(dt, fs, o.Tdeep); });
      }
      cols.forEach(function (c) { c.W = c.W0; });
    }
    var out = { t: [], weather: [], cols: cols.map(function (c) { return { mat: c.mat, albedo: c.albedo, water: c.water, Ts: [], flux: [], profile: [], W: [] }; }) };
    function record(t) {
      var f = o.weather(t);
      out.t.push(t); out.weather.push(f);
      cols.forEach(function (c, j) {
        var r = out.cols[j];
        r.Ts.push(c.T[0]); r.flux.push(c.fluxes(c.T[0], f)); r.profile.push(Array.prototype.slice.call(c.T)); r.W.push(c.W);
      });
    }
    var next = 0;
    for (var t = 0; t <= o.duration + 1e-6; t += dt) {
      if (t >= next - 1e-6) { record(t); next += o.sample; }
      if (t >= o.duration) break;
      var f = o.weather(t + dt / 2);
      for (var j = 0; j < cols.length; j++) cols[j].step(dt, f, o.Tdeep);
    }
    return out;
  }

  window.SEB = {
    MATERIALS: MATERIALS, WET: WET, N: N, DZ: DZ, ZTOP: ZTOP, LAT: LAT,
    simulate: simulate, shortwave: shortwave, sunElevation: sunElevation
  };
})();
