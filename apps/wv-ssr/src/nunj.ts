import nunjucks from "nunjucks";
import { resolve } from "node:path";

const TEMPLATES_FOLDER_NAME = "templates"

const templatesDirPath = resolve(import.meta.dirname, `./${TEMPLATES_FOLDER_NAME}`)

const engine = nunjucks.configure(templatesDirPath, {
  autoescape: true,
  watch: true,
  noCache: true,
});

export default engine;
