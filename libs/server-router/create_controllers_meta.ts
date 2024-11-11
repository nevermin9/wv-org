import { dirname } from "jsr:@std/path";
import { walk } from "jsr:@std/fs";
import type { ControllerMeta } from "./types/index.ts";

const is_controller_file = (p: string) => /\+controller\.(ts|js)/.test(p);

export const create_controllers_meta = async (dirPath: string): Promise<ControllerMeta[]>  => {
  const controllers_meta: ControllerMeta[] = [];
  for await (const entity of walk(dirPath)) {
    if (entity.isFile && is_controller_file(entity.name)) {
      const [,urlWithFile] = entity.path.split(dirPath);
      const url = dirname(urlWithFile);

      controllers_meta.push({
        pathToFile: entity.path,
        url,
      });
    }
  }

  return controllers_meta;
};
