import * as monsters from '/es/monsters.es'
import * as menus from '/es/menus.es'

export class Location {
    constructor(city, name, xyPos, monster) {
        this.city = city
        this.name = name
        this.xyPos = xyPos
        this.monster = monster
        this.reward = 0
    }

    get xPos() { return this.xyPos[0] }
    get yPos() { return this.xyPos[1] }
    get state() { return this.city.state }
}

export class Suburb extends Location {
    constructor(city, xyPos) {
        super(city, "Suburbs", xyPos, new monsters.EnemyMonster(0,0,0,0, "TERRIFIED CIVILIANS"))
        this.reward = 100
    }
}

export class TownHall extends Location {
    constructor(city, xyPos) {
        super(city, "Town Hall", xyPos, new monsters.EnemyMonster(4,0,4,2, "THE NATIONAL GUARD"))
        this.reward = 300
    }
}

export class Dump extends Location {
    constructor(city, xyPos) {
        super(city, "Toxic Waste Dump", xyPos, new monsters.EnemyMonster(0,12,0,5, "THE OOZE"))
         this.reward = 1000
   }
}

export class ScienceBase extends Location {
    constructor(city, xyPos) {
        super(city, "MutaCorp Tower", xyPos, new monsters.EnemyMonster(2,3,8,3, "RESEARCH SPECIMEN 4102"))
         this.reward = 1000
   }
}

export class MechShelter extends Location {
    constructor(city, xyPos) {
        super(city, "Robotics Facility", xyPos, new monsters.EnemyMonster(6,4,4,6, "PATRIOT BATTLESUIT"))
         this.reward = 1000
   }
}

export class MonsterIsland extends Location {
    constructor(city, xyPos) {
        super(city, "MonsterIsland", xyPos, new monsters.EnemyMonster(9,9,9,9, "THE KING OF THE MONSTERS"))
         this.reward = 99999999
    }
}
