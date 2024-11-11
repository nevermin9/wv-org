import { createReadStream } from "node:fs";
import Mustache from "mustache";
import { basename, dirname } from "@std/path";

const read_template = (path: string): Promise<string> => {
  const stream = createReadStream(path, "utf-8");

  return new Promise((resolve, reject) => {
    let template = "";

    stream.on("error", reject);

    stream.on("data", (str) => {
      template += str;
    });

    stream.on("end", () => resolve(template));
  });
};

let base_template = "";
export const set_base_template = async (path: string) => {
  if (!base_template) {
    base_template = await read_template(path);
  }
};
const get_base_template = () => {
  return base_template;
};

const get_nearest_layout_template = async (path: string) => {
  const dirpath = dirname(path);

  const dirpathArr = dirpath.split("/");
  const length = dirpathArr.length;

  for (let k = length - 1; k > 0; k--) {
    const path = dirpathArr.join("/")
    try {
      const layout = await read_template(`${path}/+layout.html`);
      if (layout) {
        return layout;
      }
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        dirpathArr.pop();
      } else {
        throw err;
      }
    }
  }

  return "";
};

const render_page = async (path: string, view: Record<string, unknown> | null, partials?: Record<string, string>) => {
  const [page, layout] = await Promise.all([
    read_template(path),
    get_nearest_layout_template(path),
  ]);

  const _v = view || {};
  return Mustache.render(get_base_template(), _v, { page, layout });
};

const render_template = async (path: string, view: Record<string, unknown> | null, partials?: Record<string, string>) => {
  const template = await read_template(path);
  const _v = view || {};
  return Mustache.render(template, _v);
};


export const render = async (path: string, view: Record<string, unknown> | null, partials?: Record<string, string>): Promise<string> => {
  const filename = basename(path);

  if (filename === "+page.html") {
    return render_page(path, view, partials);
  }

  return render_template(path, view, partials);
};





