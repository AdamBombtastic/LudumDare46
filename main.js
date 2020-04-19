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
        hasMissed: false,
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
        hasMissed : false,
        swingTime : 500, //ms
        homeRuns : 0,
        playerSprite : null,
        pitcherSprite: null,
        swingAnim : null,
        ballAnims : {'fast': null, 'normal' : null, 'slow':null, 'hit':null},
        ballSprite : null,
        ballType : null,
        needsRespawn : true,
        impactAnim : null,
        strikeText : null,
        strikeCount : 0,

    },
    createPitch(type,game) {
        console.log("creating pitch:",type);
        let state = mainState.state;
        state.ballType = type;
        if (state.ballSprite != null) {
            state.ballSprite.destroy();
        }
        let bball = game.add.sprite(config.width,config.height-200,'baseball').setScale(2);
        bball.anims.load('bball_flash');
        switch (type) {
            case "fast":
                bball.anims.load('bball_fast');
                bball.anims.play('bball_fast');
                state.lineSpeed = 22;
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
        state.hasMissed = false;
    },
    preload : function() {
        this.load.spritesheet('player','Sprites/Batter.png',{
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet('baseball','Sprites/Baseball.png',{
            frameWidth: 30,
            frameHeight: 30,
        });
        this.load.spritesheet('impact','Sprites/Impact.png',{
            frameWidth: 28,
            frameHeight: 29,
        });
        this.load.spritesheet('pitcher','Sprites/Pitcher.png',{
            frameWidth:42,
            frameHeight:47,
        });
        this.load.spritesheet('coach','Sprites/Coach.png',{
            frameWidth: 51,
            frameHeight: 49,
        });
        this.load.image('fg_fence',"Sprites/Dialog_foreground.png");
    },
    create : function() {
        let state = mainState.state;
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#D97031");

        //background & coach stuff
        this.anims.create({
            key: 'coach_idle',
            frames: [{key:'coach',frame:0},{key:'coach',frame:1},{key:'coach',frame:1}],
            frameRate: 2,
            yoyo: true,
            repeat: -1,
        });
        this.anims.create({
            key: 'coach_talk',
            frames: [{key:'coach',frame:2},{key:'coach',frame:3}],
            frameRate: 8,
            yoyo: false,
            repeat: -1,
        });
        this.anims.create({
            key: 'coach_strike',
            frames: [{key:'coach',frame:4},{key:'coach',frame:5},
                     {key:'coach',frame:6},{key:'coach',frame:7}],
            frameRate: 8,
            yoyo: false,
            repeat: -1,
        });
        this.anims.create({
            key: 'coach_whammy',
            frames: [{key:'coach',frame:8},{key:'coach',frame:9},
                     {key:'coach',frame:10},{key:'coach',frame:11}],
            frameRate: 8,
            yoyo: false,
            repeat: -1,
        });
        state.coach = this.add.sprite(280,config.height-185,'coach').setScale(2);
        state.fg = this.add.sprite(158,284,'fg_fence').setScale(3);

        state.coach.anims.load('coach_idle');
        state.coach.anims.load('coach_strike');
        state.coach.anims.load('coach_whammy');
        state.coach.anims.play('coach_idle');
        

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
        state.targetRect = new Phaser.Geom.Rectangle(65,config.height-100,80,30);
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
        state.ballAnims.flash = this.anims.create({
            key: 'bball_flash',
            frames: [{key:'baseball',frame:12},{key:'baseball',frame:13}],
            frameRate: 18,
            yoyo: false,
            repeat: -1,
        });
        let pitchFrames = this.anims.generateFrameNumbers('pitcher');
        this.anims.create({
            key: 'pitcher_pitch_windup',
            frames: [
                {key:'pitcher',frame:0},
                {key:'pitcher',frame:1},
                {key:'pitcher',frame:2},
            ],
            frameRate: 4,
            yoyo: false,
            repeat: 0,
        });
        this.anims.create({
            key: 'pitcher_pitch_tell_normal',
            frames: [
                {key:'pitcher',frame:3},
                {key:'pitcher',frame:4},
                {key:'pitcher',frame:3},
                {key:'pitcher',frame:2},
            ],
            frameRate: 2,
            yoyo: false,
            repeat: 0,
        });
        this.anims.create({
            key: 'pitcher_pitch_tell_fast',
            frames: [
                {key:'pitcher',frame:4},
                {key:'pitcher',frame:2},
                {key:'pitcher',frame:3},
                {key:'pitcher',frame:4},
            ],
            frameRate: 2,
            yoyo: false,
            repeat: 0,
        });
        this.anims.create({
            key: 'pitcher_pitch_tell_slow',
            frames: [
                {key:'pitcher',frame:2},
                {key:'pitcher',frame:2},
                {key:'pitcher',frame:2},
                {key:'pitcher',frame:3},
            ],
            frameRate: 2,
            yoyo: false,
            repeat: 0,
        });
        this.anims.create({
           key: 'pitcher_pitch_normal',
           frames: pitchFrames.slice(5,pitchFrames.length-1),
           frameRate:6,
           yoyo: false,
           repeat: 0, 
        });
        this.anims.create({
            key: 'pitcher_pitch_end',
            frames: [pitchFrames[pitchFrames.length-1]],
            frameRate:12,
            yoyo: false,
            repeat: 0,
        });
        this.anims.create({
            key: 'pitcher_idle',
            frames: [{key:'pitcher',frame:0}],
            frameRate: 18,
            yoyo: false,
            repeat: -1,
        });
     
        
        //pitcher
        state.pitcherSprite = this.add.sprite(config.width-20,config.height-185,'pitcher').setScale(2);

        state.pitcherSprite.anims.load('pitcher_idle');
        state.pitcherSprite.anims.load('pitcher_pitch_normal');
        state.pitcherSprite.anims.load("pitcher_pitch_windup");
        state.pitcherSprite.anims.load("pitcher_pitch_tell_normal");
        state.pitcherSprite.anims.load("pitcher_pitch_tell_slow");
        state.pitcherSprite.anims.load("pitcher_pitch_tell_fast");
        state.pitcherSprite.anims.load('pitcher_pitch_end');
        state.pitcherSprite.anims.play('pitcher_idle');
        const gameInstance = this;
        state.pitcherSprite.on("animationcomplete",function(animation,frame){
            console.log(animation.key," ending");
            if (animation.key=='pitcher_pitch_windup') {
                state.ballType = ["normal","fast","slow"][parseInt(Math.random()*3)];
                state.pitcherSprite.play("pitcher_pitch_tell_"+state.ballType);
            } 
            else if (animation.key.indexOf("pitcher_pitch_tell_") != -1) {
                state.pitcherSprite.play("pitcher_pitch_normal");
            }
            else if (animation.key=='pitcher_pitch_normal') {
                //console.log(animation.key,frame.index);
                state.line.x=config.width;
                mainState.createPitch(state.ballType,gameInstance);
                state.needsRespawn = false;
                state.pitcherSprite.play("pitcher_pitch_end");
            }
            else if (animation.key == 'pitcher_pitch_end') {
                //console.log(animation.key,frame.index);
                state.pitcherSprite.play("pitcher_idle");
                state.coach.anims.play('coach_idle');
            }
        });

        state.playerSprite.anims.load('swing');
        state.playerSprite.anims.load('idle');
        state.playerSprite.on("animationcomplete",function(animation,frame) {
            if (animation.key == 'swing') {
                state.playerSprite.anims.play('idle');
            }
        },this);
        state.ballSprite = this.add.sprite(config.width,config.height-200,'baseball').setScale(2);
        //console.log("pitching from init");
        state.pitcherSprite.anims.play('pitcher_pitch_windup');
    },
    update : function(time,delta) {
        

        //console.log("delta_time:",delta);
        let state = mainState.state;
        let graphics = state.graphics;
        graphics.clear();
        
        /*graphics.fillStyle(0xFF0000,1);
        graphics.fillRectShape(state.barRect);
        graphics.fillStyle(state.hasSwung ? state.hitBall ? 0x00FF00 : 0x0000FF : 0xFFFF00,1);
        graphics.fillRectShape(state.targetRect);
        graphics.fillStyle(0xFFFFFF,1);
        graphics.fillRectShape(state.line);*/



        //if the pitcher isn't pitching
        if (!state.needsRespawn) {
            //Let's check if we should make the ball flash
            if (Phaser.Geom.Intersects.RectangleToRectangle(state.targetRect,state.line)
            && (!state.hasSwung && !state.hasMissed)) {

                if (state.ballSprite.anims.currentAnim.key != 'bball_flash') {
                    state.ballSprite.anims.play('bball_flash');
                }
            } else {
                if (state.ballSprite.anims.currentAnim.key != 'bball_'+state.ballType) {
                    state.ballSprite.anims.play("bball_"+state.ballType);
                }
            }
            //check if the player has swung
            if (state.keySpace.isDown && !state.hasSwung) {
                state.playerSprite.anims.play('swing');
                state.hasSwung = true;
                state.hitBall = Phaser.Geom.Intersects.RectangleToRectangle(state.targetRect,state.line);
                //if I hit
                if (state.hitBall) {
                    state.homeRuns += 1;
                    state.ballSprite.anims.load("bball_hit");
                    state.ballSprite.anims.play("bball_hit");
                    state.coach.anims.play('coach_whammy');
                    state.strikeText.text="WHAMMY!!";
                    state.strikeText.updateText();
                    let impact = this.add.sprite(state.ballSprite.x,state.ballSprite.y,'impact').setScale(2);
                    impact.anims.load("impact");
                    impact.anims.play("impact");
                    impact.on("animationcomplete",function(animation,frame) {
                        if (animation.key == 'impact') {
                            impact.destroy();
                        }
                    },this);
                    this.time.delayedCall(1000, function() {
                        state.strikeText.text="";
                        state.strikeText.updateText();
                        state.strikeCount = 0;
                        state.needsRespawn = true;
                        state.pitcherSprite.play("pitcher_pitch_windup");
                    }, [], this);
                    state.hasMissed = false;
                } 
            }
            //if the ball has been hit
            if (state.hitBall) {
            //I've hit the ball and it hasn't respawned yet.
            /*let impact = this.add.sprite(state.ballSprite.x,state.ballSprite.y,'baseball').setScale(2);
            impact.anims.load("bball_flash");
            impact.anims.play("bball_flash");
            impact.on("animationcomplete",function(animation,frame) {
                //console.log("animation-complete",animation);
                if (animation.key == 'bball_flash') {
                    impact.destroy();
                }
            },this);*/

            //have it fly off screen
            state.line.x+=25;
            state.ballSprite.x = state.line.x;
            state.ballSprite.y -= 15;
            } else if (state.line.x < 0 && !state.hasMissed) {
                state.hasMissed = true;
                state.strikeText.text="STRIKE!!";
                state.coach.anims.play('coach_strike');
                state.strikeText.updateText();
                state.strikeCount +=1;
                this.time.delayedCall(750, function() {
                    state.strikeText.text="";
                    state.strikeText.updateText();
                    state.line.x = config.width;
                    if (state.strikeCount >= 2000) {
                        game.scene.stop("mainState")
                        game.scene.start('intro');
                    }
                    state.needsRespawn = true;
                    state.pitcherSprite.play("pitcher_pitch_windup");
                }, [], this);
            } else {
                state.line.x -= state.lineSpeed;
                state.ballSprite.x = state.line.x;
            }    
        } 
        mainState.scoreText.x = config.width-(mainState.scoreText.width+30);
        mainState.scoreText.y = 30;
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