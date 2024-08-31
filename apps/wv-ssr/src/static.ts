import fs from "node:fs";
import path from "node:path"

const MIME_TYPES: Record<string, string> = {
  default: "application/octet-stream",
  html: "text/html, charset=utf-8",
  js: "text/javascript, charset=utf-8",
  css: "text/css",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  mp3: "audio/mpeg",
  ttf: "font/ttf",
}

type StaticFileReponse = {
  statusCode: number
  mimeType: string
  stream: fs.ReadStream
}

const toBool = [() => true, () => false];

export const createStaticHandler = (staticPath: string, notFoundPath: string) => {
  return async ({ pathname }: { pathname: string }): Promise<StaticFileReponse> => {
    const pathsList = [staticPath, pathname];
    const filePath = path.resolve(...pathsList);
    const isTraversing = !filePath.startsWith(staticPath);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !isTraversing && exists;
    const streamPath = found ? filePath : notFoundPath;
    const ext = path.extname(streamPath);
    const stream = fs.createReadStream(streamPath);
    const mimeType = MIME_TYPES[ext] || MIME_TYPES["default"];
    const statusCode = found ? 200 : 404;
    return { stream, mimeType, statusCode };
  }
};





