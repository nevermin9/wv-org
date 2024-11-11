import { createReadStream } from "node:fs";
import type { ControllerMeta } from "./types/index.ts";

const read_controller_content = (path: string): Promise<string> => {
  const stream = createReadStream(path, { encoding: "utf-8" });

  let data: string = "";
  return new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => {
      data += chunk;
    });
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(data))
  });
};

export const map_controller_meta_to_content  = async (controllers_metas: ControllerMeta[]): Promise<Map<ControllerMeta, string>> => {
  const promises = [];
  const _map = new Map<ControllerMeta, string>();
  for (const meta of controllers_metas) {
    promises.push((async () => {
      const content = await read_controller_content(meta.pathToFile);
      _map.set(meta, content);
    })());
  }

  await Promise.all(promises);
  return _map;
}

