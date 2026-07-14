<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Eine einfache, praktische Portnamensstrategie</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Überblick

Generiert Ports über eine tastaturbasierte Abbildung von Buchstaben auf Zahlen

Wenn Sie mehrere Projekte lokal ausführen, wird die Auswahl von Portnummern lästig.

- In den letzten Jahren gab es *sehr viele* neue Projekte. Um sie wirklich auszuprobieren, müssen sie oft lokal gestartet werden – und dann beginnen die Portkonflikte.
- Wenn Sie Browser-Tabs (oder Lesezeichen) stabil halten möchten, sollte sich der Port eines Projekts nicht ständig ändern.

Beispielsweise habe ich mehr als zehn Nuxt-Anwendungen auf meinem Rechner. Wenn sie alle standardmäßig `3000` verwenden, funktioniert das offensichtlich nicht. Also habe ich eine einfache, konsistente Portnamensregel erdacht, um Ports projektbezogen "zuzuweisen".

[Original-Blogbeitrag](https://lionad.art/articles/simple-naming-method)

### Kernidee

Anstatt zufällige Zahlen zu wählen, mappen Sie den **Projektnamen auf Zahlen basierend auf der Tastatur**, sodass der Port *lesbar* und *merkbar* ist.

Solange das Ergebnis im gültigen Portbereich (**1024–65535**) liegt und keine reservierten/Systemports trifft, können Sie es direkt verwenden.

Genauer gesagt: Mithilfe einer Standard-QWERTY-Tastatur wird jeder Buchstabe anhand seiner **Zeilen-/Spaltenposition** auf eine einzelne Ziffer abgebildet.

Beispiel:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353` (Portnummer)

Sie können dann die ersten 4 Ziffern verwenden (z. B. `3453`) oder mehr Ziffern behalten (z. B. `34353`). Beides ist in Ordnung.

Wenn ein Projekt mehrere Ports benötigt (Frontend, Backend, Datenbank usw.), wählen Sie **einen** dieser beiden Ansätze:

1. Verwenden Sie das Projektpräfix und hängen Sie ein "Rollensuffix" an
   - Für `"cfetch"` nehmen Sie `3435` als Basis
   - Frontend (`fe`, d. h. `43`) → `34354`
   - Backend (`server`) → `34352`
   - Datenbank (`mongo`) → `34357`
   - …und so weiter

2. Verwenden Sie das Projektpräfix und weisen Sie sequenzielle Rollen zu
   - Für `"cfetch"` nehmen Sie `3435` als Basis
   - Web → `34351`
   - Backend → `34352`
   - Datenbank → `34353`
   - …und so weiter

### Gültiger Portbereich

- Ports müssen innerhalb von **1024–65535** liegen (Systemports 0-1023 sind blockiert).
- **Systemports (0-1023)**: Von der IETF zugewiesen. Streng blockiert.
- **Benutzerports (1024-49151)**: Von der IANA zugewiesen. Mit Vorsicht verwenden, da sie mit registrierten Diensten kollidieren könnten.
- **Dynamische/private Ports (49152-65535)**: Nicht zugewiesen. Am sichersten für private oder dynamische Nutzung.

---

## Verwendung

Einfacher Befehl:

```sh
npx -y @lionad/port-key <your-project-name>
```

Oder wenn Sie einen stdio-MCP-Server wünschen:

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


### CLI-Optionen

- `-m, --map <object>`: benutzerdefinierte Abbildung (JSON- oder JS-ähnlicher Objektliteral)
- `--lang <code>`: Ausgabesprache (derzeit nur `en` und `cn`, Standard: `cn`)
- `-d, --digits <count>`: bevorzugte Anzahl von Ziffern für den Port (4 oder 5, Standard: 4)
- `--padding-zero <true|false>`: Füllt bei kurzer Eingabe mit nachgestellten Nullen auf die bevorzugte Ziffernzahl auf (Standard: true). z. B. `"air"` -> `1840`, `"1234" --digits 5` -> `12340`
- `-h, --help`: Hilfe anzeigen

Beispiele:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4-stelliger Port)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5-stelliger Port)
```

Hinweise:
- Die Standardprotokollsprache ist `cn`. Verwenden Sie `--lang en`, um englische Meldungen anzuzeigen.
- Verwenden Sie `-h` oder `--help`, um die Hilfe anzuzeigen.

### Konfiguration

PortKey liest die optionale Benutzerkonfiguration aus:

- `~/.port-key/config.json`

Ein vollständiges Beispiel:

```json
{
  // Bevorzugte Anzahl von Ziffern für den Port (4 oder 5)
  "preferDigitCount": 5,
  // Füllt bei kurzer Eingabe mit nachgestellten Nullen auf die bevorzugte Ziffernzahl auf (Standard: true)
  "paddingZero": true,
  // Benutzerdefinierte Buchstabe-Ziffer-Abbildung
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Portbereichsgrenzen (einschließlich)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Für Entwickler

### Projektstruktur

- Dieses Repository verwendet pnpm monorepo; das Hauptpaket befindet sich in `packages/core`.
- Installation: Führen Sie `pnpm install` im Stammverzeichnis aus.
- Tests ausführen: `pnpm -C packages/core test` oder `pnpm -C packages/core test:watch`.
