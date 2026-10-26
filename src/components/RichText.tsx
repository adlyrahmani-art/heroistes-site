import { Fragment } from "react";

/** Rend un texte où les passages entre ** ** sont en gras. */
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}
