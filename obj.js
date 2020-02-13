class Player {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.v = {};
        this.v.x = 0;
        this.v.y = 0;
        this.quadrant = [0, 0];
        this.pquadrant = [1, 0];
        this.speed = 0.7;
        this.r = 0;
        this.drawAmt = 0;
        this.bowDrawPosition = [0, 0];
    }

    show() {
        draw.fillStyle = palette.player;
        this.r = Math.atan2((this.y - (mouseY + camera.y)), (this.x - (mouseX + camera.x))) + Math.PI;

        draw.beginPath();
        draw.arc(this.x - camera.x, this.y - camera.y, c.width / 64, 0, Math.PI * 2);
        draw.fill();
        this.quadrant = [Math.floor(this.x / c.width), Math.floor(this.y / c.height)];

        if (!arrowShooting && healthAmt > 0) {
            if (keysDown["w"] || keysDown["ArrowUp"]) {
                this.v.y -= this.speed;
            }
            if (keysDown["s"] || keysDown["ArrowDown"]) {
                this.v.y += this.speed;
            }
            if (keysDown["a"] || keysDown["ArrowLeft"]) {
                this.v.x -= this.speed;
            }
            if (keysDown["d"] || keysDown["ArrowRight"]) {
                this.v.x += this.speed;
            }
        }

        // Bow
        let angleWidth = 0.6;
        let pointA = [Math.cos(this.r - angleWidth) * c.width / 32 + this.x - camera.x, Math.sin(this.r - angleWidth) * c.width / 32 + this.y - camera.y];
        let pointB = [Math.cos(this.r + angleWidth) * c.width / 32 + this.x - camera.x, Math.sin(this.r + angleWidth) * c.width / 32 + this.y - camera.y];
        let middle = [((pointA[0] + pointB[0]) / 2) + Math.cos(this.r) * -this.drawAmt, ((pointA[1] + pointB[1]) / 2) + Math.sin(this.r) * -this.drawAmt]
        this.bowDrawPosition = [middle[0] + camera.x, middle[1] + camera.y];

        draw.lineWidth = 2;
        if (arrowShooting) {
            this.drawAmt += (30 - this.drawAmt) * (0.5 * timeSpeed);
            draw.strokeStyle = palette.arrow;
            draw.beginPath();
            draw.moveTo(middle[0], middle[1]);
            draw.lineTo(middle[0] + Math.cos(this.r) * 50, middle[1] + Math.sin(this.r) * 50);
            draw.stroke();
        } else {
            this.drawAmt *= -0.5;
        }

        draw.strokeStyle = palette.string;
        draw.beginPath();
        draw.moveTo(pointA[0], pointA[1]);
        draw.lineTo(middle[0], middle[1]);
        draw.lineTo(pointB[0], pointB[1]);
        draw.stroke();

        draw.strokeStyle = palette.tree;
        draw.lineWidth = 2;
        draw.beginPath();
        draw.arc(this.x - camera.x, this.y - camera.y, c.width / 32, this.r - angleWidth, this.r + angleWidth)
        draw.stroke();

        this.x += this.v.x * timeSpeed;
        this.y += this.v.y * timeSpeed;
        this.v.x *= 1 - (0.02 * timeSpeed);
        this.v.y *= 1 - (0.02 * timeSpeed);

        let i = treeCollision(this.x, this.y, c.width / 64)
        if (i) {
            let treeR = Math.atan2((this.y - trees[i].y), (this.x - trees[i].x));
            let vR = Math.atan2(this.v.y, this.v.x);
            let newvR = (treeR + Math.PI / 2) - (vR - (treeR + Math.PI / 2));
            let speed = dist(0, 0, this.v.x, this.v.y);
            this.v.x = Math.cos(newvR) * speed;
            this.v.y = Math.sin(newvR) * speed;
            this.x += this.v.x;
            this.y += this.v.y;
        }
    }
}

class Tree {
    constructor(quadrantx, quadranty) {
        this.x = map(Math.random(), 0, 1, -0.25, 1.25) * c.width + c.width * quadrantx;
        this.y = map(Math.random(), 0, 1, -0.25, 1.25) * c.height + c.height * quadranty;
    }

    show() {
        let r = c.width / 48;
        if (this.x + r - camera.x > 0 && this.y + r - camera.y > 0 && this.x - r - camera.x < c.width && this.y - r - camera.y < c.height) {
            draw.fillStyle = palette.tree;
            draw.beginPath();
            draw.arc(this.x - camera.x, this.y - camera.y, r, 0, Math.PI * 2);
            draw.fill();
        }
    }
}

class Arrow {
    constructor(x, y, r, v) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.v = v;
        this.playervx = player.v.x;
        this.playervy = player.v.y;
        this.originalV = v;
        this.endTime = 0;
        this.zombiesShot = [];
    }

    show() {
        let length = 50;
        draw.strokeStyle = palette.arrow;
        draw.beginPath();
        draw.moveTo(this.x - camera.x, this.y - camera.y);
        draw.lineTo(this.x + Math.cos(this.r + Math.PI) * length - camera.x, this.y + Math.sin(this.r + Math.PI) * length - camera.y);
        draw.stroke();

        let rx = Math.cos(this.r);
        let ry = Math.sin(this.r);

        if (this.endTime == 0) {
            this.v -= 0.1 * timeSpeed;
        }
        this.x += rx * this.v * timeSpeed + (this.playervx * (this.v / this.originalV));
        this.y += ry * this.v * timeSpeed + (this.playervy * (this.v / this.originalV));

        function treeCollide(x1, y1, x2, y2) {
            for (let i = 0; i < trees.length; i++) {
                let result = lineCircleCollide([x1, y1], [x2, y2], [trees[i].x, trees[i].y], c.width / 48);
                if (result) {
                    return true;
                }
            }
            return false;
        }

        for (let i = 0; i < (5 / this.originalV) * this.v; i++) {
            particles.push(new Particle(this.x + (rx * -1 * this.v) * Math.random(), this.y + (ry * -1 * this.v) * Math.random(), c.width / 1028, this.r + (Math.random() - 0.5) * 0.5 + Math.PI, this.v / 8 + Math.random() * 5, 0.9, 1000 + Math.random() * 500, palette.arrow));
        }

        function zombieCollide(x1, y1, x2, y2, zombiesShot) {
            for (let i = 0; i < zombies.length; i++) {
                if (zombiesShot.indexOf(zombies[i].id) == -1 && zombies[i].shootable) {
                    let result = lineCircleCollide([x1, y1], [x2, y2], [zombies[i].x, zombies[i].y], c.width / 64);
                    if (result) {
                        return i;
                    }
                }
            }
            return false;
        }

        if (this.v !== 0 && treeCollide(this.x, this.y, this.x + rx * -1 * length, this.y + ry * -1 * length)) {
            this.v = -1;
        }

        let zombieCollision = zombieCollide(this.x, this.y, this.x + rx * -1 * length, this.y + ry * -1 * length, this.zombiesShot);
        console.log(zombieCollision);
        if (zombieCollision || zombieCollision === 0) {
            if (zombies[zombieCollision].health < this.v) {
                zombies[zombieCollision].v.x += rx * this.v / 5;
                zombies[zombieCollision].v.y += ry * this.v / 5;
                this.v -= zombies[zombieCollision].health;
                zombies[zombieCollision].health = 0;
                for (let i = 0; i < 25; i++) {
                    let rand = (Math.random() - 0.5)
                    particles.push(new Particle(this.x, this.y, c.width / 512, this.r + (Math.random() - 0.5) ** 2 * Math.sign(rand), this.v * 0.5 + Math.random() * 1, 0.95, 5000, "red"));
                }
            } else {
                this.v = 0;
                zombies[zombieCollision].health -= this.v;
            }
            this.zombiesShot.push(zombies[zombieCollision].id);
        }

        if (this.v <= 0 && this.endTime == 0) {
            this.endTime = performance.now() + 10000;
            this.v = 0;
        }

        if (this.endTime !== 0 && performance.now() > this.endTime) {
            return "HELLO DARKNESSS MY OLD FRIEEEND"
        }
    }
}

class Cache {
    constructor(quadrantx, quadranty) {
        this.x = Math.random() * c.width + c.width * quadrantx;
        this.y = Math.random() * c.height + c.height * quadranty;
        while (treeCollision(this.x, this.y, c.width / 48) || dist(this.x, this.y, player.x, player.y) < c.width / 4) {
            this.x = Math.random() * c.width + c.width * quadrantx;
            this.y = Math.random() * c.height + c.height * quadranty;
        }
        let shavings = polarToCart(Math.random() * Math.PI * 2, c.width / 4 - c.width / 48);
        this.shavingX = shavings[0] + this.x;
        this.shavingY = shavings[1] + this.y;
        this.shavings = [];

        while (this.shavings.length < 30) {
            let x = (Math.random() - 0.5) * c.width / 12;
            let y = (Math.random() - 0.5) * c.width / 12;
            if (dist(x, y, 0, 0) < Math.random() * c.width / 12) {
                let r = polarToCart(Math.random() * Math.PI * 2, 10);
                this.shavings.push([x + this.shavingX, y + this.shavingY, x + this.shavingX + r[0], y + this.shavingY + r[1]]);
            }
        }

        this.arrowLocations = [];
        this.amt = 10 + Math.floor(Math.random() * 10);
        while (this.arrowLocations.length < this.amt) {
            let x = (Math.random() - 0.5) * c.width / 12;
            let y = (Math.random() - 0.5) * c.width / 12;
            if (dist(x, y, 0, 0) < Math.random() * c.width / 12) {
                this.arrowLocations.push([x, y, Math.random() * Math.PI * 2]);
            }
        }
    }

    show() {
        if (this.seen) {
            draw.fillStyle = "black";

            for (let i = 0; i < this.arrowLocations.length; i++) {
                draw.save();
                draw.translate(this.x - camera.x + this.arrowLocations[i][0], this.y - camera.y + this.arrowLocations[i][1]);
                draw.rotate(this.arrowLocations[i][2]);
                draw.drawImage(arrowheadImage, 0, 0, c.width / 128, c.width / 128);
                draw.restore();
            }

            if (dist(player.x, player.y, this.x, this.y) < c.width / 48 + c.width / 64) {
                arrowBlanks += this.amt;
                return "99 LITTLE BUGS IN MY CODE 99 LITTLE BUGS TAKE ONE DOWN PATCH IT AROUND 127 LITTLE BUGS IN MY CODE";
            }
        } else if (dist(this.x, this.y, player.x, player.y) < c.width / 4) {
            this.seen = true;
        }
        draw.strokeStyle = "white";
        draw.lineWidth = 1;
        for (let i = 0; i < this.shavings.length; i++) {
            draw.beginPath();
            draw.moveTo(this.shavings[i][0] - camera.x, this.shavings[i][1] - camera.y);
            draw.lineTo(this.shavings[i][2] - camera.x, this.shavings[i][3] - camera.y);
            draw.stroke();
        }
    }
}

class Zombie {
    constructor(quadrantx, quadranty, id) {
        this.x = Math.random() * c.width + c.width * quadrantx;
        this.y = Math.random() * c.height + c.height * quadranty;
        while (treeCollision(this.x, this.y, c.width / 48)) {
            this.x = Math.random() * c.width + c.width * quadrantx;
            this.y = Math.random() * c.height + c.height * quadranty;
        }
        this.v = {};
        this.v.x = 0;
        this.v.y = 0;
        this.health = 20;
        this.id = id;
        this.shootable = true;
        this.endTime = 0;
        this.frames = 0;
    }

    show() {
        draw.fillStyle = "black";
        if (this.endTime !== 0) {
            draw.fillStyle = `rgba(0, 0, 0, ${((120 - this.frames) / 120) * timeSpeed})`;
        }
        draw.beginPath();
        draw.arc(this.x - camera.x, this.y - camera.y, c.width / 64, 0, Math.PI * 2);
        draw.fill();

        this.x += this.v.x * timeSpeed;
        this.y += this.v.y * timeSpeed;
        this.v.x *= 1 - (0.01 * timeSpeed);
        this.v.y *= 1 - (0.01 * timeSpeed);

        if (this.shootable) {
            let speed = 0.125;
            let playerR = Math.atan2((this.y - player.y), (this.x - player.x)) + Math.PI;
            this.v.x += Math.cos(playerR) * speed * timeSpeed;
            this.v.y += Math.sin(playerR) * speed * timeSpeed;

            if (this.health <= 0) {
                this.endTime = 120;
                healthAmt += 100;
                this.shootable = false;
            }
        } else {
            this.frames += timeSpeed;
        }

        let i = treeCollision(this.x, this.y, c.width / 64)
        if (i) {
            let treeR = Math.atan2((this.y - trees[i].y), (this.x - trees[i].x));
            let vR = Math.atan2(this.v.y, this.v.x);
            let newvR = (treeR + Math.PI / 2) - (vR - (treeR + Math.PI / 2));
            let speed = dist(0, 0, this.v.x, this.v.y);
            this.v.x = Math.cos(newvR) * speed;
            this.v.y = Math.sin(newvR) * speed;
            this.x += this.v.x;
            this.y += this.v.y;
        }

        if (!this.shootable && this.endTime <= this.frames) {
            return "*roblox death noises*";
        }
    }
}

class Particle {
    constructor(x, y, radius, r, v, drag, time, c) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.r = r;
        this.v = v;
        this.drag = drag; // The percentage of velocity that will be left at the end of show()
        this.time = time + performance.now(); // The time when the particle will disappear
        this.c = c;
    }
    show() {
        draw.fillStyle = this.c;
        draw.beginPath();
        draw.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        draw.fill();

        this.x += Math.cos(this.r) * this.v * timeSpeed;
        this.y += Math.sin(this.r) * this.v * timeSpeed;
        this.v *= 1 - ((1 - this.drag) * timeSpeed);

        this.custom();

        if (this.time <= performance.now()) {
            return "oof";
        }
    }

    custom() {
        // Redefine in child classes
    }
}

class Radiation extends Particle {
    constructor() {
        super(player.x + (Math.random() - 0.5) * c.width * 1.2, player.y + (Math.random() - 0.5) * c.height * 1.2, c.width / 1028, Math.PI * -0.5, 2, 0.99, 1000 + Math.random() * 50, "#77ff77");
        this.frames = 0;
    }

    custom() {
        this.r += Math.sin(this.frames / 100) * timeSpeed * 0.01;
        this.frames += timeSpeed;
    }
}