//import Mustache from "mustache";
import { create_router } from "@wv-org/server-router";
import { resolve } from "@std/path";
import { render, set_base_template } from "./renderer.ts"

const __dirname = new URL(".", import.meta.url).pathname;

set_base_template(resolve(__dirname, "./app/routes/+base.html"));

const router = await create_router<Controller, Context>({
  dirPath: resolve(__dirname, "./app/routes"),
  context: {
    Response: Response,
    render,
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

      const resp = await controller[method.toLowerCase() as keyof Controller]?.({ params, url });

      return resp ? resp : new Response("Not Fount", { status: 404 })
    }

    return new Response("Not Fount", { status: 404 });
  }
)

