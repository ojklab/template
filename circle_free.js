let circles = [];

function setup() {
  createCanvas(400, 400);
  background(255);

  let colors = [
    color(255, 0, 0, 60), // 赤
    color(245, 158, 66, 60), // オレンジ
    color(0, 255, 0, 60), // 緑
    color(0, 0, 255, 60), // 青
    color(139, 55, 191, 60), // 紫
    color(255, 255, 0, 60), // 黄色
    color(255, 0, 255, 60), // ピンク
  ];

  for (let i = 0; i < 7; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      r: 150,
      color: colors[i],
      vx: random(-2, 2), // x速度
      vy: random(-2, 2), // y速度
    });
  }
}

function draw() {
  circle_free();
}

function circle_free() {
  fill(255);
  noStroke();
  rect(0, 0, 400, 400);

  for (let en of circles) {
    en.x += en.vx;
    en.y += en.vy;

    if (en.x > width || en.x < 0) {
      en.vx *= -1;
    }
    if (en.y > height || en.y < 0) {
      en.vy *= -1;
    }

    fill(en.color);
    circle(en.x, en.y, en.r);
  }
}
