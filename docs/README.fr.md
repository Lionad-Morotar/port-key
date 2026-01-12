<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey : une stratégie simple et pratique de nomination des ports</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Bref

Générez des ports à l’aide d’une correspondance lettre‑à‑chiffre du clavier

Lorsque vous exécutez plusieurs projets localement, choisir des numéros de port devient pénible.

- Au cours des dernières années, il y a eu *tant* de nouveaux projets. Pour les tester réellement, vous devez souvent les lancer localement — et les ports se chevauchent alors.
- Si vous souhaitez que les onglets du navigateur (ou les favoris) restent stables, le port d’un projet ne doit pas changer continuellement.

Par exemple, j’ai plus de dix applications Nuxt sur ma machine. Si elles utilisent toutes le port par défaut `3000`, cela ne fonctionnerait évidemment pas. J’ai donc inventé une règle simple et cohérente de nommage des ports pour « attribuer » un port à chaque projet.

[Article de blog source](https://lionad.art/articles/simple-naming-method)

### Idée principale

Au lieu de choisir des nombres aléatoires, mappez le **nom du projet à des chiffres selon la disposition du clavier**, de sorte que le port soit *lisible* et *mémorable*.

Du moment que le résultat se situe dans la plage de ports valide (**1024–65535**) et n’interfère pas avec les ports réservés/système, vous pouvez l’utiliser tel quel.

Plus précisément : en se basant sur un clavier QWERTY standard, chaque lettre est associée à un chiffre unique en fonction de sa **position ligne/colonne**.

Exemple  :

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numéro de port）

Vous pouvez alors prendre les 4 premiers chiffres (par ex. `3453`), ou conserver davantage de chiffres (par ex. `34353`). Les deux options sont valides.

Si un projet requiert plusieurs ports (frontend, backend, base de données, etc.), choisissez **l’une** des deux approches suivantes  :

1. Utilisez le préfixe du projet, puis ajoutez un « suffixe de rôle »  
   - Pour `"cfetch"`, prenez `3435` comme base  
   - Frontend (`fe`, c’est‑à‑dire `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Base de données (`mongo`) → `34357`  
   - …et ainsi de suite

2. Utilisez le préfixe du projet, puis attribuez des rôles séquentiels  
   - Pour `"cfetch"`, prenez `3435` comme base  
   - Web → `34351`  
   - Backend → `34352`  
   - Base de données → `34353`  
   - …et ainsi de suite

### Plage de ports valide

- Les ports doivent être compris entre **1024–65535** (les ports système 0‑1023 sont bloqués).
- **Ports système (0‑1023)** : assignés par l’IETF. Strictement bloqués.
- **Ports utilisateur (1024‑49151)** : assignés par l’IANA. À utiliser avec précaution car ils peuvent entrer en conflit avec des services enregistrés.
- **Ports dynamiques/privés (49152‑65535)** : non assignés. Les plus sûrs pour un usage privé ou dynamique.

---

## Utilisation

Commande simple  :

```sh
npx -y @lionad/port-key <nom-de-votre-projet>
```

Ou si vous voulez un serveur MCP stdio  :

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

### Options de la CLI

- `-m, --map <object>` : mappage personnalisé (JSON ou littéral d’objet JS)
- `--lang <code>` : langue de sortie (actuellement uniquement `en` et `cn`, par défaut : `cn`)
- `-d, --digits <count>` : nombre de chiffres souhaité pour le port (4 ou 5, défaut : 4)
- `-h, --help` : afficher l’aide

Exemples  :

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (port à 4 chiffres)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (port à 5 chiffres)
```

Remarques  :
- La langue de journalisation par défaut est `cn`. Utilisez `--lang en` pour afficher les messages en anglais.
- Utilisez `-h` ou `--help` pour afficher l’aide.

### Configuration

PortKey lit une configuration utilisateur optionnelle depuis  :

- `~/.port-key/config.json`

Un exemple complet  :

```json
{
  // Nombre de chiffres préféré pour le port (4 ou 5)
  "preferDigitCount": 5,
  // Mappage lettre‑à‑chiffre personnalisé
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites de la plage de ports (inclusif)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Pour les développeurs

### Structure du projet

- Ce dépôt utilise un monorepo pnpm ; le paquet principal se trouve dans `packages/core`。
- Installation : exécutez `pnpm install` à la racine du projet。
- Exécution des tests  : `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`。
