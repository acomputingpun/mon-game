export class BattleAction {
    constructor(monster) {
        this.monster = monster
        this.tickerMessage = `error: ticker message not set for action ${this.shortName}`
    }

    roll() {
        return this
    }

    get otherMonster() { return this.monster.otherMonster }

    get desc() { throw "To be overridden!" }

    get shortText() { throw "To be overridden!" }
    get shortName() { return "?UNDEF ACTION?" }
}

class AttackAction extends BattleAction {
    doApply(node) {
        node.messageTickerPanel.addMessage( this.tickerMessage )
        node.lookupHealthBar(this.monster).takeDamage( this.damage )
    }

    get damageBase() { throw "To be overridden!" }
    get damageScaling() { throw "To be overridden!" }
    get attackStat() { throw "To be overridden!" }
    get defenceStat() { throw "To be overridden!" }

    get attackStatValue() {
        return this.monster.lookupStatValue(this.attackStat)
    }
    get defenceStatValue() {
        return this.monster.lookupStatValue(this.attackStat)
    }

    roll() {
        this.attackValue = this.attackStatValue
        this.defenceValue = this.defenceStatValue

        if (this.attackValue >= this.defenceValue) {
            this.damage = this.damageBase + (this.damageScaling * (this.attackValue - this.defenceValue))
            this.tickerMessage = `${this.monster.shortName} hits ${this.otherMonster.shortName} with ${this.shortName} for ${this.damage} damage!`
        } else {
            this.damage = 0
            this.tickerMessage = `${this.monster.shortName} misses ${this.otherMonster.shortName} with ${this.shortName}.`
        }
        return this
    }

}

export class BodySlam extends AttackAction {
    get damageBase() { return 10 }
    get damageScaling() { return 1 }
    get attackStat() { return "endurance" }
    get defenceStat() { return "endurance" }

    get shortName() { return "BodySlam" }
}

export class Crush extends AttackAction {
    get damageBase() { return 10 }
    get damageScaling() { return 1 }
    get attackStat() { return "strength" }
    get defenceStat() { return "endurance" }

    get shortName() { return "Crush" }
}

export class Overwhelm extends AttackAction {
    get damageBase() { return 10 }
    get damageScaling() { return 1 }
    get attackStat() { return "strength" }
    get defenceStat() { return "strength" }

    get shortName() { return "Overwhelm" }
}
