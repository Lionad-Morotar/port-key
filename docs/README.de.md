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

Erzeuge Ports mit einer Buchstaben‑zu‑Zahl‑Tastaturzuordnung.

Wenn du viele Projekte lokal startest, wird die Auswahl von Portnummern schnell lästig.

- In den letzten Jahren sind *so viele* neue Projekte entstanden. Um sie wirklich auszuprobieren, muss man sie meist lokal starten – und dann kollidieren die Ports.
- Wenn du Browser‑Tabs (oder Lesezeichen) stabil halten willst, sollte die Portnummer eines Projekts nicht ständig wechseln.

Zum Beispiel habe ich mehr als zehn Nuxt‑Anwendungen auf meinem Rechner. Wenn alle standardmäßig `3000` verwenden, funktioniert das natürlich nicht. Deshalb habe ich eine einfache, konsistente Regel zur Portbenennung entwickelt, um für jedes Projekt einen festen Port „zuweisen“ zu können.

[Quell‑Blogbeitrag](https://lionad.art/articles/simple-naming-method)

### Kernidee

Anstatt zufällige Zahlen zu wählen, wird der **Projektname anhand einer Tastatur in Zahlen umgewandelt**, sodass der Port *lesbar* und *einprägsam* ist.

Solange das Ergebnis im gültigen Portbereich (**1024–65535**) liegt und keine reservierten/System‑Ports belegt, kann es verwendet werden.

Konkret: Mit einer Standard‑QWERTY‑Tastatur wird jedem Buchstaben eine einzelne Ziffer entsprechend seiner **Zeilen‑/Spaltenposition** zugeordnet.

Beispiel:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（Port‑Nummer）

Dann kannst du die ersten 4 Ziffern (z. B. `3453`) nehmen oder mehr Ziffern behalten (z. B. `34353`). Beides ist zulässig.

Falls ein Projekt mehrere Ports benötigt (Frontend, Backend, Datenbank usw.), wähle **eine** der beiden Vorgehensweisen:

1. Verwende das Projekt‑Präfix und füge ein „Rollen‑Suffix“ an  
   - Für `"cfetch"`: nimm `3435` als Basis  
   - Frontend (`fe`, also `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Datenbank (`mongo`) → `34357`  
   - … und so weiter

2. Verwende das Projekt‑Präfix und ordne sequenzielle Rollen zu  
   - Für `"cfetch"`: nimm `3435` als Basis  
   - Web → `34351`  
   - Backend → `34352`  
   - Datenbank → `34353`  
   - … und so weiter

### Gültiger Portbereich

- Ports müssen im Bereich **1024–65535** liegen (System‑Ports 0‑1023 sind gesperrt).
- **System‑Ports (0‑1023)**: Vom IETF zugewiesen. Streng gesperrt.
- **Benutzer‑Ports (1024‑49151)**: Vom IANA zugewiesen. Vorsicht, da sie mit registrierten Diensten kollidieren können.
- **Dynamische/Private Ports (49152‑65535)**: Nicht zugewiesen. Am sichersten für private oder dynamische Nutzung.

---

## Verwendung

Einfacher Befehl:

```sh
npx -y @lionad/port-key <dein-projekt-name>
```

Oder du möchtest einen stdio‑MCP‑Server:

```sh
npx -y @lionad/port-key-mcp
```

```json
{
  "mcpServers": {
    "port-key": {
      "command": "npx",
      "args": ["@lionad/port-key-mcp"]
    }
  }
}
```

### CLI‑Optionen

- `-m, --map <object>`: benutzerdefinierte Zuordnung (JSON‑ oder JS‑ähnliches Objektliteral)
- `--lang <code>`: Ausgabesprache (derzeit nur `en` und `cn`, Standard: `cn`)
- `-d, --digits <count>`: bevorzugte Ziffern‑Anzahl für den Port (4 oder 5, Standard: 4)
- `--padding-zero <true|false>`: kurze Ports mit Null auffüllen (Standard: true). z. B. "air" → 1840
- `-h, --help`: Hilfeseite anzeigen

Beispiele:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4‑stelliger Port)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5‑stelliger Port)
```

Hinweise:
- Die Standardsprache der Ausgabe ist `cn`. Verwende `--lang en`, um englische Meldungen zu erhalten.
- Nutze `-h` oder `--help`, um die Hilfe anzuzeigen.

### Konfiguration

PortKey liest optionale Benutzerkonfiguration aus:

- `~/.port-key/config.json`

Ein vollständiges Beispiel:

```json
{
  // Bevorzugte Ziffern‑Anzahl für den Port (4 oder 5)
  "preferDigitCount": 5,
  // Kurze Ports mit Null auffüllen (Standard: true)
  "paddingZero": true,
  // Benutzerdefinierte Buchstaben‑zu‑Ziffer‑Zuordnung
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Portbereichsgrenzen (inklusive)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Für Entwickler

### Projektstruktur

- Dieses Repository verwendet ein pnpm‑Monorepo; das Kernpaket liegt in `packages/core`.
- Installation: Im Stammverzeichnis `pnpm install` ausführen.
- Tests ausführen: `pnpm -C packages/core test` oder `pnpm -C packages/core test:watch`.
