import { resolve } from "node:path";
import { opendir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Script, createContext, runInContext } from "node:vm";
// import Mustache from "mustache";

const path = new URL(".", import.meta.url).pathname;

const isEntryFile = (p: string) => /\+page\.(ts|js)/.test(p);

export const createRoutes = async (context: Context) => {
  const dir = await opendir(resolve(path, "./routes"));

  const entryFilesPaths: string[] = [];
  for await (const dirent of dir) {
    if (isEntryFile(dirent.name)) {
      entryFilesPaths.push(`${dirent.parentPath}/${dirent.name}`)
    }
    console.log({ dirent, isDir: dirent.isDirectory(), match: isEntryFile(dirent.name) })
  }

  if (!entryFilesPaths.length) {
    console.log("no enrty files")
    return;
  }
  const indexPath = entryFilesPaths[0];

  const promises = [];
  for (const p of entryFilesPaths) {
    const stream = createReadStream(indexPath, { encoding: "utf-8" });
     promises.push(new Promise<{ content: string, filename: string }>(async (res) => {
      console.log({ msg: "start" })
      let c = "";
      for await (const data of stream) {
        c += data;
        console.log({ msg: "add data", data })
      }
      res({ content: c, filename: p });
    }));
  }
const doc_script = new Script(`const getController = (ctx)=>
({
getName: () => {
return ctx.name;
}
});
getController(context);
`);
  const doc_res = doc_script.runInNewContext({ context: { name: "anton" } })
  console.log({ name: doc_res.getName() })

  for await (const { content, filename } of promises) {
    const script = new Script(`(ctx) => ${content}`, { filename });
    const ctx = createContext({ ctx: context });
    // console.log({ result: result.trim() });
  }



  return {};
  // console.log({ dir })
};
