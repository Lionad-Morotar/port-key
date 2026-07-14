<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: una strategia di denominazione delle porte semplice e pratica</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## In breve

Genera porte con una mappatura lettera-numero basata sulla tastiera

Quando esegui diversi progetti in locale, scegliere i numeri di porta diventa fastidioso.

- Negli ultimi anni sono nati *tantissimi* progetti nuovi. Per provarli davvero, spesso devi avviarli in locale — ed è allora che le porte iniziano a collidere.
- Se vuoi che le schede del browser (o i segnalibri) restino stabili, la porta di un progetto non dovrebbe cambiare continuamente.

Ad esempio, ho più di dieci app Nuxt sulla mia macchina. Se tutte usano `3000` come impostazione predefinita, ovviamente non può funzionare. Così ho inventato una regola di denominazione delle porte semplice e coerente per "assegnare" una porta a ogni progetto.

[Articolo originale sul blog](https://lionad.art/articles/simple-naming-method)

### Idea principale

Invece di scegliere numeri a caso, mappa il **nome del progetto su numeri basati sulla tastiera**, così la porta è *leggibile* e *facile da ricordare*.

Finché il risultato rientra nell'intervallo di porte valido (**1024–65535**) e non collide con le porte riservate/di sistema, puoi usarla direttamente.

Più nel dettaglio: usando una tastiera QWERTY standard, mappa ogni lettera su una singola cifra in base alla sua **posizione riga/colonna**.

Esempio:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numero di porta）

Puoi poi prendere le prime 4 cifre (ad esempio `3453`), oppure mantenerne di più (ad esempio `34353`). Va bene in entrambi i casi.

Se un progetto richiede più porte (frontend, backend, database, ecc.), scegli **uno** di questi due approcci:

1. Usa il prefisso del progetto, poi aggiungi un "suffisso di ruolo"
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

- Le porte devono rientrare in **1024–65535** (le porte di sistema 0–1023 sono bloccate).
- **Porte di sistema (0–1023)**: assegnate dallo IETF. Rigorosamente bloccate.
- **Porte utente (1024–49151)**: assegnate dallo IANA. Usale con cautela perché potrebbero entrare in conflitto con servizi registrati.
- **Porte dinamiche/private (49152–65535)**: non assegnate. Le più sicure per uso privato o dinamico.

---

## Come usare

Comando semplice:

```sh
npx -y @lionad/port-key <your-project-name>
```

Oppure, se vuoi un server MCP via stdio:

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

- `-m, --map <object>`: mappatura personalizzata (oggetto JSON o letterale in stile JS)
- `--lang <code>`: lingua di output (attualmente solo `en` e `cn`, predefinita: `cn`)
- `-d, --digits <count>`: numero di cifre preferito per la porta (4 o 5, predefinito: 4)
- `--padding-zero <true|false>`: riempie con zeri finali fino al numero di cifre preferito quando l'input è breve (predefinito: true). Ad esempio `"air"` -> `1840`, `"1234" --digits 5` -> `12340`
- `-h, --help`: mostra l'aiuto

Esempi:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta a 4 cifre)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta a 5 cifre)
```

Note:
- La lingua predefinita dei log è `cn`. Usa `--lang en` per mostrare i messaggi in inglese.
- Usa `-h` o `--help` per mostrare l'aiuto.

### Configurazione

PortKey legge la configurazione utente opzionale da:

- `~/.port-key/config.json`

Un esempio completo:

```json
{
  // Numero di cifre preferito per la porta (4 o 5)
  "preferDigitCount": 5,
  // Riempie con zeri finali fino al numero di cifre preferito quando l'input è breve (predefinito: true)
  "paddingZero": true,
  // Mappatura personalizzata lettera-cifra
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limiti dell'intervallo di porte (inclusi)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Per gli sviluppatori

### Struttura del progetto

- Questo repository usa un monorepo pnpm; il pacchetto principale si trova in `packages/core`.
- Installazione: esegui `pnpm install` nella radice.
- Eseguire i test: `pnpm -C packages/core test` oppure `pnpm -C packages/core test:watch`.
