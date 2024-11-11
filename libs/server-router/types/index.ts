
export type ControllerMeta = {
  pathToFile: string
  url: string
};

export interface ContextWithResolve {
  resolve?: (...paths: string[]) => string
}

