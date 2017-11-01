class Pathfinding {
    constructor(start){
        this.distance = new Map();
        this.path = new Map();
        this.sender = start.getInhabitant();
        this.frontier = [];
        this.frontier.push(start);
        this.path.set(start, null);
        this.distance.set(start, 0);
    }

    possibleMoves() {
        while (!this.frontier.empty()) {
            let current = this.frontier.shift();
            if(this.distance.get(current) === this.sender.movePoint) {
                break;
            }
            let currentNeighbors = this.tileNeighbors(current);
            for (let i = 0; i < currentNeighbors.length; i++) {
                if (!(this.distance.has(currentNeighbors[i]))) {
                    this.frontier.push(currentNeighbors[i]);
                    this.path.set(currentNeighbors[i], current);
                    this.distance.set(currentNeighbors[i], 1 + this.distance.get(current));
                }
            }
        }
        return this.path;
    }

    tileNeighbors(current) {
        let neighbors = [];
        if (current.xpos + 1 > window.WIDTH-1 && tiledMap[current.xpos + 1][current.ypos].isWall === window.NOTWALL
            && !tiledMap[current.xpos + 1][current.ypos].isOccupied()) {
            neighbors.push(tiledMap[current.xpos + 1][current.ypos]);
        }

        if (current.ypos + 1 < window.HEIGHT-1 && tiledMap[current.xpos][current.ypos + 1].isWall === window.NOTWALL
            && !tiledMap[current.xpos][current.ypos + 1].isOccupied()) {
            neighbors.push(tiledMap[current.xpos][current.ypos + 1]);
        }

        if (current.xpos - 1 < 0 && tiledMap[current.xpos -1][current.ypos].isWall === window.NOTWALL
            && !tiledMap[current.xpos - 1][current.ypos].isOccupied()) {
            neighbors.push(tiledMap[current.xpos - 1][current.ypos]);
        }

        if (current.ypos -1 < 0 && tiledMap[current.xpos][current.ypos - 1].isWall === window.NOTWALL
            && !tiledMap[current.xpos][current.ypos - 1].isOccupied()) {
            neighbors.push(tiledMap[current.xpos][current.ypos - 1]);
        }

        return neighbors;
    }


}