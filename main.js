//region Config
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
};
//endregion

//region "Intro Story State"
let teamName = "<INSERT_NAME_HER>";
let badTeamName = "Back City Bad Boyz"
let coachName = "<COACH_NAME>"
let textArray = [
    `It is the worst day of your middle school career . . .`,
    `It's bottom of the 9th and your baseball team, ${teamName}, is in the championship 
     game against the ${badTeamName}!`,
    `${coachName} has been dreaming of this moment his entire life, 
     but the dream is almost dead. You're down 20 points.`,
    `Keep the dream alive and hit some home runs!!!`,
]
let introState = {
    selectedIndex : 0,
    textIndex : 0,
    introText : null,
    textTicker : 0,
    textTickerTimeMs: 35,
    introState : null,
    hasProgressed : false,

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
                    game.scene.stop("intro")
                    game.scene.start('mainState');
                }
            }
            introState.introText.x = 400 - (introState.introText.width/2);
            introState.introText.y = 300 - (introState.introText.height/2);
        }
        if (introState.keySpace.isDown && !introState.hasProgressed) {
            introState.hasProgressed = true;
            game.scene.stop("intro")
            game.scene.start('mainState');
        }
    }
}
//endregion

//region "Main State"
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
    },
    preload : function() {

    },
    create : function() {
        let state = mainState.state;
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
        mainState.scoreText = this.add.text(0, 0, ``, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });


        
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

        state.line.x -= state.lineSpeed;

        if (state.keySpace.isDown && !state.hasSwung) {
            state.hasSwung = true;
            state.hitBall = Phaser.Geom.Intersects.RectangleToRectangle(state.targetRect,state.line);
            if (state.hitBall) {
                state.homeRuns += 1;
            }
        }

        if (state.line.x < 0) {
            state.line.x = config.width;
            state.lineSpeed = parseInt(Math.random() * 12)+6;
            state.hasSwung = false;
            state.hitBall = false;
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