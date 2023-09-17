import { PDFDrawer } from "./drawer";
import { hexToRgb, pt } from "./layout";

export function drawSleeve(
  _drawer: PDFDrawer,
  _width: number,
  _length: number,
  _depth: number,
  _fill?: string,
) {
  const d = _drawer;
  const size = pt(_width, _length);
  const depth = _depth;
  const frontLength = size.x / 2;
  const tabLength = 1 / 4;

  d.doc.setDrawColor(160);
  let fill: string | undefined = undefined;
  if (_fill) {
    d.doc.setFillColor.apply(d, hexToRgb(_fill));
    fill = "DF";
  }

  const totalLength = frontLength + depth + size.x + tabLength;
  const currCenter = frontLength + depth + size.x / 2;
  d.resetCenter();
  d.center = d.p(-totalLength / 2 + currCenter, 0);

  d.rect(null, size, fill);

  const botX = (size.x + depth) / -2;

  //bottom
  d.rect(d.p(botX, 0), pt(depth, size.y), fill);

  //front
  d.rect(
    d.p(botX - (frontLength + depth) / 2, 0),
    pt(frontLength, size.y),
    fill,
  );

  //bottom flaps
  const flapLength = Math.min(frontLength, depth);
  d.trap(
    d.p(botX, (size.y + flapLength) / 2),
    depth,
    flapLength,
    1 / 16,
    "down",
    fill,
  );
  d.trap(
    d.p(botX, (size.y + flapLength) / -2),
    depth,
    flapLength,
    1 / 16,
    "up",
    fill,
  );

  // left side
  const leftAnchor = d.p(-size.x / 2, -size.y / 2);
  d.doc.lines(
    [
      [0, -depth],
      [frontLength, 0],
      [size.x - frontLength, depth],
    ],
    leftAnchor.x,
    leftAnchor.y,
    [1, 1],
    fill,
    true,
  );

  // right side
  const rightAnchorAnchor = d.p(-size.x / 2, size.y / 2);
  d.doc.lines(
    [
      [0, depth],
      [frontLength, 0],
      [size.x - frontLength, -depth],
    ],
    rightAnchorAnchor.x,
    rightAnchorAnchor.y,
    [1, 1],
    fill,
    true,
  );

  // lr flaps
  const lrFlapLength = Math.min(size.y / 2, depth);
  const lrFlapX = d.p((size.x - frontLength) / -2, 0).x;
  const lrFlapYOffset = size.y / 2 + depth + lrFlapLength / 2;
  d.trap(
    pt(lrFlapX, d.p(0, -lrFlapYOffset).y),
    frontLength,
    lrFlapLength,
    1 / 16,
    "up",
    fill,
  );
  d.trap(
    pt(lrFlapX, d.p(0, lrFlapYOffset).y),
    frontLength,
    lrFlapLength,
    1 / 16,
    "down",
    fill,
  );

  // tab
  d.flap(
    d.p(size.x / 2 + tabLength / 2, 0),
    1 / 2,
    tabLength,
    tabLength / 2,
    "right",
    fill,
  );
}
