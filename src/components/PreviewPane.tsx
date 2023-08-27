import React from "react";

export type PreviewPaneProps = {
  pdfBlob: string | null;
};

export function PreviewPane(props: PreviewPaneProps): React.JSX.Element {
  return (
    <iframe
      className="preview"
      // type="application/pdf"
      src={props.pdfBlob || undefined}
    />
  );
}
