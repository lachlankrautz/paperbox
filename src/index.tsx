import { createRoot } from "react-dom/client";
import React from "react";
import { Window } from "./components/Window";

const domNode = document.getElementById("root");
if (!domNode) {
  throw new Error("missing root node");
}

const root = createRoot(domNode);
root.render(<Window pdfBlob="" />);
