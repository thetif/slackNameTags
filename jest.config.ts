import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  rootDir: "./src",
  setupFilesAfterEnv: ["../jest.setup.ts"],
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};

export default config;
