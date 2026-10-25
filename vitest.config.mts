import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The theory engine is plain TypeScript, so tests run in Node without React.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/theory/**/*.ts", "lib/ear-training/**/*.ts"],
      exclude: ["**/*.test.ts"],
    },
  },
});
