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
 * R      : 角丸の比率（0から1の範囲／0が四角、1が円）
 * speed  : 図形の変化速度
 * colors : 色セット [color('色名'), color(R,G,B), ...]
 * opacity: 不透明度（0から1の範囲／0が透明、1が不透明）
 * 注） パラメータによっては [A, B] の形式で2つの値を与えられる（詳細は各テンプレートのコードの先頭に記載）
 * 注） colorsで単色を指定するときも [color(R,G,B)] と配列の形式にする
 */

/* 各テンプレートのレイヤー */
let reboundLayer;
let pulseLayer;
let whirlLayer;
let spiralLayer;
let gridLayer;
let lineLayer;

let defaultCols;

/* 定数 */
const PULSE_MINSIZE = 3;
const WHIRL_MINRAD = 0;
const SPIRAL_MINRAD = 5;
let HALF_W, HALF_H;

/* レイヤー設定 */
p5.prototype.ws_setup = (arg) => {
  reboundLayer = createGraphics(width, height);
  pulseLayer = createGraphics(width, height);
  whirlLayer = createGraphics(width, height);
  spiralLayer = createGraphics(width, height);
  gridLayer = createGraphics(width, height);
  lineLayer = createGraphics(width, height);

  HALF_W = width / 2;
  HALF_H = height / 2;
};

/* 各テンプレートのデータ */
const store = {
  rebound: [],
  pulse: [],
  whirl: [],
  spiral: [],
  grid: [],
  line: []
};

/* ユーティリティ */
const rand01 = () => (random(0, 1) < 0.5 ? 1 : -1);
const ws_reset = (tmpl) => (store[tmpl] = []);

/*** リバウンド：図形がランダムに動き回って端で跳ね返る ***/
/* 引数： num, size, R, speed, cols, opacity */
// 注） size, R, speed, opacityは [最小値, 最大値] の形式で乱数
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
      color(255, 105, 180)
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
        vy: rand01() * vel
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
/* 引数： num, size, R, speed, cols, opacity, fade */
// fade（消え方）: 'size', 'opacity'
// 注） size, R, speed, opacityは [最小値, 最大値] の形式で乱数
p5.prototype.ws_pulse = (arg) => {
  const fade = arg.fade || 'size';

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
      color(255, 105, 180)
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
        R = random(arg.R[0], arg.R[1]);
      } else {
        R = arg.R ?? 1.0;
      }
      let vel;
      if (Array.isArray(arg.speed)) {
        vel = floor(random(arg.speed[0], arg.speed[1] + 1));
      } else {
        if (fade == 'size') {
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
        vel: vel
      });
    }
  }

  // 図形の描画
  pulseLayer.push();
  pulseLayer.clear();
  pulseLayer.noStroke();
  pulseLayer.rectMode(CENTER);

  for (const s of store.pulse) {
    if (fade == 'size') {
      s.size -= s.vel;
      if (s.size < PULSE_MINSIZE) {
        const r = s.orgSize / 2;
        s.size = s.orgSize;
        s.x = random(r, width - r);
        s.y = random(r, height - r);
      }
    } else if (fade == 'opacity') {
      s.opa -= s.vel;
      if (s.opa < 0) {
        const r = s.orgSize / 2;
        s.opa = s.orgOpa;
        s.x = random(r, width - r);
        s.y = random(r, height - r);
      }
    }

    const col = s.col;
    col.setAlpha(s.opa);
    pulseLayer.fill(col);
    const R = s.R * (s.size / 2);
    pulseLayer.square(s.x, s.y, s.size, R);
  }

  // メインキャンバスに描画
  pulseLayer.pop();
  image(pulseLayer, 0, 0);
};

/*** 回転（ウィール）：複数の図形が円を描いて回転する ***/
/* 引数： num, size, R, speed, colors, opacity, direction, fluctuate, diameter */
// fluctuate（収縮・膨張を繰り返すか否か）: 'on', 'off' (既定値: 'on')
// direcrion: 収縮…'def', 膨張…'inf', 右回り…'right', 左回り…'left' (既定値: 'def' & 'right')
// diameter（回転直径）: width以下の数値
// 注） size, R, opacityは [最小値, 最大値] の形式で乱数
// 注） speedが配列の場合は、乱数ではなく、[回転速度, 収縮／膨張速度]になる
// 注） directionが配列の場合は[収縮／膨張方向, 左回り／右回り]になる
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
      color(255, 105, 180)
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
      let h_vel, v_vel;
      if (Array.isArray(arg.speed)) {
        h_vel = arg.speed[0];
        v_vel = arg.speed[1];
      } else {
        h_vel = arg.speed || 8;
        v_vel = h_vel;
      }
      let opa;
      if (Array.isArray(arg.opacity)) {
        opa = random(arg.opacity[0], arg.opacity[1]) * 255;
      } else {
        opa = (arg.opacity ?? 1) * 255;
      }
      let h_dir, v_dir;
      if (Array.isArray(arg.direction)) {
        v_dir = arg.direction[0] == 'inf' ? 1 : -1;
        h_dir = arg.direction[1] == 'left' ? -1 : 1;
      } else {
        if (arg.direction == 'inf' || arg.direction == 'def') {
          v_dir = arg.direction == 'inf' ? 1 : -1;
          h_dir = 1;
        } else if (arg.direction == 'right' || arg.direction == 'left') {
          v_dir = -1;
          h_dir = arg.direction == 'left' ? -1 : 1;
        } else {
          v_dir = -1;
          h_dir = 1;
        }
      }
      const diameter = arg.diameter ?? width - size;
      const col = random(cols);
      col.setAlpha(opa);

      store.whirl.push({
        size: size,
        R: R,
        col: col,
        h_vel: h_vel * 0.01,
        v_vel: v_vel * 0.005,
        angle: (TWO_PI / num) * i,
        v_dir: v_dir,
        h_dir: h_dir,
        fluctuate: arg.fluctuate == 'off' ? false : true,
        radius: v_dir > 0 ? 0 : diameter / 2,
        diameter: diameter,
        step: 0
      });
    }
  }

  // 図形の描画
  whirlLayer.push();
  whirlLayer.clear();
  whirlLayer.noStroke();
  whirlLayer.rectMode(CENTER);
  whirlLayer.translate(HALF_W, HALF_H);
  whirlLayer.angleMode(DEGREES);

  for (let s of store.whirl) {
    s.radius += s.v_dir * s.v_vel * s.step;
    const x = cos(s.angle) * s.radius;
    const y = sin(s.angle) * s.radius;

    whirlLayer.fill(s.col);
    whirlLayer.square(x, y, s.size, s.R);

    s.angle += s.h_dir * s.h_vel;
    s.step += 1;

    if ((s.v_dir < 0 && s.radius <= WHIRL_MINRAD) || (s.v_dir > 0 && s.radius >= s.diameter / 2)) {
      if (s.fluctuate) {
        s.v_dir *= -1;
      } else {
        s.radius = s.v_dir > 0 ? 0 : s.diameter / 2;
      }
      s.step = 0;
    }
  }

  whirlLayer.pop();
  image(whirlLayer, 0, 0);
};

/*** スパイラル：図形（1個）が円を描きながら中心にいく ***/
/* 引数： size, R, speed, colors, opacity, direction, diameter, interval */
// direction（収縮／膨張方向）: 負の値, 正の値 (既定値: -1)
// diameter（回転直径）: width以下の数値
// interval（色変化間隔）: 秒 （既定値： 色変化なし）
// 注） size, R, opacityは [最小値, 最大値] の形式で乱数
// 注） speedが配列の場合は、乱数ではなく、[回転速度, 収縮／膨張速度]になる
// 注） directionが配列の場合は、乱数ではなく、[収縮／膨張方向, 左回り／右回り]になる
p5.prototype.ws_spiral = (arg) => {
  const cols = arg.colors || [
    color(252, 121, 121),
    color(245, 158, 66),
    color(126, 224, 201),
    color(145, 168, 235),
    color(139, 55, 191),
    color(252, 249, 179),
    color(255, 105, 180)
  ];
  const fps = frameRate();

  if (store.spiral.length == 0) {
    const size = arg.size ?? 50;
    let h_vel, v_vel;
    if (Array.isArray(arg.speed)) {
      h_vel = arg.speed[0];
      v_vel = arg.speed[1];
    } else {
      h_vel = arg.speed || 10;
      v_vel = h_vel;
    }
    let h_dir, v_dir;
    if (Array.isArray(arg.direction)) {
      v_dir = arg.direction[0] == 'inf' ? 1 : -1;
      h_dir = arg.direction[1] == 'left' ? -1 : 1;
    } else {
      if (arg.direction == 'inf' || arg.direction == 'def') {
        v_dir = arg.direction == 'inf' ? 1 : -1;
        h_dir = 1;
      } else if (arg.direction == 'right' || arg.direction == 'left') {
        v_dir = -1;
        h_dir = arg.direction == 'left' ? -1 : 1;
      } else {
        v_dir = -1;
        h_dir = 1;
      }
    }
    const diameter = arg.diameter ?? width - size;
    const col = random(cols);
    const opa = (arg.opacity ?? 1) * 255;
    col.setAlpha(opa);

    store.spiral.push({
      size: size,
      R: (arg.R ?? 1.0) * (size / 2),
      v_vel: v_vel * 0.1,
      h_vel: h_vel * 0.01,
      col: col,
      opa: opa,
      orgOpa: opa,
      v_dir: v_dir,
      h_dir: h_dir,
      radius: v_dir > 0 ? 0 : diameter / 2,
      diameter: diameter,
      angle: random(0, 360),
      int: round(arg.interval * fps) ?? 0
    });
  }

  spiralLayer.push();
  spiralLayer.clear();
  spiralLayer.noStroke();
  spiralLayer.rectMode(CENTER);
  spiralLayer.translate(HALF_W, HALF_H);
  spiralLayer.angleMode(DEGREES);

  const s = store.spiral[0];
  if (frameCount % s.int == 0) {
    const t = floor(frameCount / s.int);
    const col = cols[t % cols.length];
    s.col = col;
  }

  const col = s.col;
  col.setAlpha(s.opa);
  spiralLayer.fill(col);

  const x = cos(s.angle) * s.radius;
  const y = sin(s.angle) * s.radius;
  spiralLayer.square(x, y, s.size, s.R);

  s.angle += s.h_dir * s.h_vel;
  s.radius += s.v_dir * s.v_vel;

  if ((s.v_dir < 0 && s.radius <= SPIRAL_MINRAD) || (s.v_dir > 0 && s.radius >= s.diameter / 2)) {
    s.opa -= s.orgOpa / (s.h_vel * 100);
    if (s.opa <= 0) {
      s.radius = s.v_dir > 0 ? 0 : s.diameter / 2;
      s.angle = random(0, 360);
      s.opa = s.orgOpa;
      const col = random(cols);
      col.setAlpha(s.opa);
      s.col = col;
    }
  }

  spiralLayer.pop();
  image(spiralLayer, 0, 0);
};

/*** グリッド：敷き詰めた図形の色などが変化する ***/
/* 引数： num, size, R, colors, opacity, interval, noise */
// num（一辺の図形数）： 個数
// interval（色変化間隔）: 秒 （既定値： 色変化なし）
// noise（振動の大きさ）: 数値 （規定値： 振動なし）
// 注） size, R, opacity, interval, noiseは [最小値, 最大値] の形式で乱数
p5.prototype.ws_grid = (arg) => {
  const num = arg.num || 5;
  const cols = arg.colors || [
    color(252, 121, 121),
    color(245, 158, 66),
    color(126, 224, 201),
    color(145, 168, 235),
    color(139, 55, 191),
    color(252, 249, 179),
    color(255, 105, 180)
  ];
  const step = floor(width / num);

  if (store.grid.length === 0) {
    const fps = frameRate();
    for (let y = 0; y < num; y += 1) {
      for (let x = 0; x < num; x += 1) {
        let size;
        if (Array.isArray(arg.size)) {
          size = floor(random(arg.size[0], arg.size[1] + 1));
        } else {
          size = arg.size ?? step / 2;
        }
        let R;
        if (Array.isArray(arg.R)) {
          R = random(arg.R[0], arg.R[1]);
        } else {
          R = arg.R ?? 1.0;
        }
        let opa;
        if (Array.isArray(arg.opacity)) {
          opa = random(arg.opacity[0], arg.opacity[1]) * 255;
        } else {
          opa = (arg.opacity ?? 1) * 255;
        }
        let int;
        if (Array.isArray(arg.interval)) {
          int = floor(random(arg.interval[0], arg.interval[1]));
        } else {
          int = arg.interval ?? random(0.5, 2);
        }
        let sigma;
        if (Array.isArray(arg.noise)) {
          sigma = random(arg.noise[0], arg.noise[1]);
        } else {
          sigma = arg.noise ?? 0;
        }

        const col = cols[(x + y * step) % cols.length];
        col.setAlpha(opa);

        store.grid.push({
          size: size,
          x: x * step + floor(step / 2),
          y: y * step + floor(step / 2),
          R: R,
          col: col,
          opa: opa,
          sigma: sigma,
          int: round(int * fps)
        });
      }
    }
  }
  // 図形の描画
  gridLayer.push();
  gridLayer.clear();
  gridLayer.noStroke();
  gridLayer.rectMode(CENTER);

  for (const s of store.grid) {
    s.size = abs(randomGaussian(s.size, s.sigma));

    if (frameCount % s.int == 0) {
      if (Array.isArray(arg.size)) {
        s.size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        s.size = arg.size ? s.size : step / 2;
      }
      s.col = random(cols);
      s.col.setAlpha(s.opa);
    }
    const R = s.R * (s.size / 2);
    const col = s.col;
    gridLayer.fill(col);
    gridLayer.square(s.x, s.y, s.size, R);
  }

  gridLayer.pop();
  image(gridLayer, 0, 0);
};

/***  ライン：直線を任意の角度で動かす ***/
/* 引数： num, size, weight, speed, cols, opacity, angle */
// num： 図形の個数だけどおおよその数になる
// size（長さ）: 数値
// weight（太さ）: 数値（既定値：2）
// angle（進行角度）: 0-360（真上が0度／既定値：90）
// 注） size, weight, speed, opacityは [最小値, 最大値] の形式で乱数
p5.prototype.ws_line = (arg) => {
  const cols = arg.cols || [
    color(252, 121, 121),
    color(245, 158, 66),
    color(126, 224, 201),
    color(145, 168, 235),
    color(139, 55, 191),
    color(252, 249, 179),
    color(255, 105, 180)
  ];
  const angle = arg.angle ?? 90;

  // 初期設定
  if (store.line.length === 0) {
    const num = (arg.num ?? 20) * 2;
    for (let i = 0; i < num; i += 1) {
      let size;
      if (Array.isArray(arg.size)) {
        size = floor(random(arg.size[0], arg.size[1] + 1));
      } else {
        size = arg.size ?? floor(random(20, 81));
      }
      let weight;
      const w = arg.weight;
      if (Array.isArray(w)) {
        weight = floor(random(w[0], w[1] + 1));
      } else {
        weight = w ?? 2;
      }
      let vel;
      if (Array.isArray(arg.speed)) {
        vel = floor(random(arg.speed[0], arg.speed[1] + 1));
      } else {
        vel = arg.speed || floor(random(10, 30));
      }
      let opa;
      if (Array.isArray(arg.opacity)) {
        opa = random(arg.opacity[0], arg.opacity[1]) * 255;
      } else {
        opa = (arg.opacity ?? 1) * 255;
      }

      const col = cols[i % cols.length];
      col.setAlpha(opa);

      const range = abs(floor((sin(radians(angle) + PI / 4) * width * (sqrt(2) - 1)) / 2));

      store.line.push({
        size: size,
        weight: weight,
        x: random(-size, width + size),
        y: random(-range, height + range),
        col: col,
        opa: opa,
        vel: vel
      });
    }
  }

  // 図形の描画
  lineLayer.push();
  lineLayer.clear();
  lineLayer.angleMode(DEGREES);
  lineLayer.translate(HALF_W, HALF_H);
  lineLayer.rotate(angle - 90);
  lineLayer.translate(-HALF_W, -HALF_H);

  for (let s of store.line) {
    s.x += s.vel;

    if (s.x > width) {
      s.x = -s.size;
      s.col = random(cols);
      s.col.setAlpha(s.opa);
    }

    lineLayer.stroke(s.col);
    lineLayer.strokeWeight(s.weight);
    lineLayer.line(s.x, s.y, s.x + s.size, s.y);
  }

  // レイヤー書き出し
  lineLayer.pop();
  image(lineLayer, 0, 0);
};
