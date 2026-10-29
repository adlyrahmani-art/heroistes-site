import type { SchemaTypeDefinition } from "sanity";
import { button } from "./objects/button";
import { imageWithAlt } from "./objects/imageWithAlt";
import { seo } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [imageWithAlt, button, seo];
