<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey : Une stratégie de nommage de ports simple et pratique</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Présentation

Génère des ports grâce à un mappage lettres-chiffres basé sur le clavier

Lorsque vous exécutez plusieurs projets localement, choisir des numéros de port devient fastidieux.

- Ces dernières années, il y a eu *tellement* de nouveaux projets. Pour les essayer réellement, il faut souvent les démarrer localement — et alors les ports commencent à entrer en conflit.
- Si vous voulez garder les onglets du navigateur (ou les favoris) stables, le port d'un projet ne devrait pas changer constamment.

Par exemple, j'ai plus de dix applications Nuxt sur ma machine. Si elles utilisent toutes `3000` par défaut, cela ne fonctionnera évidemment pas. J'ai donc imaginé une règle de nommage de ports simple et cohérente pour « attribuer » des ports par projet.

[Article de blog original](https://lionad.art/articles/simple-naming-method)

### Idée principale

Plutôt que de choisir des nombres au hasard, mappez le **nom du projet sur des chiffres en fonction du clavier**, afin que le port soit *lisible* et *mémorable*.

Tant que le résultat se situe dans la plage de ports valide (**1024–65535**) et ne touche pas les ports réservés ou système, vous pouvez l'utiliser directement.

Plus précisément : en utilisant un clavier QWERTY standard, mappez chaque lettre sur un seul chiffre en fonction de sa **position ligne/colonne**.

Exemple :

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353` (numéro de port)

Vous pouvez ensuite prendre les 4 premiers chiffres (p. ex. `3453`), ou conserver plus de chiffres (p. ex. `34353`). Les deux conviennent.

Si un projet nécessite plusieurs ports (frontend, backend, base de données, etc.), choisissez **l'une** de ces deux approches :

1. Utilisez le préfixe du projet, puis ajoutez un « suffixe de rôle »
   - Pour `"cfetch"`, prenez `3435` comme base
   - Frontend (`fe`, c'est-à-dire `43`) → `34354`
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

- Les ports doivent être compris entre **1024 et 65535** (les ports système 0-1023 sont bloqués).
- **Ports système (0-1023)** : Attribués par l'IETF. Strictement bloqués.
- **Ports utilisateur (1024-49151)** : Attribués par l'IANA. À utiliser avec prudence, car ils peuvent entrer en conflit avec des services enregistrés.
- **Ports dynamiques/privés (49152-65535)** : Non attribués. Les plus sûrs pour un usage privé ou dynamique.

---

## Comment utiliser

Commande simple :

```sh
npx -y @lionad/port-key <your-project-name>
```

Ou si vous souhaitez un serveur MCP stdio :

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


### Options CLI

- `-m, --map <object>` : mappage personnalisé (littéral d'objet JSON ou similaire à JS)
- `--lang <code>` : langue de sortie (actuellement uniquement `en` et `cn`, par défaut : `cn`)
- `-d, --digits <count>` : nombre préféré de chiffres pour le port (4 ou 5, par défaut : 4)
- `--padding-zero <true|false>` : Remplit avec des zéros à la fin jusqu'au nombre préféré de chiffres lorsque l'entrée est courte (par défaut : true). p. ex. `"air"` -> `1840`, `"1234" --digits 5` -> `12340`
- `-h, --help` : afficher l'aide

Exemples :

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (port à 4 chiffres)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (port à 5 chiffres)
```

Remarques :
- La langue de journalisation par défaut est `cn`. Utilisez `--lang en` pour afficher les messages en anglais.
- Utilisez `-h` ou `--help` pour afficher l'aide.

### Configuration

PortKey lit la configuration utilisateur optionnelle depuis :

- `~/.port-key/config.json`

Un exemple complet :

```json
{
  // Nombre préféré de chiffres pour le port (4 ou 5)
  "preferDigitCount": 5,
  // Remplit avec des zéros à la fin jusqu'au nombre préféré de chiffres lorsque l'entrée est courte (par défaut : true)
  "paddingZero": true,
  // Mappage personnalisé lettre-chiffre
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites de la plage de ports (inclusif)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Pour les développeurs

### Structure du projet

- Ce dépôt utilise pnpm monorepo ; le paquet principal se trouve dans `packages/core`.
- Installation : exécutez `pnpm install` dans le répertoire racine.
- Exécuter les tests : `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
