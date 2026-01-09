# PortKey

<p align="center">
  <img width="200" src="/public/logo.png" />
</p>

<p align="center">
  <strong>PortKey：A Simple, Practical Port Naming Strategy</strong>
</p>

## Brief

Generate ports with a letter-to-number keyboard mapping

When you’re running a bunch of projects locally, picking port numbers becomes annoying.

- Over the last couple of years, there have been *so many* new projects. To really try them out, you often need to boot them locally—and then ports start colliding.
- If you want to keep browser tabs (or bookmarks) stable, a project’s port shouldn’t keep changing.

For example, I have more than ten Nuxt apps on my machine. If they all default to `3000`, that’s obviously not going to work. So I came up with a simple, consistent port naming rule to “assign” ports per project.

[Source Blog Post](https://lionad.art/articles/simple-naming-method)

### Core idea

Instead of picking random numbers, map the **project name to numbers based on the keyboard**, so the port is *readable* and *memorable*.

As long as the result is within the valid port range (**0–65535**) and doesn’t hit reserved/system ports, you can just use it.

More specifically: using a standard QWERTY keyboard, map each letter to a single digit based on its **row/column position**.

Example:

`"cfetch"` → `c(3) f(4) e(3) t(5) c(3) h(6)` → `34353`（port number）

Then you can take the first 4 digits (e.g. `3453`), or keep more digits (e.g. `34353`). Either is fine.

If a project needs multiple ports (frontend, backend, database, etc.), pick **one** of these two approaches:

1. Use the project prefix, then append a “role suffix”  
   - For `"cfetch"`, take `3435` as the base  
   - Frontend (`fe`, i.e. `43`) → `34354`  
   - Backend (`server`) → `34352`  
   - Database (`mongo`) → `34357`  
   - …and so on

2. Use the project prefix, then assign sequential roles  
   - For `"cfetch"`, take `3435` as the base  
   - Web → `34351`  
   - Backend → `34352`  
   - Database → `34353`  
   - …and so on

### Valid port range

- Ports must be within **0–65535**.
- For custom services, it’s usually best to use **1024–49151** (non-reserved) or **49152–65535** (private/dynamic).
- As long as the mapped number stays under the limit, it’s valid.

---

## How to use

```
npx @lionad/port-key <your-project-name>
```

### CLI options

- `-m, --map <object>`: custom mapping (JSON or JS-like object literal)
- `--lang <code>`: output language (currently only `en` and `cn`, default: `cn`)
- `-d, --digits <count>`: preferred digit count for port (4 or 5, default: 4)
- `-h, --help`: show help

Examples:

```bash
npx @lionad/port-key cfetch # -> 3435
npx @lionad/port-key cfetch --digits 4  # -> 3435 (4-digit port)
npx @lionad/port-key cfetch --digits 5  # -> 34353 (5-digit port)
```

Notes:
- Default log language is `cn`. Use `--lang en` to show English messages.
- Use `-h` or `--help` to show help.

### Config

PortKey reads optional user config from:

- `~/.port-key/config.json`
