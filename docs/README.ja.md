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

文字から数字へのキーボードマッピングでポート番号を生成します。

ローカルで多数のプロジェクトを実行するとき、ポート番号の選択は面倒です。

- 近年、プロジェクトが**非常に多く**なっています。実際に試すにはローカルで起動する必要があり、ポート番号が衝突しやすくなります。
- ブラウザのタブ（またはブックマーク）を安定させたい場合、プロジェクトのポート番号は変わってはいけません。

たとえば、私のマシンには10以上の Nuxt アプリがあり、すべてがデフォルトで `3000` を使用すると明らかに動作しません。そこで、プロジェクトごとに**一貫したポート命名ルール**を考案しました。

[ソースブログ記事](https://lionad.art/articles/simple-naming-method)

### 基本コンセプト

ランダムな数字を選ぶのではなく、**キーボード上の位置に基づいてプロジェクト名を数字へマッピング**します。これによりポート番号は*読みやすく*、かつ*覚えやすい*ものになります。

結果が有効なポート範囲（**1024–65535**）に収まり、予約済みやシステムポートと衝突しなければ、そのまま使用できます。

具体的には、標準 QWERTY キーボードを用いて、各文字を**行/列の位置に対応する一桁の数字**へ変換します。

例：

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（ポート番号）

ここから先頭の 4 桁だけを取っても（例：`3453`）、全桁を使用しても構いません。

プロジェクトが複数のポート（フロントエンド、バックエンド、データベースなど）を必要とする場合は、次の **2 つの方法** のいずれかを選びます。

1. プロジェクト接頭辞に「役割サフィックス」を付加  
   - `"cfetch"` の場合、ベースは `3435`  
   - フロントエンド（`fe` → `43`）→ `34354`  
   - バックエンド（`server`）→ `34352`  
   - データベース（`mongo`）→ `34357`  

2. プロジェクト接頭辞に**シーケンシャルな役割番号**を付与  
   - `"cfetch"` の場合、ベースは `3435`  
   - Web → `34351`  
   - Backend → `34352`  
   - Database → `34353`

### 有効なポート範囲

- ポートは **1024–65535** の間でなければなりません（システムポート 0‑1023 は使用不可）。
- **システムポート (0‑1023)**：IETF によって割り当てられ、使用禁止。
- **ユーザーポート (1024‑49151)**：IANA によって割り当てられるが、登録済みサービスと衝突する可能性があるため注意。
- **動的/プライベートポート (49152‑65535)**：割り当てなし。プライベートまたは動的利用に最も安全。

---

## 使用方法

簡単なコマンド:

```sh
npx -y @lionad/port-key <your-project-name>
```

または、標準入出力（stdio）MCP サーバーを利用したい場合:

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

- `-m, --map <object>`: カスタムマッピング（JSON または JS ライクオブジェクトリテラル）
- `--lang <code>`: 出力言語（現在は `en` と `cn` のみ、デフォルトは `cn`）
- `-d, --digits <count>`: ポートの桁数（4 または 5、デフォルトは 4）
- `--padding-zero <true|false>`: 短いポート番号をゼロ埋めするか（デフォルト: true）。例: `"air"` → `1840`
- `-h, --help`: ヘルプを表示

使用例:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4 桁ポート)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5 桁ポート)
```

補足:
- デフォルトのログ言語は `cn` です。英語メッセージを表示したい場合は `--lang en` を使用してください。
- ヘルプを見るには `-h` または `--help` を使用します。

### 設定

PortKey は次の場所からオプション設定を読み取ります:

- `~/.port-key/config.json`

例（フル構成）:

```json
{
  // ポートの桁数の優先設定 (4 または 5)
  "preferDigitCount": 5,
  // 短いポート番号をゼロ埋めするか (デフォルト: true)
  "paddingZero": true,
  // カスタム文字→数字マッピング
  "blockedPorts": [3000, 3001, 3002, 6666],
  // ポート範囲の上限・下限 (包括的)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## 開発者向け

### プロジェクト構造

- 本リポジトリは pnpm monorepo 形式です。コアパッケージは `packages/core` にあります。
- インストール: ルートディレクトリで `pnpm install` を実行してください。
- テスト実行: `pnpm -C packages/core test` または `pnpm -C packages/core test:watch`。
