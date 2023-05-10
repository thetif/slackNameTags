import { rest } from "msw";
import * as path from "path";
import * as fs from "fs";

const currentDirectory = path.resolve();

export const imageHandler = rest.get(
  "https://avatars.slack-edge.com/*",
  async (_, res, ctx) => {
    // Read the image from the file system using the "fs" module.
    const imageBuffer = fs.readFileSync(
      path.resolve(currentDirectory, "test-data/prince-akachi-unsplash.jpg")
    );

    return res(
      ctx.set("Content-Length", imageBuffer.byteLength.toString()),
      ctx.set("Content-Type", "image/jpeg"),
      // Respond with the "ArrayBuffer".
      ctx.body(imageBuffer)
    );
  }
);
