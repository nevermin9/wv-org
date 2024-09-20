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


declare var ctx: Context

// declare global {
//   var ctx: Context
// }
