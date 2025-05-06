import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "es-module-shims";

fetch(`${window.location.origin}/import-map.json`)
  .then((res) => res.json())
  .then((res) => importShim.addImportMap(res))
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
