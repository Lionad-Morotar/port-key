<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: una strategia semplice e pratica per la denominazione delle porte</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Breve

Genera porte con una mappatura tastiera lettera‑numero

Quando si eseguono più progetti in locale, scegliere i numeri di porta diventa fastidioso.

- Negli ultimi due anni sono nati *tantissimi* nuovi progetti. Per provarli davvero, spesso è necessario avviarli localmente — e poi le porte cominciano a collidere.
- Se vuoi mantenere stabile la barra degli indirizzi del browser (o i segnalibri), la porta di un progetto non dovrebbe cambiare continuamente.

Ad esempio, ho più di dieci applicazioni Nuxt sulla mia macchina. Se tutte usassero la porta predefinita `3000`, ovviamente non funzionerebbe. Perciò ho ideato una semplice e coerente regola di denominazione delle porte per “assegnare” le porte a ciascun progetto.

[Post originale sul blog](https://lionad.art/articles/simple-naming-method)

### Idea principale

Invece di scegliere numeri a caso, mappa **il nome del progetto a numeri basati sulla tastiera**, così la porta è *leggibile* e *memorizzabile*.

Finché il risultato rientra nell’intervallo valido delle porte (**1024–65535**) e non colpisce porte riservate/sistema, puoi usarlo tranquillamente.

Più specificamente: usando una tastiera QWERTY standard, mappa ogni lettera a una singola cifra in base alla sua **posizione di riga/colonna**.

Esempio:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numero della porta）

Puoi prendere le prime 4 cifre (es. `3453`), oppure mantenere più cifre (es. `34353`). Entrambi vanno bene.

Se un progetto richiede più porte (frontend, backend, database, ecc.), scegli **una** delle due seguenti strategie:

1. Usa il prefisso del progetto, poi aggiungi un “suffisso ruolo”  
   - Per `"cfetch"`, prendi `3435` come base  
   - Frontend (`fe`, cioè `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Database (`mongo`) → `34357`  
   - …e così via

2. Usa il prefisso del progetto, poi assegna ruoli sequenziali  
   - Per `"cfetch"`, prendi `3435` come base  
   - Web → `34351`  
   - Backend → `34352`  
   - Database → `34353`  
   - …e così via

### Intervallo di porte valido

- Le porte devono trovarsi tra **1024–65535** (le porte di sistema 0‑1023 sono bloccate).
- **Porte di Sistema (0‑1023)**: assegnate da IETF. Stretta limitazione.
- **Porte Utente (1024‑49151)**: assegnate da IANA. Usare con cautela perché potrebbero entrare in conflitto con servizi registrati.
- **Porte Dinamiche/Private (49152‑65535)**: non assegnate. Le più sicure per uso privato o dinamico.

---

## Come usarlo

Comando semplice:

```sh
npx -y @lionad/port-key <nome-del-tuo-progetto>
```

Oppure vuoi un server stdio MCP:

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

### Opzioni CLI

- `-m, --map <object>`: mappatura personalizzata (JSON o oggetto in stile JS)
- `--lang <code>`: lingua di output (attualmente solo `en` e `cn`, predefinito: `cn`)
- `-d, --digits <count>`: numero preferito di cifre per la porta (4 o 5, predefinito: 4)
- `--padding-zero <true|false>`: aggiunge zero di riempimento alle porte corte (predefinito: true). es. "air" -> 1840
- `-h, --help`: mostra l’aiuto

Esempi:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta a 4 cifre)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta a 5 cifre)
```

Note:
- La lingua di log predefinita è `cn`. Usa `--lang en` per mostrare i messaggi in inglese.
- Usa `-h` o `--help` per visualizzare l’aiuto.

### Configurazione

PortKey legge una configurazione opzionale dell’utente da:

- `~/.port-key/config.json`

Un esempio completo:

```json
{
  // Numero preferito di cifre per la porta (4 o 5)
  "preferDigitCount": 5,
  // Aggiungi zero di riempimento alle porte corte (predefinito: true)
  "paddingZero": true,
  // Mappatura personalizzata lettere‑cifre
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limiti dell’intervallo di porte (inclusivo)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Per gli sviluppatori

### Struttura del progetto

- Questo repository utilizza un monorepo pnpm; il pacchetto core si trova in `packages/core`.
- Installazione: esegui `pnpm install` nella radice.
- Esegui i test: `pnpm -C packages/core test` o `pnpm -C packages/core test:watch`.
