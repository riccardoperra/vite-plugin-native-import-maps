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

import { VitePluginImportMapsBuildStore } from "./store.js";
import { pluginImportMapsBuildEnv } from "./build.js";
import { pluginImportMapsInject } from "./inject-import-map.js";
import { pluginImportMapsDevelopmentEnv } from "./development.js";
import type { VitePluginImportMapsConfig } from "./config.js";
import type { Plugin } from "vite";

export function vitePluginNativeImportMaps(
  options: VitePluginImportMapsConfig,
): Array<Plugin> {
  const plugins: Array<Plugin> = [];

  const store = new VitePluginImportMapsBuildStore(options);

  plugins.push(...pluginImportMapsBuildEnv(store, options.buildOptions ?? {}));
  plugins.push(pluginImportMapsDevelopmentEnv(store));
  plugins.push(pluginImportMapsInject(store));

  return plugins;
}
