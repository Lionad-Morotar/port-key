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

Genera porte mediante una mappatura da lettere a numeri della tastiera.

Quando gestisci diversi progetti localmente, scegliere i numeri di porta può diventare un vero fastidio.

- Negli ultimi anni sono comparsi *tanti* nuovi progetti. Per provarli realmente, spesso è necessario avviarli in locale—e allora le porte cominciano a sovrapporsi.
- Se vuoi mantenere stabile la barra degli indirizzi del browser (o i segnalibri), la porta di un progetto non dovrebbe cambiare continuamente.

Ad esempio, ho più di dieci applicazioni Nuxt sulla mia macchina. Se tutte usassero la porta predefinita `3000`, chiaramente non funzionerebbe. Perciò ho ideato una regola semplice e coerente per “assegnare” porte a ciascun progetto.

[Articolo del blog originale](https://lionad.art/articles/simple-naming-method)

### Idea principale

Invece di scegliere numeri a caso, mappa il **nome del progetto a numeri basati sulla tastiera**, così la porta risulta *leggibile* e *memorizzabile*.

Finché il risultato è compreso nell’intervallo valido delle porte (**0–65535**) e non coincide con porte riservate o di sistema, può essere usato direttamente.

Più precisamente: usando una tastiera QWERTY standard, associa ogni lettera a una singola cifra in base alla sua **posizione di riga/colonna**.

Esempio:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numero di porta）

Puoi prendere le prime 4 cifre (ad es. `3453`) o mantenere più cifre (ad es. `34353`). Entrambe le opzioni vanno bene.

Se un progetto richiede più porte (frontend, backend, database, ecc.), scegli **uno** di questi due approcci:

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

- Le porte devono trovarsi nell’intervallo **0–65535**.
- Per servizi personalizzati, di solito è meglio usare **1024–49151** (non riservate) o **49152–65535** (private/dynamic).
- Finché il numero mappato rimane sotto il limite, è considerato valido.

---

## Come usarlo

```bash
npx @lionad/port-key <nome-del-tuo-progetto>
```

### Opzioni della CLI

- `-m, --map <object>`: mappatura personalizzata (JSON o oggetto in stile JS)
- `--lang <code>`: lingua di output (attualmente solo `en` e `cn`, default: `cn`)
- `-d, --digits <count>`: numero di cifre preferito per la porta (4 o 5, default: 4)
- `-h, --help`: mostra l’aiuto

Esempi:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta a 4 cifre)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta a 5 cifre)
```

Note:
- La lingua predefinita del log è `cn`. Usa `--lang en` per visualizzare i messaggi in inglese.
- Usa `-h` o `--help` per visualizzare l’aiuto.

### Configurazione

PortKey legge una configurazione opzionale dell’utente da:

- `~/.port-key/config.json`

Un esempio completo:

```json
{
  // Numero di cifre preferito per la porta (4 o 5)
  "preferDigitCount": 5,
  // Mappatura personalizzata da lettere a cifre
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limiti dell’intervallo di porte (inclusivi)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Per gli sviluppatori

### Struttura del progetto

- Questo repository utilizza un monorepo pnpm; il pacchetto principale si trova in `packages/core`.
- Installazione: esegui `pnpm install` nella directory radice.
- Esecuzione dei test: `pnpm -C packages/core test` o `pnpm -C packages/core test:watch`.
