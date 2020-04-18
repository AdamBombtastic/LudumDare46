var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
let state = {
    barRect : null,
    targetRect : null,
    line : null,
    lineX: config.width,
    lineSpeed : 14,
    graphics : null,
    keySpace : null,
    hasSwung : false,
    hitBall : false,
    swingTime : 500, //ms
}
function preload ()
{
}

function create ()
{
    state.barRect = new Phaser.Geom.Rectangle(30,config.height-100,config.width-60,30);
    state.graphics = this.add.graphics({
        fillStyle:{
            color: 0xFF0000,
        },
        lineStyle:{
            color:0xFFFFFF,
            width: 4,
        }
    });
    state.targetRect = new Phaser.Geom.Rectangle(100,config.height-100,60,30);
    state.line = new Phaser.Geom.Rectangle(state.lineX-2,0,2,config.height);

    state.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

}

function update ()
{
    let graphics = state.graphics;
    graphics.clear();
    graphics.fillStyle(0xFF0000,1);
    graphics.fillRectShape(state.barRect);
    graphics.fillStyle(state.hasSwung ? state.hitBall ? 0x00FF00 : 0x0000FF : 0xFFFF00,1);
    graphics.fillRectShape(state.targetRect);
    graphics.fillStyle(0xFFFFFF,1);
    graphics.fillRectShape(state.line);

    state.line.x -= state.lineSpeed;

    if (state.keySpace.isDown && !state.hasSwung) {
        state.hasSwung = true;
        state.hitBall = Phaser.Geom.Intersects.RectangleToRectangle(state.targetRect,state.line);
    }

    if (state.line.x < 0) {
        state.line.x = config.width;
        state.lineSpeed = parseInt(Math.random() * 12)+6;
        state.hasSwung = false;
        state.hitBall = false;
    }
}