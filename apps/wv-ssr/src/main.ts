//import Mustache from "mustache";
//import { resolve } from "node:path"
import { testFn } from "./app/app.ts";

const __dirname = new URL(".", import.meta.url).pathname;
console.log({ __dirname });
console.log({ dirname: import.meta.dirname })

console.log(import.meta)

// const STATIC_PATHNAME = "/public";
// const STATIC_DIR_PATH = resolve(__dirname, `.${STATIC_PATHNAME}`);
// const NOT_FOUND_PAGE = resolve(STATIC_DIR_PATH, "./404.html");

Deno.serve(
  { port: 3000 },
  async (req) => {

    const url = new URL(req.url);
    const pathname = url.pathname;
    console.log({ method: req.method, path: pathname, url: req.url });

    const isFound = await testFn(pathname);

    if (isFound) {
      const { params, controller } = isFound;
      console.log("isFound", { params, controller });
    }

    return new Response("Hello, world!");
  }
)

