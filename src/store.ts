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

import path from "node:path";
import { normalizeDependencyName } from "./utils.js";
import type { VitePluginImportMapsConfig } from "./config.js";

export interface RegisteredDependency {
  packageName: string;
  url: string;
}

export class VitePluginImportMapsStore {
  readonly sharedDependencies: ReadonlyArray<string> = [];
  readonly sharedOutDir: string = "shared";
  readonly log: boolean;

  readonly importMapDependencies: Map<string, RegisteredDependency> = new Map();

  constructor(options: VitePluginImportMapsConfig) {
    this.sharedDependencies = [...new Set<string>(options.shared)];
    this.log = options.log || false;
    if (options.sharedOutDir) {
      this.sharedOutDir = options.sharedOutDir;
    }
  }

  clearDependencies(): void {
    this.importMapDependencies.clear();
  }

  addDependency(dependency: RegisteredDependency): void {
    this.importMapDependencies.set(dependency.packageName, dependency);
  }

  getNormalizedDependencyName(dependency: string): string {
    return normalizeDependencyName(dependency);
  }

  getEntrypointPath(entrypoint: string): string {
    return path.join(this.sharedOutDir, entrypoint);
  }
}
