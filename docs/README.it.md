<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Una strategia semplice e pratica per la denominazione delle porte</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Breve

Genera porte con una mappatura da lettere a numeri della tastiera.

Quando gestisci più progetti in locale, scegliere i numeri di porta può diventare fastidioso.

- Negli ultimi anni sono nati *tantissimi* nuovi progetti. Per provarli è spesso necessario avviarli localmente—e le porte iniziano a collidere.
- Se vuoi mantenere gli URL o i segnalibri del browser stabili, la porta di un progetto non dovrebbe cambiare continuamente.

Ad esempio, ho più di dieci app Nuxt sulla mia macchina. Se tutti usassero la porta predefinita `3000`, ovviamente non funzionerebbe. Ho quindi ideato una regola semplice e coerente per “assegnare” porte a ciascun progetto.

[Post del blog originale](https://lionad.art/articles/simple-naming-method)

### Idea principale

Invece di scegliere numeri a caso, mappa **il nome del progetto a numeri basati sulla tastiera**, così la porta risulta *leggibile* e *memorizzabile*.

Finché il risultato rientra nell’intervallo valido delle porte (**1024–65535**) e non coincide con porte riservate/sistema, può essere usato liberamente.

Più in dettaglio: usando una tastiera QWERTY standard, associa ogni lettera a una singola cifra in base alla sua **posizione riga/colonna**.

Esempio:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numero di porta）

Puoi prendere le prime 4 cifre (es. `3453`) oppure mantenere più cifre (es. `34353`). Entrambe le scelte vanno bene.

Se un progetto richiede più porte (frontend, backend, database, ecc.), scegli **uno** dei due approcci seguenti:

1. Usa il prefisso del progetto, quindi aggiungi un “suffisso di ruolo”  
   - Per `"cfetch"`, prendi `3435` come base  
   - Frontend (`fe`, cioè `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Database (`mongo`) → `34357`  
   - …e così via

2. Usa il prefisso del progetto, quindi assegna ruoli sequenziali  
   - Per `"cfetch"`, prendi `3435` come base  
   - Web → `34351`  
   - Backend → `34352`  
   - Database → `34353`  
   - …e così via

### Intervallo di porte valido

- Le porte devono rientrare in **1024–65535** (le porte di sistema 0‑1023 sono bloccate).
- **Porte di Sistema (0‑1023)**: assegnate da IETF. Sono strettamente bloccate.
- **Porte Utente (1024‑49151)**: assegnate da IANA. Usarle con cautela perché potrebbero entrare in conflitto con servizi registrati.
- **Porte Dinamiche/Private (49152‑65535)**: non assegnate. Sono le più sicure per usi privati o dinamici.

---

## Come usarlo

Comando semplice:

```sh
npx -y @lionad/port-key <nome-del-tuo-progetto>
```

Oppure se vuoi un server MCP su stdio:

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

### Opzioni della CLI

- `-m, --map <object>`: mappatura personalizzata (JSON o oggetto simile a JS)
- `--lang <code>`: lingua di output (attualmente solo `en` e `cn`, default: `cn`)
- `-d, --digits <count>`: numero preferito di cifre per la porta (4 o 5, default: 4)
- `-h, --help`: mostra l’aiuto

Esempi:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta a 4 cifre)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta a 5 cifre)
```

Note:
- La lingua di log predefinita è `cn`. Usa `--lang en` per visualizzare i messaggi in inglese.
- Usa `-h` o `--help` per visualizzare l’aiuto.

### Configurazione

PortKey legge una configurazione opzionale dell’utente da:

- `~/.port-key/config.json`

Esempio completo:

```json
{
  // Numero preferito di cifre per la porta (4 o 5)
  "preferDigitCount": 5,
  // Mappatura personalizzata lettera‑cifra
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limiti dell’intervallo di porte (inclusivo)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Per gli sviluppatori

### Struttura del progetto

- Questo repository utilizza un monorepo gestito da pnpm; il pacchetto principale si trova in `packages/core`.
- Installazione: esegui `pnpm install` nella radice del progetto.
- Esecuzione dei test: `pnpm -C packages/core test` oppure `pnpm -C packages/core test:watch`.
