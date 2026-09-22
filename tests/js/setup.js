import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { readFileSync } from "node:fs";
import { join } from "node:path";

GlobalRegistrator.register();

const root = join(import.meta.dir, "../..");
const modelSrc = readFileSync(
  join(root, "inst/www/hierarchy-model.js"),
  "utf8"
);
const hierarchySrc = readFileSync(
  join(root, "inst/www/hierarchy.js"),
  "utf8"
);

eval(modelSrc);
eval(hierarchySrc);
