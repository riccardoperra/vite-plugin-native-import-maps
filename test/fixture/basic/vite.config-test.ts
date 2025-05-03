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
import { vitePluginImportMaps } from "../../../src/index.js";
import type { UserConfig } from "vite";

const root = path.resolve(path.join(import.meta.dirname));

const buildOutput = path.resolve(
  import.meta.dirname,
  "../../__snapshot__/build-project-with-right-import-maps",
);

export default {
  root,
  resolve: {
    alias: {
      "shared-lib": path.resolve(path.join(root, "shared-lib.ts")),
    },
  },
  build: {
    outDir: buildOutput,
    minify: false,
    rollupOptions: {
      input: {
        index: path.resolve(path.join(root, "./index.html")),
      },
    },
  },
  plugins: [
    vitePluginImportMaps({
      shared: ["shared-lib"],
    }),
  ],
} satisfies UserConfig;
