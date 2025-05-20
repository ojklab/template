'use strict';

/*
 * 使い方の基本：
 * - sketch.jsのsetup()の中で ws_setup(); を呼び出す
 * - すべてデフォルトで動かすときも空のオブジェクトが必要 ws_function({});
 * - 同じテンプレート関数の引数を途中で変更しても変化しない
 *
 * 引数：
 * num    : 図形の数（グリッドは1辺の数、スパイラルにはない）
 * size   : 図形の1辺あるいは直径の長さ
 * speed  : 図形の移動／変化速度
 * cols   : [color(R,G,B), color(R,G,B), ...] の形式で複数指定可
 * opacity: 不透明度（0.0-1.0）
 * R      : 角丸の大きさ（既定値は円で、0を指定すると四角）
 * ※sizeとspeedでは [最小値, 最大値] の形式で乱数が使える
 */

/* 各テンプレートのレイヤー */
let reboundLayer;
let CircleRotate_Layer;
let CirclePaint_Layer;
let DrawShapeGrid_Layer;
let RandomSquares_Layer;
let SpiralSquares_Layer;

p5.prototype.ws_setup = (arg) => {
  reboundLayer = createGraphics(width, height);
  CircleRotate_Layer = createGraphics(width, height);
  CirclePaint_Layer = createGraphics(width, height);
  DrawShapeGrid_Layer = createGraphics(width, height);
  RandomSquares_Layer = createGraphics(width, height);
  SpiralSquares_Layer = createGraphics(width, height);
};

/* 各テンプレートのデータ */
const store = {
  rebound: [],
  drawShapeGrid_colors: [],
  circle_paint_circles: [],
  circle_rotate_angle: 0,
  circle_rotate_radius: 250,
  circle_rotate_currentColor: null,
  randomSquares: [],
  spiralSquares: [],
};

/* ユーティリティ */
const rand01 = () => (random(0, 1) < 0.5 ? 1 : -1);

/* リバウンド：図形がランダムに動き回って端で跳ね返る */
p5.prototype.ws_rebound = (arg) => {
  const num = arg.num || 5;
  const cols = arg.cols || [
    color(252, 121, 121), // 赤
    color(245, 158, 66), // オレンジ
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(139, 55, 191), // 紫
    color(252, 249, 179), // 黄色
    color(255, 105, 180), // ピンク
  ];
  const opacity = (arg.opacity ?? 1) * 255;

  // 初回呼び出しのみ初期設定
  if (store.rebound.length === 0) {
    let size, vel;
    for (let i = 0; i < num; i += 1) {
      if (Array.isArray(arg.size)) {
        size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        size = arg.size ?? floor(random(20, 81));
      }
      if (Array.isArray(arg.speed)) {
        vel = floor(random(arg.speed[0], arg.speed[1] + 1));
      } else {
        vel = arg.speed || floor(random(2, 6));
      }

      const col = cols[i % cols.length];
      col.setAlpha(opacity);

      store.rebound.push({
        size: size,
        x: random(width - size),
        y: random(height - size),
        R: arg.R ?? size / 2,
        col: col,
        vx: rand01() * vel,
        vy: rand01() * vel,
      });
    }
  }

  // レイヤー設定
  // reboundLayer.push();
  reboundLayer.clear();
  reboundLayer.noStroke();

  const shapes = store.rebound;

  // 図形の描画
  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x > width - s.size || s.x < 0) {
      s.vx *= -1;
    }
    if (s.y > height - s.size || s.y < 0) {
      s.vy *= -1;
    }

    reboundLayer.fill(s.col);
    reboundLayer.square(s.x, s.y, s.size, s.R);
  }

  // レイヤー書き出し
  image(reboundLayer, 0, 0);
  // reboundLayer.pop();
};

/* テンプレート：図形を円運動させる */
p5.prototype.drawSpiralSquares = (arg) => {
  // 初回のみ初期化
  if (store.spiralSquares.length === 0) {
    const num = arg.num || 4;
    const size = arg.size || 30;
    const speed = arg.speed || 0.05;
    const bl = arg.bl || 0;
    const colors = arg.colors || [
      color(252, 121, 121),
      color(126, 224, 201),
      color(145, 168, 235),
      color(252, 249, 179),
    ];

    // 各四角形の初期角度と中心位置を設定
    for (let i = 0; i < num; i++) {
      const angle = (TWO_PI / num) * i; // 各四角形の初期角度
      store.spiralSquares.push({
        x: width / 2, // 中心から始める
        y: height / 2,
        color: colors[i % colors.length],
        angle: angle,
        step: 0,
        bl: bl,
        size: size,
        speed: speed,
      });
    }
  }

  SpiralSquares_Layer.clear();
  for (let square of store.spiralSquares) {
    // 中心を基点にスパイラル移動
    const spiralRadius = width / 2 - square.step * 0.5; // 半径を減少させながらスパイラル状に描画
    square.x = width / 2 + cos(square.angle) * spiralRadius;
    square.y = height / 2 + sin(square.angle) * spiralRadius;

    SpiralSquares_Layer.fill(square.color);
    SpiralSquares_Layer.noStroke();
    SpiralSquares_Layer.square(
      square.x - square.size / 2,
      square.y - square.size / 2,
      square.size,
      square.bl
    );

    square.angle += square.speed; // 角度を変化させて回転
    square.step += 1; // スパイラルの進行

    // スパイラルが外側に達したらリセット
    if (spiralRadius <= 0) {
      square.step = 0;
    }
  }

  image(SpiralSquares_Layer, 0, 0);
};

/* テンプレート：図形をランダムに出現させる */
p5.prototype.drawRandomSquares = (arg) => {
  const baseColors = arg.baseColors || [
    color(150, 200, 250),
    color(150, 172, 250),
    color(165, 150, 250),
  ];
  const minSize = arg.minSize || 10;
  const maxSize = arg.maxSize || 50;
  const speed = arg.speed || 30;
  const bl = arg.bl || 0;

  // 出現制御
  if (frameCount % speed === 0) {
    const squareSize = random(minSize, maxSize); // サイズをランダムに
    const squareX = random(width);
    const squareY = random(height);
    store.randomSquares.push({
      x: squareX,
      y: squareY,
      size: squareSize,
      color: random(baseColors), // ランダムな色を指定
    });
  }

  // レイヤーのリセット
  RandomSquares_Layer.clear();

  // 四角形の描画
  for (let square of store.randomSquares) {
    RandomSquares_Layer.fill(square.color); // 正しい色プロパティにアクセス
    RandomSquares_Layer.noStroke();
    RandomSquares_Layer.square(square.x, square.y, square.size, bl);
  }

  // メインキャンバスに描画
  image(RandomSquares_Layer, 0, 0);
};

/* テンプレート：1個の図形をスパイラル運動させる */
p5.prototype.circle_rotate = (arg) => {
  const spd = arg.spd || 0.02;
  const radiusDec = arg.radiusDec || 0.2;
  const minRad = arg.minRad || 10;
  const maxRad = arg.maxRad || 250;
  const col = arg.col || 60; //色
  const r = arg.r || 40;
  const bl = arg.bl || 10; //角の丸さ

  // const g = circle_rotate_pg;
  CircleRotate_Layer.push();
  CircleRotate_Layer.clear();
  CircleRotate_Layer.noStroke();

  const baseColors = [
    color(252, 121, 121), // 赤系
    color(126, 224, 201), // 緑系
    color(145, 168, 235), // 青系
    color(252, 249, 179), // 黄色系
  ];

  const speed = spd; // 回転速度
  const radiusDecrement = radiusDec; // 半径の縮小量
  const minRadius = minRad; // 最小半径
  const maxRadius = maxRad; // 最大半径

  // 初期色の設定
  if (store.circle_rotate_currentColor === null) {
    store.circle_rotate_currentColor = random(baseColors);
  }

  // 円の色を60フレームごとに変更
  if (frameCount % col === 0) {
    store.circle_rotate_currentColor = random(baseColors);
  }

  // 円を中心に描く
  CircleRotate_Layer.translate(width / 2, height / 2);
  CircleRotate_Layer.fill(store.circle_rotate_currentColor);

  // 円の位置計算
  let x = store.circle_rotate_radius * cos(store.circle_rotate_angle);
  let y = store.circle_rotate_radius * sin(store.circle_rotate_angle);

  // 円を描画
  CircleRotate_Layer.square(x, y, r, bl); //四角形⇄円へと変更可,40,10
  // ellipse(x, y, 50, 50);

  // 半径を縮めて、回転を進める
  store.circle_rotate_radius -= radiusDecrement;
  store.circle_rotate_angle += speed;

  // 半径が小さくなりすぎたらリセット
  if (store.circle_rotate_radius < minRadius) {
    store.circle_rotate_radius = maxRadius;
    store.circle_rotate_angle = 0;
    store.circle_rotate_currentColor = random(baseColors);
  }

  CircleRotate_Layer.pop();
  image(CircleRotate_Layer, 0, 0);
};

/*circle_paint（円で塗りつぶす）*/
// ランダムに表示して消える…というのがない
// 大きさの指定ができない
p5.prototype.circle_paint = (arg) => {
  const num = arg.num || 4;
  const r = arg.r || 85;
  const vx = arg.vx || random(-2.5, 2.5);
  const vy = arg.vy || random(-2.5, 2.5);
  const bl = arg.bl || 40;
  const baseColors = arg.baseColors || [
    color(252, 121, 121), // 赤
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(252, 249, 179), // 黄色
  ];

  if (store.circle_paint_circles.length === 0) {
    for (let i = 0; i < num; i++) {
      store.circle_paint_circles.push({
        x: random(width),
        y: random(height),
        r: r,
        color: baseColors[i % baseColors.length],
        vx: vx,
        vy: vy,
      });
    }
  }

  const circles = store.circle_paint_circles;

  CirclePaint_Layer.clear(); // 描画のリセット
  CirclePaint_Layer.noStroke();

  for (let en of circles) {
    en.x += en.vx;
    en.y += en.vy;

    if (en.x > width || en.x < 0) {
      en.vx *= -1;
    }
    if (en.y > height || en.y < 0) {
      en.vy *= -1;
    }

    CirclePaint_Layer.fill(en.color);
    CirclePaint_Layer.square(en.x, en.y, en.r, bl);
  }

  image(CirclePaint_Layer, 0, 0); // メインキャンバスに描画
};

/* テンプレート：図形をグリッドに敷き詰める */
p5.prototype.drawShapeGrid = (arg) => {
  const cols = arg.cols || 5;
  const rows = arg.rows || 5;
  const shapeSize = arg.shapeSize || 50;
  const cornerRadius = arg.cornerRadius || 0;
  const baseColors = arg.colors || [
    color(252, 121, 121),
    color(126, 224, 201),
    color(145, 168, 235),
    color(252, 249, 179),
  ];
  const colorChangeSpeed = arg.colorChangeSpeed || 30;
  const useStroke = arg.stroke !== undefined ? arg.stroke : true;
  const randomizeColor =
    arg.randomizeColor !== undefined ? arg.randomizeColor : false;

  DrawShapeGrid_Layer.push();

  if (useStroke) {
    DrawShapeGrid_Layer.stroke(0);
  } else {
    DrawShapeGrid_Layer.noStroke();
  }

  const xStep = width / cols;
  const yStep = height / rows;

  if (store.drawShapeGrid_colors.length == 0) {
    for (let i = 0; i < cols * rows; i++) {
      store.drawShapeGrid_colors.push(random(baseColors));
    }
  }

  const colors = store.drawShapeGrid_colors;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = y * cols + x;
      const posX = x * xStep + xStep / 2;
      const posY = y * yStep + yStep / 2;

      if (randomizeColor && frameCount % colorChangeSpeed === 0) {
        colors[index] = random(baseColors);
      }

      DrawShapeGrid_Layer.fill(colors[index]);
      DrawShapeGrid_Layer.rectMode(CENTER);
      DrawShapeGrid_Layer.square(posX, posY, shapeSize, cornerRadius);
    }
  }

  DrawShapeGrid_Layer.pop();
  image(DrawShapeGrid_Layer, 0, 0);
};

/* テンプレート：直線を任意の角度で動かす */
