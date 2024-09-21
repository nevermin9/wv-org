interface Model {
  get(id: string): Record<string, string | number>
}

type Context = {
  render: (path: string, data: Record<string, unknown> | void) => string
  db: (model: string) => Model
}

type ControllerPayload = {
  url: URL
  params: Record<string, string>
}

interface Controller {
  get(p: ControllerPayload): string
  post(p: ControllerPayload): string
  put(p: ControllerPayload): string
  delete(p: ControllerPayload): string
}


declare var ctx: Context

// declare global {
//   var ctx: Context
// }
