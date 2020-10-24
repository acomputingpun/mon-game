import * as utils from '/es/utils.es'
import * as mutations from '/es/mutations.es'
import * as menus from '/es/menus.es'

export class Monster {
    constructor (tank, dnaString) {
        console.log("Called CM", tank, "DN", dnaString, "this", this)
        this.tank = tank
        this.dnaString = dnaString
        this.monName = this.state.nameMaker.NAME( utils.easyHash(this.dnaString.chars) )

        this.baseMutation = new mutations.Basic(0,0,0,0)
    }

    get state() { return this.tank.state }
    get genes() { return this.dnaString.genes }
    get ruleset() { return this.state.ruleset }

    get allSegmentPoses() { return [...this.dnaString.allSegmentPoses()] }
    get allSegments() { return [...this.dnaString.allSegments()] }
    get activeSegmentPoses() { return this.ruleset.getActiveSegmentPoses(this.dnaString) }
    get activeSegments() { return this.ruleset.getActiveSegments(this.dnaString) }
    get mutations() { return [this.baseMutation, ...this.ruleset.getMutations(this.dnaString)] }

    get strength() { return utils.aSum(this.mutations.map(mut=>mut.strength)) }
    get agility() { return utils.aSum(this.mutations.map(mut=>mut.agility)) }
    get intellect() { return utils.aSum(this.mutations.map(mut=>mut.intellect)) }
    get endurance() { return utils.aSum(this.mutations.map(mut=>mut.endurance)) }

    createFight(other) { return new MonsterFight(this, other) }

    markKnown() {
        for (let mutation of this.mutations) {
            mutation.known = true
        }
    }
}


export class MonsterFight {
    constructor (attacker, defender) {
        this.attacker = attacker
        this.defender = defender
    }

    statComp(a, b) {
        if (a>b) {
            return Math.floor( (a-b)**0.5 )
        } else if (a<b) {
            return -this.statComp(b,a)
        } else {
            return 0
        }
    }

    get aBattle() { return this.statComp(this.attacker.agility, this.defender.agility) }
    get eBattle() { return this.statComp(this.attacker.endurance, this.defender.endurance) }
    get iBattle() { return this.statComp(this.attacker.intellect, this.defender.intellect) }
    get sBattle() { return this.statComp(this.attacker.strength, this.defender.strength) }

    get totalResult() { return this.aBattle + this.eBattle + this.iBattle + this.sBattle }
    get attackerVictory() { return this.totalResult > 0 }
    get defenderVictory() { return this.totalResult < 0 }
}

export class EnemyMonster {
    constructor (a,e,i,s, monName) {
        this.agility=a
        this.endurance=e
        this.intellect=i
        this.strength=s
        this.monName = monName
    }
}
