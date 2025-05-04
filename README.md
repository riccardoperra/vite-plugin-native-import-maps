# vite-plugin-native-import-maps

A vite plugin that automatically
manages
browser [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)
in your
host vite application.

Works in both development and production builds, assuring that the defined imports in an import-map are
always pointing to an existing chunk of your application, avoiding duplicating instances.

## Table of contents

- [Do you need this plugin?](#do-you-need-this-plugin)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [How does this plugin work?](#how-does-this-plugin-work)

## Do you need this plugin?

If you wanted to
use [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap),
you're likely working with a micro-frontend architecture or an application that uses a plugin system,
where sharing dependencies between different modules at runtime is essential.

While @module-federation/vite offers a full-featured module federation system, it may be a bloated solution for your
problem.

Native import maps allow the browser to resolve modules directly, giving you control over dependency management.
This means that you can build your external modules independently **without forcing to use any specific bundler or
plugin**
to integrate them (e.g., module federation plugins).
You only need to write ES Modules that actually import those dependencies if you want to reuse the same chunks.

At the same time, relying on services like [esm.sh] or [jspm.io] can be limiting, since they require downloading
packages (and their entire dependency trees)
from their own networks, which might not align with your expectations.

This plugin directly integrates into the vite build system, so it just exposed via import maps the modules (local files
or vendors in node_modules are supported) you defined in configuration, while assuring even your host application uses
those chunks. This avoids duplicating instances of the same library in your application, which is a common problem when
using micro-frontend architectures.

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
import {vitePluginNativeImportMaps} from "vite-plugin-native-import-maps";

export default defineConfig({
    plugins: [
        vitePluginNativeImportMaps({
            shared: [
                "react",
                "react-dom",
                // Add an import map with a custom entry
                {name: 'react/jsx-runtime', entry: './src/custom-jsx-runtime.ts'}
            ],
            // optional settings
            sharedOutDir: "shared", // default: 'shared'
            log: true, // default: false
        }),
    ],
});
```

## Configuration

| Option         | Type                                               | Default | Description                                        |
|----------------|----------------------------------------------------|---------|----------------------------------------------------|
| `shared`       | `Array<string \| { name: string, entry: string }>` |         | List of dependencies to be exposed via import maps |
| `sharedOutDir` | `string`                                           | `''`    | Directory where shared chunks will be emitted      |
| `log`          | `boolean`                                          | `false` | Enable some logs for debugging purposes            |

## How does this plugin work?

This plugin works by creating an import map for your defined dependencies and injecting it into your HTML.
It works in both development and production builds, assuring that the defined imports always
point to the correct chunk of the module.

Since Vite uses two different bundlers (esbuild for development and Rollup for production),
the plugin implementation differs slightly between the two.

### Development

In development, the plugin collects the shared dependencies via the vite dev server,
which maps them in that way:

- node_modules libraries points to `/node_modules/.vite/deps` folder.
- If the module is not within the root, the path will be absolute and prefixed with `/@fs/`.
- Module paths will have a `?v=${browser_hash}` suffix that will change on every server reload.
- Local files defined with `alias` just point with the relative path.

### Production build

In production, it adds a new `input` to the rollup `inputOptions` for each defined shared dependency to
create a new separated chunk which will contain all the module exports (they will not be tree-shaken).
During the generate bundle phase, it will then collect all resolved urls and add them into the import map.

You can view a real example output in the test folder.

- [Basic test](./test/fixture/basic) and [snapshot result](./test/__snapshot__/build-project-with-right-import-maps)

## Examples

- [solidjs-host](./examples/solidjs-host/src/App.tsx)
- [solidjs-remote-counter](./examples/solidjs-host)

