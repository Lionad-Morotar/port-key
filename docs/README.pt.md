<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: uma estratégia simples e prática de nomeação de portas</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumo

Gera portas com um mapeamento letra-para-número baseado no teclado

Quando estás a executar vários projetos localmente, escolher números de porta torna-se aborrecido.

- Nos últimos anos, surgiram *muitos* projetos novos. Para os experimentares a sério, muitas vezes precisas de os iniciar localmente — e é aí que as portas começam a colidir.
- Se quiseres manter os separadores do navegador (ou marcadores) estáveis, a porta de um projeto não deve estar sempre a mudar.

Por exemplo, tenho mais de dez aplicações Nuxt na minha máquina. Se todas usarem `3000` por predefinição, obviamente não vai funcionar. Por isso criei uma regra simples e consistente de nomeação de portas para "atribuir" portas por projeto.

[Artigo original no blogue](https://lionad.art/articles/simple-naming-method)

### Ideia central

Em vez de escolher números aleatórios, mapeia o **nome do projeto para números com base no teclado**, para que a porta seja *legível* e *memorável*.

Desde que o resultado esteja dentro do intervalo de portas válido (**1024–65535**) e não colida com portas reservadas/do sistema, podes usá-la diretamente.

Mais especificamente: usando um teclado QWERTY padrão, mapeia cada letra para um único dígito com base na sua **posição linha/coluna**.

Exemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（número da porta）

Depois podes usar os primeiros 4 dígitos (por exemplo `3453`), ou manter mais dígitos (por exemplo `34353`). Qualquer um serve.

Se um projeto precisar de várias portas (frontend, backend, base de dados, etc.), escolhe **uma** destas duas abordagens:

1. Usa o prefixo do projeto e depois anexa um "sufixo de papel"
   - Para `"cfetch"`, usa `3435` como base
   - Frontend (`fe`, ou seja `43`) → `34354`
   - Backend (`server`) → `34352`
   - Base de dados (`mongo`) → `34357`
   - …e por aí fora

2. Usa o prefixo do projeto e depois atribui papéis sequenciais
   - Para `"cfetch"`, usa `3435` como base
   - Web → `34351`
   - Backend → `34352`
   - Base de dados → `34353`
   - …e por aí fora

### Intervalo de portas válido

- As portas têm de estar dentro de **1024–65535** (as portas de sistema 0–1023 estão bloqueadas).
- **Portas de sistema (0–1023)**: atribuídas pela IETF. Estritamente bloqueadas.
- **Portas de utilizador (1024–49151)**: atribuídas pela IANA. Usa com cautela, pois podem entrar em conflito com serviços registados.
- **Portas dinâmicas/privadas (49152–65535)**: não atribuídas. As mais seguras para uso privado ou dinâmico.

---

## Como usar

Comando simples:

```sh
npx -y @lionad/port-key <your-project-name>
```

Ou, se quiseres um servidor MCP via stdio:

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


### Opções da CLI

- `-m, --map <object>`: mapeamento personalizado (objeto JSON ou literal estilo JS)
- `--lang <code>`: idioma da saída (atualmente apenas `en` e `cn`, predefinição: `cn`)
- `-d, --digits <count>`: número de dígitos preferido para a porta (4 ou 5, predefinição: 4)
- `--padding-zero <true|false>`: preenche com zeros à direita até ao número de dígitos preferido quando a entrada é curta (predefinição: true). Por exemplo, `"air"` -> `1840`, `"1234" --digits 5` -> `12340`
- `-h, --help`: mostra a ajuda

Exemplos:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (porta de 4 dígitos)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (porta de 5 dígitos)
```

Notas:
- O idioma predefinido dos logs é `cn`. Usa `--lang en` para mostrar mensagens em inglês.
- Usa `-h` ou `--help` para mostrar a ajuda.

### Configuração

O PortKey lê a configuração opcional do utilizador a partir de:

- `~/.port-key/config.json`

Um exemplo completo:

```json
{
  // Número de dígitos preferido para a porta (4 ou 5)
  "preferDigitCount": 5,
  // Preenche com zeros à direita até ao número de dígitos preferido quando a entrada é curta (predefinição: true)
  "paddingZero": true,
  // Mapeamento personalizado de letra para dígito
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites do intervalo de portas (inclusive)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Para programadores

### Estrutura do projeto

- Este repositório usa um monorepo pnpm; o pacote principal está em `packages/core`.
- Instalação: executa `pnpm install` na raiz.
- Executar os testes: `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
