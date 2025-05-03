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
import { fileToUrl } from "./utils.js";
import type { Plugin } from "vite";
import type { VitePluginImportMapsStore } from "./store.js";

interface DevResolvedModule {
  name: string;
  path: string;
}

export function pluginImportMapsDevelopmentEnv(
  store: VitePluginImportMapsStore,
): Plugin {
  const name = pluginName("development");
  let latestBrowserHash: string | undefined = undefined;
  let cachedResolvedModules: Array<DevResolvedModule> = [];

  return {
    name,
    apply: "serve",
    // Using this hook since we are sure that deps/_metadata.json has been already created
    // and pluginContainer can resolve the right id without duplicating dependencies.
    // Here we will not inject any import map script, but we will track the dependencies into the store
    async transformIndexHtml(_, { server }) {
      if (!server) return;
      const { pluginContainer, config } = server,
        // This is just an improvement to avoid unnecessary calls to the pluginContainer
        // We get the depsOptimizer config to retrieve the latest browser hash.
        // Inside depsOptimizer we also have the dependencies with their own path,
        // but it's preferred to resolve those urls via pluginContainer.
        clientEnvironment = server.environments["client"],
        devOptimizer = clientEnvironment.depsOptimizer!;

      let resolvedModules: Array<DevResolvedModule>;

      if (devOptimizer.metadata.browserHash === latestBrowserHash) {
        resolvedModules = cachedResolvedModules;
      } else {
        resolvedModules = (
          await Promise.all(
            store.sharedDependencies.map(async (dependency) => {
              const resolvedId = await pluginContainer.resolveId(dependency);
              if (!resolvedId) return null;

              const path = fileToUrl(resolvedId.id, config.root);

              store.log &&
                server.config.logger.info(
                  `[${name}] Added ${dependency}: ${path}`,
                  { timestamp: true },
                );

              return {
                name: dependency,
                path,
              };
            }),
          )
        ).filter((value) => !!value);
      }

      cachedResolvedModules = resolvedModules;
      latestBrowserHash = devOptimizer.metadata.browserHash;

      for (const { path, name } of resolvedModules) {
        store.addDependency({ packageName: name, url: path });
      }
    },
  };
}
