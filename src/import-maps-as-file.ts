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
import type { Plugin } from "vite";
import type { VitePluginImportMapsStore } from "./store.js";

interface PluginImportMapsAsFileOptions {
  name?: string;
}

export function pluginImportMapsAsFile(
  store: VitePluginImportMapsStore,
  options: PluginImportMapsAsFileOptions,
): Plugin {
  const { name = "import-map" } = options;

  return {
    name: pluginName("import-maps-as-file"),
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === `/${name}.json`) {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(store.getImportMapAsJson()));
        } else {
          next();
        }
      });
    },
    generateBundle() {
      const json = store.getImportMapAsJson();

      this.emitFile({
        type: "asset",
        fileName: `/${name}.json`,
        source: JSON.stringify(json, null, 2),
      });
    },
  };
}
