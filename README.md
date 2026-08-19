# Habitable Worlds — Scroll-Visualisierung

## Lokal öffnen

Doppelklick auf `index.html` reicht **nicht ganz** — `fetch()` blockiert lokale
Dateien in manchen Browsern (CORS). Starte stattdessen einen simplen lokalen
Server im Ordner:

```bash
# Python (meistens schon installiert)
python3 -m http.server 8000
```

Dann im Browser öffnen: http://localhost:8000

## Aktuell: Demo-Daten

Die Seite läuft gerade mit `planets_sample.json` — künstlich erzeugten
Platzhalterdaten, die deiner echten Verteilung ähneln (1715 Planeten, ~ein
paar Dutzend tatsächlich habitabel, ein paar mehr vom Modell vorhergesagt).
Das ist nur zum Testen von Layout und Scroll-Verhalten.

## Deine echten Ergebnisse einbinden

Füg diese Zelle **ans Ende deines Jupyter Notebooks** ein und führ sie aus:

```python
import json

export = pd.DataFrame({
    "name": df.loc[X_test.index, "pl_name"] if "pl_name" in df.columns else X_test.index.astype(str),
    "pl_insol": df.loc[X_test.index, "pl_insol"],
    "pl_rade": df.loc[X_test.index, "pl_rade"],
    "actual_habitable": y_test.values,
    "predicted_proba": y_test_proba,
    "predicted_habitable": final_preds
})

export.to_json("planets.json", orient="records")
print(f"{len(export)} Planeten exportiert")
```

Die erzeugte `planets.json` in denselben Ordner wie `index.html` legen
(neben `planets_sample.json`). Die Seite erkennt sie automatisch — sobald
`planets.json` existiert, wird sie statt der Demo-Daten geladen (siehe
`app.js`, Zeile mit `DATA_FILE`).

## Was du anpassen kannst

- **Farben/Typografie**: alles zentral in `style.css`, oben unter `:root`
- **Skalen der Achsen**: `insolToX()` / `radeToY()` in `app.js`, falls sich
  der Wertebereich deiner echten Daten stark von den Demo-Daten unterscheidet
- **Texte der drei Schritte**: direkt in `index.html`, in den `<section
  class="step">`-Blöcken
- **Scroll-Empfindlichkeit**: `threshold: 0.55` in `app.js` — niedriger =
  reagiert früher beim Scrollen

## Struktur

```
index.html          # Seitenstruktur, drei Scroll-Schritte + Sternenkarte
style.css            # Design-System (Farben, Typografie, Layout)
app.js                # Datenladen, Positionierung, Scroll-Logik
planets_sample.json   # Demo-Daten
```
