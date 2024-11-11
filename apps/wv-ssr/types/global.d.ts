interface Model {
  get(id: string): Record<string, string | number>
}

type Context = {
  render: (path: string, data: Record<string, unknown> | null, partials?: Record<string, string>) => Promise<string>
  db: (model: string) => Model
  Response: typeof Response
  resolve?: (...p: string[]) => string
};

type ControllerPayload = {
  url: URL
  params: Record<string, string>
};

// interface Controller {
//   get(p: ControllerPayload): string
//   post(p: ControllerPayload): string
//   put(p: ControllerPayload): string
//   delete(p: ControllerPayload): string
// }

type HttpMethod = "get" | "post" | "put" | "delete";

type Controller = {
  [method in HttpMethod]: (p: ControllerPayload) => Response
}

declare const ctx: Context;

// declare global {
//   var ctx: Context
// }
