var	canvasWidth = 300, 
	canvasHeight = 400,
	squareLength = 20, 
	c = document.getElementById('canvas'),
	ctx = c.getContext('2d');
	ctx.fillStyle = "Black";
	ctx.font = '18pt Calibri';
	ctx.fillText("Instruction", 40, 60);
	ctx.fillText("Left: move to left", 25, 100);
	ctx.fillText("Right: move to right", 25, 120);
	ctx.fillText("Up: rotate", 25, 140);
	ctx.fillText("Down: move down", 25, 160);
	ctx.fillText("Space: move to bottom", 25, 180);

var speedLevels = [20, 16, 12, 10, 8], 
	currSpeed;

var dir_up = 1,
	dir_down = 2,
	dir_left = 3,
	dir_right = 4;

var numOfLinesClearedWhenUpgrade = 30;

var linesClearedSinceLastUpgrade = 0;

var typeI = 0, 
	typeJ = 1, 
	typeL = 2, 
	typeO = 3, 
	typeS = 4, 
	typeT = 5, 
	typeZ = 6; 

var statsGameLevel,
	statsLinesCleared = 0,
	statsPoints = 0;

var squareImage = new Image();
	squareImage.src = 'square.png';

var clearLineSound = new Audio('sound.ogg');
var bgSound = new Audio('tetris_bg_sound.ogg');
var hitSound = new Audio('move.ogg');
var collideSound = new Audio('collide.ogg');
var moveTetrisSound = new Audio('move_tetris.ogg');

//check if safari
var ua = navigator.userAgent.toLowerCase(); 
if (ua.indexOf('safari')!=-1){
		if(ua.indexOf('chrome')  <= -1)
		{
				clearLineSound = new Audio('sound.mp3');
				bgSound = new Audio('tetris_bg_sound.mp3');
				hitSound = new Audio('move.mp3');
				collideSound = new Audio('collide.mp3');
				moveTetrisSound = new Audio('move_tetris.mp3');
		}
}
//check if ie
if(navigator.appName=="Microsoft Internet Explorer")
{
		clearLineSound = new Audio('sound.mp3');
		bgSound = new Audio('tetris_bg_sound.mp3');
		hitSound = new Audio('move.mp3');
		collideSound = new Audio('collide.mp3');
		moveTetrisSound = new Audio('move_tetris.mp3');
}

var gameOn;
var gameLoop;

var gameGrid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

var bag = [typeI, typeJ, typeL, typeO, typeS, typeT, typeZ];

var clearCanvas = function(){
	ctx.fillStyle = 'White';
	ctx.beginPath();
	ctx.rect(0, 0, canvasWidth, canvasHeight);
	ctx.closePath();
	ctx.fill();
}

var drawLine = function(){
	ctx.beginPath();
	ctx.moveTo(200, 0);
	ctx.lineTo(200, 400);
	ctx.stroke();
}

var updateStats = function(lines){
	linesClearedSinceLastUpgrade += lines;
	statsLinesCleared += lines;
	statsPoints += lines*lines*50 + lines*50;

	if(linesClearedSinceLastUpgrade > numOfLinesClearedWhenUpgrade && statsGameLevel<5){
		statsGameLevel++;
		currSpeed = speedLevels[statsGameLevel-1];
		linesClearedSinceLastUpgrade-=numOfLinesClearedWhenUpgrade;
	}
}

var drawFixedSquares = function(){
	for(var i=0; i<20; i++){
		for(var j=0; j<10; j++){
			if(gameGrid[i][j] == 1){
				try{
					ctx.drawImage(squareImage, 0, 0, squareLength, squareLength, j*squareLength, i*squareLength, squareLength, squareLength)
				} catch(e)
				{
					console.log('drawImage not work')
				}
			}
		}
	}
}

var drawStats = function(){
	ctx.fillStyle = "Black";
	ctx.font = '18pt Calibri';
	ctx.fillText("LEVEL: ", 210, 120);
	ctx.fillText("LINES: ", 210, 160);
	ctx.fillText("POINTS: ", 210, 200);
	ctx.fillText(statsGameLevel, 210, 140);
	ctx.fillText(statsLinesCleared, 210, 180);
	ctx.fillText(statsPoints, 210, 220);
}

var updatePosition = function(){
	currTetrimino.fall();
}

var drawOnCanvas = function(){
	drawLine();
	currTetrimino.draw();
	nextTetrimino.drawStandBy();
	drawFixedSquares();
	drawStats();
}

var generateNextTetrimino = function(){
	if(!currTetrimino.active){
		currTetrimino = nextTetrimino;
		nextTetrimino = RandomGenOneBag();

		if(checkEndOfGame(currTetrimino))
			endGame();
	}	
}

var checkEndOfGame = function(tetri){
	if(gameGrid[tetri.s_1.vPosition][tetri.s_1.hPosition] == 1 || gameGrid[tetri.s_2.vPosition][tetri.s_2.hPosition] == 1 || gameGrid[tetri.s_3.vPosition][tetri.s_3.hPosition] == 1 || gameGrid[tetri.s_4.vPosition][tetri.s_4.hPosition] == 1){
		return true;
	}

	return false;
}

var endGame = function(){
	clearInterval(gameLoop);
	$('#pause').attr("disabled", true);
	gameOn = false;
	setTimeout(function(){
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.fillRect(0, 0, 200, canvasHeight);

		ctx.fillStyle = "Black";
		ctx.font = '25pt Calibri';
		ctx.fillText("GAME OVER", 15, 180);
	},100);

	$('#new_score_row').css("display", "table-row");
	$('#new_score').val(statsPoints);
	$('#new_score').attr("readonly", "readonly");
	$('#new_score').focus();
	$('#new_name').focus();
}

var pause_resume = function(){
	if(gameOn){
		clearInterval(gameLoop);
		$("#pause").html("Resume");
		gameOn = false;
	}
	else{
		gameOn = true;
		$("#pause").html("Pause");
		startGame();
	}

}

var Square = function(speed, x, y){
	var self = this;
	self.color = "Black";
	self.vPosition = y;
	self.hPosition = x;
	self.speed = speed;
	self.counter = 0;
	self.active = true;

	self.canFall = function(){
		if(self.fixedSquareUnder())
			self.active = false;

		return self.active;
	}

	self.draw = function(){
		if(self.active){

			try{
				ctx.drawImage(squareImage, 0, 0, squareLength, squareLength, self.hPosition*squareLength, self.vPosition*squareLength, squareLength, squareLength)
			} catch(e)
			{
				console.log('drawImage not work')
			}
		}
	}

	self.drawStandBy = function(){
		if(self.active){

			try{
				ctx.drawImage(squareImage, 0, 0, squareLength, squareLength, self.hPosition*squareLength+155, self.vPosition*squareLength+30, squareLength, squareLength)
			} catch(e)
			{
				console.log('drawImage not work')
			}
		}
	}

	self.fixedSquareUnder = function(){
		if(gameGrid[self.vPosition+1][self.hPosition] == 1)
			return true;
		else
			return false;
	}

	self.fixedSquareOnRight = function(){
		if(self.vPosition < 0) return false;

		if(gameGrid[self.vPosition][self.hPosition+1] == 1)
			return true;
		else
			return false;
	}

	self.fixedSquareOnLeft = function(){
		if(self.vPosition < 0) return false;

		if(gameGrid[self.vPosition][self.hPosition-1] == 1)
			return true;
		else
			return false;		
	}

	self.findTheHighestFixedSquareUnder = function(){
		for(var i = self.vPosition; i < 20; i++){
			if(gameGrid[i][self.hPosition] == 1){
				return i;
			}
		}
		return 20;
	}

	return self;
}

var checkLinesToClear = function(){
	var fixSquareNum;
	var linesToClear = [];
	var counter = 0;

	for(var i=0; i<20; i++){
		fixSquareNum = 0;
		for(var j=0; j<10; j++){
			fixSquareNum += gameGrid[i][j];
		}
		if(fixSquareNum == 10){
			linesToClear[counter] = i;
			counter++;
		}
	}
	clearingLineAnimation(linesToClear);

	return counter;
}

var updateGameGrid = function(linesToClear){
	var len = linesToClear.length;
	var linesToMove; 

	if(len==0) return;

	for(var m=0; m<len; m++){
		clearLine(linesToClear[m]);
	}

	for(var i=19; i>-1; i--){
		if(!emptyLine(i)){
			linesToMove = levelsToMoveDown(linesToClear, i);
			if(linesToMove>0)
				moveLineDown(i, linesToMove);
		}
	}
}

var emptyLine = function(currLine){
	for(var j=0; j<10; j++){
		if(gameGrid[currLine][j]==1){
			return false;
		}
	}	
	return true;
}

var levelsToMoveDown = function(linesToClear, currLine){
	var len = linesToClear.length;
	var counter = len;

	for(var i=0; i<len; i++){
		if(linesToClear[i]==currLine){
			return 0;
		}else if(linesToClear[i]>currLine)
		{
			return counter;
		}
		else{
			counter--;
		}
	}
	return counter;
}

var clearLine = function(lineNumber){
	for(var i=0; i<10; i++){
		gameGrid[lineNumber][i] = 0;
	}
}

var moveLineDown = function(lineNumber, levels){
	for(var i=0; i<10; i++){
		gameGrid[lineNumber+levels][i] = gameGrid[lineNumber][i];
	}	
	clearLine(lineNumber);
}

var monitorKeyboard = function (){
            $(document).keydown(function(evt){
              if(evt.which == 39 && gameOn){
              	moveTetrisSound.load();
              	moveTetrisSound.play();
              	currTetrimino.checkAndMoveToRight();
              }
              else if(evt.which == 37 && gameOn){
              	moveTetrisSound.load();
              	moveTetrisSound.play();
              	currTetrimino.checkAndMoveToLeft();
              }
              else if(evt.which == 40 && gameOn){
              	moveTetrisSound.load();
              	moveTetrisSound.play();
              	currTetrimino.checkAndMoveDown();
              }
              else if(evt.which == 38 && gameOn){
              	hitSound.load();
              	hitSound.play();
              	currTetrimino.checkAndRotate();
              }
              else if(evt.which == 32 && gameOn){
              	collideSound.load();
              	collideSound.play();
              	currTetrimino.moveToBottomAndFreeze();
              }
            });
         }

var Tetrimino = function(speed){
	var self = this;
	self.active = true;
	self.speed = speed;
	self.counter = 0;

	self.moveToLeft = function(){
		self.s_1.hPosition--;
		self.s_2.hPosition--;
		self.s_3.hPosition--;
		self.s_4.hPosition--;
	}

	self.moveToRight = function(){
		self.s_1.hPosition++;
		self.s_2.hPosition++;
		self.s_3.hPosition++;
		self.s_4.hPosition++;
	}

	self.moveDown = function(){
		self.s_1.vPosition++;
		self.s_2.vPosition++;
		self.s_3.vPosition++;
		self.s_4.vPosition++;
	}

	self.fall = function(){
		if(self.counter >= self.speed){
			var s_1_can_fall = self.s_1.canFall();
			var s_2_can_fall = self.s_2.canFall();
			var s_3_can_fall = self.s_3.canFall();
			var s_4_can_fall = self.s_4.canFall();

			if(s_1_can_fall && s_2_can_fall && s_3_can_fall && s_4_can_fall){
				self.moveDown();	
			}
			else{
				self.freeze();
				var n = checkLinesToClear();
				updateStats(n);
			}

			self.counter = 0;
		}
		self.counter++;
	}

	self.freeze = function(){
		gameGrid[self.s_1.vPosition][self.s_1.hPosition] = 1;
		gameGrid[self.s_2.vPosition][self.s_2.hPosition] = 1;
		gameGrid[self.s_3.vPosition][self.s_3.hPosition] = 1;
		gameGrid[self.s_4.vPosition][self.s_4.hPosition] = 1;
		self.active = false;
	}

	self.draw = function(){
		if(self.active){
			self.s_1.draw();
			self.s_2.draw();
			self.s_3.draw();
			self.s_4.draw();
		}
	}

	self.drawStandBy = function(){
		if(self.active){
			self.s_1.drawStandBy();
			self.s_2.drawStandBy();
			self.s_3.drawStandBy();
			self.s_4.drawStandBy();
		}
	}

	self.moveToBottom = function(){
		var numLevelMoveDownS_1 = self.s_1.findTheHighestFixedSquareUnder() - self.s_1.vPosition - 1;
		var numLevelMoveDownS_2 = self.s_2.findTheHighestFixedSquareUnder() - self.s_2.vPosition - 1;
		var numLevelMoveDownS_3 = self.s_3.findTheHighestFixedSquareUnder() - self.s_3.vPosition - 1;
		var numLevelMoveDownS_4 = self.s_4.findTheHighestFixedSquareUnder() - self.s_4.vPosition - 1;
		var numLevelMoveDown = Math.min(numLevelMoveDownS_1, numLevelMoveDownS_2, numLevelMoveDownS_3, numLevelMoveDownS_4)

		self.s_1.vPosition += numLevelMoveDown;
		self.s_2.vPosition += numLevelMoveDown;
		self.s_3.vPosition += numLevelMoveDown;
		self.s_4.vPosition += numLevelMoveDown;
	}

	self.moveToBottomAndFreeze = function(){
		self.moveToBottom();
		self.freeze();
		var n = checkLinesToClear();
		updateStats(n);
	}

	return self;
}

var I = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 3, 0);
	self.s_2 = new Square(speed, 4, 0);
	self.s_3 = new Square(speed, 5, 0);
	self.s_4 = new Square(speed, 6, 0);
	self.direction = dir_left;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_left){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_left){
			if(self.s_4.hPosition < 9 && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_2.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_left){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_4.vPosition < 19 && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var rotate_center_i = self.s_2.vPosition;
		var rotate_center_j = self.s_2.hPosition;

		if(self.direction == dir_left){
			if(rotate_center_i <= 17 && (rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0) && gameGrid[rotate_center_i+1][rotate_center_j]==0 && gameGrid[rotate_center_i+2][rotate_center_j]==0){
				self.direction = dir_up;

				// rotate
				self.s_1.vPosition = rotate_center_i-1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i+1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i+2;
				self.s_4.hPosition = rotate_center_j;
			}
		}
		else if(self.direction == dir_up){
			if(rotate_center_j>=1 && rotate_center_j<=7 && gameGrid[rotate_center_i][rotate_center_j-1]==0 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i][rotate_center_j+2]==0){
				self.direction = dir_left;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j-1;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j+1;
				self.s_4.vPosition = rotate_center_i;
				self.s_4.hPosition = rotate_center_j+2;
			}
		}
	}

	return self;
}

var J = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 3, 0);
	self.s_2 = new Square(speed, 4, 0);
	self.s_3 = new Square(speed, 5, 0);
	self.s_4 = new Square(speed, 5, 1);
	self.direction = dir_left;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_left){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_4.hPosition > 0 && !self.s_4.fixedSquareOnLeft() && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_right){
			if(self.s_3.hPosition > 0 && !self.s_3.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}				
		else if(self.direction == dir_down){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_left){
			if(self.s_3.hPosition < 9 && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_2.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_right){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_4.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_2.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_left){
			if(self.s_4.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_3.vPosition < 19 && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_right){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_3.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var rotate_center_i = self.s_2.vPosition;
		var rotate_center_j = self.s_2.hPosition;

		if(self.direction == dir_left){
			if((rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0) && gameGrid[rotate_center_i+1][rotate_center_j]==0 && gameGrid[rotate_center_i+1][rotate_center_j-1]==0){
				self.direction = dir_up;

				// rotate
				self.s_1.vPosition = rotate_center_i-1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i+1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
		else if(self.direction == dir_up){
			if(rotate_center_j<=8 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i][rotate_center_j-1]==0 && (rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j-1]==0)){
				self.direction = dir_right;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j+1;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j-1;
				self.s_4.vPosition = rotate_center_i-1;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
		else if(self.direction == dir_right){
			if(rotate_center_i <= 18 && gameGrid[rotate_center_i+1][rotate_center_j]==0 && (rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0 && gameGrid[rotate_center_i-1][rotate_center_j+1]==0)){
				self.direction = dir_down;

				// rotate
				self.s_1.vPosition = rotate_center_i+1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i-1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i-1;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
		else if(self.direction == dir_down){
			if(rotate_center_j>=1 && gameGrid[rotate_center_i][rotate_center_j-1]==0 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i+1][rotate_center_j+1]==0){
				self.direction = dir_left;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j-1;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j+1;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
	}

	return self;
}

var L = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 5, 0);
	self.s_2 = new Square(speed, 4, 0);
	self.s_3 = new Square(speed, 3, 0);
	self.s_4 = new Square(speed, 3, 1);
	self.direction = dir_right;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_right){
			if(self.s_3.hPosition > 0 && !self.s_3.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_4.hPosition > 0 && !self.s_4.fixedSquareOnLeft() && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}				
		else if(self.direction == dir_up){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_right){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_2.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_3.hPosition < 9 && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_4.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_2.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_right){
			if(self.s_4.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_3.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_3.vPosition < 19 && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var rotate_center_i = self.s_2.vPosition;
		var rotate_center_j = self.s_2.hPosition;

		if(self.direction == dir_right){
			if((rotate_center_i==0 || (gameGrid[rotate_center_i-1][rotate_center_j]==0 && gameGrid[rotate_center_i-1][rotate_center_j-1]==0)) && gameGrid[rotate_center_i+1][rotate_center_j]==0){
				self.direction = dir_down;

				// rotate
				self.s_1.vPosition = rotate_center_i+1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i-1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i-1;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
		else if(self.direction == dir_down){
			if(rotate_center_j<=8 && gameGrid[rotate_center_i][rotate_center_j-1]==0 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && (rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j+1]==0)){
				self.direction = dir_left;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j-1;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j+1;
				self.s_4.vPosition = rotate_center_i-1;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
		else if(self.direction == dir_left){
			if(rotate_center_i <= 18 && (rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0) && gameGrid[rotate_center_i+1][rotate_center_j]==0 && gameGrid[rotate_center_i+1][rotate_center_j+1]==0){
				self.direction = dir_up;

				// rotate
				self.s_1.vPosition = rotate_center_i-1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i+1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
		else if(self.direction == dir_up){
			if(rotate_center_j>=1 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i][rotate_center_j-1]==0 && gameGrid[rotate_center_i+1][rotate_center_j-1]==0){
				self.direction = dir_right;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j+1;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j-1;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
	}
	return self;
}

var O = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 4, 0);
	self.s_2 = new Square(speed, 5, 0);
	self.s_3 = new Square(speed, 4, 1);
	self.s_4 = new Square(speed, 5, 1);

	self.checkAndMoveToLeft = function(){
		if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft()){
			self.moveToLeft();
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.s_2.hPosition < 9 && !self.s_2.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
			self.moveToRight();
		}
	}

	self.checkAndMoveDown = function(){
		if(self.s_3.vPosition < 19 && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
			self.moveDown();
		}
	}

	self.checkAndRotate = function(){
		// do nothing
	}
	return self;
}

var S = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 5, 0);
	self.s_2 = new Square(speed, 4, 0);
	self.s_3 = new Square(speed, 4, 1);
	self.s_4 = new Square(speed, 3, 1);
	self.direction = dir_right;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_right){
			if(self.s_4.hPosition > 0 && !self.s_4.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_right){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_3.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_right){
			if(self.s_3.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_4.vPosition < 19 && !self.s_2.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var rotate_center_i = self.s_2.vPosition;
		var rotate_center_j = self.s_2.hPosition;

		if(self.direction == dir_right){
			if((rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0) && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i+1][rotate_center_j+1]==0){
				self.direction = dir_up;

				// rotate
				self.s_1.vPosition = rotate_center_i-1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j+1;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
		else if(self.direction == dir_up){
			if(rotate_center_j>=1 && gameGrid[rotate_center_i][rotate_center_j+1]==0 && gameGrid[rotate_center_i+1][rotate_center_j]==0 && gameGrid[rotate_center_i+1][rotate_center_j-1]==0){
				self.direction = dir_right;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j+1;
				self.s_3.vPosition = rotate_center_i+1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
	}
	return self;
}

var Z = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 5, 1);
	self.s_2 = new Square(speed, 4, 1);
	self.s_3 = new Square(speed, 4, 0);
	self.s_4 = new Square(speed, 3, 0);
	self.direction = dir_right;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_right){
			if(self.s_4.hPosition > 0 && !self.s_4.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_2.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_right){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_3.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_right){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_2.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_down){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_3.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var s_3_original_i = self.s_3.vPosition;
		var s_3_original_j = self.s_3.hPosition;

		if(self.direction == dir_right){
			if((s_3_original_i == 0 || gameGrid[s_3_original_i-1][s_3_original_j+1]==0) && gameGrid[s_3_original_i][s_3_original_j+1]==0){
				self.direction = dir_down;

				// rotate
				self.s_1.vPosition = s_3_original_i+1;
				self.s_1.hPosition = s_3_original_j;
				self.s_2.vPosition = s_3_original_i;
				self.s_2.hPosition = s_3_original_j;
				self.s_3.vPosition = s_3_original_i;
				self.s_3.hPosition = s_3_original_j+1;
				self.s_4.vPosition = s_3_original_i-1;
				self.s_4.hPosition = s_3_original_j+1;
			}
		}
		else if(self.direction == dir_down){
			if(s_3_original_j>=2 && gameGrid[s_3_original_i][s_3_original_j-2]==0 && gameGrid[s_3_original_i+1][s_3_original_j]==0){
				self.direction = dir_right;

				// rotate
				self.s_1.vPosition = s_3_original_i+1;
				self.s_1.hPosition = s_3_original_j;
				self.s_2.vPosition = s_3_original_i+1;
				self.s_2.hPosition = s_3_original_j-1;
				self.s_3.vPosition = s_3_original_i;
				self.s_3.hPosition = s_3_original_j-1;
				self.s_4.vPosition = s_3_original_i;
				self.s_4.hPosition = s_3_original_j-2;
			}
		}
	}
	return self;
}

var T = function(speed){
	var self = new Tetrimino(speed);
	self.s_1 = new Square(speed, 4, 1);
	self.s_2 = new Square(speed, 4, 0);
	self.s_3 = new Square(speed, 3, 0);
	self.s_4 = new Square(speed, 5, 0);
	self.direction = dir_down;

	self.checkAndMoveToLeft = function(){
		if(self.direction == dir_down){
			if(self.s_3.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_1.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_4.hPosition > 0 && !self.s_1.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}				
		else if(self.direction == dir_right){
			if(self.s_2.hPosition > 0 && !self.s_2.fixedSquareOnLeft() && !self.s_3.fixedSquareOnLeft() && !self.s_4.fixedSquareOnLeft()){
				self.moveToLeft();
			}
		}
	}
	self.checkAndMoveToRight = function(){
		if(self.direction == dir_down){
			if(self.s_4.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_2.hPosition < 9 && !self.s_2.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_3.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
		else if(self.direction == dir_right){
			if(self.s_1.hPosition < 9 && !self.s_1.fixedSquareOnRight() && !self.s_3.fixedSquareOnRight() && !self.s_4.fixedSquareOnRight()){
				self.moveToRight();
			}
		}
	}

	self.checkAndMoveDown = function(){
		if(self.direction == dir_down){
			if(self.s_1.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_left){
			if(self.s_4.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_up){
			if(self.s_2.vPosition < 19 && !self.s_2.fixedSquareUnder() && !self.s_3.fixedSquareUnder() && !self.s_4.fixedSquareUnder()){
				self.moveDown();
			}
		}
		else if(self.direction == dir_right){
			if(self.s_3.vPosition < 19 && !self.s_1.fixedSquareUnder() && !self.s_3.fixedSquareUnder()){
				self.moveDown();
			}
		}
	}

	self.checkAndRotate = function(){
		var rotate_center_i = self.s_2.vPosition;
		var rotate_center_j = self.s_2.hPosition;

		if(self.direction == dir_down){
			if(rotate_center_i==0 || gameGrid[rotate_center_i-1][rotate_center_j]==0){
				self.direction = dir_left;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j-1;
				self.s_3.vPosition = rotate_center_i-1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i+1;
				self.s_4.hPosition = rotate_center_j;
			}
		}
		else if(self.direction == dir_left){
			if(rotate_center_j<=8 && gameGrid[rotate_center_i][rotate_center_j+1]==0){
				self.direction = dir_up;

				// rotate
				self.s_1.vPosition = rotate_center_i-1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j+1;
				self.s_4.vPosition = rotate_center_i;
				self.s_4.hPosition = rotate_center_j-1;
			}
		}
		else if(self.direction == dir_up){
			if(rotate_center_i <= 18 && gameGrid[rotate_center_i+1][rotate_center_j]==0){
				self.direction = dir_right;

				// rotate
				self.s_1.vPosition = rotate_center_i;
				self.s_1.hPosition = rotate_center_j+1;
				self.s_3.vPosition = rotate_center_i+1;
				self.s_3.hPosition = rotate_center_j;
				self.s_4.vPosition = rotate_center_i-1;
				self.s_4.hPosition = rotate_center_j;
			}
		}
		else if(self.direction == dir_right){
			if(rotate_center_j>=1 && gameGrid[rotate_center_i][rotate_center_j-1]==0){
				self.direction = dir_down;

				// rotate
				self.s_1.vPosition = rotate_center_i+1;
				self.s_1.hPosition = rotate_center_j;
				self.s_3.vPosition = rotate_center_i;
				self.s_3.hPosition = rotate_center_j-1;
				self.s_4.vPosition = rotate_center_i;
				self.s_4.hPosition = rotate_center_j+1;
			}
		}
	}
	return self;
}

monitorKeyboard();

var RandomGenEqualOdds = function(){
	var ranNum = ~~(Math.random()*7)

	switch(ranNum)
	{
	case typeI:
	  return new I(currSpeed);		
	  break;
	case typeJ:
	  return new J(currSpeed);
	  break;
	case typeL:
	  return new L(currSpeed);
	  break;
	case typeO:
	  return new O(currSpeed);
	  break;
	case typeS:
	  return new S(currSpeed);
	  break;
	case typeT:
	  return new T(currSpeed);
	  break;
	case typeZ:
	  return new Z(currSpeed);
	  break;
	default:
	  throw 'something wrong!'
	}
}

var RandomGenOneBag = function(){
	if(bag.length == 0){
		bag = [typeI, typeJ, typeL, typeO, typeS, typeT, typeZ];
	}

	var index = ~~(Math.random()*bag.length)

	var ranNum = bag[index];
	bag.splice(index, 1);

	switch(ranNum)
		{
		case typeI:
		  return new I(currSpeed);		
		  break;
		case typeJ:
		  return new J(currSpeed);
		  break;
		case typeL:
		  return new L(currSpeed);
		  break;
		case typeO:
		  return new O(currSpeed);
		  break;
		case typeS:
		  return new S(currSpeed);
		  break;
		case typeT:
		  return new T(currSpeed);
		  break;
		case typeZ:
		  return new Z(currSpeed);
		  break;
		default:
		  throw 'something wrong!'
		}	
}

var currTetrimino = RandomGenOneBag();
var nextTetrimino = RandomGenOneBag();

var resetVariable = function(){
	currTetrimino = RandomGenOneBag();
	nextTetrimino = RandomGenOneBag();
	bag = [typeI, typeJ, typeL, typeO, typeS, typeT, typeZ];
	gameGrid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
  linesClearedSinceLastUpgrade = 0;
	gameOn = true;
	statsLinesCleared = 0;
	statsPoints = 0;
	$("#pause").html("Pause");
}

var startGame = function(){
	$('#new_name').val('');
	$('#new_score_row').css("display", "none");

	//stop playing the background music
	bgSound.pause();

	$('#pause').attr("disabled", false);
	if(gameLoop != undefined)
		clearInterval(gameLoop);
	if(!gameOn)
	resetVariable();
	gameLoop = setInterval(function(){
		clearCanvas();
		generateNextTetrimino();
		updatePosition();
		drawOnCanvas();
	}, 1000/50);
}

var lineDisappear = function(linesToClear){
	var len = linesToClear.length;
	for(var i=0; i<len; i++){
		ctx.fillStyle = 'White';
		ctx.beginPath();
		ctx.rect(0, linesToClear[i]*squareLength, canvasWidth, squareLength);
		ctx.closePath();
		ctx.fill();
	}
}

var lineAppear = function(linesToClear){
	var len = linesToClear.length;
	for(var i=0; i<len; i++){
		for(var j=0;j<10;j++){
			ctx.drawImage(squareImage, 0, 0, squareLength, squareLength, j*squareLength, linesToClear[i]*squareLength, squareLength, squareLength)
		}
	}
}

var clearingLineAnimation = function(linesToClear){
	if(linesToClear.length==0)
		return;

	setTimeout(function(){
		clearInterval(gameLoop);
		$('#pause').attr("disabled", true);
		gameOn = false;
	}, 1000/10);

	clearLineSound.load();
	clearLineSound.play();

	var animateTimes = 0;
	clearLineAnimation = setInterval(function(){
		if(animateTimes<6){
			if(animateTimes%2 ==0)
				lineDisappear(linesToClear);
			else if(animateTimes%2 ==1)
				lineAppear(linesToClear);

			animateTimes++;
		}
		else{
			clearInterval(clearLineAnimation);
			gameOn = true;
			startGame();
			$('#pause').attr("disabled", false);
			updateGameGrid(linesToClear);
		}
			
	}, 1000/10);
}

$(document).ready(function(){
	// play the background music
	bgSound.play();

	$("#pause").attr("disabled", true);

  $("#start").click(function(){
  	gameOn = false;
  	currSpeed = speedLevels[parseInt($("#level").val())-1]
  	statsGameLevel = $("#level").val();
    startGame();
    $("#start").html("Restart");
  });
  $("#pause").click(function(){
    pause_resume();
  });
});
