"use strict";

function isDirectionValid(curX, curY, direction, height, width) {

			let UP = 0;
			let LEFT = 1;
			let DOWN = 2;
			let RIGHT = 3;
			switch(direction) {
			case UP: return (curY - 1) >= 0;
			case DOWN: return (curY + 1) < height;
			case LEFT: return (curX - 1) >=0;
					break;
			case RIGHT: return (curX + 1) < width;
			default: break;
		}
}

function dungeonMapMaker(width, height, tileWalls) {
	let map = [];
	for(let i = 0; i < height; i++){
		map[i] = [];
		for(let j = 0; j < width; j++){
			map[i][j] = 1;
		}
	}

	let UP = 0;
	let LEFT = 1;
	let DOWN = 2;
	let RIGHT = 3;
	let counter = width*height;
	let randRow = Math.floor(Math.random() * height);
  	let randCol = Math.floor(Math.random() * width);
	let pointer = [randRow, randCol];
	map[randRow][randCol] = 0;
	counter--;
	let direction;
	while(counter > tileWalls) {
    	do {
			direction = Math.floor(Math.random() * 4);
    	}
    	while (!isDirectionValid(pointer[1], pointer[0], direction, height, width));

		switch(direction) {
			case UP:    pointer[0] = pointer[0]-1;
						break;
			case DOWN:  pointer[0] = pointer[0]+1;
						break;
			case LEFT: 	pointer[1] = pointer[1]-1;
						break;
			case RIGHT: pointer[1] = pointer[1]+1;
						break;
			default: break;
		}

		if (map[pointer[0]][pointer[1]] === 1){
			map[pointer[0]][pointer[1]] = 0;
    		counter--;
		}
	}

	// for(let k = 0; k < height; k++) {
		// for(let m = 0; m < height; m++) {
			// console.log(map[k][m]);
		// }
		// console.log('\n');
	// }

	return map;
};
