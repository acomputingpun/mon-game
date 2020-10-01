import * as mutations from '/es/mutations.es'
import * as utils from '/es/utils.es'

export class Genotype {
    constructor(roller) {
        this.index = 0
        this.mutTable = [...this.constructor.baseTable]
        roller.shuffle(this.mutTable)
    }
    getNextIndex() {
        return ++this.index
    }
    lookup(index) {
        return this.mutTable[ index % this.mutTable.length ]
    }

    static get baseTable() {
        return [ "no mut" ]
    }
}

export class Animal1 extends Genotype {
    static get baseTable () {
        return [
            new mutations.Basic(0,0,0,1),
            new mutations.Basic(0,0,1,0),
            new mutations.Basic(0,1,0,0),
            new mutations.Basic(1,0,0,0)
        ]
    }
}
export class Animal2 extends Genotype {
    static get baseTable () {
        return [...utils.combinations([-3, 1, 0, 6])].map(arr=>new mutations.Basic( ...arr ))
    }
}
export class Animal3 extends Genotype {
    static get baseTable () {
        return [...utils.combinations([-6, 7, -1, 10])].map(arr=>new mutations.Basic( ...arr ))
    }
}

export class Alien extends Genotype {
}
export class AlienHybrid extends Genotype {
}
export class Robot extends Genotype {
}
export class Cyborg extends Genotype {
}
export class Invalid extends Genotype {
}

export var genotypeClasses = [ Animal1, Animal2, Animal3, Alien, AlienHybrid, Robot, Cyborg, Invalid ]
