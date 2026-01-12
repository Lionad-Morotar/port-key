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

キーボードの文字と数字を対応させてポート番号を生成します  

ローカルで多数のプロジェクトを実行すると、ポート番号の選択が面倒になります。  

- 近年、プロジェクトが非常に増えており、実際に試すにはローカルで起動する必要がありますが、その結果ポート番号が衝突します。  
- ブラウザのタブ（またはブックマーク）を安定させたい場合、プロジェクトのポートが頻繁に変わっては困ります。  

たとえば、私のマシンには 10 個以上の Nuxt アプリがありますが、すべてがデフォルトで `3000` になると明らかに動作しません。そこで、プロジェクトごとに「ポートを割り当てる」シンプルで一貫した命名規則を考案しました。  

[Source Blog Post](https://lionad.art/articles/simple-naming-method)  

### 基本概念  

ランダムな数字を選ぶ代わりに、**プロジェクト名をキーボード上の位置に基づく数字列へマッピング**し、ポート番号を *読みやすく*、*覚えやすく* します。  

結果が有効なポート範囲（**1024–65535**）内に収まり、予約済み/システムポートと衝突しなければ、そのまま使用できます。  

具体的には、標準 QWERTY キーボードの行・列位置に基づき各文字を 1 桁の数字へ変換します。  

例:  

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（ポート番号）  

最初の 4 桁だけ（例: `3453`）を使用するか、全桁（例: `34353`）でも構いません。  

プロジェクトが複数のポート（フロントエンド、バックエンド、データベース等）を必要とする場合は、次の 2 つの方法のうちどれかを選びます。  

1. プロジェクト接頭辞に「役割サフィックス」を付加  
   - `"cfetch"` の場合、ベースとして `3435` を取得  
   - フロントエンド (`fe`, つまり `43`) → `34354`  
   - バックエンド (`server`) → `34352`  
   - データベース (`mongo`) → `34357`  

2. プロジェクト接頭辞に連番で役割を割り当て  
   - `"cfetch"` の場合、ベースとして `3435` を取得  
   - Web → `34351`  
   - バックエンド → `34352`  
   - データベース → `34353`  

### 有効なポート範囲  

- ポートは **1024–65535** の範囲内である必要があります（システムポート 0‑1023 はブロック）。  
- **システムポート (0‑1023)**: IETF により割り当てられ、厳密にブロック。  
- **ユーザーポート (1024‑49151)**: IANA により割り当てられ、登録サービスと衝突する可能性があるため注意。  
- **動的/プライベートポート (49152‑65535)**: 割り当てられていない。プライベートまたは動的使用に最も安全。  

---  

## 使い方  

シンプルなコマンド:  

```sh
npx -y @lionad/port-key <your-project-name>
```  

あるいは stdio MCP サーバーが欲しい場合:  

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

- `-m, --map <object>`: カスタムマッピング（JSON または JS ライクリテラル）  
- `--lang <code>`: 出力言語（現在は `en` と `cn` のみ、デフォルト: `cn`）  
- `-d, --digits <count>`: ポートの桁数（4 または 5、デフォルト: 4）  
- `-h, --help`: ヘルプを表示  

例:  

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4 桁ポート)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5 桁ポート)
```  

補足:  
- デフォルトのログ言語は `cn` です。英語メッセージを表示したい場合は `--lang en` を使用してください。  
- `-h` または `--help` でヘルプを表示できます。  

### 設定  

PortKey は以下の場所からオプション設定を読み取ります:  

- `~/.port-key/config.json`  

完全な例:  

```json
{
  // ポートの希望桁数 (4 または 5)
  "preferDigitCount": 5,
  // カスタム文字→数字マッピング
  "blockedPorts": [3000, 3001, 3002, 6666],
  // ポート範囲の上下限 (inclusive)
  "minPort": 1024,
  "maxPort": 49151
}
```  

---  

## 開発者向け  

### プロジェクト構造  

- 本リポジトリは pnpm monorepo 方式で管理されており、コアパッケージは `packages/core` にあります。  
- インストール: ルートディレクトリで `pnpm install` を実行。  
- テスト実行: `pnpm -C packages/core test` または `pnpm -C packages/core test:watch`。
