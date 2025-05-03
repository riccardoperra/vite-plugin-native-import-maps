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

/**
 * Normalize a dependency name to be used as an entrypoint input
 *
 * @example
 * ```
 * @scope/package-name -> @scope_package-name
 * package-name/sub-entrypoint -> package-name_sub-entrypoint
 * ```
 */
export function normalizeDependencyName(dep: string) {
  return dep.replace(/\//g, "_");
}

export function getError(name: string, message: string) {
  return new Error(`[vite-plugin-import-maps${name ? ':' + name : ''}] ${message}`);
}

export function errorFactory(path: string) {
  return (message: string) => getError(path, message);
}