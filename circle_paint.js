let circles = [];

function setup() {
  createCanvas(400, 400);
  background(255);

  let colors = [
    color(252, 121, 121), // 赤
    color(126, 224, 201), // 緑
    color(145, 168, 235), // 青
    color(252, 249, 179), // 黄色
  ];

  for (let i = 0; i < 4; i++) {
    circles.push({
      x: random(width),
      y: random(height),
      r: 85,
      color: colors[i],
      vx: random(-2.5, 2.5), // x速度
      vy: random(-2.5, 2.5), // y速度
    });
  }
}

function draw() {
  circle_paint();
}

function circle_paint() {
  noStroke();

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
