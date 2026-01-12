<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Uma Estratégia Simples e Prática para Nomeação de Portas</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumo

Gerar portas usando um mapeamento de letras para números baseado no teclado.

Quando você está executando vários projetos localmente, escolher números de porta pode ser complicado.

- Nos últimos anos surgiram *tantos* novos projetos. Para realmente testá‑los, muitas vezes você precisa iniciá‑los localmente — e então as portas começam a colidir.
- Se quiser manter as guias do navegador (ou favoritos) estáveis, a porta de um projeto não deve mudar constantemente.

Por exemplo, eu tenho mais de dez aplicativos Nuxt na minha máquina. Se todos eles usarem a porta padrão `3000`, obviamente não vai funcionar. Por isso criei uma regra simples e consistente de nomeação de portas para “atribuir” portas por projeto.

[Postagem original no blog](https://lionad.art/articles/simple-naming-method)

### Ideia principal

Em vez de escolher números aleatórios, mapeie o **nome do projeto para números com base no teclado**, de modo que a porta seja *legível* e *memorizável*.

Desde que o resultado esteja dentro da faixa válida de portas (**0–65535**) e não colida com portas reservadas/sistema, ele pode ser usado diretamente.

Mais especificamente: usando um teclado QWERTY padrão, associe cada letra a um único dígito de acordo com sua **posição na linha/coluna**.

Exemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（número da porta）

Então você pode usar os primeiros 4 dígitos (por exemplo `3453`) ou manter mais dígitos (por exemplo `34353`). Ambos são válidos.

Se um projeto precisar de várias portas (frontend, backend, banco de dados etc.), escolha **uma** das duas abordagens a seguir:

1. Use o prefixo do projeto e, em seguida, adicione um “sufixo de função”  
   - Para `"cfetch"`, tome `3435` como base  
   - Frontend (`fe`, ou seja, `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Banco de dados (`mongo`) → `34357`  
   - …e assim por diante

2. Use o prefixo do projeto e, então, atribua funções sequencialmente  
   - Para `"cfetch"`, tome `3435` como base  
   - Web → `34351`  
   - Backend → `34352`  
   - Banco de dados → `34353`  
   - …e assim por diante

### Faixa válida de portas

- As portas devem estar entre **0–65535**.  
- Para serviços personalizados, costuma ser melhor usar a faixa **1024–49151** (não reservada) ou **49152–65535** (privada/dinâmica).  
- Desde que o número mapeado fique dentro do limite, ele é válido.

---

## Como usar

```bash
npx @lionad/port-key <nome-do-seu-projeto>
```

### Opções da CLI

- `-m, --map <object>`: mapeamento personalizado (JSON ou literal de objeto JavaScript)  
- `--lang <code>`: idioma da saída (atualmente apenas `en` e `cn`, padrão: `cn`)  
- `-d, --digits <count>`: quantidade de dígitos desejada para a porta (4 ou 5, padrão: 4)  
- `-h, --help`: exibir ajuda

Exemplos:

```bash
npx @lionad/port-key cfetch      # → 3435
npx @lionad/port-key cfetch --digits 4   # → 3435 (porta de 4 dígitos)
npx @lionad/port-key cfetch --digits 5   # → 34353 (porta de 5 dígitos)
```

Observações:  
- O idioma padrão dos logs é `cn`. Use `--lang en` para exibir mensagens em inglês.  
- Use `-h` ou `--help` para mostrar a ajuda.

### Configuração

PortKey lê uma configuração opcional do usuário em:

- `~/.port-key/config.json`

Um exemplo completo:

```json
{
  // Quantidade preferida de dígitos para a porta (4 ou 5)
  "preferDigitCount": 5,
  // Mapeamento personalizado de letra para dígito
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Limites da faixa de portas (inclusive)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Para Desenvolvedores

### Estrutura do Projeto

- Este repositório usa um monorepo gerenciado por pnpm; o pacote central está em `packages/core`.  
- Instalação: execute `pnpm install` na raiz do projeto.  
- Executar testes: `pnpm -C packages/core test` ou `pnpm -C packages/core test:watch`.
