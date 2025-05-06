# vite-plugin-native-import-maps

> [!CAUTION]
>
> **This Vite plugin is currently in active development.**
> The API and internal behavior may change without notice.
> Use at your own risk and keep an eye on updates.

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

If you're considering
using [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap),
you're likely working with a micro-frontend architecture or an application that uses a plugin system, where including
remote modules and sharing dependencies between different modules at runtime is essential.

While tools like [Module Federation](https://module-federation.io/ ) provide full-featured module federation
capabilities, they can be overkill for your use cases. To use module federation, you typically need to follow its
conventions and tooling—setting up the appropriate plugins and adhering to its runtime expectations.
Although it's possible to use the federation runtime independently, doing so effectively requires a tightly integrated
ecosystem that fully supports its model.

### Why not import maps?

[Import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) are a
browser standard that allows developers to control how the browser resolves module specifiers.
They provide a mapping between module names and their actual locations, enabling more flexible module imports without
having to specify full paths.

```html

<script type="importmap">
    {
        "imports": {
            "react": "/shared/react.js",
        }
    }
</script>
```

```javascript
// Without import maps
import React from '/shared/react.js';

// With import maps
import React from 'react';
```

However, setting them up manually is often cumbersome—especially when dealing with external CDNs or when you’re forced
to manage static assets by hand.

Relying on services like [esm.sh] or [jspm.io] can be limiting, since they require downloading packages (and their
entire dependency trees)
from their own networks, which might not align with your expectations.

For example, what if you want to expose only some modules or a modified version of a library, or just a local file that
could be used by a remote-loaded module?

This plugin integrates import maps with Vite's build system to seamlessly expose entrypoints from your application or
installed dependencies,
which are built as a separate chunk. It works in **both development and production modes**, and ensures that
shared modules are bundled into proper chunks and referenced consistently, so even your host application uses the exact
same instances. This avoids issues like module duplication and helps maintain a clean, predictable module graph—without
having to serve assets externally or manage URLs manually.

For more technical insight, see the [detailed explainatino below](#how-does-this-plugin-work),

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

