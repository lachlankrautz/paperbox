import {
  add,
  CMcomp,
  CMrot,
  CMstr,
  CMtranslate,
  dir2deg,
  hexToRgb,
  Orientation,
  Point,
  pt,
} from "./layout";
import jsPDF from "jspdf";

export class PDFDrawer {
  public doc: jsPDF;
  public center: Point;

  constructor() {
    this.doc = new jsPDF("l", "mm", "a4", undefined);
    this.center = this.getResetCenter();
    this.doc.setLineWidth(0.2);
  }

  getResetCenter(): Point {
    return pt(
      this.doc.internal.pageSize.width / 2,
      this.doc.internal.pageSize.height / 2,
    );
  }

  resetCenter() {
    this.center = this.getResetCenter();
  }

  // TODO unsure of type
  setLineDash(segments: string[]) {
    segments = segments ? segments : [];
    this.doc.internal.write("[" + segments.join(" ") + "] 0 d");
  }

  rect(cent: Point | null, size: Point, fill?: string) {
    cent = cent ? cent : this.center;
    fill = fill ? fill : "S";
    this.doc.rect(
      cent.x - size.x / 2,
      cent.y - size.y / 2,
      size.x,
      size.y,
      fill,
    );
  }

  line(p0: Point, p1: Point) {
    this.doc.line(p0.x, p0.y, p1.x, p1.y);
  }

  rotate(about: Point, deg: number) {
    const y = this.doc.internal.pageSize.height - about.y;
    const t0 = CMtranslate(-about.x, -y);
    const r = CMrot(deg);
    const t1 = CMtranslate(about.x, y);
    const cm = CMstr(CMcomp(CMcomp(t0, r), t1));
    this.doc.internal.write(cm);
  }

  flap(
    cent: Point,
    width: number,
    height: number,
    attenuation: number,
    orient: Orientation,
    fill?: string,
  ) {
    fill = fill ? fill : "S";
    // bottom left
    const x0 = cent.x - width / 2;
    const y0 = cent.y + height / 2;

    this.doc.internal.write("q");
    this.rotate(cent, dir2deg(orient));
    this.doc.lines(
      [
        [width, 0],
        [0, attenuation - height],
        [
          0,
          -attenuation,
          -attenuation,
          -attenuation,
          -attenuation,
          -attenuation,
        ],
        [-(width - 2 * attenuation), 0],
        [-attenuation, 0, -attenuation, attenuation, -attenuation, attenuation],
      ],
      x0,
      y0,
      [1, 1],
      fill,
      true,
    );
    this.doc.internal.write("Q");
  }

  /** Draws a flap with only one curved corner */
  flapSingle(
    cent: Point,
    width: number,
    height: number,
    attenuation: number,
    orient: Orientation,
    flip: boolean,
    fill?: string,
  ) {
    fill = fill ? fill : "S";
    // bottom left
    const x0 = cent.x - width / 2;
    const y0 = cent.y + height / 2;

    this.doc.internal.write("q");
    this.rotate(cent, dir2deg(orient));
    if (flip) {
      this.doc.lines(
        [
          [width, 0],
          [0, -height],
          [attenuation - width, 0],
          [
            -attenuation,
            0,
            -attenuation,
            attenuation,
            -attenuation,
            attenuation,
          ],
        ],
        x0,
        y0,
        [1, 1],
        fill,
        true,
      );
    } else {
      this.doc.lines(
        [
          [width, 0],
          [0, attenuation - height],
          [
            0,
            -attenuation,
            -attenuation,
            -attenuation,
            -attenuation,
            -attenuation,
          ],
          [attenuation - width, 0],
        ],
        x0,
        y0,
        [1, 1],
        fill,
        true,
      );
    }
    this.doc.internal.write("Q");
  }

  trap(
    cent: Point,
    width: number,
    height: number,
    attenuation: number,
    orient: Orientation,
    fill?: string,
  ) {
    fill = fill ? fill : "S";
    // bottom left
    const x0 = cent.x - width / 2;
    const y0 = cent.y + height / 2;

    this.doc.internal.write("q");
    this.rotate(cent, dir2deg(orient));
    this.doc.lines(
      [
        [width, 0],
        [-attenuation, -height],
        [-(width - 2 * attenuation), 0],
      ],
      x0,
      y0,
      [1, 1],
      fill,
      true,
    );
    this.doc.internal.write("Q");
  }

  p(x: number, y: number) {
    return add(this.center, x, y);
  }

  /**
   /** Adds text
   * @param s The text
   * @param cent Text will be centered (horizontally & vertically) on this point
   * @param size Size (in pts) for the text
   * @param orient Orientation for the text: 'up' | 'down' | 'left' | 'right'
   */
  text(s: string, cent: Point, size: number, orient: Orientation) {
    this.doc.setFontSize(size);

    // TODO title should have a colour
    // this.doc.setTextColor("#008000");

    // The * 0.6 is needed, for whatever reason, to make it centered
    const inchesToMm = 0.03937;
    const textHeight =
      ((this.doc.internal.getLineHeight() / 72) * 0.6) / inchesToMm;
    const textWidth = (this.doc.getStringUnitWidth(s) * size) / 72 / inchesToMm;
    const rot = dir2deg(orient);
    const r = CMrot(rot);
    const rv = CMcomp([textWidth / 2, textHeight / 2], r);

    const textX = cent.x - rv[0];
    const textY = cent.y + rv[1];
    this.doc.text(s, textX, textY, null, (rot * 180) / Math.PI);
  }

  buildPdfUriString() {
    return this.doc.output("datauristring");
  }

  save() {
    this.doc.save("tuckbox");
  }

  // TODO if it works without it delete it
  // flush() {
  //   document.getElementById("pdf-preview").src = this.buildPdfUriString();
  // }
}

export function drawDrawer(
  _drawer: PDFDrawer,
  _width: number,
  _length: number,
  _height: number,
  _gap: number,
  _fill?: string,
) {
  const size = pt(_width, _length);
  const height = _height;
  const gap_width = _gap;
  const d = _drawer;

  d.doc.setDrawColor(160);
  let fill: string | undefined = undefined;
  // TODO does this even do anything?
  // seems like fill colour is already set at this point
  if (_fill) {
    d.doc.setFillColor(...hexToRgb(_fill));
    fill = "DF";
  }

  //base
  d.rect(null, size, fill);

  //left-right wings
  let x_offset = size.x / 2 + height / 2;
  d.rect(d.p(x_offset, 0), pt(height, size.y), fill);
  d.rect(d.p(-x_offset, 0), pt(height, size.y), fill);

  //top-bottom winglets
  let y_offset = size.y / 2 + height / 2;
  const winglet_width = (size.x - gap_width) / 2;
  x_offset = (gap_width + winglet_width) / 2;
  d.rect(d.p(x_offset, y_offset), pt(winglet_width, height), fill);
  d.rect(d.p(-x_offset, y_offset), pt(winglet_width, height), fill);
  d.rect(d.p(x_offset, -y_offset), pt(winglet_width, height), fill);
  d.rect(d.p(-x_offset, -y_offset), pt(winglet_width, height), fill);

  // flaps
  const flap_length = Math.min(height, winglet_width);
  x_offset = size.x / 2 + height / 2;
  y_offset = size.y / 2 + flap_length / 2;
  d.trap(d.p(x_offset, y_offset), height, flap_length, 1.5, "down", fill);
  d.trap(d.p(-x_offset, y_offset), height, flap_length, 1.5, "down", fill);
  d.trap(d.p(x_offset, -y_offset), height, flap_length, 1.5, "up", fill);
  d.trap(d.p(-x_offset, -y_offset), height, flap_length, 1.5, "up", fill);
}
