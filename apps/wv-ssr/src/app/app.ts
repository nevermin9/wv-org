import { resolve, join } from "node:path";
import { readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Script } from "node:vm";

const path = new URL(".", import.meta.url).pathname;

const isEntryFile = (p: string) => /\+page\.(ts|js)/.test(p);

const readRoutesDirs = async (root: string): Promise<Map<string, string>> => {
  const routerMap = new Map<string, string>();

  const traverse = async (dir: string) => {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (isEntryFile(entry.name)) {
        const split = fullPath.split("/");
        const index = split.indexOf("routes");
        const route = `/${ split.slice(index + 1, -1).join("/") }`;
        routerMap.set(route, fullPath);
      }
    }
  };

  await traverse(root);
  return routerMap;
};

export const createRoutes = async (context: Context) => {
  const root = resolve(path, "./routes");
  const routeMap = await readRoutesDirs(root);
  console.log(Array.from(routeMap.keys()));

  if (!routeMap.size) {
    console.log("No entry files found");
    return;
  }

  const controllers = new Map<string, Controller>();

  for (const [route, filePath] of routeMap.entries()) {
    const content = await new Promise<string>((resolve, reject) => {
      let data = '';
      const stream = createReadStream(filePath, { encoding: "utf-8" });
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });

    const script = new Script(`const c = (ctx) => ${content}; c(context);`, { filename: filePath });
    const controller = script.runInNewContext({ context }) as Controller;
    controllers.set(route, controller);
    console.log({ script_result: controller.get({ params: { id: "kj" }, url: new URL("http://example.com") }) });
  }

  for (const [route, con] of controllers.entries()) {
    console.log({ route, con });
  }

  return controllers;
};
