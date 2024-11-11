import { Script } from "node:vm";
import { escape_regexp } from "@wv-org/helpers";
import type { ControllerMeta } from "./types/index.ts";
import { dirname, resolve } from "@std/path";

const create_url_pattern = (url: string) => {
  return url.split("/").map(segment => {
    if (!segment) return "";

    if (segment.startsWith("[[") && segment.endsWith("]]")) {
      return `(?:/(?<${segment.slice(2, -2)}>[^/]+))?`;
    } else if (segment.startsWith("[...") && segment.endsWith("]")) {
      return `(?:/(?<${segment.slice(4, -1)}>.+))?`;
    } else if (segment.startsWith("[") && segment.endsWith("]")) {
      return `/(?<${segment.slice(1, -1)}>[^/]+)`;
    }

    return `/${escape_regexp(segment)}`;
  }).join("") + "/?";
};
const execute_controller_script = <T, V>(
  { context, filename, content }: { context: V, filename: string, content: string }
): T => {

  const _resolve = (...paths: string[]): string => resolve(dirname(filename), ...paths);

  const script = new Script(`const c = (ctx) => ${content};c(context)`, { filename });
  return script.runInNewContext({ context, resolve: _resolve });
};

export const create_url_pattern_controller_map = <T, V>(meta_controllers_content_map: Map<ControllerMeta, string>, context: V): Map<string, T> => {
  const pattern_controller_map = new Map<string, T>();
  for (const [rm, content] of meta_controllers_content_map) {
    const controller = execute_controller_script<T, V>({
      content,
      filename: rm.pathToFile,
      context
    });

    const pattern = create_url_pattern(rm.url);
    pattern_controller_map.set(pattern, controller);
  }

  return pattern_controller_map;
};
