# vite-plugin-native-import-maps

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


- ✅ A plugin that works in both development and production build
- ✅ Automatically creates import maps with the exposed dependencies, reusing the application chunks
- ✅ Injects the appropriate import map into your HTML

## Do you need this plugin?

If you have searched for import maps, you probably are working in a micro-frontend architecture or an application with a plugin system, where you
need to share some dependencies between different modules at runtime.

While @module-federation/vite offers a full-featured module federation system, it may not always be necessary.

Native import maps allow the browser to resolve modules directly, giving you control over dependency management.
This means that you can build your external modules independently **without forcing you to use any specific bundler / plugin**,
aside from writing ES Modules and externalizing those dependencies if you want to reuse the same chunks.

At the same time, relying on services like [esm.sh] or [jspm.io] can be limiting, since they require downloading packages (and their entire dependency trees)
from their own networks, which might not align with your expectations.

This plugin directly integrates into vite build system, so it just exposed via import maps the modules you defined in 
configuration, while assuring your host application is using those chunks instead of duplicating them.

You can check a more detailed explanation in the [below paragraph](#how-the-heck-does-this-plugin-work),

## Installation

```shell
# pnpm
pnpm add -D vite-plugin-native-import-maps
# or npm
npm add vite-plugin-native-import-maps -D
# or yarn
yarn add -D vite-plugin-native-import-maps
```

## Usage

```ts
import {defineConfig} from "vite";
import {vitePluginImportMaps} from "vite-plugin-native-import-maps";

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

## Configuration

| Option         | Type       | Default    | Description                                       |
|----------------|------------|------------|---------------------------------------------------|
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

You can view a real example output in the test folder.

- [Basic test](./test/fixture/basic) and [snapshot result](./test/__snapshot__/build-project-with-right-import-maps)
