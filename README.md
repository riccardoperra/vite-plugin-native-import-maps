# vite-plugin-import-maps

> [!IMPORTANT]
> 
> This package has not been published yet to the npm registry.

A vite plugin that automatically manages [native import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) in your
host vite application.

## Features

- ✅ Works in both development and production build
- ✅ Automatically creates import maps for shared dependencies
- ✅ Optimizes build output by separating shared dependencies into their own chunks
- ✅ Injects the appropriate import map into your HTML

## Installation

```shell
npm install vite-plugin-import-maps --save-dev
# or
pnpm add -D vite-plugin-import-maps
# or
yarn add -D vite-plugin-import-maps
```

## Usage

```ts
import { defineConfig } from 'vite'
import { vitePluginImportMaps } from 'vite-plugin-import-maps'

export default defineConfig({
  plugins: [
    vitePluginImportMaps({
      shared: ['react', 'react-dom'],
      // optional settings
      sharedOutDir: 'shared', // default: 'shared'
      log: true               // default: false
    })
  ]
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `shared` | `string[]` | Required | List of dependencies to be shared via import maps |
| `sharedOutDir` | `string` | `'shared'` | Directory where shared chunks are stored |
| `log` | `boolean` | `false` | Enable logging |

## How it works

This plugin works by creating an import map for your defined dependencies and injecting it into your HTML.
It works in both development and production builds, assuring that the defined imports are always
pointing to the correct version of the dependency.

Since Vite uses two different bundlers (esbuild for development and Rollup for production),
the plugin implementation differs slightly between the two.

In development, the plugin collects the shared dependencies via the vite dev server,
which maps them in that way:
- For node_modules libraries, it points to `/node_modules/.vite/deps` folder.
  - If the library is not in the root, it adds a `/@fs/` prefix. 
  - Dependencies have a `?v=BROWSER_HASH` suffix that will change on every server reload.
- For local files defined with `alias`, it just uses the path name

In production, it adds a new `input` to the rollup `inputOptions` for each defined shared dependency to
create a new separated chunk which will contain all the module exports (they will not be tree-shaken).
During the generate bundle phase, it will then collect all resolved urls and add them into the import map.
