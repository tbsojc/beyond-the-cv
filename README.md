# Beyond the CV 10.1 – Full Content Studio

## Was ist neu?
Neben personalisierten Bewerbungen lassen sich jetzt im Content Studio unter `/studio/` die **gemeinsamen CV-Inhalte** bearbeiten: Profil, Kennzahlen, Kompetenzkarten, alle vier Kompetenzwelten mit Fakten und Kapiteln, Tech-Stack, Career Journey, Ausbildung, Sprachen und Engagement. Listen können ergänzt oder gekürzt werden. Das Erscheinungsbild und die 3D-Logik bleiben bestehen.

## Inhaltliche Datenquellen
- `content/site.json`: gemeinsame CV-Inhalte für Startseite und alle Bewerbungen
- `applications/*.json`: individuelle Bewerbungen
- `scripts/template.html`: unveränderte HTML-/3D-Basis
- `scripts/build.py`: erzeugt `dist/index.html` und alle veröffentlichten Bewerbungsseiten aus diesen Daten

## Installation
1. Zum erstmaligen Test den Ordner `dist` bei Netlify Deploys hochladen. Das Studio ist dann unter `/studio/` erreichbar.
2. Für Speichern/Veröffentlichen ein **privates GitHub-Repository** mit dem gesamten Projektinhalt erstellen, inklusive `.github`, `content`, `applications`, `scripts`, `dist`.
3. Unter GitHub Settings → Secrets and variables → Actions `NETLIFY_AUTH_TOKEN` und `NETLIFY_SITE_ID` eintragen. Der Workflow `.github/workflows/deploy.yml` deployt nach Änderungen in `content/` oder `applications/` automatisch.
4. Im Studio GitHub-Benutzer, Repository, Branch und einen **Fine-grained Personal Access Token** mit `Contents: Read and write` für dieses Repository eingeben. Der Token bleibt nur im Arbeitsspeicher des Tabs; nicht auf fremden Geräten nutzen.
5. Bewerbungen unter **Bewerbung bearbeiten**, gemeinsame Inhalte unter **Gesamten CV bearbeiten** aktualisieren und jeweils speichern.

**Wichtig:** Speichern erstellt einen GitHub-Commit und löst einen automatischen Netlify-Deploy aus. Es ist kein manueller Upload nötig, nachdem GitHub/Netlify einmal verbunden sind. Eine tatsächliche Live-Verbindung wurde hier nicht getestet. Die Studio-Seite ist öffentlich aufrufbar, aber Schreibzugriff erfordert den GitHub-Token. Keine Tokens in den Projektcode schreiben.

**Grenzen:** Die Vorschau der gemeinsamen Inhalte ist eine strukturierte JSON-Vorschau, keine vollständige visuelle 3D-Vorschau. Nicht alle statisch im Template enthaltenen Texte, Bilder, Referenzlinks und das CV-PDF sind über den Editor veränderbar. Für diese sind noch Code-/Asset-Änderungen erforderlich. Vor allem Icons und Reihenfolge der vier Welten nur mit Vorsicht ändern. `noindex` ist kein Zugriffsschutz für Bewerbungsseiten.

## Lokal bauen
`python scripts/build.py`

## Prüfen
Syntaxprüfung der Studio-JS-Datei mit `node --check dist/studio/studio.js`, Build und Asset-Prüfung. Browser- und GitHub/Netlify-End-to-End-Test stehen aus.

## Wiederhergestellter Arrival
Alle über `scripts/application_v5.html` erzeugten Bewerbungen beginnen mit dem atmosphärischen Arrival aus Journey 8.8/8.9: BS-Logo, cyanfarbenes Leuchten, Ring und „Mehr als ein Lebenslauf. Ein persönlicher Einblick.“ Der Unternehmensname kommt aus `applications/*.json`. Die bisherige Ansprache folgt unter `#personal`, der Arrival bleibt unter `#arrival` erreichbar.

- Darstellung: `dist/application/arrival.css`; Scroll-Übergang und Tastaturfokus: `dist/application/arrival.js`.
- Vorhandenes BS-Logo, kein zusätzlicher WebGL-Import, keine erzwungene Wartezeit.
- „Persönliche Nachricht lesen“ und „Einstieg überspringen“ führen direkt zur Ansprache. Direktlinks bleiben nutzbar. Reduzierte Bewegung wird berücksichtigt.
- Build: `python scripts/build.py`; Prüfung: `python scripts/verify_v5.py`.
- Für GitHub sind die Dateien im Repository-Hauptverzeichnis maßgeblich. Verschachtelte Versionsordner sind vorhandene historische Kopien und werden vom Deploy-Workflow nicht verwendet.
