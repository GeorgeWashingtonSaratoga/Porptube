// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-auth.js";
import { getDatabase, ref, set, onDisconnect, onValue, onChildAdded, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.17.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRqD6EkN71Pb5ZXBfPcNY43rNWOhpDr3E",
    authDomain: "gnawingonhumanbones.firebaseapp.com",
    projectId: "gnawingonhumanbones",
    storageBucket: "gnawingonhumanbones.appspot.com",
    messagingSenderId: "1086979129953",
    appId: "1:1086979129953:web:da2f3262b7f3f51beea020"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);

// get canvas & context
var c = document.getElementById("gamecanvas");
var ctx = c.getContext("2d");

var mouseX, mouseY;

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var theme = document.createElement('audio');
var cronch = document.getElementById('crunch');
var splat = document.getElementById('splat');
var succ = document.getElementById('succ');

var keys = [];
var score = 0;
var scoreval = '';
var babydeathheight = 432;
var luigi = false;

var image = document.getElementById("ad1");
    image.onclick = function(e) {
      window.location.href = "https://georgewashingtonsaratoga.github.io/sillysite/";
};

var image = document.getElementById("ad2");
image.onclick = function(e) {
  window.location.href = "www.pornhub.com";
};

var image = document.getElementById("ad3");
image.onclick = function(e) {
  window.location.href = "https://twitter.com/MinionRunHacks/status/1616460910910140419";
};

theme.setAttribute('src', 'theme.mp3');
theme.setAttribute('autoplay', 'autoplay');
theme.loop=true;
// cronch.setAttribute('src', 'crunch.mp3');

window.addEventListener("keydown", function(event) {
    keys[event.keyCode] = true;
}, false);
window.addEventListener("keyup", function(event) {
    keys[event.keyCode] = false;
}, false);

var spirtImg = document.getElementById("spirt");

// define vector class
class Vector {
    constructor(xComponent, yComponent) {
        this.x = xComponent;
        this.y = yComponent;
    }

    add(vector2) {
        this.x += vector2.x;
        this.y += vector2.y;
        return this;
    }

    clamp(minValue, maxValue) {
        if (this.x > maxValue) {
            this.x = maxValue;
        }
        if (this.y > maxValue) {
            this.y = maxValue;
        }
        if (this.x < minValue) {
            this.x = minValue;
        }
        if (this.y < minValue) {
            this.y = minValue;
        }
    }

    zero() {
        this.x = 0;
        this.y = 0;
    }
}

// define player class
class Player {
    constructor(positionVector, velocityVector) {
        this.pos = positionVector;
        this.vel = velocityVector;
    }
}

// init player at (64, 64) with velocity vector (0, 0)
var player = new Player(new Vector(64, 448), new Vector(0, 0));

// init bone at (-9001, -9001) with velocity vector (0, 0)
var bone = new Player(new Vector(-9001, -9001), new Vector(0, 0));

// init child at (-9001, -9001) with velocity vector (0, 0)
var child = new Player(new Vector(-9002, -9001), new Vector(0, 0));

// init acceleration vector as (2, 15)
var acceleration = new Vector(2, 15);

// init gravity
var gravity = 0.9;

// init onGround as true
var onGround = true;

// init maxVel as 5
var maxVel = 15;

// init friction
var friction = 0.9; // 0.4

// init error
var error = 0.1;

function dropBone() {
    bone.vel.zero();
    bone.pos.x = Math.random() * 448;
    bone.pos.y = -64;
}

function dropChild() {
    child.vel.zero();
    child.pos.x = Math.random() * 448;
    child.pos.y = -64;
}

var tChild = 0;

var winned = false;

var deadBabieX = [];

function update() {
    // change velocity by acceleration if correct key pressed
    
    // left-right motion
    if (keys[39] || keys[68]) {
        player.vel.x += acceleration.x;
    }
    if (keys[37] || keys[65]) {
        player.vel.x -= acceleration.x;
    }

    // jump
    if ((keys[38] || keys[87]) && onGround) {
        player.vel.y = -acceleration.y;
        onGround = false;
    }

    // gravity
    player.vel.y += gravity;
    bone.vel.y += (gravity / 2);
    child.vel.y += (gravity / 4);

    // friction
    if (player.vel.x > 0) {
        player.vel.x -= friction;
    }
    if (player.vel.x < 0) {
        player.vel.x += friction;
    }

    if (Math.abs(player.vel.x) < friction + error) {
        player.vel.x = 0;
    }

    // clamp velocity
    player.vel.clamp(-maxVel, maxVel);

    // change position by velocity
    player.pos.add(player.vel);
    bone.pos.add(bone.vel);
    child.pos.add(child.vel);

    // clamp position
    player.pos.clamp(0, 448);

    if (bone.pos.y >= 448) {
        dropBone();
    } 
    
    if (child.pos.y >= 448) {
        if (tChild < 40) {
            if (tChild == 0) {
                splat.play();
            }
            tChild++;
            death(tChild);
            child.pos.y = 9001; // over 9000
        } else {
            tChild = 0;
            babyDeathAnim = [0, 5];
            deadBabieX.push(child.pos.x);
            dropChild();
        }
    }

    if (player.pos.y == 448) {
        onGround = true;
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, bone.pos.x, bone.pos.y, 64, 64)) {
        dropBone();
        cronch.play();
        score += 100;
        if (score >= 6900) {
            winned = true;
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, child.pos.x, child.pos.y, 64, 64)) {
        dropChild();
        score -= 50;
    }

    friction = 0.9;
    for (var i = 0; i < deadBabieX.length; i++) {
        if (AABB(player.pos.x, player.pos.y, 64, 64, deadBabieX[i], babydeathheight, 64, 64)) {
            friction /= 9;
        }
    }
if(luigi) {
    for (var i = 0; i < deadBabieX.length; i++) {
        if (mouseX >= deadBabieX[i] && mouseX <= deadBabieX[i] + 64 && mouseY >= babydeathheight + 48 && mouseY <= babydeathheight + 64) {
            deadBabieX.splice(i, 1);
            succ.play();
        }
    }
}
}

function AABB(x1, y1, w1, h1, x2, y2, w2, h2) {
    if ((x1 >= x2 && x1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
        (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 >= y2 && y1 <= y2 + h2) ||
        (x1 >= x2 && x1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2) ||
        (x1 + w1 >= x2 && x1 + w1 <= x2 + w2 && y1 + h1 >= y2 && y1 + h1 <= y2 + h2)) {
            return true;
    } else {
        return false;
    }
}

var babyDeathAnim = [0, 5];

function death(t) {
    babyDeathAnim = [child.pos.x, Math.floor(t / 10)];
}

function drawDeath() {
    switch (babyDeathAnim[1]) {
        case 0: {
            ctx.drawImage(spirtImg, 20, 360, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 1: {
            ctx.drawImage(spirtImg, 20, 20, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 2: {
            ctx.drawImage(spirtImg, 360, 20, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 3: {
            ctx.drawImage(spirtImg, 360, 360, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 4: {
            ctx.drawImage(spirtImg, 360, 700, 320, 320, babyDeathAnim[0], babydeathheight, 64, 64);
            break;
        }
        case 5: {
            break;
        }
        default: {
            break;
        }
    }
}

function draw() {
    // draw background
    ctx.drawImage(spirtImg, 700, 20, 650, 650, 0, 0, 512, 512);

    // draw bone
    ctx.drawImage(spirtImg, 1040, 700, 319, 319, bone.pos.x, bone.pos.y, 64, 64);

    // draw child
    ctx.drawImage(spirtImg, 20, 700, 319, 319, child.pos.x, child.pos.y, 64, 64);

    // dead baby anim
    drawDeath();

    // draw dead babies
    for (var i = 0; i < deadBabieX.length; i++) {
        ctx.drawImage(spirtImg, 360, 700, 320, 320, deadBabieX[i], babydeathheight, 64, 64);
    }

    // draw player
    if (luigi) {
        ctx.drawImage(spirtImg, 20, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
    } else { // cring
        ctx.drawImage(spirtImg, 700, 700, 320, 320, player.pos.x, player.pos.y, 64, 64);
    }
    
    // draw score
    drawScore();
}

function drawScore() {
    ctx.beginPath();
    ctx.font = "24px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function main() { 
    theme.play(); 
    update();
    draw();
    // request aim frame
    if (!winned) {
        window.requestAnimationFrame(main);
    } else {
        luigi = true;
        window.requestAnimationFrame(win);
    }
    console.log(luigi);
}

function win() {
    // draw background
    ctx.drawImage(spirtImg, 700, 1040, 650, 650, 0, 0, 512, 512);

    if (keys[32]) {
        luigi = true;
        score = 0;
        scoreval = '';
        deadBabieX = [];
        babyDeathAnim = [0, 5];
        winned = false;
        tChild = 0;
        friction = 0.9;
        onGround = true;
        player = new Player(new Vector(64, 448), new Vector(0, 0));
        bone = new Player(new Vector(-9001, -9001), new Vector(0, 0));
        child = new Player(new Vector(-9002, -9001), new Vector(0, 0));
        acceleration = new Vector(2, 15);
        window.requestAnimationFrame(titty);
        alert(message = "You can now play as Luigi");
        document.body.style.cursor = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAD2UExURb0AAAAAABQAAGVlZdnZ2RoaGsttbcvLy70AAL0AAAAAAAAAAL0AAL0AAL0AAL0AAAAAAAAAAAAAAAAAAL0AAL0AAL0AAAAAAAAAAAAAAAAAAKkAABkAAAAAAAAAALoAAGgAAAAAAAAAAAAAANgAAL0AAMoAAMwAAAAAAP8AAL0AAL0AAL0AABoaGhoaGh0dHXR0dOjo6NnZ2b0BAb6+vr+/v8LCwtbW1tnZ2dnZ2b0AANnY2Nra2tvb29nZ2dnZ2dnZ2b0AAL0AANnZ2dnZ2dnZ2dnZ2dnZ2dnZ2b0AAL4AAKcAABYAAKYAAAAAANra2tnZ2f///1PVeSUAAABJdFJOUwAAAAAAAAAAHODgHAQZOeTkORkExub7/ebGG/vk4x/kNzfiHhviHRkdAh0fGx7i5jkZBAQd4f3mxhnhBDnk5jkcHhob++ThH+OiMhG4AAAAAWJLR0RRlGl8KgAAAAd0SU1FB+cCAg4qJTmtLxQAAAC1SURBVBjTVczZAoFAGEDhHyPCVKisWUr2fV8jskxC7/80TN3kXH4XBwAgzhL76SSSIRpACnM8BSGdyXqARUkm9svJ5QtFCnFOIoTYpbLwVioUWF7+AanW6nlVo0D82EZRVYKgN5NKAGRJbLWDwHO4owWB7UL4D/QehDRFbUcQAv/Qh+hgOBpPph5IHJ4xsfliuVpvEGy3uoiB2W32h49rHE9gmuY5BeiyNizXta438EP3h+v3BTe6JdaFCh7FAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAyLTAyVDE0OjQyOjM3KzAwOjAwZEL5EgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMi0wMlQxNDo0MjozNyswMDowMBUfQa4AAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDItMDJUMTQ6NDI6MzcrMDA6MDBCCmBxAAAAAElFTkSuQmCC), auto";
    } else {
        window.requestAnimationFrame(win);
    }
}

var allPlayersRef;

var playerID;
var playerRef;

var gamePlayers = {};
var gamePlayer;

function multiInit() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // logged in
            playerID = user.uid;

            playerRef = ref(database, `players/${playerID}`);

            set(playerRef, {
                id: playerID,
                x: 20,
                y: 20
            });

            onDisconnect(playerRef).remove();

            init2electricboogaloo();
        } else {
            // logged out?
        }
    });

    signInAnonymously(auth).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
    })

    window.requestAnimationFrame(multi);
}

function init2electricboogaloo() {
    allPlayersRef = ref(database, `players`);

    onValue(allPlayersRef, (snapshot) => {
        for (var key in (snapshot.val() || {})) {
            gamePlayers[key].pos.x = snapshot.val()[key].x;
            gamePlayers[key].pos.y = snapshot.val()[key].y;
        }
    });

    onChildAdded(allPlayersRef, (snapshot) => {
        var addedPlayer = snapshot.val();

        if (addedPlayer.id == playerID) {
            gamePlayer = new Player(new Vector(addedPlayer.x, addedPlayer.y), new Vector(0, 0));
            gamePlayers[addedPlayer.id] = gamePlayer;
        } else {
            var p = new Player(new Vector(addedPlayer.x, addedPlayer.y), new Vector(0, 0));
            gamePlayers[addedPlayer.id] = p;
        }
    });

    onChildRemoved(allPlayersRef, (snapshot) => {
        delete(gamePlayers[snapshot.val().id]);
    });
}

function multi() {
    theme.play();
    ferment();
    aerobic();
    console.log(gamePlayers);
    window.requestAnimationFrame(multi);
}

function ferment() {
    // change velocity by acceleration if correct key pressed
    
    // left-right motion
    if (keys[39] || keys[68]) {
        player.vel.x += acceleration.x;
    }
    if (keys[37] || keys[65]) {
        player.vel.x -= acceleration.x;
    }

    // jump
    if ((keys[38] || keys[87]) && onGround) {
        player.vel.y = -acceleration.y;
        onGround = false;
    }

    // gravity
    player.vel.y += gravity;
    bone.vel.y += (gravity / 2);
    child.vel.y += (gravity / 4);

    // friction
    if (player.vel.x > 0) {
        player.vel.x -= friction;
    }
    if (player.vel.x < 0) {
        player.vel.x += friction;
    }

    if (Math.abs(player.vel.x) < friction + error) {
        player.vel.x = 0;
    }

    // clamp velocity
    player.vel.clamp(-maxVel, maxVel);

    // change position by velocity
    player.pos.add(player.vel);
    bone.pos.add(bone.vel);
    child.pos.add(child.vel);

    // clamp position
    player.pos.clamp(0, 448);

    if (bone.pos.y >= 448) {
        dropBone();
    } 
    
    if (child.pos.y >= 448) {
        if (tChild < 40) {
            if (tChild == 0) {
                splat.play();
            }
            tChild++;
            death(tChild);
            child.pos.y = 9001; // over 9000
        } else {
            tChild = 0;
            babyDeathAnim = [0, 5];
            deadBabieX.push(child.pos.x);
            dropChild();
        }
    }

    if (player.pos.y == 448) {
        onGround = true;
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, bone.pos.x, bone.pos.y, 64, 64)) {
        dropBone();
        cronch.play();
        score += 100;
        if (score >= 6900) {
            winned = true;
        }
    }

    if (AABB(player.pos.x, player.pos.y, 64, 64, child.pos.x, child.pos.y, 64, 64)) {
        dropChild();
        score -= 50;
    }

    friction = 0.9;
    for (var i = 0; i < deadBabieX.length; i++) {
        if (AABB(player.pos.x, player.pos.y, 64, 64, deadBabieX[i], babydeathheight, 64, 64)) {
            friction /= 9;
        }
    }
if(luigi) {
    for (var i = 0; i < deadBabieX.length; i++) {
        if (mouseX >= deadBabieX[i] && mouseX <= deadBabieX[i] + 64 && mouseY >= babydeathheight + 48 && mouseY <= babydeathheight + 64) {
            deadBabieX.splice(i, 1);
            succ.play();
        }
    }
}

gamePlayer.pos.x = player.pos.x;
gamePlayer.pos.y = player.pos.y;
set(playerRef, {
        id: playerID,
        x: gamePlayer.pos.x,
        y: gamePlayer.pos.y
    });

}

function aerobic() {
    // draw background
    ctx.drawImage(spirtImg, 700, 20, 650, 650, 0, 0, 512, 512);

    // draw bone
    ctx.drawImage(spirtImg, 1040, 700, 319, 319, bone.pos.x, bone.pos.y, 64, 64);

    // draw child
    ctx.drawImage(spirtImg, 20, 700, 319, 319, child.pos.x, child.pos.y, 64, 64);

    // dead baby anim
    drawDeath();

    // draw dead babies
    for (var i = 0; i < deadBabieX.length; i++) {
        ctx.drawImage(spirtImg, 360, 700, 320, 320, deadBabieX[i], babydeathheight, 64, 64);
    }

    // draw player
    if (luigi) {
        ctx.drawImage(spirtImg, 20, 1720, 320, 320, player.pos.x, player.pos.y, 64, 64);
    } else { // cring
        ctx.drawImage(spirtImg, 700, 700, 320, 320, player.pos.x, player.pos.y, 64, 64);
    }

    for (var key in gamePlayers) {
        console.log(key);
        console.log(playerID);
        if (key != playerID) {
            ctx.drawImage(spirtImg, 360, 1720, 320, 320, gamePlayers[key].pos.x, gamePlayers[key].pos.y, 64, 64);
        }
    }
    
    // draw score
    drawScore();
}

function titty() {
    // draw background
    ctx.drawImage(spirtImg, 20, 1040, 650, 650, 0, 0, 512, 512);

    if (keys[32]) {
        window.requestAnimationFrame(main);
    } else if (keys[77]) {
        multiInit();
    } else {
        window.requestAnimationFrame(titty);
    }
}

// request anim frame
window.requestAnimationFrame(titty);

