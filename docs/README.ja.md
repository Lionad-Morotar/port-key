<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：シンプルで実用的なポート命名戦略</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## 概要

キーボードの文字と数字のマッピングでポートを生成する

ローカルでたくさんのプロジェクトを動かしていると、ポート番号を選ぶのが面倒になってきます。

- ここ数年で新しいプロジェクトが*とても*増えました。実際に試すにはローカルで起動する必要があることが多く、そうするとポートの衝突が起き始めます。
- ブラウザのタブ（やブックマーク）を安定させたいなら、プロジェクトのポートが変わり続けるべきではありません。

たとえば、私のマシンには 10 個以上の Nuxt アプリがあります。全部がデフォルトで `3000` を使うと、明らかにうまくいきません。そこで、プロジェクトごとにポートを「割り当てる」ためのシンプルで一貫したポート命名ルールを考えました。

[元のブログ記事](https://lionad.art/articles/simple-naming-method)

### 基本的な考え方

ランダムな数字を選ぶ代わりに、**プロジェクト名をキーボードに基づいて数字にマッピング**することで、ポートを*読みやすく*、*覚えやすく*します。

結果が有効なポート範囲（**1024–65535**）内に収まり、予約ポートやシステムポートにぶつからなければ、そのまま使えます。

具体的には、標準的な QWERTY キーボードを使い、各文字をその**行と列の位置**に基づいて 1 桁の数字にマッピングします。

例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（ポート番号）

その後、最初の 4 桁（例：`3453`）を使っても、より多くの桁（例：`34353`）を残しても構いません。どちらでも問題ありません。

プロジェクトが複数のポート（フロントエンド、バックエンド、データベースなど）を必要とする場合は、次の 2 つのアプローチの**どちらか**を選びます。

1. プロジェクト名のプレフィックスに「役割サフィックス」を付加する
   - `"cfetch"` の場合、`3435` をベースとして使う
   - フロントエンド（`fe`、つまり `43`）→ `34354`
   - バックエンド（`server`）→ `34352`
   - データベース（`mongo`）→ `34357`
   - ……以下同様

2. プロジェクト名のプレフィックスに、連番で役割を割り当てる
   - `"cfetch"` の場合、`3435` をベースとして使う
   - Web → `34351`
   - バックエンド → `34352`
   - データベース → `34353`
   - ……以下同様

### 有効なポート範囲

- ポートは **1024–65535** の範囲内である必要があります（システムポート 0–1023 は禁止されています）。
- **システムポート（0–1023）**：IETF が割り当て。厳格に禁止されています。
- **ユーザーポート（1024–49151）**：IANA が割り当て。登録済みサービスと競合する可能性があるため、慎重に使用してください。
- **動的／プライベートポート（49152–65535）**：未割り当て。プライベート用途や動的用途に最も安全です。

---

## 使い方

シンプルなコマンド：

```sh
npx -y @lionad/port-key <your-project-name>
```

あるいは stdio MCP サーバーが必要な場合：

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


### CLI オプション

- `-m, --map <object>`：カスタムマッピング（JSON または JS 風のオブジェクトリテラル）
- `--lang <code>`：出力言語（現在は `en` と `cn` のみ、デフォルト：`cn`）
- `-d, --digits <count>`：ポートの桁数の希望（4 または 5、デフォルト：4）
- `--padding-zero <true|false>`：入力が短い場合に末尾のゼロで希望の桁数に埋める（デフォルト：true）。例：`"air"` → `1840`、`"1234" --digits 5` → `12340`
- `-h, --help`：ヘルプを表示

例：

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435（4 桁のポート）
npx @lionad/port-key cfetch --digits 5  # -> 34353（5 桁のポート）
```

注意：
- デフォルトのログ言語は `cn` です。英語のメッセージを表示するには `--lang en` を使ってください。
- ヘルプを表示するには `-h` または `--help` を使ってください。

### 設定

PortKey は次の場所から任意のユーザー設定を読み込みます。

- `~/.port-key/config.json`

完全な例：

```json
{
  // ポートの桁数の希望（4 または 5）
  "preferDigitCount": 5,
  // 入力が短い場合に末尾のゼロで希望の桁数に埋める（デフォルト：true）
  "paddingZero": true,
  // カスタムの文字から数字へのマッピング
  "blockedPorts": [3000, 3001, 3002, 6666],
  // ポート範囲の制限（両端を含む）
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 開発者向け

### プロジェクト構成

- このリポジトリは pnpm monorepo を採用しています。コアパッケージは `packages/core` にあります。
- インストール：ルートディレクトリで `pnpm install` を実行します。
- テストの実行：`pnpm -C packages/core test` または `pnpm -C packages/core test:watch`。
