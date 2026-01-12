<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey : une stratégie simple et pratique de nommage des ports</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Bref

Générez des ports à l’aide d’une correspondance clavier lettre‑chiffre.

Lorsque vous exécutez plusieurs projets localement, choisir les numéros de port devient pénible.

- Au cours des dernières années, il y a eu **tant** de nouveaux projets. Pour les tester réellement, vous devez souvent les lancer localement – et les ports commencent à se chevaucher.
- Si vous voulez que les onglets (ou les favoris) du navigateur restent stables, le port d’un projet ne doit pas changer continuellement.

Par exemple, j’ai plus de dix applications Nuxt sur ma machine. Si elles utilisent toutes le port par défaut `3000`, cela ne fonctionnera évidemment pas. J’ai donc imaginé une règle simple et cohérente de nommage des ports pour « attribuer » un port à chaque projet.

[Article source du blog](https://lionad.art/articles/simple-naming-method)

### Idée principale

Au lieu de choisir des nombres aléatoires, mappez le **nom du projet à des chiffres selon le clavier**, de façon que le port soit *lisible* et *mémorisable*.

Tant que le résultat se situe dans la plage de ports valide (**1024–65535**) et n’entre pas en conflit avec les ports réservés/système, vous pouvez simplement l’utiliser.

Plus précisément : à l’aide d’un clavier QWERTY standard, associez chaque lettre à un chiffre unique basé sur sa **position ligne/colonne**.

Exemple :

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numéro de port）

Vous pouvez alors prendre les quatre premiers chiffres (par exemple `3453`) ou conserver davantage de chiffres (par exemple `34353`). Les deux options sont valides.

Si un projet nécessite plusieurs ports (frontend, backend, base de données, etc.), choisissez **l’une** des deux approches suivantes :

1. Utilisez le préfixe du projet, puis ajoutez un « suffixe de rôle »  
   - Pour `"cfetch"`, prenez `3435` comme base  
   - Frontend (`fe`, c’est‑à‑dire `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Base de données (`mongo`) → `34357`  
   - …etc.

2. Utilisez le préfixe du projet, puis attribuez des rôles séquentiels  
   - Pour `"cfetch"`, prenez `3435` comme base  
   - Web → `34351`  
   - Backend → `34352`  
   - Base de données → `34353`  
   - …etc.

### Plage de ports valide

- Les ports doivent être compris entre **1024 et 65535** (les ports système 0‑1023 sont bloqués).
- **Ports système (0‑1023)** : attribués par l’IETF. Strictement bloqués.
- **Ports utilisateur (1024‑49151)** : attribués par l’IANA. À utiliser avec précaution car ils peuvent entrer en conflit avec des services enregistrés.
- **Ports dynamiques/privés (49152‑65535)** : non attribués. Les plus sûrs pour un usage privé ou dynamique.

---

## Utilisation

Commande simple :

```sh
npx -y @lionad/port-key <nom-de-votre-projet>
```

Ou si vous voulez un serveur MCP stdio :

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
- `--lang <code>` : langue de sortie (actuellement uniquement `en` et `cn`, défaut : `cn`)
- `-d, --digits <count>` : nombre de chiffres souhaité pour le port (4 ou 5, défaut : 4)
- `--padding-zero <true|false>` : remplissage de zéro pour les ports courts (défaut : true). Exemple : « air » → 1840
- `-h, --help` : afficher l’aide

Exemples :

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (port à 4 chiffres)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (port à 5 chiffres)
```

Notes :
- La langue de journalisation par défaut est `cn`. Utilisez `--lang en` pour afficher les messages en anglais.
- Utilisez `-h` ou `--help` pour afficher l’aide.

### Configuration

PortKey lit une configuration utilisateur optionnelle depuis :

- `~/.port-key/config.json`

Exemple complet :

```json
{
  // Nombre de chiffres préféré pour le port (4 ou 5)
  "preferDigitCount": 5,
  // Remplir les ports courts avec zéro (défaut : true)
  "paddingZero": true,
  // Mappage personnalisé lettre‑chiffre
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites de la plage de ports (inclusives)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Pour les développeurs

### Structure du projet

- Ce dépôt utilise un monorepo pnpm ; le paquet cœur se trouve dans `packages/core`.
- Installation : exécutez `pnpm install` à la racine.
- Exécution des tests : `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
