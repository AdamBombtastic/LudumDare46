const coachTextMap = {
    onStrike: [
        `I have cataracts, and I saw that one coming!`,
        `This guy. Talk about a belly itcher, am I right?`,
        `C'MON!`,
        `This is gonna flare up my hemorrhoids`,
        `I need a drink.`,
        `Oof.`,
        'Sweet baby jesus!!!',
        `Watch the pitcher! He's giving it away with his head movements.`
    ],
    onHomeRun: [
        `THAT'S IT! Swing what your momma gave you! ...The bat, I mean!`,
        `BEEOOWWWWW BEOWBEOWBEOWBEOWBEOWWWWWWW!! ....sorry.`,
        `WHAMMY!`,
        `Keep my dream alive!!`,
        `That was sweeter than relish on a hotdog`,
        `TAKE THAT BAD BOYZ!`,
        `FAR OUT!!`,
        `TAKE NOTES YA BUMS`,
        `Someone get the marshmallows, this kid's on FIRE!`,
        `This kid's harder than my kidneystone!`,
    ],
    onPitch: [
        `SWING!`,
        `I've got some good memories under these bleachers. . .Takes me back.`,
        `My nickname in middle school was "Shortstop..." or was it just "Short?"`,
        `Oh gosh, I think my hemorrhoids are flaring up again.`,
        `This can't be good for my blood pressure.`,
        `Maybe I should give Lisa a call . . .`,
        `Watch the pitcher! He's giving it away with his head movements.`
    ],
}

function GetCoachText(score,strikes,event) {
    let text = "";
    switch (event) {
        case 'pitch': {
            if (strikes >= 2) {
                text = `I can't watch this.`;
                break;
            }
            if (score == 19) {
                text = `Get ready kid, he's bringing in the HEATER.`
                break;
            }
            text = coachTextMap.onPitch[parseInt(Math.random()*coachTextMap.onPitch.length-1)];
            break;
        }
        case `strike`:{
            text = coachTextMap.onStrike[parseInt(Math.random()*coachTextMap.onStrike.length-1)];
            break;
        }
        case `homeRun`:{
            if (score >= 19) {
                text = `My Dream!!!! I can't believe it!`;
                break;
            }
            text = coachTextMap.onHomeRun[parseInt(Math.random()*coachTextMap.onHomeRun.length-1)];
            break;
        }
    }
    return text;
}