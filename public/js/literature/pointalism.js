/* global uncontext, console */

(function () {
    'use strict';

    var runner;
    var fullHeight = 450;
    var fullWidth = fullHeight;

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    function toDegrees(rads) {
        return rads * (180 / Math.PI);
    }

    function hsv2rgb(h, s, v) {
        var rgb, i, data = [];
        if (s === 0) {
            rgb = [v, v, v];
        } else {
            h = h / 60;
            i = Math.floor(h);
            data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
            switch (i) {
                case 0:
                    rgb = [v, data[2], data[0]];
                    break;
                case 1:
                    rgb = [data[1], v, data[0]];
                    break;
                case 2:
                    rgb = [data[0], v, data[2]];
                    break;
                case 3:
                    rgb = [data[0], data[1], v];
                    break;
                case 4:
                    rgb = [data[2], data[0], v];
                    break;
                default:
                    rgb = [v, data[0], data[1]];

            }
        }

        return '#' + rgb.map(function (x) {
            return ('0' + Math.round(x*255).toString(16)).slice(-2);
        }).join('');
    }

    function setupDOM() {
        var div = document.createElement('div');
        var canvas = document.createElement('canvas');

        div.setAttribute('class', 'demo-holder');
        div.appendChild(canvas);
        document.body.appendChild(div);

        canvas.setAttribute('height', fullHeight);
        canvas.setAttribute('width', fullWidth);
        canvas.setAttribute('id', 'demo');
        return canvas;
    }

    var Point = function (data) {
        // Calculate point
        this.x = 0;
        this.y = 0;
        this.angle = (data.c ? data.e.f : -data.e.f) + (Math.random() + 360); // Some randomization
        this.speed = Math.random() * 10;

        // Figure color
        var ratio = (data.a / 25) * 100;
        var h = Math.floor((100 - ratio) * 120 / 100);
        var s = Math.abs(ratio - 50) / 50;
        var v = 1
        this.color = hsv2rgb(h, s, v);

        // this.radius = data.a;
        this.radius = data.d;
        this.lifetime = data.e.g / 10;
    };

    Point.prototype.update = function () {
        if (this.lifetime <= 0) {

        } else {
            this.lifetime -= 1;
            this.x += Math.cos(toRadians(this.angle)) * this.speed;
            this.y += Math.sin(toRadians(this.angle)) * this.speed;
        }
    };

    Point.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(fullWidth / 2, fullHeight / 2);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.restore();
    };

    var Runner = function () {
        this.last_step = null;
        this.last_data = null;

        // Setup
        this.init();
    };

    Runner.prototype.init = function () {
        this.canvas = setupDOM();
        this.context = this.canvas.getContext('2d');
        this.points = [];
    };

    Runner.prototype.addData = function (data) {
        // Update data set
        this.points.push(new Point(data));
    };

    Runner.prototype.update = function () {
        // Update render calculations
        this.points.forEach(function (p) {
            p.update();
        });
    };

    Runner.prototype.render = function () {
        // Render to provided context
        var runner = this;
        this.context.clearRect(0, 0, fullWidth, fullHeight);
        this.points.forEach(function (p) {
            p.render(runner.context);
        });
    };

    Runner.prototype.tick = function () {
        var runner = this;
        window.requestAnimationFrame(function (time) {
            var delta = time - (runner.last_step || time);
            runner.last_step = time;
            runner.update();
            runner.render();
            runner.tick();
        });
    };

    // Keep it simple.
    runner = new Runner();
    uncontext.socket_.onmessage = function (ev) {
        runner.addData(JSON.parse(ev.data));
    };
    runner.tick();
})();
