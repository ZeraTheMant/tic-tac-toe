const displayController = (() => {
    //new game screen controls
    const newGameDiv = document.querySelector('#new-game-div');
    const startGameBtn = document.querySelector('#start-game');
    const hasSelectedAnOption = (optionGroup) => {
        for (let i=0; i<optionGroup.length; i++) {
            if (optionGroup[i].checked) {
                return true;
            }   
        }        
        return false;       
    };
    const getSelectedValue = (optionGroup) => {
        for (let i=0; i<optionGroup.length; i++) {
            if (optionGroup[i].checked) {
                return optionGroup[i].value;
            }   
        }  
    }   
    const resetRadioValues = (optionGroup) => {
        optionGroup.forEach(option => {
            option.checked = false;
        });
    }    
    
    startGameBtn.onclick = () => {
        const gameModeOptions = document.getElementsByName('mode');
        const markerOptions = document.getElementsByName('marker');
        const firstTurnOptions = document.getElementsByName('first-turn');

        if (hasSelectedAnOption(gameModeOptions) && hasSelectedAnOption(markerOptions) 
            && hasSelectedAnOption(firstTurnOptions)) {
            hideNewGameDiv();  
            showGameScreenDiv();
            
            const gameMode = getSelectedValue(gameModeOptions);
            const marker = getSelectedValue(markerOptions);
            const firstTurnPlayer = getSelectedValue(firstTurnOptions);
            initializeGame(gameMode, marker, firstTurnPlayer);
        } else {
            alert("Please complete all the required information to start the game.")
        }
    };
    
    //game screen div controls
    const gameScreenDiv = document.querySelector('#game-screen-div');
    
    const showNewGameDiv = () => {
        newGameDiv.style.display = 'block';  
    };
    const showGameScreenDiv = () => {
        gameScreenDiv.style.display = 'block';  
    };
    const showGameEndDiv = () => {
        gameEndDiv.style.display = 'block';  
    };
    const hideNewGameDiv = () => {
        newGameDiv.style.display = 'none';  
    };
    const hideGameScreenDiv = () => {
        gameScreenDiv.style.display = 'none';  
    };
    const hideGameEndDiv = () => {
        gameEndDiv.style.display = 'none';  
    };
    
    //game end div controls
    const gameEndDiv = document.querySelector('#game-end-div');
    const endGameScreen = (msg) => {
        const endGameMsg = document.querySelector('#end-game-msg');
        const backToStartBtn = document.querySelector('#back-to-start');
        backToStartBtn.onclick = function() {
            restartGame();
        };
        
        setTimeout(function(){ 
            hideGameScreenDiv(); 
            showGameEndDiv(); 
            endGameMsg.textContent = msg;
        }, 3500);
    };
    
    const restartGame = () => {
        hideGameEndDiv();
        showNewGameDiv();   

        const gameModeOptions = document.getElementsByName('mode');
        const markerOptions = document.getElementsByName('marker');
        const firstTurnOptions = document.getElementsByName('first-turn'); 

        resetRadioValues(gameModeOptions);
        resetRadioValues(markerOptions);
        resetRadioValues(firstTurnOptions);
    };
    
    return {
        showNewGameDiv,
        showGameScreenDiv,
        showGameEndDiv,
        hideNewGameDiv,
        hideGameScreenDiv,
        hideGameEndDiv,
        endGameScreen
    }
})();

function initializeGame(gameMode, marker, firstTurnPlayer) {
    const Player = (name, playerClass) => {
        const getName = () => name;
        const getMarker = () => playerClass;
        
        return {
            getName,
            getMarker
        };
    }
    
    const gameInstance = ((gameMode, marker, firstTurnPlayer) => {
        let gameOver = false;
        let winner;
        let tie = false;
        let player = Player(marker.toUpperCase(), marker);
        let currentTurnPlayer;
        
        const enemyMarker = (marker == 'x') ? 'o' : 'x';
        let enemy = Player(enemyMarker.toUpperCase(), enemyMarker);

        const setFirstTurnPlayer = (firstTurnPlayer) => {
            if (firstTurnPlayer == 'you') {
                currentTurnPlayer = player;
            } else {
                currentTurnPlayer = enemy;
            }
        };
        
        const switchTurns = () => {
            if (gameInstance.currentTurnPlayer == player) {
                gameInstance.currentTurnPlayer = enemy;
            } else {
                gameInstance.currentTurnPlayer = player;
            }  
        };
        
        const gameTied = () => { 
            gameInstance.gameOver = true;
            displayController.endGameScreen("The game is tied! No one won.");
        };
        
        const gameWon = (winner) => {
            gameInstance.gameOver = true;
            gameInstance.winner = winner;
            
            if (gameInstance.winner == player) {
                displayController.endGameScreen("You win! Good job!");         
            } else {
                displayController.endGameScreen("You lose! Try again next time.");                           
            }

        }
        
        setFirstTurnPlayer(firstTurnPlayer);
        
        return {
            switchTurns,
            currentTurnPlayer,
            gameWon,
            gameTied,
            gameOver,
            winner,
            gameMode,
            player,
            enemy
        }
    })(gameMode, marker, firstTurnPlayer);
    
    gameActions(gameInstance);
}

function gameActions(gameInstance) { 
    function getGameEnderForAI(squares, player) {
        for (let i=0; i<squares.length; i++) {
            const square = squares[i];
            const squareID = square.id;
            square.classList.add(player.getMarker());
            
            if (board.checkWin()) {
                square.classList.remove(player.getMarker());
                return squareID;
            } else {
               square.classList.remove(player.getMarker()); 
            }
        }
        return null;        
    }

    function getAIChosenSquare() {
        let availableSquares = document.querySelectorAll('.square:not(.x):not(.o)');
        
        const willWinNextTurnID = getGameEnderForAI(availableSquares, gameInstance.enemy);
        if (willWinNextTurnID) {
            return willWinNextTurnID;
        }
        
        const willPlayerWinNextTurnID = getGameEnderForAI(availableSquares, gameInstance.player);
        if (willPlayerWinNextTurnID) {
            return willPlayerWinNextTurnID;
        }
        
        const availableSquaresArray = []
        
        for (let i=0; i<availableSquares.length; i++) {
            availableSquaresArray.push(Number(availableSquares[i].id));
        }
        
        const cornerIndices = availableSquaresArray.filter((num) => {
            return [1, 3, 7, 9].includes(num)
        });
        
        if (cornerIndices.length > 0) {
            return cornerIndices[Math.floor(Math.random() * cornerIndices.length)];
        }
        
        if (document.getElementById('5').classList.toString.toLowerCase() == 'square') {
            return 5;
        }
        
        const sideIndices = availableSquaresArray.filter((num) => {
            return [2, 4, 6, 8].includes(num)
        });
        
        if (sideIndices.length > 0) {
            return sideIndices[Math.floor(Math.random() * sideIndices.length)];
        }
    }
    
    function move(square) {
        if (!gameInstance.gameOver) {
            board.placeMove(square, gameInstance.currentTurnPlayer.getMarker());
            const hasWon = board.checkWin();
            if (hasWon) {
                gameInstance.gameWon(gameInstance.currentTurnPlayer);
            }
            const isTied = board.checkTie();
            
            if (isTied) {
                gameInstance.gameTied();
            }
            
            gameInstance.switchTurns();          
            board.switchHoverMarker(gameInstance.currentTurnPlayer);             
        }
    }

    function aiMove() {
        const chosenSquare = document.getElementById(getAIChosenSquare());
        move(chosenSquare);
    }

    function handleClick(e) {
        if (!gameInstance.gameOver) {
            move(e.target);
            if (gameInstance.gameMode == 'vs-comp') {
                aiMove();
            }            
        }
    }
    
    const board = (() => {
        const squares = document.querySelectorAll('.square');//document.querySelectorAll('.square:not(.x):not(.o)');
        squares.forEach(cell => {
            cell.classList.remove('x'); 
            cell.classList.remove('o');
            cell.addEventListener('click', handleClick, {once: true})
        }); 
        const boardDOMDiv = document.querySelector('#game-board-div');
        const placeMove = (square, playerMarker) => {
            square.classList.add(playerMarker);
            //square.textContent = square.classList.toString()
        };    
        const switchHoverMarker = (currentTurnPlayer) => {
            boardDOMDiv.classList.remove('x'); 
            boardDOMDiv.classList.remove('o');
            if (!gameInstance.gameOver) {
                boardDOMDiv.classList.add(currentTurnPlayer.getMarker());                 
            }
        };
        const checkWin = () => {
            const squares = document.querySelectorAll('.square');

            const squareClassStrings = [];
            for (let i=0; i<squares.length; i++) {
                squareClassStrings.push(squares[i].classList.toString().toLowerCase());
            }

            return (squareClassStrings[0] == squareClassStrings[1] && squareClassStrings[0] == squareClassStrings[2] && squareClassStrings[0] != 'square') ||
                   (squareClassStrings[3] == squareClassStrings[4] && squareClassStrings[3] == squareClassStrings[5] && squareClassStrings[3] != 'square') ||
                   (squareClassStrings[6] == squareClassStrings[7] && squareClassStrings[6] == squareClassStrings[8] && squareClassStrings[6] != 'square') ||
                   (squareClassStrings[0] == squareClassStrings[3] && squareClassStrings[0] == squareClassStrings[6] && squareClassStrings[0] != 'square') ||
                   (squareClassStrings[1] == squareClassStrings[4] && squareClassStrings[1] == squareClassStrings[7] && squareClassStrings[1] != 'square') ||
                   (squareClassStrings[2] == squareClassStrings[5] && squareClassStrings[2] == squareClassStrings[8] && squareClassStrings[2] != 'square') ||
                   (squareClassStrings[0] == squareClassStrings[4] && squareClassStrings[0] == squareClassStrings[8] && squareClassStrings[0] != 'square') ||
                   (squareClassStrings[2] == squareClassStrings[4] && squareClassStrings[2] == squareClassStrings[6] && squareClassStrings[2] != 'square');
        };
        const checkTie = () => {
            const squares = document.querySelectorAll('.square:not(.x):not(.o)');
            return squares.length == 0;
        }
         
         return {
             placeMove,
             switchHoverMarker,
             checkTie,
             checkWin
         };
    })();  
    
    board.switchHoverMarker(gameInstance.currentTurnPlayer);
    
    if (gameInstance.gameMode == 'vs-comp') {
        if (gameInstance.currentTurnPlayer == gameInstance.enemy){ 
            aiMove();      
        }
    }
}