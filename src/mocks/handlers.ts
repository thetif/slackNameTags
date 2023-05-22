import { lookupHandler } from "./lookUpByEmail";
import { profileHandler } from "./profile";
import { imageHandler } from "./image";

// collection of all handlers
export const handlers = [lookupHandler, profileHandler, imageHandler];
