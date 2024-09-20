import { createServer } from "node:http";
import Mustache from "mustache";
//import { resolve } from "node:path"

import { createRoutes } from "./app/app";

const __dirname = new URL(".", import.meta.url).pathname;
console.log({ __dirname })
// const STATIC_PATHNAME = "/public";
// const STATIC_DIR_PATH = resolve(__dirname, `.${STATIC_PATHNAME}`);
// const NOT_FOUND_PAGE = resolve(STATIC_DIR_PATH, "./404.html");

const getName = () => {
  return "anton";
}

class Person {
  constructor({ name, age, city }) {
    this.name = name;
    this.age = age;
    this.city = city;
  }
}


const server = createServer(async (req, res) => {
  const router = await createRoutes({
    db(model) {
      return {
        get(id: string) {
          return { name: "Anton", age: 29 };
        }
      }
    },
    render: Mustache.render,
  });
  const url = new URL(`http://${ req.headers.host }`);
  const pathname = url.pathname;
  console.log({ method: req.method, path: pathname })
  // console.log({ result: router.get(pathname) })

  res.end("helllll");
});

server.listen(3000);
