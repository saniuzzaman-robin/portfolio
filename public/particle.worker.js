/* Particle system web worker — runs the O(n²) physics + canvas loop off the main thread */
'use strict';

var PARTICLE_AREA_DIVISOR = 12000;
var PARTICLE_MAX = 120;
var CONNECTION_DISTANCE = 120;
var MOUSE_REPULSION_RADIUS = 100;

var offscreen = null;
var ctx = null;
var particles = [];
var mouse = { x: -9999, y: -9999 };
var rafId = 0;

function initParticles(width, height, colors) {
  var count = Math.floor((width * height) / PARTICLE_AREA_DIVISOR);
  var len = Math.min(count, PARTICLE_MAX);
  particles = [];
  for (var i = 0; i < len; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function draw() {
  if (!offscreen || !ctx) return;
  var width = offscreen.width;
  var height = offscreen.height;

  ctx.clearRect(0, 0, width, height);

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var dx = p.x - mouse.x;
    var dy = p.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0 && dist < MOUSE_REPULSION_RADIUS) {
      var force = (MOUSE_REPULSION_RADIUS - dist) / MOUSE_REPULSION_RADIUS;
      p.vx += (dx / dist) * force * 0.3;
      p.vy += (dy / dist) * force * 0.3;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle =
      p.color +
      Math.floor(p.opacity * 255)
        .toString(16)
        .padStart(2, '0');
    ctx.fill();
  }

  /* O(n²) connection loop — the primary reason this runs in a worker */
  for (var a = 0; a < particles.length; a++) {
    for (var b = a + 1; b < particles.length; b++) {
      var pa = particles[a];
      var pb = particles[b];
      var ddx = pa.x - pb.x;
      var ddy = pa.y - pb.y;
      var d = Math.sqrt(ddx * ddx + ddy * ddy);
      if (d < CONNECTION_DISTANCE) {
        var alpha = ((CONNECTION_DISTANCE - d) / CONNECTION_DISTANCE) * 0.25;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = 'rgba(0, 212, 255, ' + alpha + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  rafId = requestAnimationFrame(draw);
}

self.addEventListener('message', function (event) {
  var msg = event.data;
  if (msg.type === 'init') {
    offscreen = msg.canvas;
    offscreen.width = msg.width;
    offscreen.height = msg.height;
    ctx = offscreen.getContext('2d');
    initParticles(msg.width, msg.height, msg.colors);
    draw();
  } else if (msg.type === 'mouse') {
    mouse = { x: msg.x, y: msg.y };
  } else if (msg.type === 'resize') {
    if (!offscreen) return;
    cancelAnimationFrame(rafId);
    offscreen.width = msg.width;
    offscreen.height = msg.height;
    initParticles(msg.width, msg.height, msg.colors);
    draw();
  } else if (msg.type === 'stop') {
    cancelAnimationFrame(rafId);
  }
});
