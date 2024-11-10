import Mustache from "mustache";
//import { resolve } from "node:path"
// import { testFn } from "./app/app.ts";
import { create_router } from "@wv-org/server-router";
import { resolve } from "@std/path";

const __dirname = new URL(".", import.meta.url).pathname;
console.log({ __dirname });
console.log({ dirname: import.meta.dirname })

console.log(import.meta)

// class HtmlResponse extends Response {
//   constructor(body?: BodyInit | null, init?: ResponseInit) {
//     const contentType = {
//       "Content-Type": "text/html",
//     };
//     const _init = init || {};
//     _init.headers = { ...(_init.headers || {}), ...contentType };
//     super(body, _init);
//   }
// }

const router = await create_router<Controller, Context>({
  dirPath: resolve(__dirname, "./app/routes"),
  context: {
    Response: Response,
    render: Mustache.render,
    db(model: string) {
      return {
        get(id: string) {
          return { name: "Anton", age: 29 };
        }
      }
    },
  },
})

// const STATIC_PATHNAME = "/public";
// const STATIC_DIR_PATH = resolve(__dirname, `.${STATIC_PATHNAME}`);
// const NOT_FOUND_PAGE = resolve(STATIC_DIR_PATH, "./404.html");

Deno.serve(
  { port: 3000 },
  async (req) => {

    const url = new URL(req.url);
    const pathname = url.pathname;
    console.log({ method: req.method, path: pathname, url: req.url });

    const isFound = router.match_route(url.pathname);

    if (isFound) {
      const { params, controller } = isFound;
      const method = req.method;

      const resp = controller[method.toLowerCase() as keyof Controller]?.({ params, url });

      if (!resp) {
        return new Response("Not Fount", { status: 404 });
      }

      console.log({ resp })
      return resp
    }

    return new Response("Not Fount", { status: 404 });
  }
)

