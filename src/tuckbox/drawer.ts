import {
  add,
  CMcomp,
  CMrot,
  CMstr,
  CMtranslate,
  dir2deg,
  Orientation,
  Point,
  pt,
} from "./tuckbox";
import jsPDF from "jspdf";

export class PDFDrawer {
  private paperSize: string;
  public doc: jsPDF;
  public center: Point;

  constructor(paperSize: string) {
    this.paperSize = paperSize;
    this.doc = new jsPDF("l", "in", paperSize, undefined);

    this.center = this.getResetCenter();
    this.doc.setLineWidth(1 / 128);
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
    // The * 0.6 is needed, for whatever reason, to make it centered
    const textHeight = (this.doc.internal.getLineHeight() / 72) * 0.6;
    const textWidth = (this.doc.getStringUnitWidth(s) * size) / 72;
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
