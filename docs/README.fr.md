<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey : une stratégie simple et pratique de nommage de ports</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Bref

Générer des ports grâce à une correspondance clavier lettre‑chiffre.

Lorsque vous exécutez plusieurs projets localement, choisir des numéros de port devient pénible.

- Au cours des dernières années, il y a eu *tant* de nouveaux projets. Pour les tester réellement, vous devez souvent les lancer localement — et alors les ports commencent à se chevaucher.
- Si vous voulez que les onglets du navigateur (ou vos signets) restent stables, le port d’un projet ne doit pas changer constamment.

Par exemple, j’ai plus de dix applications Nuxt sur ma machine. Si elles utilisent toutes le port par défaut `3000`, cela ne fonctionnera évidemment pas. J’ai donc imaginé une règle simple et cohérente de nomination des ports pour « attribuer » un port à chaque projet.

[Article du blog source](https://lionad.art/articles/simple-naming-method)

### Idée principale

Au lieu de choisir des nombres aléatoires, mapper le **nom du projet à des chiffres selon le clavier**, de sorte que le port soit *lisible* et *mémorisable*.

Tant que le résultat reste dans la plage de ports valide (**0–65535**) et n’empiète pas sur les ports réservés/systèmes, vous pouvez l’utiliser tel quel.

Plus précisément : en se basant sur un clavier QWERTY standard, chaque lettre est associée à un seul chiffre selon sa **position ligne/colonne**.

Exemple :

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（numéro de port）

Vous pouvez alors prendre les 4 premiers chiffres (par ex. `3453`), ou conserver plus de chiffres (par ex. `34353`). Les deux options sont valables.

Si un projet nécessite plusieurs ports (frontend, backend, base de données, etc.), choisissez **l’une** des deux approches :

1. Utiliser le préfixe du projet, puis ajouter un « suffixe de rôle »  
   - Pour `"cfetch"`, prendre `3435` comme base  
   - Frontend (`fe`, c’est‑à‑dire `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Base de données (`mongo`) → `34357`  
   - …etc.

2. Utiliser le préfixe du projet, puis attribuer des rôles séquentiels  
   - Pour `"cfetch"`, prendre `3435` comme base  
   - Web → `34351`  
   - Backend → `34352`  
   - Base de données → `34353`  
   - …etc.

### Plage de ports valide

- Les ports doivent être compris entre **0 et 65535**.
- Pour les services personnalisés, il est généralement préférable d’utiliser la plage **1024–49151** (non réservée) ou **49152–65535** (privé/dynamique).
- Tant que le nombre mappé reste en dessous de la limite, il est valide.

---

## Comment l’utiliser

```bash
npx @lionad/port-key <nom-de-votre-projet>
```

### Options de la CLI

- `-m, --map <object>` : mappage personnalisé (objet JSON ou littéral de type JS)
- `--lang <code>` : langue de sortie (actuellement uniquement `en` et `cn`, par défaut : `cn`)
- `-d, --digits <count>` : nombre de chiffres souhaité pour le port (4 ou 5, défaut : 4)
- `-h, --help` : afficher l’aide

Exemples :

```bash
npx @lionad/port-key cfetch # → 3435
npx @lionad/port-key cfetch --digits 4  # → 3435 (port à 4 chiffres)
npx @lionad/port-key cfetch --digits 5  # → 34353 (port à 5 chiffres)
```

Notes :
- La langue de journal par défaut est `cn`. Utilisez `--lang en` pour afficher les messages en anglais.
- Utilisez `-h` ou `--help` pour voir l’aide.

### Configuration

PortKey peut lire une configuration utilisateur optionnelle depuis :

- `~/.port-key/config.json`

Exemple complet :

```json
{
  // Nombre de chiffres préféré pour le port (4 ou 5)
  "preferDigitCount": 5,
  // Mappage lettre‑chiffre personnalisé
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites de la plage de ports (inclusif)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Pour les développeurs

### Structure du projet

- Ce dépôt utilise un monorepo pnpm ; le package central se trouve dans `packages/core`.
- Installation : exécutez `pnpm install` à la racine du projet.
- Lancer les tests : `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
