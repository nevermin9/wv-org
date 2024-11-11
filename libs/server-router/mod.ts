import { create_controllers_meta } from "./create_controllers_meta.ts"
import { map_controller_meta_to_content } from "./map_controller_meta_to_content.ts"
import { create_url_pattern_controller_map } from "./create_url_pattern_controller_map.ts"
import { sort_patterns } from "./sort_url_patters.ts";
import { dirname } from "@std/path";
import type { ContextWithResolve } from "./types/index.ts";

export const create_router = async <T, V extends ContextWithResolve>({
  dirPath,
  context,
}: { dirPath: string, context: V }) => {
  const controllers_meta = await create_controllers_meta(dirPath);
  const controllers_meta_content_map = await map_controller_meta_to_content(controllers_meta);
  const pattern_controller_map = create_url_pattern_controller_map<T, V>(controllers_meta_content_map, context);
  const sorted_patterns = sort_patterns(Array.from(pattern_controller_map.keys()));
  for (const m of controllers_meta) {
    console.log({ controllers_meta: dirname(m.pathToFile) })
  }

  const match_route = (pathname: string): { params: Record<string, string>, controller: T } | null => {
    for (const pattern of sorted_patterns) {
      const match = pathname.match(new RegExp(`^${pattern}$`));

      //console.log({ pattern, pathname, match  });

      if (match) {
        const params = match.groups || {};

        return { params, controller: pattern_controller_map.get(pattern)! };
      }
    }

    return null;
  };

  return {
    match_route
  }
};
