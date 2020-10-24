import * as nodes from '/es/nodes.es'
import * as menus from '/es/menus.es'
import * as colours from '/es/ui/colours.es'
import * as fonts from '/es/ui/fonts.es'
import * as locations from '/es/locations.es'

import * as battles from '/es/battles.es'

export class City {
    constructor(state) {
        this.state = state
        this.locations = [
            new locations.Suburb(this, [30, 200]),
            new locations.TownHall(this, [440, 350]),
            new locations.Dump(this, [900, 40]),
            new locations.ScienceBase(this, [45, 590]),
            new locations.MechShelter(this, [400, 600]),
            new locations.MonsterIsland(this, [800, 550])
        ]
    }

    createNode(monster) {
        if (monster == null) {
            return new ViewCityNode(this)
        } else {
            return new AttackCityNode(this, monster)
        }
    }

    get ruleset() { return this.state.ruleset }
}


export class GeneralCityNode extends nodes.MenuNode {
    constructor(city) {
        super(city.state)
        this.city = city
    }

    get xyMenuShift() { return [0, 0] }
}

export class ViewCityNode extends GeneralCityNode {
    constructor(city) {
        super(city)
        this.menuItems = []
        this.menuItems.push(new menus.MenuItem("never mind", this.doCancel))
    }

    doCancel() {
        this.state.curNode = this.state.lab.createNode()
//        this.state.curNode = new CreateMonsterNode(this.tank)

    }
}

export class AttackCityNode extends GeneralCityNode {
    constructor(city, monster) {
        super(city)
        this.monster = monster
        this.menuItems = []
        this.menuItems.push(new menus.MenuItem("return to lab", null))

        for(let location of this.city.locations) {
            this.menuItems.push(new menus.MenuItem(`${location.locName}`, location))
        }
    }

    drawMenuItem(xDraw, yDraw, menuItem) {
        if (menuItem.data == null) {
            super.drawMenuItem(xDraw, yDraw, menuItem)
        } else {
            super.drawMenuItem(xDraw + menuItem.data.xPos, yDraw + menuItem.data.yPos, menuItem)
        }
    }

    warpMenuSelect(data) {
        if (data != null) {
            this.state.curNode = new battles.Battle(data, this.monster).createNode()

//            this.state.curNode = new AttackLocationNode(data, this.monster)
        } else {
            console.log("choosing")
            this.state.curNode = this.monster.tank.createNode()
        }
    }

}

export class AttackLocationNode extends GeneralCityNode{
    constructor(location, monster) {
        super(location.city)
        this.location = location
        this.monster = monster
        this.enemyMonster = location.monster

        this.monsterFight = this.monster.createFight(this.enemyMonster)

        this.menuItems.push(new menus.MenuItem("return", this.doFinish))
    }

    doFinish() {
        if (this.monsterFight.attackerVictory) {
            this.state.curNode = this.state.lab.createNode()
        } else {
            this.state.curNode = this.state.lab.createNode()
        }
    }

    drawContents() {
        this.drawMonsterFight(50, 50, this.monsterFight)
    }

    drawMonsterFight(xDraw, yDraw, fight) {
        this.drawMonsterStats(xDraw+25, yDraw+25, fight.attacker)
        this.drawMonsterStats(xDraw+425, yDraw+25, fight.defender)

        this.ctx.strokeStyle=colours.MAIN_TEXT
        this.ctx.fillStyle=colours.MAIN_TEXT
        this.ctx.font = fonts.MONSTER_STAT_TEXT
        this.ctx.textBaseline = "top"
        this.ctx.textAlign = "center"

        this.ctx.strokeRect(xDraw, yDraw, 800, 600)

        this.ctx.strokeRect(xDraw+150, yDraw+300, 500, 30)
        this.ctx.strokeRect(xDraw+150, yDraw+340, 500, 30)
        this.ctx.strokeRect(xDraw+150, yDraw+380, 500, 30)
        this.ctx.strokeRect(xDraw+150, yDraw+420, 500, 30)

        this.ctx.fillText("STRENGTH RESULT", xDraw+400, yDraw+310)
        this.ctx.fillText("AGILITY RESULT", xDraw+400, yDraw+350)
        this.ctx.fillText("INTELLECT RESULT", xDraw+400, yDraw+390)
        this.ctx.fillText("ENDURANCE RESULT", xDraw+400, yDraw+430)

        let fillSideBonus = (value, yShift) => {
            if (value >= 0) {
                this.ctx.fillText(`${value}`, xDraw+200, yDraw+yShift)
            }
            if (value <= 0) {
                this.ctx.fillText(`${-value}`, xDraw+600, yDraw+yShift)
            }
        }
        fillSideBonus( fight.sBattle, 310 )
        fillSideBonus( fight.aBattle, 350 )
        fillSideBonus( fight.iBattle, 390 )
        fillSideBonus( fight.eBattle, 430 )

        this.ctx.font = fonts.HUGE_TEXT
        if (fight.attackerVictory) {
            this.ctx.fillText("VICTORY", xDraw+400, yDraw+500)
        } else {
            this.ctx.fillText("DEFEAT", xDraw+400, yDraw+500)
        }
   }
}
