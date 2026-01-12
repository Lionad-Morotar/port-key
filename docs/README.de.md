<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Eine einfache, praktische Port‑Benennungsstrategie</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Kurzbeschreibung

Ports anhand einer Buchstaben‑zu‑Zahl‑Tastaturzuordnung generieren  

Wenn Sie mehrere Projekte lokal ausführen, wird die Auswahl von Port‑Nummern schnell lästig.

- In den letzten Jahren sind *so viele* neue Projekte entstanden. Um sie wirklich auszuprobieren, starten Sie sie häufig lokal – und dann kollidieren die Ports.
- Wenn Sie Browser‑Tabs (oder Lesezeichen) stabil halten wollen, sollte sich der Port eines Projekts nicht ständig ändern.

Zum Beispiel habe ich mehr als zehn Nuxt‑Apps auf meinem Rechner. Wenn sie alle standardmäßig `3000` verwenden würden, würde das natürlich nicht funktionieren. Deshalb habe ich eine einfache, konsistente Port‑Benennungsregel entwickelt, um „Ports“ pro Projekt zuzuordnen.

[Quell‑Blog‑Beitrag](https://lionad.art/articles/simple-naming-method)

### Kernidee

Anstatt zufällige Zahlen zu wählen, wird der **Projektname auf Basis einer Tastaturzuordnung in Ziffern übersetzt**, sodass der Port *lesbar* und *einprägsam* ist.

Solange das Ergebnis im gültigen Portbereich (**0–65535**) liegt und keine reservierten/System‑Ports trifft, können Sie es verwenden.

Genauer gesagt: Verwenden Sie eine Standard‑QWERTY‑Tastatur und ordnen Sie jedem Buchstaben anhand seiner **Zeilen-/Spaltenposition** eine einzelne Ziffer zu.

Beispiel:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（Port‑Nummer）

Sie können dann die ersten 4 Ziffern (z. B. `3453`) verwenden oder mehr Ziffern behalten (z. B. `34353`). Beides ist in Ordnung.

Falls ein Projekt mehrere Ports benötigt (Frontend, Backend, Datenbank usw.), wählen Sie **einen** der beiden Ansätze:

1. Verwenden Sie das Projekt‑Präfix und hängen Sie ein „Rollen‑Suffix“ an  
   - Für `"cfetch"`: Basis = `3435`  
   - Frontend (`fe`, also `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Datenbank (`mongo`) → `34357`  
   - …usw.

2. Verwenden Sie das Projekt‑Präfix und ordnen Sie Rollen sequenziell zu  
   - Für `"cfetch"`: Basis = `3435`  
   - Web → `34351`  
   - Backend → `34352`  
   - Datenbank → `34353`  
   - …usw.

### Gültiger Portbereich

- Ports müssen im Bereich **0–65535** liegen.
- Für benutzerdefinierte Dienste ist es meist am besten, **1024–49151** (nicht reserviert) oder **49152–65535** (privat/dynamisch) zu verwenden.
- Solange die abgebildete Zahl unter dem Limit bleibt, ist sie gültig.

---

## Anwendung

```bash
npx @lionad/port-key <your-project-name>
```

### CLI‑Optionen

- `-m, --map <object>`: benutzerdefinierte Zuordnung (JSON‑ oder JS‑ähnliches Objekt‑Literal)
- `--lang <code>`: Ausgabesprache (derzeit nur `en` und `cn`, Standard: `cn`)
- `-d, --digits <count>`: gewünschte Ziffern‑Anzahl für den Port (4 oder 5, Standard: 4)
- `-h, --help`: Hilfe anzeigen

Beispiele:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4   # -> 3435 (4‑stelliger Port)
npx @lionad/port-key cfetch --digits 5   # -> 34353 (5‑stelliger Port)
```

Hinweise:
- Die Standardsprache für die Ausgabe ist `cn`. Verwenden Sie `--lang en`, um englische Meldungen zu erhalten.
- Nutzen Sie `-h` oder `--help`, um Hilfe anzuzeigen.

### Konfiguration

PortKey liest eine optionale Benutzer‑Konfiguration aus:

- `~/.port-key/config.json`

Ein vollständiges Beispiel:

```json
{
  // Bevorzugte Ziffernzahl für den Port (4 oder 5)
  "preferDigitCount": 5,
  // Benutzerdefinierte Buchstaben‑zu‑Ziffer‑Zuordnung
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Port‑Bereichsgrenzen (einschließlich)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Für Entwickler

### Projektstruktur

- Dieses Repository verwendet ein pnpm‑Monorepo; das Kernpaket befindet sich in `packages/core`.
- Installation: Führen Sie im Wurzelverzeichnis `pnpm install` aus.
- Tests ausführen: `pnpm -C packages/core test` oder `pnpm -C packages/core test:watch`.
