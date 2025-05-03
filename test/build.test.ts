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

import { expect, test } from "vitest";
import { build } from "vite";
import { vitePluginImportMaps } from "../src/index.js";
import path from "node:path";
import type { OutputAsset, RollupOutput } from "rollup";

test("build project with right import map", async () => {
  const buildOutput = path.resolve(
    import.meta.dirname,
    "__snapshot__/build-project-with-right-import-maps",
  );

  const root = path.resolve(path.join(import.meta.dirname, "./fixture/basic"));

  const result = (await build({
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
  })) as RollupOutput;

  expect(result.output).toHaveLength(2);
  const [sharedDependency, indexHtml] = result.output;

  expect(sharedDependency.type).toEqual("chunk");
  expect(sharedDependency.name).toEqual("shared/shared-lib");
  expect(sharedDependency.isEntry).toEqual(true);
  expect(sharedDependency.fileName).toSatisfy((name) =>
    name.startsWith("assets/shared/shared-lib-"),
  );
  await expect(sharedDependency.code).toMatchFileSnapshot(
    path.join(buildOutput, sharedDependency.fileName),
  );
  const expectedImportMap = JSON.stringify({
    imports: {
      "shared-lib": `./${sharedDependency.fileName}`,
    },
  });
  expect(indexHtml.type).toEqual("asset");
  expect((indexHtml as OutputAsset).source).toContain(
    `<script type="importmap">${expectedImportMap}</script>`,
  );
});
