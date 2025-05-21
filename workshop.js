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
let pulseLayer;
let whirlLayer;
let spiralLayer;
let gridLayer;

let defaultCols;

/* 定数 */
const PULSE_MINSIZE = 2; // 未満でリセット

/* 初期設定 */
p5.prototype.ws_setup = (arg) => {
  // レイヤー
  reboundLayer = createGraphics(width, height);
  pulseLayer = createGraphics(width, height);
  whirlLayer = createGraphics(width, height);
  spiralLayer = createGraphics(width, height);
  gridLayer = createGraphics(width, height);

  // 規定の色セット
  defaultCols = [
    color(252, 121, 121), // 赤
    color(245, 158, 66), // オレンジ
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(139, 55, 191), // 紫
    color(252, 249, 179), // 黄色
    color(255, 105, 180), // ピンク
  ];
};

/* 各テンプレートのデータ */
const store = {
  rebound: [],
  pulse: [],
  whirl: [],
  spiral: [],
  spiralDate: {
    angle: 0,
    radius: 250,
    currentCol: null,
  },
  grid: [],
};

/* ユーティリティ */
const rand01 = () => (random(0, 1) < 0.5 ? 1 : -1);
const ws_reset = (tmpl) => (store[tmpl] = []);

/* リバウンド：図形がランダムに動き回って端で跳ね返る */
/* 引数： num, size, R, speed, cols, opacity */
p5.prototype.ws_rebound = (arg) => {
  const num = arg.num || 5;
  const cols = arg.cols || defaultCols;
  const opacity = (arg.opacity ?? 1) * 255;

  // 初期設定
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

  // 図形の描画
  reboundLayer.push();
  reboundLayer.clear();
  reboundLayer.noStroke();

  for (let s of store.rebound) {
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
  reboundLayer.pop();
  image(reboundLayer, 0, 0);
};

/* パルス：図形がランダムに出現して消える */
/* 引数： num, size, R, speed, cols, opacity */
p5.prototype.ws_pulse = (arg) => {
  const num = arg.num || 10;
  const cols = arg.cols || defaultCols;
  const opacity = (arg.opacity ?? 1) * 255;

  // 初期設定
  if (store.pulse.length === 0) {
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
        vel = arg.speed || floor(random(1, 3));
      }

      const col = cols[i % cols.length];
      col.setAlpha(opacity);

      store.pulse.push({
        size: size,
        orgSize: size,
        x: random(size / 2, width - size / 2),
        y: random(size / 2, height - size / 2),
        R: arg.R ?? size / 2,
        col: col,
        vel: vel,
      });
    }
  }

  // 図形の描画
  pulseLayer.push();
  pulseLayer.clear();
  pulseLayer.noStroke();
  pulseLayer.rectMode(CENTER);

  for (let n = 0; n < store.pulse.length; n += 1) {
    const s = store.pulse[n];
    pulseLayer.fill(s.col);
    pulseLayer.square(s.x, s.y, s.size, s.R);
    s.size -= s.vel;
    if (s.size < PULSE_MINSIZE) {
      const r = s.orgSize / 2;
      store.pulse[n].size = s.orgSize;
      store.pulse[n].x = random(r, width - r);
      store.pulse[n].y = random(r, height - r);
    }
  }

  // メインキャンバスに描画
  pulseLayer.pop();
  image(pulseLayer, 0, 0);
};

/* 回転（ウィール）：複数の図形が円を描いて回転する */
p5.prototype.ws_whirl = (arg) => {
  // 初回のみ初期化
  if (store.whirl.length === 0) {
    const num = arg.num || 4;
    const size = arg.size || 30;
    const speed = arg.speed || 0.05;
    const bl = arg.bl || 0;
    const colors = arg.colors || defaultCols;

    // 各四角形の初期角度と中心位置を設定
    for (let i = 0; i < num; i++) {
      const angle = (TWO_PI / num) * i; // 各四角形の初期角度
      store.whirl.push({
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

  whirl.clear();
  for (let s of store.whirl) {
    // 中心を基点にスパイラル移動
    const spiralRadius = width / 2 - s.step * 0.5; // 半径を減少させながらスパイラル状に描画
    s.x = width / 2 + cos(s.angle) * spiralRadius;
    s.y = height / 2 + sin(s.angle) * spiralRadius;

    whirlLayer.push();
    whirlLayer.fill(s.color);
    whirlLayer.noStroke();
    whirlLayer.s(s.x - s.size / 2, s.y - s.size / 2, s.size, s.bl);

    s.angle += s.speed; // 角度を変化させて回転
    s.step += 1; // スパイラルの進行

    // スパイラルが外側に達したらリセット
    if (spiralRadius <= 0) {
      s.step = 0;
    }
  }

  whirlLayer.pop();
  image(Spiralss_Layer, 0, 0);
};

/* スパイラル：図形（1個）が円を描きながら中心にいく */
p5.prototype.ws_spiral = (arg) => {
  const spd = arg.spd || 0.02;
  const radiusDec = arg.radiusDec || 0.2;
  const minRad = arg.minRad || 10;
  const maxRad = arg.maxRad || 250;
  const col = arg.col || 60; //色
  const r = arg.r || 40;
  const bl = arg.bl || 10; //角の丸さ

  // const g = circle_rotate_pg;
  spiralLayer.push();
  spiralLayer.clear();
  spiralLayer.noStroke();

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
  if (store.spiralData.currentColor === null) {
    store.circle_rotate_currentColor = random(baseColors);
  }

  // 円の色を60フレームごとに変更
  if (frameCount % col === 0) {
    store.spiralData.currentColor = random(baseColors);
  }

  // 円を中心に描く
  spiralLayer.translate(width / 2, height / 2);
  spiralLayer.fill(store.spiralData.currentColor);

  // 円の位置計算
  let x = store.spiralData.radius * cos(store.spiralData.angle);
  let y = store.spiralData.radius * sin(store.spiralData.angle);

  // 円を描画
  spiralLayer.square(x, y, r, bl); //四角形⇄円へと変更可,40,10
  // ellipse(x, y, 50, 50);

  // 半径を縮めて、回転を進める
  store.spiralData.radius -= radiusDecrement;
  store.spiralData.angle += speed;

  // 半径が小さくなりすぎたらリセット
  if (store.spiralData.radius < minRadius) {
    store.spiralData.radius = maxRadius;
    store.spiralData.angle = 0;
    store.spiralData.currentColor = random(baseColors);
  }

  spiralLayer.pop();
  image(spiralLayer, 0, 0);
};

/* グリッド：敷き詰めた図形の色などが変化する */
p5.prototype.ws_grid = (arg) => {
  const cols = arg.cols || 5;
  const rows = arg.rows || 5;
  const shapeSize = arg.shapeSize || 50;
  const cornerRadius = arg.cornerRadius || 0;
  const baseColors = arg.colors || defaultCols;
  const colorChangeSpeed = arg.colorChangeSpeed || 30;
  const useStroke = arg.stroke !== undefined ? arg.stroke : true;
  const randomizeColor =
    arg.randomizeColor !== undefined ? arg.randomizeColor : false;

  gridLayer.push();

  if (useStroke) {
    gridLayer.stroke(0);
  } else {
    gridLayer.noStroke();
  }

  const xStep = width / cols;
  const yStep = height / rows;

  if (store.grid.length == 0) {
    for (let i = 0; i < cols * rows; i++) {
      store.grid.push(random(baseColors));
    }
  }

  const colors = store.gridcolors;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = y * cols + x;
      const posX = x * xStep + xStep / 2;
      const posY = y * yStep + yStep / 2;

      if (randomizeColor && frameCount % colorChangeSpeed === 0) {
        colors[index] = random(baseColors);
      }

      gridLayer.fill(colors[index]);
      gridLayer.rectMode(CENTER);
      gridLayer.square(posX, posY, shapeSize, cornerRadius);
    }
  }

  gridLayer.pop();
  image(gridLayer, 0, 0);
};

/* ライン：直線を任意の角度で動かす */
