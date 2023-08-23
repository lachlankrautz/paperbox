import { PDFDrawer } from "./drawer";

export function pt(x, y) {
  return { x: x, y: y };
}

export function add(p1, x, y) {
  return pt(p1.x + x, p1.y + y);
}

export function CMrot(deg) {
  return [Math.cos(deg), Math.sin(deg), -Math.sin(deg), Math.cos(deg), 0, 0];
}

export function CMtranslate(x, y) {
  return [1, 0, 0, 1, x * 72, y * 72];
}

export function CMcomp(m0, m1) {
  return [
    m0[0] * m1[0] + m0[1] * m1[2],
    m0[0] * m1[1] + m0[1] * m1[3],

    m0[2] * m1[0] + m0[3] * m1[2],
    m0[2] * m1[1] + m0[3] * m1[3],

    m0[4] * m1[0] + m0[5] * m1[2] + m1[4],
    m0[4] * m1[1] + m0[5] * m1[3] + m1[5],
  ];
}

export function CMstr(m) {
  const round = function (n) {
    return n.toFixed(3);
  };
  const posZero = function (n) {
    return n === 0 ? 0 : n;
  };
  return m.map(round).map(posZero).join(" ") + " cm";
}

export function dir2deg(orient) {
  let deg = 0;
  if (orient === "left") {
    deg = Math.PI / 2;
  } else if (orient === "down") {
    deg = Math.PI;
  } else if (orient === "right") {
    deg = (3 * Math.PI) / 2;
  }
  return deg;
}

export function hexToRgb(hex) {
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function drawSleeve(_drawer, _width, _length, _depth, _fill) {
  const d = _drawer;
  const size = pt(_width, _length);
  const depth = _depth;
  const frontLength = size.x / 2;
  const tabLength = 1 / 4;

  d.doc.setDrawColor(160);
  let fill = null;
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

export function drawDrawer(_drawer, _width, _length, _height, _gap, _fill) {
  const size = pt(_width, _length);
  const height = _height;
  const gap_width = _gap;
  const d = _drawer;

  d.doc.setDrawColor(160, undefined, undefined, undefined);
  let fill = null;
  if (_fill) {
    d.doc.setFillColor.apply(d, hexToRgb(_fill));
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
  d.trap(d.p(x_offset, y_offset), height, flap_length, 1 / 16, "down", fill);
  d.trap(d.p(-x_offset, y_offset), height, flap_length, 1 / 16, "down", fill);
  d.trap(d.p(x_offset, -y_offset), height, flap_length, 1 / 16, "up", fill);
  d.trap(d.p(-x_offset, -y_offset), height, flap_length, 1 / 16, "up", fill);
}

export function drawBox(
  _drawer,
  _width,
  _length,
  _height,
  _fill,
  _title,
  _imgs,
) {
  const d = _drawer;
  const depths = {
    side_flap: _height * 0.9,
    bot_flap: _height,
  };
  const size = {
    main: pt(_length, _width),
    side_panel: pt(_height, _width),
    side_flap: pt(depths.side_flap, _width),
    lr_flap: pt(_height, Math.min(depths.bot_flap, 5 / 8)),
    bt_flap: pt(_length, depths.bot_flap),
    top_top_flap: pt(_length, Math.max(_height / 2, 1 / 2)),
  };
  const height = _height;

  d.doc.setDrawColor(160, undefined, undefined, undefined);
  let fill = null;
  if (_fill) {
    d.doc.setFillColor.apply(d, hexToRgb(_fill));
    fill = "DF";
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

  const panels = {
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
  const flaps = {
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
    },
    top_top: {
      loc: add(panels.top.loc, 0, -(panels.bottom.size.y + size.bt_flap.y) / 2),
      size: size.bt_flap,
      kind: "outside",
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

  function drawPanel(pan) {
    d.rect(pan.loc, pan.size, fill);
  }

  function drawFlap(flap) {
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
      const att = 1 / 16;
      d.trap(flap.loc, flap.size.x, flap.size.y, att, flap.orient, fill);
    }
  }

  function imagePanel(img, pos, size, rot) {
    const imageX = pos.x - size.x / 2;
    const imageY = pos.y - size.y / 2;
    d.doc.addImage(
      img,
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

  if (frontImage) {
    imagePanel(frontImage, panels.top.loc, panels.top.size, 0);
  }
  if (backImage) {
    imagePanel(backImage, panels.bottom.loc, panels.bottom.size, 0);
    //TO DO - display bottom image in flap so visible behind thumb hole
  }

  if (sideImage) {
    imagePanel(sideImage, panels.left.loc, panels.left.size, 0);
    imagePanel(sideImage, panels.right.loc, panels.right.size, 0);
  }

  if (topImage) {
    imagePanel(topImage, flaps.top_top.loc, flaps.top_top.size, 0);
    imagePanel(topImage, flaps.top_bot.loc, flaps.top_bot.size, 0);
  }
  _.values(panels).forEach(drawPanel);
  _.values(flaps).forEach(drawFlap);

  // Add title text to panels
  d.doc.setFont("helvetica", "bold");
  d.text(_title, flaps.top_top.loc, 20, "down");
  d.text(_title, flaps.top_bot.loc, 20, "up");
  d.text(_title, panels.left.loc, 23, "right");
  d.text(_title, panels.right.loc, 23, "left");
  d.text(_title, add(panels.top.loc, 0, panels.top.size.y * 0.25), 20, "up");
  d.text(
    _title,
    add(panels.bottom.loc, 0, panels.bottom.size.y * 0.25),
    20,
    "up",
  );

  (function drawThumbCutout() {
    const r = 1 / 3;
    const x = panels.bottom.loc.x - r,
      y = panels.bottom.loc.y - size.main.y / 2;
    const xOffset = 2 * r,
      yOffset = (4 / 3) * r;
    d.doc.lines([[0, yOffset, xOffset, yOffset, xOffset, 0]], x, y);
  })();

  // Add cut points
  d.doc.setDrawColor(0);
  const cutLength = 3 / 8;
  // Top flap
  let topMid = pt(
    flaps.top_top.loc.x,
    flaps.top_top.loc.y - flaps.top_top.size.y / 2,
  );
  let halfWidth = size.main.x / 2;
  d.line(add(topMid, -halfWidth, 0), add(topMid, cutLength - halfWidth, 0));
  d.line(add(topMid, halfWidth, 0), add(topMid, halfWidth - cutLength, 0));
  // Back
  topMid = pt(panels.top.loc.x, panels.top.loc.y - panels.top.size.y / 2);
  halfWidth = size.main.x / 2;
  d.line(add(topMid, -halfWidth, 0), add(topMid, -halfWidth, cutLength));
  d.line(add(topMid, halfWidth, 0), add(topMid, halfWidth, cutLength));
}

export function makeBox(
  paper,
  cardWidth,
  cardHeight,
  boxDepth,
  inside,
  fillColor,
  title,
  images,
) {
  images = images || {};
  //paper = paper === 'a4' ? 'a4' : 'letter';

  const drawer = new PDFDrawer(paper);

  let hasInside = false;
  if (inside === "sleeve") {
    drawSleeve(drawer, cardWidth, cardHeight, boxDepth, fillColor);
    drawer.doc.addPage();
    hasInside = true;
  } else if (inside === "tray") {
    drawer.resetCenter();
    drawer.doc.setLineWidth(1 / 128);
    drawDrawer(drawer, cardWidth, cardHeight, boxDepth, 1, fillColor);
    drawer.doc.addPage();
    hasInside = true;
  }

  drawer.doc.setLineWidth(1 / 128);
  if (hasInside) {
    cardWidth += 1 / 16;
    cardHeight += 1 / 16;
    boxDepth += 1 / 16;
  }
  drawBox(drawer, cardWidth, cardHeight, boxDepth, fillColor, title, images);

  return drawer;
}
