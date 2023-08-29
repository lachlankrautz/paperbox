import React from "react";
import { makeBox } from "../tuckbox/tuckbox";
import { Configurator, PdfConfig } from "./Configurator";
import { PreviewPane } from "./PreviewPane";

export type ImageMap = {
  boxFront?: string;
  boxBack?: string;
  boxSide?: string;
  boxTop?: string;
};

const generatePdf = (params: PdfConfig) => {
  const images: ImageMap = {
    boxFront: params.imageBoxFront,
    boxBack: params.imageBoxBack,
    boxSide: params.imageBoxSide,
    boxTop: params.imageBoxTop,
  };

  return makeBox(
    params.paper,
    params.height,
    params.width,
    params.depth,
    params.inside,
    params.color,
    params.title,
    images,
  );
};

const downloadPdf = function (params: PdfConfig) {
  generatePdf(params).save();
};

export class Window extends React.Component<
  { pdfBlob: string },
  { pdfBlob: string | null }
> {
  constructor(props: { pdfBlob: string }) {
    super(props);
    this.state = {
      pdfBlob: null,
    };
  }

  generatePreview(params: PdfConfig): void {
    this.setState({
      pdfBlob: generatePdf(params).buildPdfUriString(),
    });
  }

  render() {
    return (
      <div className="app container">
        <div className="row">
          <h2>Tuckbox Generator</h2>
          <hr />
          <div className="col-xs-4">
            <Configurator
              onRebuildPreview={this.generatePreview.bind(this)}
              onDownload={downloadPdf}
            />
          </div>
          <div className="col-xs-7">
            <PreviewPane pdfBlob={this.state.pdfBlob} />
          </div>
        </div>
      </div>
    );
  }
}
