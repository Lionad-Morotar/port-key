<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Uma Estratégia Simples e Prática de Nomeação de Portas</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumo

Gere portas usando um mapeamento de tecla letra‑número

Ao executar vários projetos localmente, escolher números de porta pode se tornar incômodo.

- Nos últimos anos surgiram *tantos* novos projetos. Para testá‑los, costuma‑se precisar iniciá‑los localmente — e as portas começam a colidir.
- Se você deseja que as abas do navegador (ou favoritos) permaneçam estáveis, a porta de um projeto não deve mudar constantemente.

Por exemplo, tenho mais de dez aplicativos Nuxt na minha máquina. Se todos usarem a porta padrão `3000`, obviamente isso não funciona. Assim, criei uma regra simples e consistente de nomeação de portas para “atribuir” portas por projeto.

[Postagem original no blog](https://lionad.art/articles/simple-naming-method)

### Ideia central

Em vez de escolher números aleatórios, mapeie **o nome do projeto para números com base no teclado**, de modo que a porta seja *legível* e *memorável*.

Desde que o resultado esteja dentro da faixa válida de portas (**1024–65535**) e não colida com portas reservadas/sistema, você pode usá‑lo diretamente.

Mais especificamente: usando um teclado QWERTY padrão, atribua a cada letra um único dígito de acordo com sua **posição na linha/coluna**.

Exemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353` (número da porta)

Então você pode pegar os primeiros 4 dígitos (ex.: `3453`) ou manter mais dígitos (ex.: `34353`). Ambos são válidos.

Se um projeto precisar de múltiplas portas (frontend, backend, banco de dados etc.), escolha **uma** das duas abordagens a seguir:

1. Use o prefixo do projeto e adicione um “sufixo de função”  
   - Para `"cfetch"`, use `3435` como base  
   - Frontend (`fe`, ou seja, `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Banco de dados (`mongo`) → `34357`  
   - … e assim por diante

2. Use o prefixo do projeto e atribua funções sequencialmente  
   - Para `"cfetch"`, use `3435` como base  
   - Web → `34351`  
   - Backend → `34352`  
   - Banco de dados → `34353`  
   - … e assim por diante

### Faixa válida de portas

- As portas devem estar entre **1024–65535** (as portas do Sistema 0‑1023 são bloqueadas).
- **Portas de Sistema (0‑1023)**: atribuídas pelo IETF. Estritamente bloqueadas.
- **Portas de Usuário (1024‑49151)**: atribuídas pela IANA. Use com cautela, pois podem conflitar com serviços registrados.
- **Portas Dinâmicas/Privadas (49152‑65535)**: não atribuídas. As mais seguras para uso privado ou dinâmico.

---

## Como usar

Comando simples:

```sh
npx -y @lionad/port-key <nome-do-seu-projeto>
```

Ou se quiser um servidor MCP via stdio:

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

### Opções de CLI

- `-m, --map <object>`: mapeamento personalizado (JSON ou objeto literal estilo JS)
- `--lang <code>`: idioma de saída (atualmente apenas `en` e `cn`, padrão: `cn`)
- `-d, --digits <count>`: número preferido de dígitos para a porta (4 ou 5, padrão: 4)
- `-h, --help`: exibir ajuda

Exemplos:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta de 4 dígitos)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta de 5 dígitos)
```

Observações:
- O idioma padrão dos logs é `cn`. Use `--lang en` para exibir mensagens em inglês.
- Use `-h` ou `--help` para mostrar a ajuda.

### Configuração

PortKey lê configuração opcional do usuário em:

- `~/.port-key/config.json`

Um exemplo completo:

```json
{
  // Número preferido de dígitos para a porta (4 ou 5)
  "preferDigitCount": 5,
  // Mapeamento letra‑para‑dígito customizado
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites da faixa de portas (inclusivo)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Para desenvolvedores

### Estrutura do Projeto

- Este repositório usa monorepo pnpm; o pacote principal está em `packages/core`.
- Instalação: execute `pnpm install` na raiz do diretório.
- Executar testes: `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
