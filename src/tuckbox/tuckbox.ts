import { drawDrawer, PDFDrawer } from "./drawer";
import { ImageMap } from "../components/Window";
import { add, Flap, hexToRgb, Panel, Point, pt } from "./layout";
import { drawSleeve } from "./sleeve";

type PanelLayout = {
  top: Panel;
  bottom: Panel;
  left: Panel;
  right: Panel;
};

type FlapLayout = {
  side: Flap;
  bot_bot: Flap;
  l_bot: Flap;
  l_top: Flap;
  r_bot: Flap;
  r_top: Flap;
  top_bot: Flap;
  top_top: Flap;
  top_top_top: Flap;
};

function drawPanel(d: PDFDrawer, pan: Panel, fill: string | undefined) {
  d.rect(pan.loc, pan.size, fill);
}

function drawFlap(d: PDFDrawer, flap: Flap, fill: string | undefined) {
  if (flap.kind === "outside") {
    d.rect(flap.loc, flap.size, fill);
  } else if (flap.kind === "curved") {
    const att = Math.min(flap.size.x / 2, flap.size.y);
    d.flap(flap.loc, flap.size.x, flap.size.y, att, flap.orient, fill);
  } else if (flap.kind === "curvedRight") {
    const att = Math.min(flap.size.x, flap.size.y);
    d.flapSingle(
      flap.loc,
      flap.size.x,
      flap.size.y,
      att,
      flap.orient,
      false,
      fill,
    );
  } else if (flap.kind === "curvedLeft") {
    const att = Math.min(flap.size.x, flap.size.y);
    d.flapSingle(
      flap.loc,
      flap.size.x,
      flap.size.y,
      att,
      flap.orient,
      true,
      fill,
    );
  } else {
    const att = 1.5875;
    d.trap(flap.loc, flap.size.x, flap.size.y, att, flap.orient, fill);
  }
}

function drawThumbCutout(
  d: PDFDrawer,
  panels: Record<string, Panel>,
  size: BoxSize,
) {
  const r = 8.46;
  const x = panels.bottom.loc.x - r;
  const y = panels.bottom.loc.y - size.main.y / 2;
  const xOffset = 2 * r;
  const yOffset = (4 / 3) * r;
  d.doc.lines([[0, yOffset, xOffset, yOffset, xOffset, 0]], x, y);
}

function imagePanel(
  d: PDFDrawer,
  img: HTMLImageElement,
  pos: Point,
  size: Point,
  rot: number,
) {
  // pica.
  // pica.resize();
  const imageX = pos.x - size.x / 2;
  const imageY = pos.y - size.y / 2;
  d.doc.addImage(
    img.src,
    "JPEG",
    imageX,
    imageY,
    size.x,
    size.y,
    null,
    null,
    rot,
  );
}

type BoxSize = {
  main: Point;
  side_panel: Point;
  side_flap: Point;
  lr_flap: Point;
  bt_flap: Point;
  top_top_flap: Point;
};

export function drawBox(
  _drawer: PDFDrawer,
  _width: number,
  _length: number,
  _height: number,
  _fill: string | undefined,
  _textColour: string | undefined,
  _title: string,
  _imgs: ImageMap,
) {
  const d = _drawer;
  const depths = {
    side_flap: _height * 0.9,
    bot_flap: _height,
  };
  const size: BoxSize = {
    main: pt(_length, _width),
    side_panel: pt(_height, _width),
    side_flap: pt(depths.side_flap, _width),
    lr_flap: pt(_height, Math.min(depths.bot_flap, 15.875)),
    bt_flap: pt(_length, depths.bot_flap),
    top_top_flap: pt(_length, Math.max(_height / 2, 12.7)),
  };
  const height = _height;

  d.doc.setDrawColor(160);
  let fill: string | undefined = undefined;
  if (_fill) {
    d.doc.setFillColor(...hexToRgb(_fill));
    fill = "DF";
  }

  if (_textColour) {
    d.doc.setTextColor(...hexToRgb(_textColour));
  }

  const frontImage = _imgs.boxFront;
  const backImage = _imgs.boxBack;
  const sideImage = _imgs.boxSide;
  const topImage = _imgs.boxTop;
  const totalLength =
    size.main.x * 2 + size.side_panel.x * 2 + size.side_flap.x;
  const currCenterX = size.main.x * 1.5 + size.side_panel.x;
  const totalHeight = size.main.y + size.bt_flap.y * 2 + size.top_top_flap.y;
  const currCenterY = size.bt_flap.y + size.main.y / 2;

  d.resetCenter();
  d.center = d.p(
    (totalLength / 2 - currCenterX) / 2,
    (totalHeight / 2 - currCenterY) / 2,
  );

  const panels: PanelLayout = {
    top: {
      loc: d.p(size.main.x / 2, 0),
      size: size.main,
    },
    bottom: {
      loc: d.p(-size.main.x / 2 - height, 0),
      size: size.main,
    },
    left: {
      loc: d.p(-height / 2, 0),
      size: size.side_panel,
    },
    right: {
      loc: d.p(size.main.x + height / 2, 0),
      size: size.side_panel,
    },
  };

  const flaps: FlapLayout = {
    side: {
      loc: pt(
        panels.bottom.loc.x - (size.main.x + depths.side_flap) / 2,
        panels.bottom.loc.y,
      ),
      size: pt(size.side_flap.y, depths.side_flap),
      orient: "left",
      kind: "inside",
    },
    bot_bot: {
      loc: add(
        panels.bottom.loc,
        0,
        (panels.bottom.size.y + size.bt_flap.y) / 2,
      ),
      size: size.bt_flap,
      orient: "down",
      kind: "inside",
    },
    l_bot: {
      loc: add(panels.left.loc, 0, (panels.bottom.size.y + size.lr_flap.y) / 2),
      size: size.lr_flap,
      orient: "down",
      kind: "inside",
    },
    l_top: {
      loc: add(
        panels.left.loc,
        0,
        (-panels.bottom.size.y - size.lr_flap.y) / 2,
      ),
      size: size.lr_flap,
      orient: "up",
      kind: "curvedLeft",
    },
    r_bot: {
      loc: add(
        panels.right.loc,
        0,
        (panels.bottom.size.y + size.lr_flap.y) / 2,
      ),
      size: size.lr_flap,
      orient: "down",
      kind: "inside",
    },
    r_top: {
      loc: add(
        panels.right.loc,
        0,
        (-panels.bottom.size.y - size.lr_flap.y) / 2,
      ),
      size: size.lr_flap,
      orient: "up",
      kind: "curvedRight",
    },
    top_bot: {
      loc: add(panels.top.loc, 0, (panels.bottom.size.y + size.bt_flap.y) / 2),
      size: size.bt_flap,
      kind: "outside",
      orient: undefined,
    },
    top_top: {
      loc: add(panels.top.loc, 0, -(panels.bottom.size.y + size.bt_flap.y) / 2),
      size: size.bt_flap,
      kind: "outside",
      orient: undefined,
    },
    top_top_top: {
      loc: add(
        panels.top.loc,
        0,
        -size.bt_flap.y - (panels.bottom.size.y + size.top_top_flap.y) / 2,
      ),
      size: size.top_top_flap,
      kind: "curved",
      orient: "up",
    },
  };

  if (frontImage) {
    imagePanel(d, frontImage, panels.top.loc, panels.top.size, 0);
  }
  if (backImage) {
    imagePanel(d, backImage, panels.bottom.loc, panels.bottom.size, 0);
    // TODO - display bottom image in flap so visible behind thumb hole
  }

  if (sideImage) {
    imagePanel(d, sideImage, panels.left.loc, panels.left.size, 0);
    imagePanel(d, sideImage, panels.right.loc, panels.right.size, 0);
  }

  if (topImage) {
    imagePanel(d, topImage, flaps.top_top.loc, flaps.top_top.size, 0);
    imagePanel(d, topImage, flaps.top_bot.loc, flaps.top_bot.size, 0);
  }

  drawPanel(d, panels.top, frontImage ? undefined : fill);
  drawPanel(d, panels.bottom, backImage ? undefined : fill);
  drawPanel(d, panels.left, sideImage ? undefined : fill);
  drawPanel(d, panels.right, sideImage ? undefined : fill);

  drawFlap(d, flaps.side, fill);
  drawFlap(d, flaps.bot_bot, fill);
  drawFlap(d, flaps.l_bot, fill);
  drawFlap(d, flaps.r_bot, fill);
  drawFlap(d, flaps.l_top, fill);
  drawFlap(d, flaps.r_top, fill);
  drawFlap(d, flaps.top_bot, fill);
  drawFlap(d, flaps.top_top, fill);
  drawFlap(d, flaps.top_top_top, fill);

  // title
  d.doc.setFont("helvetica", "bold");
  d.text(_title, add(panels.top.loc, 0, panels.top.size.y * 0.25), 20, "up");

  drawThumbCutout(d, panels, size);

  // Add cut points
  d.doc.setDrawColor(0);
  const cutLength = 9.525;
  const halfWidth = size.main.x / 2;

  // Top flap
  const topMid = pt(
    flaps.top_top.loc.x,
    flaps.top_top.loc.y - flaps.top_top.size.y / 2,
  );
  d.line(add(topMid, -halfWidth, 0), add(topMid, cutLength - halfWidth, 0));
  d.line(add(topMid, halfWidth, 0), add(topMid, halfWidth - cutLength, 0));

  // Back
  const backMid = pt(
    panels.top.loc.x,
    panels.top.loc.y - panels.top.size.y / 2,
  );
  d.line(add(backMid, -halfWidth, 0), add(backMid, -halfWidth, cutLength));
  d.line(add(backMid, halfWidth, 0), add(backMid, halfWidth, cutLength));
}

export function makeBox(
  cardWidth: number,
  cardHeight: number,
  boxDepth: number,
  inside: string | number,
  fillColour: string | undefined,
  textColour: string | undefined,
  title: string,
  images: ImageMap,
) {
  const drawer = new PDFDrawer();

  let hasInside = false;
  if (inside === "sleeve") {
    drawSleeve(drawer, cardWidth, cardHeight, boxDepth, fillColour);
    drawer.doc.addPage();
    hasInside = true;
  } else if (inside === "tray") {
    drawer.resetCenter();
    drawer.doc.setLineWidth(0.2);
    drawDrawer(drawer, cardWidth, cardHeight, boxDepth, 25, fillColour);
    drawer.doc.addPage();
    hasInside = true;
  }

  drawer.doc.setLineWidth(0.2);
  if (hasInside) {
    cardWidth += 1.5;
    cardHeight += 1.5;
    boxDepth += 1.5;
  }
  drawBox(
    drawer,
    cardWidth,
    cardHeight,
    boxDepth,
    fillColour,
    textColour,
    title,
    images,
  );

  return drawer;
}
