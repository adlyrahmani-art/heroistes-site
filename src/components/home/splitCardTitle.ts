/** Sépare un titre d'article : amorce en gras jusqu'aux deux-points inclus, puis suite en texte courant. */
export function splitCardTitle(title: string): { lead: string; rest: string } {
  const m = /^([^:]*:)\s+([\s\S]+)$/.exec(title);
  return m ? { lead: m[1], rest: m[2] } : { lead: title, rest: "" };
}
