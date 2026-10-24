import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Required syntax for ambient module augmentation (e.g. extending
      // Express's Request type via `declare global { namespace Express {} }`).
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    },
  }
);
