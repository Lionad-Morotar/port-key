<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：シンプルで実用的なポート命名戦略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 概要

キー入力の文字と数字を対応させてポート番号を生成します。

ローカルで多数のプロジェクトを同時に動かすと、ポート番号の選択が面倒になります。

- 最近数年で新しいプロジェクトが**大量に**誕生しました。実際に試すにはローカルで起動する必要がありますが、するとポート番号が衝突しやすくなります。  
- ブラウザのタブやブックマークを安定させたい場合、プロジェクトごとのポートが頻繁に変わっては困ります。

たとえば、私のマシンには 10 個以上の Nuxt アプリがあります。すべてがデフォルトで `3000` を使用していたら、当然動作しません。そこで私は「プロジェクトごとにポートを割り当てる」シンプルで一貫した命名規則を考案しました。

[元記事](https://lionad.art/articles/simple-naming-method)

### 基本コンセプト

ランダムな数字を選ぶのではなく、**キーボード上の位置に基づいてプロジェクト名を数字列に変換**し、ポート番号を *読みやすく* かつ *覚えやすく* します。

変換結果が有効なポート範囲（**0〜65535**）に収まっていて、予約済み／システムポートと衝突しなければそのまま使用できます。

具体例（標準 QWERTY キーボードを想定）：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（ポート番号）

このうち先頭 4 桁（例：`3453`）だけ使用するか、5 桁すべて（例：`34353`）を使用しても構いません。

プロジェクトが複数のポート（フロントエンド、バックエンド、データベース等）を必要とする場合は、次の 2 つの方法のいずれかで「役割」ポートを決めます。

1. **プロジェクト接頭語＋ロールサフィックス**  
   - `"cfetch"` のベースは `3435`  
   - フロントエンド（`fe` → `43`） → `34354`  
   - バックエンド（`server`） → `34352`  
   - データベース（`mongo`） → `34357`  

2. **プロジェクト接頭語＋連番ロール**  
   - `"cfetch"` のベースは `3435`  
   - Web → `34351`  
   - Backend → `34352`  
   - Database → `34353`

### 有効なポート範囲

- ポート番号は **0〜65535** の範囲内でなければなりません。  
- カスタムサービスの場合、通常は **1024〜49151**（非予約）または **49152〜65535**（プライベート／動的）の範囲が推奨されます。  
- マッピング結果が上限未満であれば有効です。

---

## 使用方法

```bash
npx @lionad/port-key <your-project-name>
```

### CLI オプション

- `-m, --map <object>`: カスタムマッピング（JSON または JS ライクなオブジェクトリテラル）
- `--lang <code>`: 出力言語（現在は `en` と `cn` のみ、デフォルトは `cn`）
- `-d, --digits <count>`: ポートに使用する桁数（4 または 5、デフォルトは 4）
- `-h, --help`: ヘルプを表示

使用例：

```bash
npx @lionad/port-key cfetch          # -> 3435
npx @lionad/port-key cfetch --digits 4   # -> 3435（4 桁ポート）
npx @lionad/port-key cfetch --digits 5   # -> 34353（5 桁ポート）
```

補足:
- デフォルトのログ言語は `cn` です。英語メッセージを表示したい場合は `--lang en` を付けます。  
- ヘルプは `-h` または `--help` で確認できます。

### 設定

PortKey は以下のファイルからオプション設定を読み取ります（任意）:

- `~/.port-key/config.json`

設定例：

```json
{
  // ポートに使用する桁数（4 または 5）
  "preferDigitCount": 5,
  // カスタム文字→数字マッピング
  "blockedPorts": [3000, 3001, 3002, 6666],
  // ポート範囲の上下限（包括的）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 開発者向け

### プロジェクト構成

- 本リポジトリは pnpm の monorepo 形式です。コアパッケージは `packages/core` にあります。  
- インストール方法: ルートディレクトリで `pnpm install` を実行してください。  
- テストの実行: `pnpm -C packages/core test` または `pnpm -C packages/core test:watch`。
