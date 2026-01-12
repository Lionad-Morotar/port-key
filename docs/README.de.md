<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Eine einfache, praktische Strategie zur Portbenennung</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Kurzbeschreibung

Ports anhand einer Buchstaben‑zu‑Ziffern‑Tastaturabbildung generieren

Wenn Sie mehrere Projekte lokal ausführen, wird die Auswahl von Port‑Nummern schnell lästig.

- In den letzten Jahren sind *so viele* neue Projekte entstanden. Um sie auszuprobieren, muss man sie häufig lokal starten – und dann kollidieren die Ports.
- Wenn Sie Browser‑Tabs (oder Lesezeichen) stabil halten wollen, sollte sich der Port eines Projekts nicht ständig ändern.

Beispielsweise habe ich mehr als zehn Nuxt‑Apps auf meinem Rechner. Wenn sie alle standardmäßig `3000` verwenden würden, käme das natürlich nicht infrage. Deshalb habe ich mir eine einfache, konsistente Port‑Benennungsregel ausgedacht, um „Ports“ pro Projekt zuzuweisen.

[Quell‑Blog‑Beitrag](https://lionad.art/articles/simple-naming-method)

### Kernidee

Anstatt zufällige Zahlen zu wählen, wird der **Projektname anhand einer Tastatur** auf Ziffern abgebildet, sodass der Port *lesbar* und *einprägsam* ist.

Solange das Ergebnis im gültigen Port‑Bereich (**1024–65535**) liegt und keine reservierten/System‑Ports belegt, kann es verwendet werden.

Genauer: Auf einer Standard‑QWERTY‑Tastatur wird jeder Buchstabe anhand seiner **Zeilen‑/Spaltenposition** einer einzelnen Ziffer zugeordnet.

Beispiel:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（Port‑Nummer）

Dann kann man entweder die ersten 4 Ziffern (z. B. `3453`) oder mehr Ziffern (z. B. `34353`) verwenden – beides ist zulässig.

Falls ein Projekt mehrere Ports benötigt (Frontend, Backend, Datenbank usw.), wählen Sie **eine** der beiden folgenden Vorgehensweisen:

1. Verwenden Sie das Projekt‑Präfix und hängen einen „Rollen‑Suffix“ an  
   - Für `"cfetch"` nehmen Sie `3435` als Basis  
   - Frontend (`fe`, d. h. `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Datenbank (`mongo`) → `34357`  
   - … und so weiter

2. Verwenden Sie das Projekt‑Präfix und ordnen Rollen sequenziell zu  
   - Für `"cfetch"` nehmen Sie `3435` als Basis  
   - Web → `34351`  
   - Backend → `34352`  
   - Datenbank → `34353`  
   - … und so weiter

### Gültiger Port‑Bereich

- Ports müssen im Bereich **1024–65535** liegen (System‑Ports 0‑1023 sind gesperrt).
- **Systemports (0‑1023)**: Von IETF zugewiesen. Streng gesperrt.
- **Benutzerports (1024‑49151)**: Von IANA zugewiesen. Mit Vorsicht verwenden, da sie mit registrierten Diensten kollidieren können.
- **Dynamische/Private Ports (49152‑65535)**: Nicht zugewiesen. Am sichersten für private oder dynamische Nutzung.

---

## Verwendung

Einfacher Befehl:

```sh
npx -y @lionad/port-key <Ihr-Projektname>
```

Oder Sie benötigen einen stdio‑MCP‑Server:

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

- `-m, --map <object>`: benutzerdefinierte Zuordnung (JSON‑ oder JavaScript‑ähnliches Objektliteral)
- `--lang <code>`: Ausgabesprache (derzeit nur `en` und `cn`, Standard: `cn`)
- `-d, --digits <count>`: bevorzugte Ziffern‑Anzahl für den Port (4 oder 5, Standard: 4)
- `-h, --help`: Hilfe anzeigen

Beispiele:

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435 (4‑stelliger Port)
npx @lionad/port-key cfetch --digits 5  # → 34353 (5‑stelliger Port)
```

Hinweise:
- Die Standardsprache für Logmeldungen ist `cn`. Verwenden Sie `--lang en`, um englische Meldungen anzuzeigen.
- Mit `-h` oder `--help` erhalten Sie die Hilfe.

### Konfiguration

PortKey liest optionale Benutzereinstellungen aus:

- `~/.port-key/config.json`

Ein komplettes Beispiel:

```json
{
  // Bevorzugte Ziffern‑Anzahl für den Port (4 oder 5)
  "preferDigitCount": 5,
  // Benutzerdefinierte Buchstaben‑zu‑Ziffer‑Zuordnung
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Port‑Bereichsgrenzen (inklusive)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Für Entwickler

### Projektstruktur

- Dieses Repository verwendet ein pnpm‑Monorepo; das Kernpaket befindet sich in `packages/core`.
- Installation: Im Stammverzeichnis `pnpm install` ausführen.
- Tests ausführen: `pnpm -C packages/core test` oder `pnpm -C packages/core test:watch`.
