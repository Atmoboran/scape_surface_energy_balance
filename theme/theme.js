// THEME – brand and colours used from JavaScript (logo, footer, canvas
// drawings). The CSS side lives in theme.css. For another institution,
// replace the values here; the keys are what the app looks up.
window.THEME = {
  brand: {
    name: 'SCAPE°',
    // Wordmark: name with the subtitle spread over its full width.
    logoHtml:
      '<span class="logo-word">SCAPE°</span>' +
      '<span class="logo-sub" aria-hidden="true"><span>Wetter</span><span>Klima</span><span>Mensch</span></span>',
    logoLabel: 'SCAPE° – Wetter Klima Mensch',
    claim: 'Wetter, Klima, Wandel. Wir erklären es.',
    contactHtml: 'SCAPE°<br>Frankfurter Straße 39<br>63065 Offenbach am Main<br>Instagram: @scape_offenbach<br>scape@offenbach.de',
    titleSuffix: ' – SCAPE°',
    themeColor: '#F2E4BA',
    // Short mark S° for the browser tab.
    favicon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#FFF487"/><text x="16" y="23.5" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="19" fill="#000">S°</text></svg>'
  },

  // Typeface for canvas text (the same stack as --font in theme.css).
  font: '"Founders Grotesk","Helvetica Neue",Inter,Arial,sans-serif',

  // The SCAPE° palette by name. Drawings refer to these names.
  palette: {
    black: '#000000', white: '#FFFFFF',
    olive: '#726B1E', sand: '#D4BFA3',
    gold: '#E09F00', amber: '#F59E24', yellow: '#FFE547', yellowStrong: '#FFD500', yellowBright: '#FFED00', yellowS: '#FDC618',
    yellowPastel: '#FFF487', yellowPale: '#FDF6B7',
    rust: '#D55117', orange: '#EE7518', salmon: '#EF887F', pink: '#F8E1E6', cream: '#F2E4BA',
    red: '#E41513', red2: '#E8472E',
    purple: '#442683', purple2: '#523E91', lavender: '#E0E5F5', lilac: '#C5B8DB',
    greenStrong: '#00983A', green: '#62BA91', greenPale: '#B0D8C0', mint: '#CFE6CE', paleGreen: '#D0E8DC',
    cyan: '#0097BE', cyan2: '#44ABCC', cyan3: '#80C0DA', petrol: '#1F6C8E', teal: '#007B73', grey: '#AEC4C2',
    navy: '#28348B', blue: '#0253A0', blue2: '#3274BA', bluePale: '#98B8DD', ice: '#D4EDF8'
  }
};

// ---- Energiebilanz: Farben der Zeichnungen (passend zu theme.css) ----
THEME.seb = {
  ink: '#000000',
  sky: '#D4EDF8',          // Himmel am Tag
  skyCloudy: '#AEC4C2',    // Himmel bei 8/8 Bewölkung
  skyNight: '#28348B',     // Himmel nachts
  sun: '#E09F00', sunRay: '#FFE547',
  beam: '#FFF487',         // Lichtbündel (Stufe 3)
  cloud: '#FFFFFF', cloudLine: '#98B8DD',
  wind: '#FFFFFF',
  steam: '#0097BE',
  star: '#FFF487',
  // Energieflüsse (gleiche Werte wie --flux-… in theme.css)
  flux: { sw: '#FFD500', ref: '#FFFFFF', lw: '#E8472E', h: '#C5B8DB', le: '#0097BE', g: '#442683' },
  // Temperatur im Boden: von kalt nach heiß (°C → Farbe)
  temp: [[-5, '#28348B'], [3, '#3274BA'], [10, '#98B8DD'], [16, '#D4EDF8'], [22, '#F2E4BA'], [30, '#FFE547'],
         [38, '#F59E24'], [46, '#EE7518'], [54, '#D55117'], [62, '#E41513']],
  // Kurven der drei Flächen A, B, C und gemerkte Kurven
  lines: ['#28348B', '#00983A', '#D55117'],
  saved: ['#C5B8DB', '#98B8DD', '#D4BFA3'],
  air: '#000000',
  night: '#E0E5F5',        // Nachtstreifen im Diagramm
  grid: 'rgba(0,0,0,.14)',
  // Oberflächenfarben der Materialien
  material: { asphalt: '#000000', beton: '#AEC4C2', sand: '#D4BFA3', erde: '#917F5B', rasen: '#00983A', holz: '#BB9870', wasser: '#3274BA' },
  // Farben zum Anmalen (Stufe 1) mit ihrer Albedo
  paints: [
    { name: 'Weiß', color: '#FFFFFF', albedo: 0.80 },
    { name: 'Gelb', color: '#FFE547', albedo: 0.60 },
    { name: 'Hellgrau', color: '#AEC4C2', albedo: 0.45 },
    { name: 'Rot', color: '#E41513', albedo: 0.25 },
    { name: 'Grün', color: '#00983A', albedo: 0.20 },
    { name: 'Dunkelblau', color: '#28348B', albedo: 0.12 },
    { name: 'Schwarz', color: '#000000', albedo: 0.05 }
  ]
};
