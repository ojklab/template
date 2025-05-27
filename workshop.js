'use strict';

/*
 * 使い方の基本：
 * - sketch.jsのsetup()の中で ws_setup(); を呼び出す
 * - すべてデフォルトで動かすときも空のオブジェクトが必要 ws_function({});
 * - 同じテンプレート関数の引数を途中で変更しても変化しない
 *
 * 比較的共通する引数：
 * num    : 図形の数（グリッドは1辺の数、スパイラルは無し）
 * size   : 図形の1辺あるいは直径の長さ
 * R      : 角丸の比率（0から1の範囲／1が円）
 * speed  : 図形の変化速度
 * colors : 色セット [color(R,G,B), color(R,G,B), ...]
 * opacity: 不透明度（0から1の範囲／1が不透明）
 * ※パラメータによっては [A, B] の形式で2つの値を与えられる
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
let HALF_W, HALF_H;

/* レイヤー設定 */
p5.prototype.ws_setup = (arg) => {
  reboundLayer = createGraphics(width, height);
  pulseLayer = createGraphics(width, height);
  whirlLayer = createGraphics(width, height);
  spiralLayer = createGraphics(width, height);
  gridLayer = createGraphics(width, height);

  HALF_W = width / 2;
  HALF_H = height / 2;
};

/* 各テンプレートのデータ */
const store = {
  rebound: [],
  pulse: [],
  whirl: [],
  spiral: [],
  spiralData: {
    angle: 0,
    radius: 250,
    currentCol: null,
  },
  grid: [],
};

/* ユーティリティ */
const rand01 = () => (random(0, 1) < 0.5 ? 1 : -1);
const ws_reset = (tmpl) => (store[tmpl] = []);

/*** リバウンド：図形がランダムに動き回って端で跳ね返る ***/
/* 引数： num, size, R, speed, cols, opacity */
p5.prototype.ws_rebound = (arg) => {
  // 初期設定
  if (store.rebound.length === 0) {
    const num = arg.num || 5;
    const cols = arg.cols || [
      color(252, 121, 121),
      color(245, 158, 66),
      color(126, 224, 201),
      color(145, 168, 235),
      color(139, 55, 191),
      color(252, 249, 179),
      color(255, 105, 180),
    ];

    for (let i = 0; i < num; i += 1) {
      let size;
      if (Array.isArray(arg.size)) {
        size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        size = arg.size ?? floor(random(20, 81));
      }
      let R;
      if (Array.isArray(arg.R)) {
        R = random(arg.R[0], arg.R[1]) * (size / 2);
      } else {
        R = (arg.R ?? 1.0) * (size / 2);
      }
      let vel;
      if (Array.isArray(arg.speed)) {
        vel = floor(random(arg.speed[0], arg.speed[1] + 1));
      } else {
        vel = arg.speed || floor(random(2, 6));
      }
      let opa;
      if (Array.isArray(arg.opacity)) {
        opa = random(arg.opacity[0], arg.opacity[1]) * 255;
      } else {
        opa = (arg.opacity ?? 1) * 255;
      }

      const col = cols[i % cols.length];
      col.setAlpha(opa);

      store.rebound.push({
        size: size,
        x: random(width - size),
        y: random(height - size),
        R: R,
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

/*** パルス：図形がランダムに出現して消える ***/
/* 引数： num, size, R, speed, cols, opacity, target */
// target（現象する対象）: 'size', 'opacity'
p5.prototype.ws_pulse = (arg) => {
  const target = arg.target || 'size';

  // 初期設定
  if (store.pulse.length === 0) {
    const num = arg.num || 10;
    const cols = arg.cols || [
      color(252, 121, 121),
      color(245, 158, 66),
      color(126, 224, 201),
      color(145, 168, 235),
      color(139, 55, 191),
      color(252, 249, 179),
      color(255, 105, 180),
    ];

    for (let i = 0; i < num; i += 1) {
      let size;
      if (Array.isArray(arg.size)) {
        size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        size = arg.size ?? floor(random(20, 81));
      }
      let R;
      if (Array.isArray(arg.R)) {
        R = random(arg.R[0], arg.R[1]) * (size / 2);
      } else {
        R = (arg.R ?? 1.0) * (size / 2);
      }
      let vel;
      if (Array.isArray(arg.speed)) {
        vel = floor(random(arg.speed[0], arg.speed[1] + 1));
      } else {
        if (target == 'size') {
          vel = arg.speed || floor(random(1, 3));
        } else {
          vel = arg.speed || floor(random(5, 20));
        }
      }
      let opa;
      if (Array.isArray(arg.opacity)) {
        opa = random(arg.opacity[0], arg.opacity[1]) * 255;
      } else {
        opa = (arg.opacity ?? 1) * 255;
      }

      const col = cols[i % cols.length];

      store.pulse.push({
        size: size,
        orgSize: size,
        opa: opa,
        orgOpa: opa,
        x: random(size / 2, width - size / 2),
        y: random(size / 2, height - size / 2),
        R: R,
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
    const col = s.col;
    col.setAlpha(s.opa);
    pulseLayer.fill(col);
    pulseLayer.square(s.x, s.y, s.size, s.R);
    if (target == 'size') {
      s.size -= s.vel;
      if (s.size < PULSE_MINSIZE) {
        const r = s.orgSize / 2;
        store.pulse[n].size = s.orgSize;
        store.pulse[n].x = random(r, width - r);
        store.pulse[n].y = random(r, height - r);
      }
    } else if (target == 'opacity') {
      s.opa -= s.vel;
      if (s.opa < 0) {
        const r = s.orgSize / 2;
        store.pulse[n].opa = s.orgOpa;
        store.pulse[n].x = random(r, width - r);
        store.pulse[n].y = random(r, height - r);
      }
    }
  }

  // メインキャンバスに描画
  pulseLayer.pop();
  image(pulseLayer, 0, 0);
};

/*** 回転（ウィール）：複数の図形が円を描いて回転する ***/
/* 引数： num, size, R, speed, colors, opacity, direction, repeat, diameter */
// fluctuate（収縮・膨張を繰り返すか否か）: on, off (既定値: on)
// direcrion（収縮か膨張か）: 負の値, 正の値 (既定値: -1)
// diameter（回転直径）: width以下の数値
// 注） speedが配列の場合は、乱数ではなく、[回転速度, 収縮速度]になる
p5.prototype.ws_whirl = (arg) => {
  // 初期設定
  if (store.whirl.length === 0) {
    const num = arg.num || 6;
    const cols = arg.colors || [
      color(252, 121, 121),
      color(245, 158, 66),
      color(126, 224, 201),
      color(145, 168, 235),
      color(139, 55, 191),
      color(252, 249, 179),
      color(255, 105, 180),
    ];

    for (let i = 0; i < num; i += 1) {
      let size;
      if (Array.isArray(arg.size)) {
        size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        size = arg.size ?? 50;
      }
      let R;
      if (Array.isArray(arg.R)) {
        R = random(arg.R[0], arg.R[1]) * (size / 2);
      } else {
        R = (arg.R ?? 1.0) * (size / 2);
      }
      let rt_vel, se_vel;
      if (Array.isArray(arg.speed)) {
        rt_vel = arg.speed[0];
        se_vel = arg.speed[1];
      } else {
        rt_vel = arg.speed || 8;
        se_vel = rt_vel;
      }
      let opa;
      if (Array.isArray(arg.opacity)) {
        opa = random(arg.opacity[0], arg.opacity[1]) * 255;
      } else {
        opa = (arg.opacity ?? 1) * 255;
      }
      const dir = arg.direction > 0 ? 1 : -1;
      const diameter = arg.diameter ?? width - size;
      const col = random(cols);
      col.setAlpha(opa);

      store.whirl.push({
        size: size,
        x: HALF_W,
        y: HALF_H,
        R: R,
        col: col,
        rt_vel: rt_vel * 0.01,
        se_vel: se_vel * 0.005,
        angle: (TWO_PI / num) * i,
        dir: dir,
        fluctuate: arg.fluctuate == 'off' ? false : true,
        step: 0,
        radius: dir > 0 ? 0 : diameter / 2,
        diameter: diameter,
      });
    }
  }

  // 図形の描画
  whirlLayer.push();
  whirlLayer.clear();
  whirlLayer.noStroke();
  pulseLayer.rectMode(CENTER);

  for (let s of store.whirl) {
    s.radius += s.dir * s.se_vel * s.step;
    const r = s.size / 2;
    s.x = HALF_W - r + cos(s.angle) * s.radius;
    s.y = HALF_H - r + sin(s.angle) * s.radius;

    whirlLayer.fill(s.col);
    whirlLayer.square(s.x, s.y, s.size, s.R);

    s.angle += s.rt_vel;
    s.step += 1;

    if (
      (s.dir < 0 && s.radius <= 0) ||
      (s.dir > 0 && s.radius >= s.diameter / 2)
    ) {
      if (s.fluctuate) {
        s.dir *= -1;
      } else {
        s.radius = s.diameter / 2;
      }
      s.step = 0;
    }
  }

  whirlLayer.pop();
  image(whirlLayer, 0, 0);
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
  spiralLayer.translate(HALF_W, HALF_H);
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
