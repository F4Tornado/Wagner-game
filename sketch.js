let c;
let draw;

let player;
let trees = [];

let timeSpeed = 1;
let quadrantsGenerated = [];
let cachesGenerated = [];
let keysDown = {};
let squareWidth;
let mouseX = 0;
let mouseY = 0;
let arrowsFrames = 80 - 1; // The amount of frames it takes to make a new arrow
let time = 0; // The time used in producing a new arrow
let waveTime = 0; // The time before the next wave
let wavesFrames = (60 * 20) - 1; // The time between waves
let maxHealth = (60 * 40) - 1;
let healthAmt = maxHealth; // Amount of health the player has
let arrowsAmt = 0;
let arrowBlanks = 10;
let arrowShooting = false;
const arrows = [];
const caches = [];
const zombies = [];
const particles = [];
let totalZombies = 0;
let rotation = 0;
const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
}
const palette = {
    background: `rgba(96, 204, 20, 0.8)`,
    player: "hsla(275, 100%, 55%, 1)",
    tree: "#b36012",
    string: "#fff",
    arrow: "#fff",
}
let arrowImage = document.createElement("img");
arrowImage.src = "Arrow.png";
let arrowheadImage = document.createElement("img");
arrowheadImage.src = "Arrowhead.png";
let healthImage = document.createElement("img");
healthImage.src = "Health.png";

function setup() {
    c = document.getElementById("c");
    draw = c.getContext("2d");

    c.width = window.innerWidth;
    c.height = window.innerHeight;
    player = new Player();
    setTimeout(drawLoop, 1000 / 60);
}

function drawLoop() {
    if (healthAmt > 0) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        setTimeout(deadLoop, 1000 / 60);
    }

    adjustCamera();

    draw.fillStyle = palette.background;
    draw.fillRect(0, 0, c.width, c.height);
    squareWidth = c.width / 8;

    if (!arrowShooting) {
        draw.strokeStyle = "rgba(0, 0, 0, 0.2)";
        draw.beginPath();
        draw.arc(player.x - camera.x, player.y - camera.y, c.width / 4, 0, Math.PI * 2);
        draw.stroke();
    }

    for (let i = 0; i < particles.length; i++) {
        if (particles[i].show()) {
            particles.splice(i, 1);
        }
    }

    for (let i = 0; i < trees.length; i++) {
        trees[i].show();
    }

    for (let i = 0; i < caches.length; i++) {
        if (caches[i].show()) {
            caches.splice(i, 1);
        }
    }

    player.show();
    for (let i = 0; i < arrows.length; i++) {
        if (arrows[i].show()) {
            arrows.splice(i, 1);
        }
    }

    for (let i = 0; i < zombies.length; i++) {
        if (zombies[i].show()) {
            zombies.splice(i, 1);
        }
    }

    draw.fillStyle = "black";
    draw.strokeStyle = palette.tree;
    draw.lineWidth = 4;
    draw.beginPath();
    draw.arc(c.width / 64 + 16, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 32 + 128, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 16 + 240, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 8 + 310, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + 16, c.width / 64 + 16, c.width / 64, 0, (Math.PI * 2) * (time / arrowsFrames));
    draw.stroke();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 16 + 240, c.width / 64 + 16, c.width / 64, 0, (Math.PI * 2) * (waveTime / wavesFrames));
    draw.stroke();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 32 + 128, c.width / 64 + 16, c.width / 64, 0, (Math.PI * 2) * ((arrowsFrames - (time == 0 ? arrowsFrames : time)) / arrowsFrames));
    draw.stroke();

    draw.strokeStyle = `hsla(${29 + rotation}, 82%, 39%, 1)`
    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 8 + 310, c.width / 64 + 16, c.width / 64, 0, (Math.PI * 2) * (healthAmt / maxHealth));
    draw.stroke();

    drawArrows();

    draw.fillStyle = "white";
    draw.font = "32px sans-serif";
    draw.textBaseline = "middle";
    draw.fillText(arrowsAmt, c.width / 32 + 32 + 16, c.width / 64 + 16, c.width / 64, c.width / 64);
    draw.fillText(arrowBlanks, c.width / 32 + c.width / 32 + 128 + 32, c.width / 64 + 16, c.width / 64, c.width / 64);
    draw.fillText(zombies.length, c.width / 32 + c.width / 16 + 240 + 32, c.width / 64 + 16, c.width / 64, c.width / 64);

    draw.drawImage(arrowImage, 16, 16, c.width / 32, c.width / 32);
    draw.drawImage(arrowheadImage, c.width / 32 + 128, 16, c.width / 32, c.width / 32);
    draw.drawImage(healthImage, c.width / 8 + 310, 16, c.width / 32, c.width / 32);

    if (!arraysEqual(player.quadrant, player.pquadrant)) {
        generateQuadrant(-1, -1);
        generateQuadrant(-1, 0);
        generateQuadrant(-1, 1);
        generateQuadrant(0, -1);
        generateQuadrant(0, 0);
        generateQuadrant(0, 1);
        generateQuadrant(1, -1);
        generateQuadrant(1, 0);
        generateQuadrant(1, 1);
    }

    for (let i = 0; i < 20; i++) {
        particles.push(new Radiation());
    }

    player.pquadrant = player.quadrant;
    if (!(keysDown["w"] || keysDown["ArrowUp"] || keysDown["s"] || keysDown["ArrowDown"] || keysDown["a"] || keysDown["ArrowLeft"] || keysDown["d"] || keysDown["ArrowRight"] || arrowShooting || arrowBlanks == 0)) {
        time += timeSpeed;
    }
    waveTime += timeSpeed;
    healthAmt -= timeSpeed;
    rotation += (512 / healthAmt) * timeSpeed;
    if (time >= arrowsFrames) {
        time = 0;
        arrowsAmt++;
        arrowBlanks--;
    }
    if (waveTime >= wavesFrames) {
        waveTime = 0;
        wavesFrames *= 0.99;
        for (let i = 0; i < 10; i++) {
            let quadrant = Math.floor(Math.random() * 16);
            let quadrantX = quadrant < 5 ? -2 : (quadrant < 8 ? (quadrant - 6) : (quadrant < 13 ? 2 : (14 - quadrant)));
            let quadrantY = quadrant < 5 ? (quadrant - 2) : (quadrant < 9 ? 2 : (quadrant < 13 ? (10 - quadrant) : -2));
            zombies.push(new Zombie(player.quadrant[0] + quadrantX, player.quadrant[1] + quadrantY, totalZombies));
            totalZombies++;
        }
    }
}

function deadLoop() {
    if (healthAmt > 0) {
        setTimeout(drawLoop, 1000 / 60);
    } else {
        setTimeout(deadLoop, 1000 / 60);
    }

    timeSpeed = 0.5;
    palette.background = `rgba(96, 204, 20, 0.3)`;

    adjustCamera();

    draw.fillStyle = palette.background;
    draw.fillRect(0, 0, c.width, c.height);
    squareWidth = c.width / 8;

    for (let i = 0; i < particles.length; i++) {
        if (particles[i].show()) {
            particles.splice(i, 1);
        }
    }

    for (let i = 0; i < trees.length; i++) {
        trees[i].show();
    }

    for (let i = 0; i < caches.length; i++) {
        if (caches[i].show()) {
            caches.splice(i, 1);
        }
    }

    player.show();
    for (let i = 0; i < arrows.length; i++) {
        if (arrows[i].show()) {
            arrows.splice(i, 1);
        }
    }

    for (let i = 0; i < zombies.length; i++) {
        if (zombies[i].show()) {
            zombies.splice(i, 1);
        }
    }

    draw.fillStyle = "black";
    draw.strokeStyle = palette.tree;
    draw.lineWidth = 4;
    draw.beginPath();
    draw.arc(c.width / 64 + 16, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 32 + 128, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 16 + 240, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.beginPath();
    draw.arc(c.width / 64 + c.width / 8 + 310, c.width / 64 + 16, c.width / 64, 0, Math.PI * 2);
    draw.fill();

    draw.fillStyle = "white";
    draw.font = "32px sans-serif";
    draw.textBaseline = "middle";
    draw.fillText(arrowsAmt, c.width / 32 + 32 + 16, c.width / 64 + 16, c.width / 64, c.width / 64);
    draw.fillText(arrowBlanks, c.width / 32 + c.width / 32 + 128 + 32, c.width / 64 + 16, c.width / 64, c.width / 64);
    draw.fillText(zombies.length, c.width / 32 + c.width / 16 + 240 + 32, c.width / 64 + 16, c.width / 64, c.width / 64);

    draw.drawImage(arrowImage, 16, 16, c.width / 32, c.width / 32);
    draw.drawImage(arrowheadImage, c.width / 32 + 128, 16, c.width / 32, c.width / 32);
    draw.drawImage(healthImage, c.width / 8 + 310, 16, c.width / 32, c.width / 32);

    if (!arraysEqual(player.quadrant, player.pquadrant)) {
        generateQuadrant(-1, -1);
        generateQuadrant(-1, 0);
        generateQuadrant(-1, 1);
        generateQuadrant(0, -1);
        generateQuadrant(0, 0);
        generateQuadrant(0, 1);
        generateQuadrant(1, -1);
        generateQuadrant(1, 0);
        generateQuadrant(1, 1);
    }

    for (let i = 0; i < 20; i++) {
        particles.push(new Radiation());
    }

    draw.font = "128px sans-serif";
    draw.textBaseline = "center";
    draw.textAlign = "center";
    draw.fillText("You died", c.width / 2, c.height / 2);
    draw.font = "32px sans-serif";
    draw.fillText("Press enter to restart", c.width / 2, c.height / 2 + 64 * 1.5);
    draw.textAlign = "left";

    if (keysDown["Enter"]) {
        timeSpeed = 1;
        palette.background = `rgba(96, 204, 20, 0.8)`;
        healthAmt = maxHealth;
        arrowsAmt = 0;
        arrowBlanks = 10;
        zombies.splice(0, zombies.length);
        caches.splice(0, caches.length);
        cachesGenerated = [];
        rotation = 0;
        time = 0;
        waveTime = 0;
        arrowShooting = false;
    }

    player.pquadrant = player.quadrant;
}

function adjustCamera() {
    const mult = 16;
    camera.targetX = player.v.x * mult + player.x - (c.width / 2);
    camera.targetY = player.v.y * mult + player.y - (c.height / 2);
    camera.x -= (camera.x - camera.targetX) * 0.125 * timeSpeed;
    camera.y -= (camera.y - camera.targetY) * 0.125 * timeSpeed;
}

function generateQuadrant(relx, rely) {
    let x = player.quadrant[0] + relx;
    let y = player.quadrant[1] + rely;
    let hasArray = false;
    for (let i = 0; i < quadrantsGenerated.length; i++) {
        if (!hasArray && arraysEqual(quadrantsGenerated[i], [x, y])) {
            hasArray = true;
        }
    }

    let hasArray2 = false;
    for (let i = 0; i < cachesGenerated.length; i++) {
        if (!hasArray2 && arraysEqual(cachesGenerated[i], [x, y])) {
            hasArray2 = true;
        }
    }

    if (Math.random() < (1 / 8) && !hasArray2) {
        caches.push(new Cache(x, y));
        cachesGenerated.push([x, y]);
    }

    if (hasArray) return;

    let amt = Math.floor(Math.random() * 40);
    for (let i = 0; i < amt; i++) {
        trees.push(new Tree(x, y));
    }
    quadrantsGenerated.push([x, y]);
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

function treeCollision(x, y, r) {
    for (let i = 0; i < trees.length; i++) {
        if (dist(x, y, trees[i].x, trees[i].y) <= c.width / 48 + r) {
            return i;
        }
    }
    return false;
}

function polarToCart(r, d) {
    return [Math.cos(r) * d, Math.sin(r) * d];
}

function drawArrows() {
    for (let i = 0; i < zombies.length; i++) {
        if ((zombies[i].x - camera.x < 0 || zombies[i].x - camera.x > c.width || zombies[i].y - camera.y < 0 || zombies[i].y - camera.y > c.height) && zombies[i].endTime == 0) {
            palette.foreground;

            let r = Math.atan2((player.y - zombies[i].y), (player.x - zombies[i].x)) + Math.PI;

            let p1 = polarToCart(r, 16);
            let p2 = polarToCart(Math.PI * 2 / 3 + r, 8);
            let p3 = polarToCart(Math.PI * 2 * 2 / 3 + r, 8);
            let d = polarToCart(r, c.width / 8);
            draw.beginPath();
            draw.moveTo(p1[0] + player.x - camera.x + d[0], p1[1] + player.y - camera.y + d[1]);
            draw.lineTo(p2[0] + player.x - camera.x + d[0], p2[1] + player.y - camera.y + d[1]);
            draw.lineTo(p3[0] + player.x - camera.x + d[0], p3[1] + player.y - camera.y + d[1]);
            draw.fill();
        }
    }
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function map(s, a1, a2, b1, b2) {
    return b1 + (s - a1) * (b2 - b1) / (a2 - a1);
}

window.onkeydown = (e) => {
    keysDown[e.key] = true;
}

window.onkeyup = (e) => {
    keysDown[e.key] = false;
}

window.onmousedown = () => {
    if (arrowsAmt !== 0 && healthAmt > 0) {
        timeSpeed = 0.125;
        palette.background = `rgba(96, 204, 20, 0.1)`;
        arrowShooting = true;
    }
}

window.onmouseup = () => {
    timeSpeed = 1;
    palette.background = `rgba(96, 204, 20, 0.8)`;
    if (arrowShooting) {
        arrowsAmt--;
        arrows.push(new Arrow(player.bowDrawPosition[0] + Math.cos(player.r) * 50, player.bowDrawPosition[1] + Math.sin(player.r) * 50, player.r, 60))
    }
    arrowShooting = false;
}

window.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

window.onload = setup;