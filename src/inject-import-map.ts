import { pluginName } from "./config.js";
import type { Plugin } from "vite";
import type { VitePluginImportMapsStore } from "./store.js";

export function pluginImportMapsInject(
  store: VitePluginImportMapsStore,
): Plugin {
  const name = pluginName("inject-html-import-map");
  return {
    name,
    transformIndexHtml(source) {
      const imports = {} as Record<string, string>;
      store.importMapDependencies.forEach((dep) => {
        imports[dep.packageName] = dep.url;
      });

      const resolvedImports = store.importMapHtmlTransformer(
        imports,
        store.importMapDependencies
      );

      return {
        html: source,
        tags: [
          {
            tag: "script",
            attrs: { type: "importmap" },
            children: JSON.stringify({ imports: resolvedImports }),
            injectTo: "head-prepend",
          },
        ],
      };
    },
  };
}
