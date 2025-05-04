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
import type { VitePluginImportMapsStore } from "./store.js";
import type { Plugin, ResolvedConfig } from "vite";

interface ImportMapChunkEntrypoint {
  originalDependencyName: string;
  normalizedDependencyName: string;
  entrypoint: string;
}

function getVirtualFileName(name: string) {
  return `\0virtual:import-map-chunk/${name}`;
}

export function pluginImportMapsBuildEnvVirtual(
  store: VitePluginImportMapsStore,
): Plugin {
  const inputs: Array<ImportMapChunkEntrypoint> = [];
  const name = pluginName("build");
  const virtualModules = new Map<string, ImportMapChunkEntrypoint>();
  let config!: ResolvedConfig;

  for (const dep of store.sharedDependencies) {
    const normalizedDepName = store.getNormalizedDependencyName(dep);
    const entrypoint = store.getEntrypointPath(normalizedDepName);

    inputs.push({
      originalDependencyName: dep,
      entrypoint,
      normalizedDependencyName: normalizedDepName,
    });
  }

  return {
    name,
    apply: "build",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(id) {
      const chunk = virtualModules.get(id);
      if (!chunk) return;
      return id;
    },
    async load(id) {
      const chunk = virtualModules.get(id);
      if (!chunk) return;

      const resolvedId = await this.resolve(chunk.originalDependencyName);
      if (!resolvedId) return;
      let hasDefaultExport = false;

      const [fileName] = resolvedId.id.split("?");
      const moduleInfo = this.getModuleInfo(fileName);

      if (moduleInfo) {
        hasDefaultExport = moduleInfo.hasDefaultExport ?? false;
        if (!hasDefaultExport) {
          if (
            "commonjs" in moduleInfo.meta &&
            moduleInfo.meta.commonjs.isCommonJS
          ) {
            const requires = moduleInfo.meta.commonjs.requires;
            if (Array.isArray(requires)) {
              for (const require of requires) {
                if (require.resolved) {
                  const innerResolvedId = this.getModuleInfo(
                    require.resolved.id,
                  );
                  if (!innerResolvedId) break;
                  hasDefaultExport = innerResolvedId.hasDefaultExport || false;
                  if (hasDefaultExport) break;
                  if (innerResolvedId.exports?.includes("__require")) {
                    hasDefaultExport = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      let code = `export * from "${chunk.originalDependencyName}"`;
      if (hasDefaultExport) {
        code += `\nexport { default } from '${chunk.originalDependencyName}'`;
      }

      return {
        moduleSideEffects: "no-treeshake",
        code,
      };
    },
    buildStart() {
      for (const input of inputs) {
        const id = getVirtualFileName(input.normalizedDependencyName);
        virtualModules.set(id, input);
        this.emitFile({
          type: "chunk",
          name: input.entrypoint,
          id,
          preserveSignature: "strict",
        });
      }
    },
    // We'll get here the final name of the generated chunk
    // to track the import-maps dependencies
    generateBundle(_, bundle) {
      store.clearDependencies();

      const keys = Object.keys(bundle);
      for (const key of keys) {
        const entry = bundle[key];
        if (entry.type !== "chunk" || !entry.facadeModuleId) continue;
        const entryImportMap = virtualModules.get(entry.facadeModuleId);
        if (!entryImportMap) continue;

        const url = `./${entry.fileName}`,
          packageName = entryImportMap.originalDependencyName;
        store.addDependency({ url, packageName });
        config.logger.info(`[${name}] Added ${packageName}: ${url}`, {
          timestamp: true,
        });
      }
    },
  };
}
