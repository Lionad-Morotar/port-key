<!-- Auto Generated - Do Not Edit -->
# PortKey

<p align="center">
  <img width="200" src="https://raw.githubusercontent.com/Lionad-Morotar/port-key/main/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey: Una estrategia de nombramiento de puertos simple y práctica</strong>
</p>

<p align="center">
  <!-- LANGUAGES=("cn" "es" "fr" "de" "ja" "ko" "ru" "ar" "pt" "it") -->
  <a href="./docs/README.cn.md">中文</a> | <a href="./docs/README.es.md">Español</a> | <a href="./docs/README.fr.md">Français</a> | <a href="./docs/README.de.md">Deutsch</a> | <a href="./docs/README.ja.md">日本語</a> | <a href="./docs/README.ko.md">한국어</a> | <a href="./docs/README.ru.md">Русский</a> | <a href="./docs/README.ar.md">العربية</a> | <a href="./docs/README.pt.md">Português</a> | <a href="./docs/README.it.md">Italiano</a>
</p>

## Resumen

Genera puertos mediante un mapeo de letras a números basado en el teclado

Cuando ejecutas varios proyectos localmente, elegir números de puerto se vuelve molesto.

- En los últimos años han surgido *muchos* proyectos nuevos. Para probarlos realmente, a menudo necesitas arrancarlos localmente —y entonces los puertos empiezan a colisionar.
- Si quieres mantener estables las pestañas del navegador (o los marcadores), el puerto de un proyecto no debería cambiar constantemente.

Por ejemplo, tengo más de diez aplicaciones Nuxt en mi máquina. Si todas usan `3000` por defecto, obviamente no va a funcionar. Así que ideé una regla de nombramiento de puertos simple y coherente para "asignar" puertos por proyecto.

[Publicación del blog original](https://lionad.art/articles/simple-naming-method)

### Idea central

En lugar de elegir números al azar, mapea el **nombre del proyecto a números según el teclado**, de modo que el puerto sea *legible* y *memorable*.

Mientras el resultado esté dentro del rango de puertos válido (**1024–65535**) y no coincida con puertos reservados o del sistema, puedes usarlo directamente.

Más concretamente: usando un teclado QWERTY estándar, mapea cada letra a un único dígito según su **posición de fila/columna**.

Ejemplo:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353` (número de puerto)

Luego puedes tomar los primeros 4 dígitos (p. ej. `3453`) o conservar más dígitos (p. ej. `34353`). Ambas opciones son válidas.

Si un proyecto necesita varios puertos (frontend, backend, base de datos, etc.), elige **una** de estas dos estrategias:

1. Usa el prefijo del proyecto y luego añade un "sufijo de rol"
   - Para `"cfetch"`, toma `3435` como base
   - Frontend (`fe`, es decir `43`) → `34354`
   - Backend (`server`) → `34352`
   - Base de datos (`mongo`) → `34357`
   - …y así sucesivamente

2. Usa el prefijo del proyecto y luego asigna roles secuenciales
   - Para `"cfetch"`, toma `3435` como base
   - Web → `34351`
   - Backend → `34352`
   - Base de datos → `34353`
   - …y así sucesivamente

### Rango de puertos válido

- Los puertos deben estar dentro de **1024–65535** (los puertos del sistema 0-1023 están bloqueados).
- **Puertos del sistema (0-1023)**: Asignados por la IETF. Estrictamente bloqueados.
- **Puertos de usuario (1024-49151)**: Asignados por la IANA. Úsalos con precaución, ya que podrían entrar en conflicto con servicios registrados.
- **Puertos dinámicos/privados (49152-65535)**: No asignados. Los más seguros para uso privado o dinámico.

---

## Cómo usar

Comando simple:

```sh
npx -y @lionad/port-key <your-project-name>
```

O si quieres un servidor MCP stdio:

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


### Opciones CLI

- `-m, --map <object>`: mapeo personalizado (literal de objeto JSON o similar a JS)
- `--lang <code>`: idioma de salida (actualmente solo `en` y `cn`, predeterminado: `cn`)
- `-d, --digits <count>`: número preferido de dígitos para el puerto (4 o 5, predeterminado: 4)
- `--padding-zero <true|false>`: Rellena con ceros al final hasta el número preferido de dígitos cuando la entrada es corta (predeterminado: true). p. ej. `"air"` -> `1840`, `"1234" --digits 5` -> `12340`
- `-h, --help`: mostrar ayuda

Ejemplos:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (puerto de 4 dígitos)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (puerto de 5 dígitos)
```

Notas:
- El idioma de registro predeterminado es `cn`. Usa `--lang en` para mostrar mensajes en inglés.
- Usa `-h` o `--help` para mostrar ayuda.

### Configuración

PortKey lee la configuración de usuario opcional desde:

- `~/.port-key/config.json`

Un ejemplo completo:

```json
{
  // Número preferido de dígitos para el puerto (4 o 5)
  "preferDigitCount": 5,
  // Rellena con ceros al final hasta el número preferido de dígitos cuando la entrada es corta (predeterminado: true)
  "paddingZero": true,
  // Mapeo personalizado de letra a dígito
  "blockedPorts": [3000, 3001, 3002, 6666],
  // Límites del rango de puertos (inclusivo)
  "minPort": 1024,
  "maxPort": 49151
}
```

---

## Para desarrolladores

### Estructura del proyecto

- Este repositorio utiliza pnpm monorepo; el paquete principal se encuentra en `packages/core`.
- Instalación: ejecuta `pnpm install` en el directorio raíz.
- Ejecutar pruebas: `pnpm -C packages/core test` o `pnpm -C packages/core test:watch`.
