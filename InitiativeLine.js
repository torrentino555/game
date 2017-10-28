class InitiativeLine{
	constructor() {
		this.queue = [];
	}

	NextUnit() {
		let unit = this.queue.shift();
		this.queue.push(unit);
		return unit;
	}

	CurrentUnit() {
		return this.queue[this.queue.length-1];
	}	

	RemoveUnit(unit) {
		this.queue.splice(this.queue.indexOf(unit), 1);
	}

	PushEveryone(allies, enemies) {

		for(let i = 0; i < allies.length-1; i++){
			this.queue.push(allies[i]);
		}

		for(let i = 0; i < enemies.length-1; i++){
			this.queue.push(enemies[i]);
		}
		this.queue.sort(InitiativeLine.compareUnitsByInitiative);
	}

	static compareUnitsByInitiative(unit1, unit2){
		if (unit1.initiative > unit2.initiative) {
			return 1;
		}
		if (unit1.initiative <= unit2.initiative) {
			return -1;
		}
	}

}