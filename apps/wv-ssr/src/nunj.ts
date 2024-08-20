import nunjucks from "nunjucks";
import { resolve } from "node:path";

const templatesDir = resolve(import.meta.dirname, "./nunj-templates")

const engine = nunjucks.configure(templatesDir, {
  watch: true,
  noCache: true,
});

export default engine;
