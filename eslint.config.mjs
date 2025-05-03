import { defineConfig } from "eslint/config";
import { tanstackConfig } from "@tanstack/eslint-config";

export default defineConfig([...tanstackConfig]);
