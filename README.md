# vite-plugin-import-maps

A Vite plugin that manages import maps for shared dependencies in your Vite applications.

## Features

- Automatically creates import maps for shared dependencies
- Works in both development and production environments
- Optimizes build output by separating shared dependencies into their own chunks
- Injects the appropriate import map into your HTML

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
// vite.config.js / vite.config.ts
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

## How It Works

This plugin:
1. Identifies shared dependencies specified in your configuration
2. In development: Resolves paths to optimized dependencies
3. In production: Creates separate chunks for shared dependencies
4. Injects the appropriate import map into your HTML