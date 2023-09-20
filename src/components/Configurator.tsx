import React, { CSSProperties } from "react";

// TODO validate PdfParams
// initial type is just a guess
export type PdfConfig = {
  paper: string;
  height: number;
  width: number;
  depth: number;
  inside: string | number;
  fillColour: string;
  textColour: string;
  title: string;
  frontImage?: HTMLImageElement;
  backImage?: HTMLImageElement;
  sideImage?: HTMLImageElement;
  topImage?: HTMLImageElement;
};

export type ConfiguratorProps = {
  onRebuildPreview: (pdfConfig: PdfConfig) => void;
  onDownload: (pdfConfig: PdfConfig) => void;
};

type State = PdfConfig & {
  unit: string;
  fillColourStyle?: CSSProperties;
  textColourStyle?: CSSProperties;
};

function getDimensionWithUnit(size: number, unit: string): number | Error {
  if (size <= 0) {
    return Error("config dimension is less than or equal to zero");
  }

  if (unit === "millimetres") {
    return size * 0.03937;
  }

  return size;
}

export class Configurator extends React.Component<ConfiguratorProps, State> {
  constructor(props: ConfiguratorProps) {
    super(props);
    this.state = {
      paper: "a4",
      unit: "millimetres",
      inside: "none",
      height: 89,
      width: 64,
      depth: 13,
      title: "",
      fillColour: "#ffffff",
      textColour: "#000000",
    };
  }

  buildMeasurements(): PdfConfig | undefined {
    const width = getDimensionWithUnit(this.state.width, this.state.unit);
    if (width instanceof Error) {
      return;
    }

    const height = getDimensionWithUnit(this.state.height, this.state.unit);
    if (height instanceof Error) {
      return;
    }

    const depth = getDimensionWithUnit(this.state.depth, this.state.unit);
    if (depth instanceof Error) {
      return;
    }

    const measurements: PdfConfig = {
      inside: this.state.inside,
      paper: this.state.paper,
      title: this.state.title,
      width,
      height,
      depth,
      fillColour: this.state.fillColour,
      textColour: this.state.textColour,
      frontImage: this.state.frontImage,
      backImage: this.state.backImage,
      sideImage: this.state.sideImage,
      topImage: this.state.topImage,
    };

    if (this.state.fillColour) {
      const hexMatcher = /^#?([0-9a-f]{6})/i;
      const matches = hexMatcher.exec(this.state.fillColour);
      if (matches) {
        measurements.fillColour = matches[1];
      }
    }

    if (this.state.textColour) {
      const hexMatcher = /^#?([0-9a-f]{6})/i;
      const matches = hexMatcher.exec(this.state.textColour);
      if (matches) {
        measurements.textColour = matches[1];
      }
    }

    return measurements;
  }

  componentDidMount() {
    this.handleSubmit();
  }

  handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) {
      e.preventDefault();
    }
    const measurements = this.buildMeasurements();
    if (measurements) {
      this.props.onRebuildPreview(measurements);
    }
  }

  handleDownload(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();

    const measurements = this.buildMeasurements();
    if (measurements) {
      this.props.onDownload(measurements);
    }
  }

  changeState<T extends keyof State>(key: T, val: State[T]) {
    const newState: State = {
      ...this.state,
      [key]: val,
    };

    if (
      key === "fillColour" &&
      val &&
      typeof val === "string" &&
      val.length === 6
    ) {
      newState.fillColourStyle = {
        backgroundColor: "#" + val,
      };
    }

    if (
      key === "textColour" &&
      val &&
      typeof val === "string" &&
      val.length === 6
    ) {
      newState.textColourStyle = {
        backgroundColor: "#" + val,
      };
    }

    this.setState(newState);
  }

  widthChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("width", Number(e.currentTarget.value));
  }

  heightChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("height", Number(e.currentTarget.value));
  }

  depthChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("depth", Number(e.currentTarget.value));
  }

  fillColourChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("fillColour", e.currentTarget.value);
  }

  textColourChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("textColour", e.currentTarget.value);
  }

  insideChange(e: React.FormEvent<HTMLSelectElement>) {
    this.changeState("inside", e.currentTarget.value);
  }

  paperChange(e: React.FormEvent<HTMLSelectElement>) {
    this.changeState("paper", e.currentTarget.value);
  }

  unitChange(e: React.FormEvent<HTMLSelectElement>) {
    this.changeState("unit", e.currentTarget.value);
  }

  titleChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("title", e.currentTarget.value);
  }

  imageBoxBackChange(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      this.changeState("backImage", undefined);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageData = reader.result;
      if (typeof imageData === "string") {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          this.changeState("backImage", img);
        };
      }
    });
    reader.readAsDataURL(file);
  }

  imageBoxFrontChange(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      this.changeState("frontImage", undefined);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageData = reader.result;
      if (typeof imageData === "string") {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          this.changeState("frontImage", img);
        };
      }
    });
    reader.readAsDataURL(file);
  }

  imageBoxSideChange(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      this.changeState("sideImage", undefined);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageData = reader.result;
      if (typeof imageData === "string") {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          this.changeState("sideImage", img);
        };
      }
    });
    reader.readAsDataURL(file);
  }

  imageBoxTopChange(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      this.changeState("topImage", undefined);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageData = reader.result;
      if (typeof imageData === "string") {
        const img = new Image();
        img.src = imageData;
        img.onload = () => {
          this.changeState("topImage", img);
        };
      }
    });
    reader.readAsDataURL(file);
  }

  render() {
    return (
      <form
        className="configurator form-horizontal"
        onSubmit={this.handleSubmit.bind(this)}
      >
        <div className="form-group">
          <label className="control-label col-xs-4">Paper Size</label>
          <div className="col-xs-8">
            <select
              className="form-control"
              onChange={this.paperChange.bind(this)}
              value={this.state.paper}
            >
              <option value="letter">Letter</option>
              <option value="a4">A4</option>
              <option value="a0">A0</option>
              <option value="a1">A1</option>
              <option value="a2">A2</option>
              <option value="a3">A3</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Unit</label>
          <div className="col-xs-8">
            <select
              className="form-control"
              onChange={this.unitChange.bind(this)}
              value={this.state.unit}
            >
              <option value="inches">Inches</option>
              <option value="millimetres">Millimetres</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Card width</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="text"
              onChange={this.widthChange.bind(this)}
              value={this.state.width}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Card height</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="text"
              onChange={this.heightChange.bind(this)}
              value={this.state.height}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box depth</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="text"
              onChange={this.depthChange.bind(this)}
              value={this.state.depth}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box Color</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="color"
              onChange={this.fillColourChange.bind(this)}
              value={this.state.fillColour}
            />
          </div>
          <div className="col-xs-1" style={this.state.fillColourStyle}>
            &nbsp;
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Drawer Style</label>
          <div className="col-xs-8">
            <select
              className="form-control"
              onChange={this.insideChange.bind(this)}
              value={this.state.inside}
            >
              <option value="tray">Tray</option>
              <option value="sleeve">Sleeve</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Title</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="text"
              onChange={this.titleChange.bind(this)}
              value={this.state.title}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Text Color</label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="color"
              onChange={this.textColourChange.bind(this)}
              value={this.state.textColour}
            />
          </div>
          <div className="col-xs-1" style={this.state.textColourStyle}>
            &nbsp;
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box Front</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="file"
              onChange={this.imageBoxFrontChange.bind(this)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box Back</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="file"
              onChange={this.imageBoxBackChange.bind(this)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box Side</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="file"
              onChange={this.imageBoxSideChange.bind(this)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-4">Box Top</label>
          <div className="col-xs-8">
            <input
              className="form-control"
              type="file"
              onChange={this.imageBoxTopChange.bind(this)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-xs-offset-4 col-xs-8">
            <button className="btn btn-default" type="submit">
              Preview
            </button>
            <button
              className="btn btn-default"
              onClick={this.handleDownload.bind(this)}
            >
              Download
            </button>
          </div>
        </div>
      </form>
    );
  }
}
