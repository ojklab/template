function setup() {
  createCanvas(400, 400);
  workshop_setup();
}

function draw() {
  background(255);

  // スパイラル四角形を初期化＆描画
  // drawSpiralSquares({
  //   num: 7,
  //   size: 80,
  //   speed: 0.05,
  //   bl: 40,
  //   colors: [
  //     color(252, 121, 121), // 赤
  //     color(126, 224, 201), // 緑
  //     color(145, 168, 235), // 青
  //     color(252, 249, 179), // 黄色
  //   ],
  // });

  /*circle_free（円が自由に動き回る）*/
  // circle_free({
  //   r: 150,
  //   num: 7,
  //   vx: random(-2, 2),
  //   vy: random(-2, 2),
  //   bl: 80,
  // });

  /*circle_rotate（時計回りに円が回る）*/
  // circle_rotate({
  //   spd: 0.02,
  //   r: 80,
  //   bl: 40,
  // });

  /*circle_paint（円で塗りつぶす）*/
  // circle_paint({
  //   num: 4,
  //   r: 90,
  //   vx: random(-5, 5),
  //   vy: random(-5, 5),
  //   //baseColors: [color(50, 168, 82, 150), color(50, 85, 168, 200)],
  //   bl: 1,
  // });

  /*drawShapeGrid（25個の四角）*/
  // drawShapeGrid({
  //   cols: 5,
  //   rows: 5,
  //   shapeSize: 50,
  //   cornerRadius: 0,
  //   // colors: [
  //   //   color(52, 121, 121),
  //   //   color(126, 224, 21),
  //   //   color(145, 16, 235),
  //   //   color(25, 249, 179),
  //   // ],
  //   colorChangeSpeed: 60,
  //   stroke: false,
  //   randomizeColor: true,
  // });

  /* drawRandomSquares (ランダムに四角形を出現させる) */
  drawRandomSquares({
    baseColors: [
      color(252, 121, 121),
      color(126, 224, 201),
      color(145, 168, 235),
      color(252, 249, 179),
    ],
    minSize: 10, // 四角形の最小サイズ
    maxSize: 20, // 四角形の最大サイズ
    speed: 30, // 出現スピードを指定
  });

  // circle(200, 200, 80);
}
