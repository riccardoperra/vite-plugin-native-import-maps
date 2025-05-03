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