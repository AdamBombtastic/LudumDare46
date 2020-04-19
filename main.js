//region Config
var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
};
//endregion

//region "Intro Story State"
let teamName = "<INSERT_NAME_HERE>";
let badTeamName = "Back City Bad Boyz"
let coachName = "<COACH_NAME>"
let textArray = [
    `It is the worst day of your middle school career . . .`,
    `It's bottom of the 9th and your baseball team, ${teamName}, 
     is in the championship 
     game against the ${badTeamName}!`,
    `${coachName} has been dreaming of this moment 
     his entire life, but the dream is almost dead. 
     You're down 20 points.`,
    `Keep the dream alive and hit some home runs!!!`,
];
let introState = {
    selectedIndex : 0,
    textIndex : 0,
    introText : null,
    textTicker : 0,
    textTickerTimeMs: 35,
    introState : null,
    hasProgressed : false,

    toMain() {
        game.scene.stop("intro")
        game.scene.start('mainState');
    },
    preload : function() {},
    create : function() {
        introState.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        introState.introText = this.add.text(0, 0, '', { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });
    },
    update : function(time,delta) {
        introState.textTicker += delta;
        if (introState.textTickerTimeMs < introState.textTicker) {
            let textSelection = textArray[introState.selectedIndex].substring(0,introState.textIndex);
            introState.introText.text = textSelection;
            introState.introText.updateText();
            introState.textIndex++;
            introState.textTicker = 0;
            if (introState.textIndex > textArray[introState.selectedIndex].length) {
                introState.textIndex = 0;
                introState.selectedIndex += 1;
                if (introState.selectedIndex >= textArray.length) {
                    introState.selectedIndex = textArray.length-1;
                    introState.toMain();
                }
            }
            introState.introText.x = 320 - (introState.introText.width/2);
            introState.introText.y = 240 - (introState.introText.height/2);
        }
        if (introState.keySpace.isDown && !introState.hasProgressed) {
            introState.hasProgressed = true;
            introState.toMain();
        }
    }
}
//endregion

//region "Main State"
function createMainState() {
    return {
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
        homeRuns : 0,
        playerSprite : null,
        swingAnim : null,
        ballAnims : {'fast': null, 'normal' : null, 'slow':null, 'hit':null},
        ballSprite : null,
        needsRespawn : false,
        impactAnim : null,
        strikeText : null,
        strikeCount : 0,

    }
}
let mainState = {
    state : {
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
        homeRuns : 0,
        playerSprite : null,
        swingAnim : null,
        ballAnims : {'fast': null, 'normal' : null, 'slow':null, 'hit':null},
        ballSprite : null,
        needsRespawn : false,
        impactAnim : null,
        strikeText : null,
        strikeCount : 0,

    },
    createPitch(type,game) {
        //console.log(game);
        let state = mainState.state;
        if (state.ballSprite != null) {
            state.ballSprite.destroy();
        }
        let bball = game.add.sprite(config.width,config.height-200,'baseball').setScale(2);
        switch (type) {
            case "fast":
                bball.anims.load('bball_fast');
                bball.anims.play('bball_fast');
                state.lineSpeed = 20;
                break;
            case "slow":
                bball.anims.load('bball_slow');
                bball.anims.play('bball_slow')
                state.lineSpeed = 10;
                break;
            default:
                bball.anims.load('bball_normal');
                bball.anims.play('bball_normal');
                state.lineSpeed = 15;
        }
        state.ballSprite = bball;
        state.hasSwung = false;
        state.hitBall = false;
    },
    preload : function() {
        this.load.spritesheet('player','Sprites/Batter.png',{
            frameWidth: 62,
            frameHeight: 62,
        });

        this.load.spritesheet('baseball','Sprites/Baseball.png',{
            frameWidth: 30,
            frameHeight: 30,
        });
        this.load.spritesheet('impact','Sprites/Impact.png',{
            frameWidth: 28,
            frameHeight: 29,
        });
    },
    create : function() {
        let state = mainState.state;
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#444");
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
        state.targetRect = new Phaser.Geom.Rectangle(70,config.height-100,50,30);
        state.line = new Phaser.Geom.Rectangle(state.lineX-2,0,2,config.height);
    
        state.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        mainState.scoreText = this.add.text(0, 0, ``, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });
        state.strikeText = this.add.text(30, 150, ``, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontSize: 44 });

        //player stuff
        state.playerSprite = this.add.sprite(80,config.height-200,'player').setScale(2);
        state.impactAnim = this.anims.create({
            key: 'impact',
            frames: this.anims.generateFrameNumbers('impact'),
            frameRate: 12,
            yoyo: false,
            repeat: 0,
        });
        state.swingAnim = this.anims.create({
            key: 'swing',
            frames: this.anims.generateFrameNumbers('player'),
            frameRate: 18,
            yoyo: false,
            repeat: 0 
        });
        state.idleAnim = this.anims.create({
            key: 'idle',
            frames: [{key:'player',frame:0}],
            frameRate: 1,
            yoyo: false,
            repeat: -1,
        });
        state.ballAnims.fast = this.anims.create({
            key: 'bball_fast',
            frames: [{key:'baseball',frame:8},{key:'baseball',frame:9},
                     {key:'baseball',frame:10},{key:'baseball',frame: 11}],
            frameRate: 12,
            yoyo: false,
            repeat: -1,
        });
        state.ballAnims.slow = this.anims.create({
            key: 'bball_slow',
            frames: [{key:'baseball',frame:4},{key:'baseball',frame:5},
                     {key:'baseball',frame:6},{key:'baseball',frame: 7}],
            frameRate: 12,
            yoyo: false,
            repeat: -1,
        });
        state.ballAnims.fast = this.anims.create({
            key: 'bball_normal',
            frames: [{key:'baseball',frame:0},{key:'baseball',frame:1},
                     {key:'baseball',frame:2},{key:'baseball',frame:3}],
            frameRate: 12,
            yoyo: false,
            repeat: -1,
        });
        state.ballAnims.hit = this.anims.create({
            key: 'bball_hit',
            frames: [{key:'baseball',frame:13},/*{key:'baseball',frame:13}*/],
            frameRate: 18,
            yoyo: false,
            repeat: -1,
        });

        state.playerSprite.anims.load('swing');
        state.playerSprite.anims.load('idle');
        state.playerSprite.on("animationcomplete",function(animation,frame) {
            console.log("animation-complete",animation);
            if (animation.key == 'swing') {
                state.playerSprite.anims.play('idle');
            }
        },this);
        console.log('Swing Anim Frames:',this.anims.generateFrameNumbers('player'));
        mainState.createPitch('normal',this);
    },
    update : function() {
        let state = mainState.state;
        let graphics = state.graphics;
        graphics.clear();
        graphics.fillStyle(0xFF0000,1);
        graphics.fillRectShape(state.barRect);
        graphics.fillStyle(state.hasSwung ? state.hitBall ? 0x00FF00 : 0x0000FF : 0xFFFF00,1);
        graphics.fillRectShape(state.targetRect);
        graphics.fillStyle(0xFFFFFF,1);
        graphics.fillRectShape(state.line);

        if (state.keySpace.isDown && !state.hasSwung) {
            state.playerSprite.anims.play('swing');
            state.hasSwung = true;
            state.hitBall = Phaser.Geom.Intersects.RectangleToRectangle(state.targetRect,state.line);
            if (state.hitBall) {
                state.homeRuns += 1;
            }
        }

        if (state.line.x < 0 && !state.needsRespawn) {
            state.needsRespawn = true;
            state.strikeText.text="STRIKE!!";
            state.strikeText.updateText();
            state.strikeCount +=1;
            this.time.delayedCall(750, function() {
                console.log("missed the ball -- creating pitch");
                state.strikeText.text="";
                state.strikeText.updateText();
                state.line.x = config.width;
                if (state.strikeCount >= 3) {
                    game.scene.stop("mainState")
                    game.scene.start('intro');
                    //mainState.state = createMainState();
                }
                mainState.createPitch(['normal','fast','slow'][parseInt(Math.random()*3)],this);
                state.needsRespawn = false;
            }, [], this);
        } else if (!state.hitBall) {
            state.line.x -= state.lineSpeed;
            state.ballSprite.x = state.line.x;
        } else {
            state.ballSprite.anims.load("bball_hit");
            state.ballSprite.anims.play("bball_hit");
            
            
            /* Uncomment for fun
            let impact = this.add.sprite(state.ballSprite.x,state.ballSprite.y,'impact').setScale(2);
            impact.anims.load("impact");
            impact.anims.play("impact");
            impact.on("animationcomplete",function(animation,frame) {
                //console.log("animation-complete",animation);
                if (animation.key == 'impact') {
                    impact.destroy();
                }
            },this);
            */

            state.line.x+=25;
            state.ballSprite.x = state.line.x;
            state.ballSprite.y -= 15;
            if (!state.needsRespawn) {
                state.needsRespawn = true;
                let impact = this.add.sprite(state.ballSprite.x,state.ballSprite.y,'impact').setScale(2);
                impact.anims.load("impact");
                impact.anims.play("impact");
                state.strikeText.text="WHAMMY!!";
                state.strikeText.updateText();
                impact.on("animationcomplete",function(animation,frame) {
                    //console.log("animation-complete",animation);
                    if (animation.key == 'impact') {
                        impact.destroy();
                    }
                },this);
                this.time.delayedCall(1000, function() {
                    console.log("hit the ball created pitch");
                    state.strikeText.text="";
                    state.strikeText.updateText();
                    state.strikeCount = 0;
                    mainState.createPitch(['normal','fast','slow'][parseInt(Math.random()*3)],this);
                    state.needsRespawn = false;
                }, [], this);
            }
        }

        mainState.scoreText.x = config.width-(mainState.scoreText.width+30);
        mainState.scoreText.y = 60;
        mainState.scoreText.text = `${state.homeRuns} whammies!`;
        mainState.scoreText.updateText();
    }
}
//endregion



//region Entrypoint
var game = new Phaser.Game(config);
game.scene.add('intro',introState);
game.scene.add('mainState',mainState);
game.scene.start('intro');
//endregion