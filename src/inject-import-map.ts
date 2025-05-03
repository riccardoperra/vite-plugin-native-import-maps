import type { IndexHtmlTransformResult, Plugin } from "vite";
import type {
  RegisteredDependency,
  VitePluginImportMapsStore,
} from "./store.js";
import { pluginName } from "./config.js";

export function pluginImportMapsInject(
  store: VitePluginImportMapsStore,
): Plugin {
  const name = pluginName("inject-html-import-map");
  return {
    name,
    transformIndexHtml(source) {
      return generateHtmlTransformResult(source, store.importMapDependencies);
    },
  };
}

function generateHtmlTransformResult(
  source: string,
  entries: Map<string, RegisteredDependency>,
): IndexHtmlTransformResult {
  const imports = {} as Record<string, string>;
  entries.forEach((dep) => {
    imports[dep.packageName] = dep.url;
  });
  return {
    html: source,
    tags: [
      {
        tag: "script",
        attrs: { type: "importmap" },
        children: JSON.stringify({ imports }),
        injectTo: "head-prepend",
      },
    ],
  };
}
