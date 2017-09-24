var c = document.querySelector("#view"),
    ctx = c.getContext("2d");
c.width = document.body.clientWidth;
c.height = document.body.clientHeight;

var debug = true;
var mouse = {x: 0, y: 0, relX: 0, relY: 0};

function clear() {
    ctx.clearRect(0, 0, c.width, c.height);
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function lerp(min, max, k) {
    return min + (max - min) * k;
}

function setMousePosition(e) {
    var r = c.getBoundingClientRect();
    mouse = {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      relX: e.movementX,
      relY: e.movementY
    };

    if (!ch.assistStatus) {
        ch.position.x = mouse.x;
        ch.position.y = mouse.y;
    }
}

function Crosshair() {
    this.assistStatus = false;
    this.assistRange = 20;
    this.size = 10;
    this.position = {x: mouse.x, y: mouse.y};
}

Crosshair.prototype.tick = function () {
    this.position = {
        x: Math.floor(this.position.x + mouse.relX),
        y: Math.floor(this.position.y + mouse.relY)
    };
    if (this.assistStatus) {
        this.assist();
        ctx.strokeStyle = "yellow";
    } else {
        ctx.strokeStyle = "blue";
    }
    mouse.relX = 0;
    mouse.relY = 0;

    this.draw();
};

Crosshair.prototype.draw = function () {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.position.x - this.size/2, this.position.y);
    ctx.lineTo(this.position.x + this.size/2, this.position.y);
    ctx.moveTo(this.position.x, this.position.y - this.size/2);
    ctx.lineTo(this.position.x, this.position.y + this.size/2);
    ctx.closePath();
    ctx.stroke();

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Crosshair: ["+Math.round(this.position.x)+", "+Math.round(this.position.y)+"]", 10, 75);
};

Crosshair.prototype.assist = function () {
    var rel = {
        x: t.position.x - this.position.x,
        y: t.position.y - this.position.y
    };

    if (rel.x > this.assistRange || rel.y > this.assistRange || mouse.relX === 0 || mouse.relY === 0) {
        return;
    }

    /*var comp = {
        x: Math.abs(1-Math.abs(rel.x / this.assistRange)).clamp(0.0, 0.2),
        y: Math.abs(1-Math.abs(rel.y / this.assistRange)).clamp(0.0, 0.2)
    }*/
    var comp = {
        x: Math.random() * (0.2 - 0.01) + 0.01,
        y: Math.random() * (0.2 - 0.01) + 0.01,
    };
    this.position.x = lerp(this.position.x, t.position.x, comp.x); // Math.abs(rel.x / c.width).clamp(0.0, 0.95)
    this.position.y = lerp(this.position.y, t.position.y, comp.y);
};

function Target() {
    this.size = 15;
    this.speed = 0.1;
    this.position = {x: 300, y: 300};
    this.velocity = {x: this.speed * 3, y: this.speed * 3};
}

Target.prototype.tick = function(deltaTime) {
    if (this.position.x <= 0 || this.position.x >= c.width) {
        if (this.position.x <= 0) this.position.x = 0;
        if (this.position.x >= c.width) this.position.x = c.width;
        this.velocity.x *= -1;
    }

    if (this.position.y <= 0 || this.position.y >= c.height) {
        if (this.position.y <= 0) this.position.y = 0;
        if (this.position.y >= c.height) this.position.y = c.height;
        this.velocity.y *= -1;
    }

    this.position = {
            x: this.position.x + Math.ceil((this.velocity.x * deltaTime)),
            y: this.position.y + Math.ceil((this.velocity.y * deltaTime))
    };

    this.draw();
};

Target.prototype.draw = function() {
    if (debug) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Target: ["+this.position.x+", "+this.position.y+"]", 10, 50);
    }

    ctx.strokeStyle = Math.abs(this.position.x - ch.position.x) < this.size && Math.abs(this.position.y - ch.position.y) < this.size ? "red" : "green";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, 2*Math.PI);
    ctx.closePath();
    ctx.stroke();
};

var t = new Target();

var ch = new Crosshair();
window.addEventListener("mousedown", function(){
    c.requestPointerLock();
    ch.assistStatus = true;
}, false);
window.addEventListener("mouseup", function(){
    document.exitPointerLock();
    ch.assistStatus = false;
    ch.position.x = mouse.x;
    ch.position.y = mouse.y;
}, false);
window.addEventListener("mousemove", setMousePosition, false);

var lastLoop = +new Date();
var lastFPS = 0;

function mainRoutine() {
    var deltaTime = +new Date() - lastLoop;
    var currentFPS = 1 / (deltaTime / 1000);
    var fps = (lastFPS * 0.95) + (currentFPS * (1.0 - 0.95));

    clear();
    if (debug) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("FPS: "+Math.floor(fps), 10, 25);
    }
    ch.tick();
    t.tick(deltaTime);
    lastLoop = +new Date();
    lastFPS = fps;
    requestAnimationFrame(mainRoutine);
}

requestAnimationFrame(mainRoutine);
