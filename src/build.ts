/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { pluginName } from "./config.js";
import { errorFactory } from "./utils.js";
import type { VitePluginImportMapsStore } from "./store.js";
import type { Plugin } from "vite";

interface ImportMapChunkEntrypoint {
  originalDependencyName: string;
  normalizedDependencyName: string;
  entrypoint: string;
}

export function pluginImportMapsBuildEnv(store: VitePluginImportMapsStore): Plugin {
  const inputEntrypointToDependencyMap = new Map<string, string>();
  const inputs: Array<ImportMapChunkEntrypoint> = [];
  const name = pluginName('build');
  const getError = errorFactory(name);


  return {
    name,
    apply: 'build',
    enforce: 'pre',
    config(config) {
      for (const dep of store.sharedDependencies) {
        const normalizedDepName = store.getNormalizedDependencyName(dep);
        const entrypoint = store.getEntrypointPath(normalizedDepName);

        inputs.push({
          originalDependencyName: dep,
          entrypoint,
          normalizedDependencyName: normalizedDepName
        })

        inputEntrypointToDependencyMap.set(entrypoint, normalizedDepName);
      }


      if (!config.build) config.build = {}
      if (!config.build.rollupOptions) config.build.rollupOptions = {}
      if (!config.build.rollupOptions.input) config.build.rollupOptions.input = {}

      config.build.rollupOptions.preserveEntrySignatures = 'strict';

      // Currently supporting only input options as an object
      if (typeof config.build.rollupOptions.input === 'string'
        || Array.isArray(config.build.rollupOptions.input)) {
       throw getError('Input options must be an object')
      }
      for (const input of inputs) {
        config.build.rollupOptions.input[input.entrypoint] = input.normalizedDependencyName;
      }
    },
    // We'll get here the final name of the generated chunk
    // to track the import-maps dependencies
    generateBundle(options, bundle) {
      store.clearDependencies();

      const keys = Object.keys(bundle);
      for (const key of keys) {
        const entry = bundle[key];
        if (entry.type !== 'chunk') continue;

        if (inputEntrypointToDependencyMap.has(entry.name)) {
          const entryPath = inputEntrypointToDependencyMap.get(entry.name);
          if (entryPath) {
            store.addDependency({
              url: './' + entry.fileName,
              packageName: entryPath,
            });
          }
        }
      }
    }
  }
}