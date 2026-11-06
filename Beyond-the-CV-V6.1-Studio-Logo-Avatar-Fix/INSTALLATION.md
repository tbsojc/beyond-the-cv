# Beyond the CV – V6.1 (ein gemeinsames Update)

## Enthaltene Änderungen
- Gemeinsame CV-Daten: GitHub-Git-Blob-Fallback für `content/site.json` >1 MB. Damit lässt sich die große bestehende JSON-Datei einschließlich eingebettetem PDF wieder im Studio bearbeiten.
- How I Work: explizit im Bereich „Gemeinsame CV-Daten“ als „How I Work · Arbeitsweise & Kompetenzwelten“. Die Felder entsprechen `site.worlds`, die bereits auf der Bewerbungsseite im Abschnitt How I Work ausgegeben werden.
- Job-Fit-Nachweise 1–3: im Studio direkt bei der ausgewählten Bewerbung unter „Bewerbung bearbeiten“, nicht mehr bei den allgemeinen CV-Daten oder den Projektzuordnungen.
- Case Studies bleiben unter „Projekte zuordnen“ und werden separat mit derselben Bewerbung gespeichert.
- Die bisherige WebGL-Hintergrundanimation wird nicht mehr eingebunden. Stattdessen weißes BS-SVG als ruhiges, dezent scrollbewegtes Hintergrundzeichen.
- Das vom Nutzer bereitgestellte Avatarbild erscheint im Kapitel „Let's Connect“.
- `scripts/verify_v5.py` prüft die aktualisierten Assets und verhindert versehentliches Wiedereinbinden der alten Hintergrundszene.

## Dateien (Pfad im Repository beibehalten)
dist/studio/studio.js
dist/studio/dashboard.js
dist/studio/index.html
dist/studio/studio.css
scripts/application_v5.html
scripts/verify_v5.py
dist/application/v5.css
dist/application/v5.js
dist/assets/bs-logo-white.svg
dist/assets/portrait-connect.png

## Einspielen
1. ZIP lokal entpacken.
2. Alle Dateien unter Beibehaltung der Ordnerstruktur in den lokalen Git-Checkout kopieren.
3. **Alle Dateien gemeinsam in einem Commit** auf `main` veröffentlichen. GitHub Desktop ist dafür am einfachsten.
4. GitHub Actions prüfen und anschließend `/studio/` und `/b/qrailing-product-marketing/` hart neu laden.

## Hinweise
- `content/site.json`, `applications/*.json` und `case-studies/*.json` bleiben unverändert.
- Kein neues Build-Skript nötig; `scripts/build.py` aus V6 nutzt die aktualisierte HTML-Vorlage.
- Die alte Datei `dist/application/v5-scene.mjs` bleibt aus Kompatibilitätsgründen im Repository, wird aber nicht mehr eingebunden.
- Die Studio-Änderungen sind nicht automatisch gespeichert: nach dem Editieren auf „Gemeinsame Daten speichern“ klicken.
- Der GitHub-Token benötigt Contents: Read and write. GitHub Actions muss nach dem Commit erfolgreich deployen.
- Die lokale Prüfung verwendet einen älteren Projekt-Datenstand. Kein Browser-End-to-End-Test am aktuellen Live-Repository wurde durchgeführt.
