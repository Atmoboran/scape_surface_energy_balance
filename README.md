# Wie heiß wird der Boden? – SCAPE°

Interaktive Simulation zur **Energiebilanz der Oberfläche** für SCAPE° (Wetter Klima Mensch, Offenbach am Main).
Sie zeigt, wovon es abhängt, wie stark sich eine Fläche in der Sonne aufheizt:

- **Stufe 1 – Albedo** (`#albedo`): Drei Betonplatten in verschiedenen Farben. Dunkel schluckt fast alles Licht, hell wirft viel zurück – die Farbe selbst ist egal, die Helligkeit zählt.
- **Stufe 2 – Material** (`#material`): Asphalt, Beton, Sand, Erde, Rasen, Holz und Wasser, jeweils trocken, feucht oder nass. Wärmekapazität, Wärmeleitung und Verdunstungskühlung; im Boden-Querschnitt sieht man, wie tief die Wärme eindringt. Schalter „Alle gleich hell“ trennt den Einfluss des Materials von dem der Farbe.
- **Stufe 3 – Sonne & Wetter** (`#wetter`): Sonnenhöhe (mit Mittagssonne in Offenbach im Winter, Frühling und Sommer), Bewölkung in Achteln und Wind mit Beaufort-Stufe. Ein Lichtbündel zeigt, wie sich flaches Licht auf mehr Boden verteilt. „Kurve merken“ vergleicht bis zu drei Wetterlagen.
- **Stufe 4 – Ein Tag** (`#tag`): 24 Stunden mit Sonnenlauf, Nacht und Lufttemperatur für drei Flächen, im Frühling, Sommer oder Winter.

Jede Stufe hat drei Aufgaben, die sich selbst abhaken; sind alle gelöst, erscheint die Erkenntnis.
Das **Energiekonto** zeigt für die gewählte Fläche (in der Szene antippen) alle Energieflüsse in W/m²:
Sonnenlicht, zurückgeworfen, Wärmestrahlung, Wärme an die Luft, Verdunstung, Wärme in den Boden.
Dieselben Farben haben die Pfeile in der Szene.

## Benutzung
`index.html` im Browser öffnen – keine Abhängigkeiten, kein Build, funktioniert offline und auf dem Handy.
Jede Stufe ist über ihren Anker direkt aufrufbar (z. B. `index.html#material`).

## Modell
`js/model.js` rechnet ohne DOM und lässt sich einzeln prüfen. Jede Fläche ist eine Säule aus 30 Schichten
(oben 4 mm, zusammen gut 1,7 m), Wärmeleitung implizit gerechnet, an der Oberfläche die Energiebilanz:

    Sonne − reflektiert − Wärmestrahlung (netto) − Wärme an die Luft − Verdunstung = Wärmestrom in den Boden

Sonne nach Meinel (klarer Himmel) und Kasten & Czeplak (Wolken), Himmelsstrahlung nach Brutsaert bzw.
Unsworth & Monteith, Wärmeübergang h = 4 + 3,5·Wind W/m²K. Verdunstung verbraucht einen Wasservorrat in mm;
ist er leer, wird die Fläche trocken. Wasser ist stark durchmischt und hält beim Gefrieren 0 °C.
Bewusst einfach – richtig in Größenordnung und Vergleich (z. B. Asphalt im Sommer mittags ≈ 55 °C,
Rasen ≈ 35 °C, Wasser ≈ 24 °C), nicht als Vorhersage gedacht.

## Gestaltung
Nach dem SCAPE°-Corporate-Design (Bureau Mitte): Farbfelder, Flächenformen, Linienillustrationen, Versalien für Überschriften.
Die Gestaltung liegt wie in den anderen SCAPE°-Apps getrennt im Ordner `theme/` (siehe `theme/README.md`):
Schrift, Palette, Farbthemen der Stufen (`theme/theme.css`) und die Zeichenfarben – Himmel, Energiepfeile,
Temperaturskala, Materialfarben, Malfarben mit ihrer Albedo (`theme/theme.js`, `THEME.seb`).
Hausschrift ist Founders Grotesk (lizenzpflichtig, nicht im Repository); ohne sie wird Helvetica Neue / Inter / Arial verwendet.
