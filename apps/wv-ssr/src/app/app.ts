import { createReadStream } from "node:fs";
import { Script } from "node:vm";
import { walk } from "jsr:@std/fs";
import { resolve, dirname } from "jsr:@std/path";
import Mustache from "mustache";

const path = new URL(".", import.meta.url).pathname;
const isControllerFile = (p: string) => /\+controller\.(ts|js)/.test(p);

type ControllerMeta = {
  pathToFile: string
  url: string // RegExp
};

const execute_controller_script = (
  { context, filepath, content }: { context: Context, filepath: string, content: string }
): Controller => {
  const script = new Script(`const c = (ctx) => ${content};c(context)`);
  return script.runInNewContext({ context });
}

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
}

const build_routes = async (routesDir: string): Promise<ControllerMeta[]>  => {
  const routes_meta: ControllerMeta[] = [];
  for await (const entity of walk(routesDir)) {
    if (entity.isFile && isControllerFile(entity.name)) {
      const [,urlWithFile] = entity.path.split(routesDir);
      const url = dirname(urlWithFile);

      routes_meta.push({
        pathToFile: entity.path,
        url,
      });
    }
  }

  return routes_meta;
};

const map_controller_meta_to_content  = async (controllers_metas: ControllerMeta[]): Promise<Map<ControllerMeta, string>> => {
  const promises = [];
  const _map = new Map<ControllerMeta, string>();
  for (const rm of controllers_metas) {
    promises.push((async () => {
      const content = await read_controller_content(rm.pathToFile);
      _map.set(rm, content);
    })());
  }

  await Promise.all(promises);
  return _map;
}

const escape_regexp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const create_route_pattern = (route: string) => {
  return route.split("/").map(segment => {
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
}

const create_route_pattern_controller_map = (meta_controllers_content_map: Map<ControllerMeta, string>): Map<string, Controller> => {
  const pattern_controller_map = new Map<string, Controller>();
  for (const [rm, content] of meta_controllers_content_map) {
    const controller = execute_controller_script({
      content,
      filepath: rm.pathToFile,
      context: {
        render: Mustache.render,
        db(model: string) {
          return {
            get(id: string) {
              return { name: "Anton", age: 29 };
            }
          }
        },
      }
    });
    const pattern = create_route_pattern(rm.url);
    pattern_controller_map.set(pattern, controller);
  }
  return pattern_controller_map;
}

const get_segment_specifity = (segment: string) => {
  if (segment.startsWith('(?:/(?<') && segment.endsWith('>)?')) return 0; // Optional parameter
  if (segment.startsWith('/(?<') && segment.endsWith('>[^/]+)')) return 1; // Required parameter
  if (segment.startsWith('(?:/(?<') && segment.endsWith('>.+))?')) return 2; // Rest parameter
  return 3; // Static segment
}

const sort_patterns = (patterns: string[]) => {
  return patterns.sort((a, b) => {
    const segmentsA = a.split('/').filter(Boolean);
    const segmentsB = b.split('/').filter(Boolean);

    const segmentDiff = segmentsB.length - segmentsA.length;
    if (segmentDiff !== 0) return segmentDiff;

    for (let i = 0; i < segmentsA.length; i++) {
      const specificityA = get_segment_specifity(segmentsA[i]);
      const specificityB = get_segment_specifity(segmentsB[i]);
      if (specificityA !== specificityB) return specificityB - specificityA;
    }

    return a.localeCompare(b);
  });
}


export const testFn = async (p: string) => {
  const controllers_dir_path = resolve(path, "./routes")
  const controllers_meta = await build_routes(controllers_dir_path);
  const controllers_meta_content_map = await map_controller_meta_to_content(controllers_meta);
  const pattern_controller_map = create_route_pattern_controller_map(controllers_meta_content_map);
  const sorted_patterns = sort_patterns(Array.from(pattern_controller_map.keys()));

  const match_route = (pathname: string): { params: Record<string, string>, controller: Controller } | null => {
    for (const pattern of sorted_patterns) {
      const match = pathname.match(new RegExp(`^${pattern}$`));
      console.log({ pattern, pathname, match  })
      if (match) {
        const params = match.groups || {};

        return { params, controller: pattern_controller_map.get(pattern)! };
      }
    }

    return null;
  };

  return match_route(p);
};

// required named parameter
// "[anton]".match(/^\[(\w+)\]$/)
// [
//     "[anton]",
//     "anton"
// ]

// part of the path
// "anton".match(/^\[(\w+)\]$/)
// null


// optional
// "[[anton]]".match(/^\[\[(\w+)\]\]$/)
// [
//     "[[anton]]",
//     "anton"
// ]

// rest
// "[...anton]".match(/^\[\.\.\.(\w+)\]$/)
// [
//     "[...anton]",
//     "anton"
// ]
