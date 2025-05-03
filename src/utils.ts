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
import { normalizePath } from "vite";

/**
 * Normalize a dependency name to be used as an entrypoint input
 *
 * @example
 * ```
 * @scope/package-name -> @scope_package-name
 * package-name/sub-entrypoint -> package-name_sub-entrypoint
 * ```
 */
export function normalizeDependencyName(dep: string): string {
  return dep.replace(/\//g, "_");
}

export function getError(name: string, message: string): Error {
  return new Error(
    `[vite-plugin-import-maps${name ? ":" + name : ""}] ${message}`,
  );
}

export function errorFactory(prefix: string): (message: string) => Error {
  return (message) => getError(prefix, message);
}

/**
 * Prefix for resolved fs paths, since windows paths may not be valid as URLs.
 *
 * @see https://github.com/vitejs/vite/blob/fd38d076fe2455aac1e00a7b15cd51159bf12bb5/packages/vite/src/node/constants.ts#L108
 */
export const FS_PREFIX = `/@fs/`;

export function fileToUrl(file: string, root: string): string {
  const url = path.relative(root, file);
  // out of root, use /@fs/ prefix
  if (url[0] === ".") {
    return path.posix.join(FS_PREFIX, normalizePath(file));
  }
  // file within root, create root-relative url
  return "/" + normalizePath(url);
}
