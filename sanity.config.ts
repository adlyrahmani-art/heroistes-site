import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { documentActions, resolveNewDocumentOptions } from "./src/sanity/documentRules";

export default defineConfig({
  basePath: studioUrl,
  title: "Héroïstes",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: { actions: documentActions, newDocumentOptions: resolveNewDocumentOptions },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
