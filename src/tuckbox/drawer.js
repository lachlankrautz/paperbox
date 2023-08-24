import { CMcomp, CMrot, CMstr, CMtranslate, pt } from "./tuckbox";

export function PDFDrawer(paperSize) {
  this.paperSize = paperSize;
  this.doc = new jsPDF("l", "in", paperSize, undefined);
  this.resetCenter();
  this.doc.setLineWidth(1 / 128);
  return this;
}

PDFDrawer.prototype.resetCenter = function () {
  this.center = pt(
    this.doc.internal.pageSize.width / 2,
    this.doc.internal.pageSize.height / 2,
  );
};

PDFDrawer.prototype.setLineDash = function (segments) {
  segments = segments ? segments : [];
  this.doc.internal.write("[" + segments.join(" ") + "] 0 d");
};

PDFDrawer.prototype.rect = function (cent, size, fill) {
  cent = cent ? cent : this.center;
  fill = fill ? fill : "S";
  this.doc.rect(cent.x - size.x / 2, cent.y - size.y / 2, size.x, size.y, fill);
};

PDFDrawer.prototype.line = function (p0, p1) {
  this.doc.line(p0.x, p0.y, p1.x, p1.y);
};

PDFDrawer.prototype.rotate = function (about, deg) {
  const y = this.doc.internal.pageSize.height - about.y;
  const t0 = CMtranslate(-about.x, -y);
  const r = CMrot(deg);
  const t1 = CMtranslate(about.x, y);
  const cm = CMstr(CMcomp(CMcomp(t0, r), t1));
  this.doc.internal.write(cm);
};

PDFDrawer.prototype.flap = function (
  cent,
  width,
  height,
  attenuation,
  orient,
  fill,
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
      [0, -attenuation, -attenuation, -attenuation, -attenuation, -attenuation],
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
};

/** Draws a flap with only one curved corner */
PDFDrawer.prototype.flapSingle = function (
  cent,
  width,
  height,
  attenuation,
  orient,
  flip,
  fill,
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
        [-attenuation, 0, -attenuation, attenuation, -attenuation, attenuation],
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
};

PDFDrawer.prototype.trap = function (
  cent,
  width,
  height,
  attenuation,
  orient,
  fill,
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
};

PDFDrawer.prototype.p = function (x, y) {
  return add(this.center, x, y);
};

/**
 /** Adds text
 * @param s The text
 * @param cent Text will be centered (horizontally & vertically) on this point
 * @param size Size (in pts) for the text
 * @param orient Orientation for the text: 'up' | 'down' | 'left' | 'right'
 */
PDFDrawer.prototype.text = function (s, cent, size, orient) {
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
};

PDFDrawer.prototype.buildPdfUriString = function () {
  return this.doc.output("datauristring");
};

PDFDrawer.prototype.save = function () {
  this.doc.save("tuckbox");
};

PDFDrawer.prototype.flush = function () {
  document.getElementById("pdf-preview").src = this.buildPdfUriString();
};
