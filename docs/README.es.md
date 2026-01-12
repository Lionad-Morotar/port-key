<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：Una estrategia simple y práctica para nombrar puertos</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumen

Generar puertos mediante un mapeo de letras a números del teclado.

Cuando ejecutas varios proyectos localmente, elegir números de puerto se vuelve molesto.

- En los últimos años han surgido *tantos* nuevos proyectos. Para probarlos realmente, a menudo necesitas iniciarlos localmente—y entonces los puertos empiezan a colisionar.
- Si deseas que las pestañas del navegador (o marcadores) permanezcan estables, el puerto de un proyecto no debería cambiar constantemente.

Por ejemplo, tengo más de diez aplicaciones Nuxt en mi máquina. Si todas usan `3000` por defecto, obviamente no funcionará. Así que ideé una regla simple y consistente para nombrar puertos por proyecto.

[Publicación original del blog](https://lionad.art/articles/simple-naming-method)

### Idea principal

En lugar de elegir números aleatorios, asigna el **nombre del proyecto a números basados en el teclado**, de modo que el puerto sea *legible* y *memorable*.

Mientras el resultado esté dentro del rango de puertos válidos (**1024–65535**) y no choque con puertos reservados/sistema, puedes usarlo directamente.

Más concretamente: usando un teclado QWERTY estándar, asigna a cada letra un único dígito según su **posición de fila/columna**.

Ejemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（número de puerto）

Luego puedes tomar los primeros 4 dígitos (p. ej., `3453`) o conservar más dígitos (p. ej., `34353`). Cualquiera está bien.

Si un proyecto necesita varios puertos (frontend, backend, base de datos, etc.), elige **una** de estas dos formas:

1. Usa el prefijo del proyecto y luego agrega un “sufijo de rol”  
   - Para `"cfetch"`, toma `3435` como base  
   - Frontend (`fe`, es decir, `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Base de datos (`mongo`) → `34357`  
   - …y así sucesivamente

2. Usa el prefijo del proyecto y asigna roles secuenciales  
   - Para `"cfetch"`, toma `3435` como base  
   - Web → `34351`  
   - Backend → `34352`  
   - Base de datos → `34353`  

### Rango válido de puertos

- Los puertos deben estar dentro del rango **1024–65535** (los puertos del sistema 0‑1023 están bloqueados).
- **Puertos de Sistema (0‑1023)**: asignados por IETF. Estrictamente bloqueados.
- **Puertos de Usuario (1024‑49151)**: asignados por IANA. Úsalos con precaución pues pueden entrar en conflicto con servicios registrados.
- **Puertos Dinámicos/Privados (49152‑65535)**: no asignados. Los más seguros para uso privado o dinámico.

---

## Cómo usar

Comando simple:

```sh
npx -y @lionad/port-key <nombre-de-tu-proyecto>
```

O si deseas un servidor MCP stdio:

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

### Opciones de CLI

- `-m, --map <object>`: mapeo personalizado (JSON o literal tipo JS)
- `--lang <code>`: idioma de salida (actualmente solo `en` y `cn`, por defecto: `cn`)
- `-d, --digits <count>`: número de dígitos preferido para el puerto (4 o 5, por defecto: 4)
- `-h, --help`: mostrar ayuda

Ejemplos:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (puerto de 4 dígitos)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (puerto de 5 dígitos)
```

Notas:
- El idioma predeterminado del registro es `cn`. Usa `--lang en` para mostrar mensajes en inglés.
- Utiliza `-h` o `--help` para mostrar la ayuda.

### Configuración

PortKey lee una configuración opcional del usuario desde:

- `~/.port-key/config.json`

Ejemplo completo:

```json
{
  // Número de dígitos preferido para el puerto (4 o 5)
  "preferDigitCount": 5,
  // Mapeo personalizado de letra a dígito
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Límites del rango de puertos (inclusive)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Para desarrolladores

### Estructura del proyecto

- Este repositorio utiliza un monorepo pnpm; el paquete central se encuentra en `packages/core`.
- Instalación: ejecuta `pnpm install` en la raíz del proyecto.
- Ejecutar pruebas: `pnpm -C packages/core test` o `pnpm -C packages/core test:watch`.
