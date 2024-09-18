import { resolve } from "node:path";
import { opendir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Script, createContext, runInContext } from "node:vm";
// import Mustache from "mustache";

const path = new URL(".", import.meta.url).pathname;
const ENTRY_FILE_NAME = /\+page\.(ts|js)/;

export const createRoutes = async (context: Context) => {
  const dir = await opendir(resolve(path, "./routes"));

  const entryFilesPaths: string[] = [];
  for await (const dirent of dir) {
    if (ENTRY_FILE_NAME.test(dirent.name)) {
      entryFilesPaths.push(`${dirent.parentPath}/${dirent.name}`)
    }
    console.log({ dirent, isDir: dirent.isDirectory(), match: ENTRY_FILE_NAME.test(dirent.name) })
  }


  if (!entryFilesPaths.length) {
    console.log("no enrty files")
    return;
  }

  const promises = [];
  for (const p of entryFilesPaths) {
    const stream = createReadStream(p);
    promises.push(async () => {
      const buff = [];
      for await (const b of stream) {
        buff.push(b);
      }
      return Buffer.from(buff).toString();
    });
  }

  console.log({ msg: "creating the router" })
  const map = new Map();
  for await (const result of promises) {
    const script = new Script(`((ctx) => ${result})(context)`);
    const ctx = createContext({ context });
    const what = await script.runInContext(ctx)();
    map.set("/", what)
  }

  return map;


  // console.log({ dir })
};
