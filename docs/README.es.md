<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: una estrategia simple y práctica para nombrar puertos</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumen

Genera puertos mediante una asignación de letras a números basada en la disposición del teclado.

Cuando gestionas varios proyectos localmente, elegir números de puerto puede resultar molesto.

- En los últimos años han surgido **tantos** proyectos nuevos. Para probarlos, a menudo necesitas iniciarlos localmente y los puertos empiezan a colisionar.
- Si deseas que las pestañas del navegador (o los marcadores) sean estables, el puerto de un proyecto no debería cambiar constantemente.

Por ejemplo, tengo más de diez aplicaciones Nuxt en mi máquina. Si todas usaran el puerto predeterminado `3000`, obviamente no funcionaría. Por ello ideé una regla simple y consistente para “asignar” puertos a cada proyecto.

[Publicación original del blog](https://lionad.art/articles/simple-naming-method)

### Idea principal

En lugar de elegir números aleatorios, asigna **el nombre del proyecto a números según el teclado**, de modo que el puerto sea *legible* y *memorable*.

Mientras el resultado esté dentro del rango de puertos válidos (**1024–65535**) y no coincida con puertos reservados/sistema, puedes usarlo directamente.

Más concretamente: utilizando un teclado QWERTY estándar, asigna a cada letra un solo dígito según su **posición de fila/columna**.

Ejemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353` (número de puerto)

Luego puedes tomar los primeros 4 dígitos (p. ej., `3453`), o conservar más dígitos (p. ej., `34353`). Cualquiera es válido.

Si un proyecto necesita varios puertos (frontend, backend, base de datos, etc.), elige **una** de estas dos estrategias:

1. Usa el prefijo del proyecto y añade un “sufijo de rol”  
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
   - …y así sucesivamente

### Rango válido de puertos

- Los puertos deben estar entre **1024–65535** (los puertos del sistema, 0‑1023, están bloqueados).
- **Puertos de Sistema (0‑1023)**: asignados por IETF. No utilizables.
- **Puertos de Usuario (1024‑49151)**: asignados por IANA. Úsalos con precaución, pues pueden entrar en conflicto con servicios registrados.
- **Puertos Dinámicos/Privados (49152‑65535)**: no asignados. Son los más seguros para uso privado o dinámico.

---

## Cómo usar

Comando sencillo:

```sh
npx -y @lionad/port-key <nombre-de-tu-proyecto>
```

O si prefieres un servidor MCP de stdio:

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

- `-m, --map <object>`: asignación personalizada (JSON o literal de objeto tipo JS)
- `--lang <code>`: idioma de salida (actualmente solo `en` y `cn`, por defecto: `cn`)
- `-d, --digits <count>`: número preferido de dígitos para el puerto (4 o 5, por defecto: 4)
- `--padding-zero <true|false>`: rellenar con ceros los puertos cortos (por defecto: true). Ej.: `"air"` → `1840`
- `-h, --help`: muestra la ayuda

Ejemplos:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4   # -> 3435 (puerto de 4 dígitos)
npx @lionad/port-key cfetch --digits 5   # -> 34353 (puerto de 5 dígitos)
```

Notas:
- El idioma predeterminado del registro es `cn`. Usa `--lang en` para mostrar mensajes en inglés.
- Utiliza `-h` o `--help` para ver la ayuda.

### Configuración

PortKey lee una configuración opcional del usuario desde:

- `~/.port-key/config.json`

Ejemplo completo:

```json
{
  // Número de dígitos preferido para el puerto (4 o 5)
  "preferDigitCount": 5,
  // Rellenar con cero los puertos cortos (por defecto: true)
  "paddingZero": true,
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

- Este repositorio usa un monorepo con `pnpm`; el paquete central está en `packages/core`.
- Instalación: ejecuta `pnpm install` en la raíz del proyecto.
- Ejecutar pruebas: `pnpm -C packages/core test` o `pnpm -C packages/core test:watch`.
