class Pathfinding {
    constructor(start){
        this.sender = start.getInhabitant();
        this.frontier = [];
        this.frontier.push(start);
        this.distance = {};
        this.distance[start] = 0;
        this.counter = 0;
    }

    possibleMoves() {
        while (!this.frontier.empty() && this.counter < this.sender.movePoint) {
            let current = this.frontier.pop();
            let currentNeighbors = this.tileNeighbors(current);
            for (let i = 0; i < currentNeighbors.length; i++) {
                if (!(currentNeighbors[i] in this.distance)) {
                    this.frontier.push(currentNeighbors[i]);
                    this.distance[currentNeighbors[i]] = 1 + this.distance[current];
                }
            }
            this.counter++;
        }
        return this.distance;
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