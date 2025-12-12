const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

let player = { x:400, y:250, speed:3 };

document.addEventListener("keydown", e=>{
    if(e.key==="w") player.y -= player.speed;
    if(e.key==="s") player.y += player.speed;
    if(e.key==="a") player.x -= player.speed;
    if(e.key==="d") player.x += player.speed;
});

function loop(){
    ctx.clearRect(0,0,800,500);
    ctx.fillStyle="cyan";
    ctx.fillRect(player.x-10, player.y-10, 20,20);
    requestAnimationFrame(loop);
}
loop();