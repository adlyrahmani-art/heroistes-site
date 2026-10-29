import { describe, expect, it } from "vitest";
import { splitCardTitle } from "@/components/home/splitCardTitle";

describe("splitCardTitle", () => {
  it("sépare l'amorce (jusqu'aux deux-points) du reste", () => {
    expect(splitCardTitle("Friction intentionnelle : quand briser les règles")).toEqual({
      lead: "Friction intentionnelle :",
      rest: "quand briser les règles",
    });
  });
  it("sans deux-points, tout le titre est l'amorce", () => {
    expect(splitCardTitle("Comment une simple refonte a fait chuter le rebond")).toEqual({
      lead: "Comment une simple refonte a fait chuter le rebond",
      rest: "",
    });
  });
});
