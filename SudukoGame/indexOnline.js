var gameDataAll 
//Create variables
var timer;
var timeRemaining;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;

var randomNum //selected puzzle
var solution

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status == 200) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

// this requests the file and executes a callback with the parsed result once
//   it is available


window.onload = function(){
    fetchJSONFile('./games.json', function(data){
        // do something with your data
        //console.log(data.games.easy[0].Puzzle);
        gameDataAll = data
    });
    //Run startgame function when button is clicked
    id("online-btn").addEventListener("click", startGame);
    //Add event listener to each number in number containers
    for (let i = 0; i < id("number-container").children.length; i++){
        id("number-container").children[i].addEventListener("click", function(){
            //If selecting is not disabled
            if (!disableSelect){
                //If number is already selected, select
                if (this.classList.contains("selected")){
                    //Then remove selection
                    this.classList.remove("selected");
                    selectedNum = null;
                } else{
                    //Deselect all other numbers
                    for (let i = 0; i < 9; i++){
                        id("number-container").children[i].classList.remove("selected");
                    }
                    //Select it and update selectedNum variables
                    this.classList.add("selected");
                    selectedNum = this;
                    updateMove();
                }
            }
        });
    }
}

function startGame(){
    //Choose board difficulty
    let board;
    randomNum = Math.floor(Math.random() * 7); //randomly select a puzzle 8 for puzzle amount
    if (id("diff-1").checked){
        board = gameDataAll.games.easy[randomNum].Puzzle;
        solution = gameDataAll.games.easy[randomNum].answer;
    }
    else if (id("diff-2").checked){
        board = gameDataAll.games.medium[randomNum].Puzzle;
        solution = gameDataAll.games.medium[randomNum].answer;
    }
    else if (id("diff-4").checked){
        board = gameDataAll.games.test[0].Puzzle;
        solution = gameDataAll.games.test[0].answer;
    }
    else{
         board = gameDataAll.games.hard[randomNum].Puzzle;
         solution = gameDataAll.games.hard[randomNum].answer;
    }
    //Set lives to 3 and enable selecting numbers and tiles
    lives = 3;
    disableSelect = false;
    id("lives").textContent = "Lives Remaining: 3";
    //Creates board based on difficulty
    generateBoard(board);
    //Starts the timer 
    startTimer();
    //Show number containers
    id("number-container").classList.remove("hidden");
}

function startTimer(){
    //Sets time remaining based on imput
    if (id("time-1").checked) timeRemaining = 180;
    else if (id("time-2").checked) timeRemaining = 300;
    else timeRemaining = 600;
    //Sets timer for first seconds
    id("timer").textContent = timeConversion(timeRemaining);
    //Set timer to update every seconds
    timer = setInterval(function(){
        timeRemaining --;
        if (timeRemaining === 0) endGame();
        id("timer").textContent = timeConversion(timeRemaining);
    }, 1000)
}

//Converts seconds into string of MM:SS format
function timeConversion(time){
    let minutes = Math.floor(time/60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = time % 60;
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;

}

function generateBoard(board){
    //Clear previous board
    clearPrevious();
    //Let used to increment tile ids
    let idCount = 0;
    //Create 81 tiles
    for (let i = 0; i < 81; i++){
        let tile = document.createElement("p");
        //If the tiles is not blank
        if (board.charAt(i) != "."){
            //Set tile text to correct numbers
            tile.textContent = board.charAt(i);
        } else {
            //Add click event listener to tile
            tile.addEventListener("click", function() {
                //If selecting is not disabled
                if (!disableSelect){
                    //If the tile is already selected
                    if (tile.classList.contains("selected")){
                        //Then remove selection
                        tile.classList.remove("selected");
                        selectedTile = null;
                    } else {
                        //Deselect all other tiles
                        for (let i = 0; i < 81; i++){
                            qsa(".tile")[i].classList.remove("selected");
                        }
                        //Add selection and update variable
                        tile.classList.add("selected");
                        selectedTile = tile;
                        updateMove();
                    }
                }
            });
        }
        //Assign tile id
        tile.id = idCount;
        //Increment for next tiles
        idCount ++;
        //Add tile class to all tiles
        tile.classList.add("tile");
        if ((tile.id > 17 && tile.id < 27) || (tile.id > 44 & tile.id < 54)){
            tile.classList.add("bottomBorder");
        }
        if ((tile.id + 1) % 9 == 3 || (tile.id + 1) % 9 == 6){
            tile.classList.add("rightBorder");
        }
        //Add tile to board
        id("board").appendChild(tile);
    }
}

function updateMove() {
    //if a tile and a number is selected
    if (selectedTile && selectedNum) {
        //Set the tile to the correct numbers
        selectedTile.textContent = selectedNum.textContent;
        //If the number matches the corresponding number in the solution key
        if (checkCorrect(selectedTile)){
            //Deselects the tile
            selectedTile.classList.remove("selected");
            selectedNum.classList.remove("selected");
            //clear the selected variables 
            selectedNum = null;
            selectedTile = null;
            //Check if board is completed
            if (checkDone()){
                endGame();
            }
            //If the number does not match the solution key 
        }else {
            //Disable selecting new numbers for one second
            disableSelect = true;
            //Make the tile turn red
            selectedTile.classList.add("incorrect");
            //Run in one second 
            setTimeout(function(){
                //Subtract
                lives --;
                //If no lives left end the game
                if (lives === 0){
                    endGame();
                }else {
                    //If lives is not equal to zero 
                    //Update lives text
                    id("lives").textContent = "Lives Remaining: "+ lives;
                    //Renable selecting numbers and tiles
                    disableSelect = false;
                }
                //Restore tile color and remove selected from both
                selectedTile.classList.remove("incorrect");
                selectedTile.classList.remove("selected");
                selectedNum.classList.remove("selected");
                //Clear the tiles text and clear selected variables
                selectedTile.textContent = "";
                selectedTile = null;
                selectedNum = null;
            }, 500);
        }
    }
}

function checkDone() {
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++){
        if (tiles[i].textContent === "") return false;
    }
    return true;
}

function endGame(){
    //Disable moves and stop the timer
    disableSelect = true;
    clearTimeout(timer);
    //Display winor loss message
    if (lives === 0 || timeRemaining === 0){
        id("lives").textContent = "You Lost!";
    } else{
        id("lives").textContent = "You Won!";
    }
}

function checkCorrect(tile){
    //Set solution based on difficulty selection 
    //we have answer stored already
    if (solution.charAt(tile.id) === tile.textContent) return true;
    else return false;
}

function clearPrevious(){
    //Access all of the tiles
    let tiles = qsa(".tile");
    for (let i = 0; i < tiles.length; i++){
        tiles[i].remove();
    }
    //If there is a timer clear interface
    if (timer) clearTimeout(timer);
    //Deselect any numbers
    for (let i = 0; i < id("number-container").children.length; i++){
        id("number-container").children[i].classList.remove("selected");
    }
    //Clear selected variables
    selectedTile = null;
    selectedNum = null;
}
//Helper fuctions
function id(id){
    return document.getElementById(id);
}
function qs(selector){
    return document.querySelector(selector);
}
function qsa(selector){
    return document.querySelectorAll(selector);
}

