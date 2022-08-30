function boxNumbers () {
    let boxes = document.querySelectorAll('.box');
    boxes.forEach((box, i) => {
        //1st row or (20-11, 40-31, 60-51, 80-71)
        if (String(i).length === 1 || Number((String(i)[0])) % 2 === 0){
        box.innerHTML = 100-i;

        //(1st number = 9-1st digit of i, 2nd number = 2nd digit of i) + 1
        } else{
            box.innerHTML = String(Number(`${9-Number(String(i)[0])}${String(i)[1]}`) + 1);
        }
    }) 
}
boxNumbers();

const startBtn = document.querySelector('#start-btn');
const dice = document.querySelector('.dice');
const turnDisplay = document.getElementById('p-turn');
const popup = document.getElementById('popup');
document.getElementById('red').style.marginLeft = '0vmin';
document.getElementById('red').style.marginTop = '0vmin';
document.getElementById('blue').style.marginLeft = '0vmin';
document.getElementById('blue').style.marginTop = '0vmin';
let currentPlayer = 'red';
let preventCallBack = false; //if clicked quickly -> akward movement. To prevent it

function marginLeft() {
    //spliting 95vmin into 95 and min at 'v' and returning 95 as number
    return Number(document.querySelector(`#${currentPlayer}`).style.marginLeft.split('v')[0]);
}
function marginTop() {
    return Number(document.querySelector(`#${currentPlayer}`).style.marginTop.split('v')[0]);
}

startBtn.addEventListener ('click', async() => {
    if(!preventCallBack){
        preventCallBack = true;
        let diceNum = roll();
        console.log(`dice number is ${diceNum}`)
        let diceClass = `dice-${diceNum}`;
        let willBeOutOfRange = checkRange(diceNum);
        await new Promise(resolve =>  setTimeout(resolve, 400)) //before run or if out of range
        if(!willBeOutOfRange) {
            await run(diceNum);
        await new Promise(resolve =>  setTimeout(resolve, 400)) //after run
        }
        popup.classList.remove('active');
        let wonBy = checkWin();
        if(wonBy === 'none') {
        changeTurn();
        preventCallBack = false;
        dice.classList.remove(diceClass);
        }
    }
})

let rollNum = 0;
function roll () {
    //so that no two consecutive numbers come up
    let newRollNum;
    do{
        newRollNum = Math.floor(Math.random() * 6) + 1;
    } 
    while (newRollNum === rollNum)
    rollNum = newRollNum;
    diceDisplayChange();
    return rollNum;
}

function diceDisplayChange () {
    let diceClass = `dice-${rollNum}`;
    dice.classList.add(diceClass);
}

function run(diceNum) {
    //if diceNum is 4, loops from 1 to 4
   return new Promise(async(resolve, reject) => {
    for(i = 1; i <= diceNum; i++) {
        //for each number get direction to move
        let direction = getDirection();
        await move(direction);
    }
    await checkLaddersAndSnakes();

    resolve();
   })
}

function checkLaddersAndSnakes() {
 return new Promise(async(resolve, reject) => {
        //[margin-left, margin-top]bottom of ladder/head of snakes
        let froms = [[15,0],[45,-7.5],[0,-15],[60,-30],[22.5,-37.5],[30,-52.5],
        [60,-7.5],[30,-22.5],[7.5,-30],[52.5,-45],[52.5,-60],[67.5,-67.5],[15,-67.5]];
        ////[margin-left, margin-top]top of ladder/bottom of snakes
        let tos = [[45,-37.5],[22.5,-30],[7.5,-45],[15,-52.5],[45,-45],[37.5,-67.5],
        [52.5,0],[15,-7.5],[52.5,-15],[30,-7.5],[30,-45],[30,0],[52.5,-37.5]];
        for(let i = 0; i < froms.length; i++){
            if(marginLeft() == froms[i][0] && marginTop() == froms[i][1]) {
                popup.classList.add('active');
                document.querySelector(`#${currentPlayer}`).style.marginLeft = `${tos[i][0]}vmin`;
                document.querySelector(`#${currentPlayer}`).style.marginTop = `${tos[i][1]}vmin`;
                if (marginLeft() == 45 && marginTop() == -37.5){
                    popup.innerHTML = 'Congrats! You are promoted to 54';
                } else  if (marginLeft() == 22.5 && marginTop() == -30){
                    popup.innerHTML = 'Huray! You move up to 44';
                } else if (marginLeft() == 7.5 && marginTop() == -45){
                    popup.innerHTML = 'Lucky, go to 62';
                } else  if (marginLeft() == 15 && marginTop() == -52.5){
                    popup.innerHTML = 'Congrats! You are promoted to 78';
                } else  if (marginLeft() == 45 && marginTop() == -45){
                    popup.innerHTML = 'Huray! You move up to 67';
                } else if (marginLeft() == 37.5 && marginTop() == -67.5){
                    popup.innerHTML = 'Lucky, go to 95';
                } 
                else  if (marginLeft() == 52.5 && marginTop() == 0){
                    popup.innerHTML = 'Sorry! Back to 8';
                } else if (marginLeft() == 15 && marginTop() == -7.5){
                    popup.innerHTML = 'Bad Luck. Off to 18';
                } else  if (marginLeft() == 52.5 && marginTop() == -15){
                    popup.innerHTML = 'Oh no! Drop to 28';
                } else  if (marginLeft() == 30 && marginTop() == -7.5){
                    popup.innerHTML = 'Falling back to 16';
                } else if (marginLeft() == 30 && marginTop() == -45){
                    popup.innerHTML = 'Sorry! Back to 65';
                } else if (marginLeft() == 30 && marginTop() == 0){
                    popup.innerHTML = 'Bad Luck. Off to 5';
                } else  if (marginLeft() == 52.5 && marginTop() == -37.5){
                    popup.innerHTML = 'Oh no! Drop to 53';
                }
                await new Promise(resolve =>  setTimeout(resolve, 500));
                break;
            }
        }
        resolve();
 })
}


function getDirection() {
    //to get exact results for a%b we use [(a*10)%(b*10)]/10
    let direction;
    if ((marginLeft() == 67.5 && ((((marginTop()*10)%(15*10))/10) == 0)) ||
    (marginLeft() == 0 && ((((marginTop()*10)%(15*10))/10) != 0))) {
        direction = 'up';
    } else if((((marginTop()*10)%(15*10))/10) == 0) {
        direction = 'right';
    } else{
        direction = 'left';
    }
    return direction;
}

function move(direction) {
    return new Promise(async(resolve, reject) => {
        if(direction == 'up') {
            document.querySelector(`#${currentPlayer}`).style.marginTop = String(marginTop() - 7.5) + 'vmin';
        } else if(direction == 'right') {
            document.querySelector(`#${currentPlayer}`).style.marginLeft = String(marginLeft() + 7.5) + 'vmin';
        } else if(direction == 'left') {
            document.querySelector(`#${currentPlayer}`).style.marginLeft = String(marginLeft() - 7.5) + 'vmin';
        }
        await new Promise(resolve =>  setTimeout(resolve, 400)); //we need time to move
        resolve();
    })
}

function changeTurn() {
    if (currentPlayer == 'red') {
        turnDisplay.innerHTML = "Green players's Turn";
        currentPlayer = 'blue';
    } else if (currentPlayer == 'blue') {
        turnDisplay.innerHTML = "Yellow players's Turn";
        currentPlayer = 'red';
    }
}

function checkRange (diceNum) {
    let willBeOutOfRange = false;
    //float multiplication a*b is written as Number((a*b).toFixed(1))
    //condition for top row active player about to move out of board
    if (marginTop() == -67.5 && (marginLeft() + Number((diceNum*-7.5).toFixed(1))) < 0) {
        willBeOutOfRange = true;
    }
    return willBeOutOfRange;
}

function checkWin () {
    if (marginTop() == -67.5 && marginLeft() == 0){
        if (currentPlayer == 'red') {
            turnDisplay.innerHTML = `Yellow Wins!!`;
        } else if (currentPlayer == 'blue') {
            turnDisplay.innerHTML = `Green Wins!!`;
        }
        return currentPlayer;
    } else{
        return 'none';
    }
}