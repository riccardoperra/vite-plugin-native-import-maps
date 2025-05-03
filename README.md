# vite-plugin-native-import-maps

> [!IMPORTANT]
>
> This package has not been published yet to the npm registry.

A vite plugin that automatically
manages [native import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)
in your
host vite application.

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Do you need this plugin?](#do-you-need-this-plugin)
- [Usage](#usage)
- [Configuration](#configuration)
- [How the heck does this plugin work?](#how-the-heck-does-this-plugin-work)

## Features

- ✅ Works in both development and production build
- ✅ Automatically creates import maps for shared dependencies
- ✅ Optimizes build output by separating shared dependencies into their own chunks
- ✅ Injects the appropriate import map into your HTML

## Installation

```shell
npm install vite-plugin-native-import-maps --save-dev
# or
pnpm add -D vite-plugin-native-import-maps
# or
yarn add -D vite-plugin-native-import-maps
```

## Usage

```ts
import { defineConfig } from "vite";
import { vitePluginImportMaps } from "vite-plugin-native-import-maps";

export default defineConfig({
  plugins: [
    vitePluginImportMaps({
      shared: ["react", "react-dom"],
      // optional settings
      sharedOutDir: "shared", // default: 'shared'
      log: true, // default: false
    }),
  ],
});
```

## Do you need this plugin?

If you searched for import maps, you probably are working in a Micro-frontend environment or a plugin system, where you
need
to share dependencies between different applications or even load unbundled modules at runtime.

Even if [@module-federation/vite](https://github.com/module-federation/vite) plugin exists, you may not
need to use a full-blown module federation solution.

Thanks to browser native import-maps, you can control how modules are resolved in the browser
**without necessarily forcing external packages to use module federation**.

At the same time, you don't necessarily want to use bind all your modules to services like esm.sh or jspm,
because they force you to download those packages and all their dependencies from their network.

This plugin just exposes via import maps the modules you defined inside the plugin configuration, while
assuring your host application too is using the same chunks in both development and production.

## Configuration

| Option         | Type       | Default    | Description                                       |
| -------------- | ---------- | ---------- | ------------------------------------------------- |
| `shared`       | `string[]` | Required   | List of dependencies to be shared via import maps |
| `sharedOutDir` | `string`   | `'shared'` | Directory where shared chunks are stored          |
| `log`          | `boolean`  | `false`    | Enable logging                                    |

## How the heck does this plugin work?

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
