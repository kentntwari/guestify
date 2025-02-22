import { fileURLToPath } from "node:url";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-02-15",
  alias: {
    "@": fileURLToPath(new URL("./", import.meta.url)),
  },
});
