import React, { CSSProperties } from "react";

// TODO validate PdfParams
// initial type is just a guess
export type PdfConfig = {
  paper?: string;
  height?: string | number;
  width?: string | number;
  depth?: string | number;
  inside?: string | number;
  color?: string;
  title?: string;
  imageBoxFront?: string;
  imageBoxBack?: string;
  imageBoxSide?: string;
  imageBoxTop?: string;
};

export type ConfiguratorProps = {
  onRebuildPreview: (pdfConfig: PdfConfig) => void;
  onDownload: (pdfConfig: PdfConfig) => void;
};

type State = PdfConfig & {
  unit: string;
  colorStyle?: CSSProperties;
};

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
    };
  }

  buildMeasurements() {
    const measurements: PdfConfig = {
      inside: this.state.inside,
      paper: this.state.paper,
      title: this.state.title,
      imageBoxFront: this.state.imageBoxFront,
      imageBoxBack: this.state.imageBoxBack,
      imageBoxSide: this.state.imageBoxSide,
      imageBoxTop: this.state.imageBoxTop,
    };

    let hasInvalid = false;

    const names: (keyof Pick<State, "width" | "height" | "depth">)[] = [
      "width",
      "height",
      "depth",
    ];

    names.forEach((prop) => {
      const val = Number(this.state[prop]);
      if (val > 0) {
        if (this.state.unit === "millimetres") {
          measurements[prop] = val * 0.03937;
        } else {
          measurements[prop] = val;
        }
      } else {
        hasInvalid = true;
      }
    });

    if (this.state.color) {
      const hexMatcher = /^#?([0-9a-f]{6})/i;
      const matches = hexMatcher.exec(this.state.color);
      if (matches) {
        measurements.color = matches[1];
      }
    }

    if (!hasInvalid) {
      return measurements;
    }
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
    const newState = {
      ...this.state,
      [key]: val,
    };

    if (key === "color" && val && typeof val === "string" && val.length === 6) {
      newState.colorStyle = {
        backgroundColor: "#" + val,
      };
    }

    this.setState(newState);
  }

  widthChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("width", e.currentTarget.value);
  }

  heightChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("height", e.currentTarget.value);
  }

  depthChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("depth", e.currentTarget.value);
  }

  colorChange(e: React.FormEvent<HTMLInputElement>) {
    this.changeState("color", e.currentTarget.value);
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
    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") {
          this.changeState("imageBoxBack", dataUrl);
        }
      });

      reader.readAsDataURL(file);
    } else {
      this.changeState("imageBoxBack", undefined);
    }
  }

  imageBoxFrontChange(e: React.FormEvent<HTMLInputElement>) {
    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") {
          this.changeState("imageBoxFront", dataUrl);
        }
      });

      reader.readAsDataURL(file);
    } else {
      this.changeState("imageBoxFront", undefined);
    }
  }

  imageBoxSideChange(e: React.FormEvent<HTMLInputElement>) {
    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") {
          this.changeState("imageBoxSide", dataUrl);
        }
      });

      reader.readAsDataURL(file);
    } else {
      this.changeState("imageBoxSide", undefined);
    }
  }

  imageBoxTopChange(e: React.FormEvent<HTMLInputElement>) {
    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") {
          this.changeState("imageBoxTop", dataUrl);
        }
      });

      reader.readAsDataURL(file);
    } else {
      this.changeState("imageBoxTop", undefined);
    }
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
              onChange={this.colorChange.bind(this)}
              value={this.state.color}
            />
          </div>
          <div className="col-xs-1" style={this.state.colorStyle}>
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
