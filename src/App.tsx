import React from "react";
import { createRoot } from "react-dom/client";

function App(): React.JSX.Element {
  return <div>Hello World!</div>;
}

const domNode = document.getElementById("root");
if (!domNode) {
  throw new Error("missing root node");
}

const root = createRoot(domNode);
root.render(<App />);
