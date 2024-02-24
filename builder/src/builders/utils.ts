import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Gets a library directory, relative to the current directory.
export const getLibraryDirectory = (path: string) =>
  join(dirname(fileURLToPath(import.meta.url)), "..", "..", "library", path);
