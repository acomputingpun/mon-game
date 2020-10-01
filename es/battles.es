import * as vecs from '/es/vectors.es'
import * as dirconst from '/es/dirconst.es'

import * as drawscions from '/es/ui/drawscions.es'
import * as nodes from '/es/nodes.es'
import * as menus from '/es/menus.es'

export class BattleMonster {
    constructor(monster) {
        this.monster = monster

        this.health = 100

        this.possibleActions = [new BattleAction(), new BattleAction(), new BattleAction()]
    }

    doSubmitAction(action) {
        if (! this.possibleActions.includes(action)) {
            throw `Submitted invalid action! ${action}`
        }
    }
}

export class BattleAction {
    constructor() {
    }
    get monster() { return this._monster }

    rollDamage() { throw "To be overridden!" }
    get desc() { throw "To be overridden!" }
    get damageMods() {}

    get shortText() { throw "To be overridden!" }
    get shortName() { return "?UNDEF ACTION?" }
}

class BodySlam extends BattleAction {
    constructor() {
        //10 damage
    }

    getDamage() { return this.monster.strength }
}

class Stomp extends BattleAction {
    constructor() {
    }
}

export class Battle {
    constructor(location, monster) {
        this.location = location

        this.playerMonster = new BattleMonster(monster)
        this.enemyMonster = null

        this.curTurn = this.playerMonster
    }
    get state() { return this.location.state }

    createNode() {
        return new BattleNode(this)
    }
}


class ActionMenu extends menus.MenuPanel {
    constructor(parent) {
        super(parent)

        this.menuItems = []
        this.refreshMenuItems()
        this.selectedIndex = 0
    }

    get battle() { return this.parent.battle }
    get playerMonster() { return this.battle.playerMonster }
    get enemyMonster() { return this.battle.enemyMonster }

    refreshMenuItems() {
        this.menuItems = this.playerMonster.possibleActions.map((action) => new menus.MenuItem(action.shortName, action))
    }

    doSelect() {
        this.playerMonster.doSubmitAction(this.selectedMenuItem.data)
    }

    drawContents() {
        this.ctx.fillStyle="#CCC"
        this.ctx.fillRect(...this.anchorAbs.xy, 120, 480)
        super.drawContents()
    }
    drawMenuItem(drawAbs, index) {
        let menuItem = this.menuItems[index]
        if (index == this.selectedIndex) {
            this.ctx.fillStyle="#0C0"
        } else {
            this.ctx.fillStyle="#CF0"
        }
        this.ctx.fillRect(...drawAbs.xy, 300, 90)

        this.renderer.drawChars("ABCDEF", ...drawAbs.xy)

        return drawAbs.add(vecs.Vec2(0, 100))
    }
}

class ActionFocusPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#FCC"
        this.ctx.fillRect(...this.anchorAbs.xy, 400, 400)

        this.renderer.drawChars("hajrttes", ...this.anchorAbs.xy)

        super.drawContents()
    }
}

class MessageTickerPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#AAB"
        this.ctx.fillRect(...this.anchorAbs.xy, 600, 120)
        super.drawContents()
    }
}

class MonsterStatsPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#AB0"
        this.ctx.fillRect(...this.anchorAbs.xy, 400, 400)
        super.drawContents()
    }
}

class MapPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#D07"
        this.ctx.fillRect(...this.anchorAbs.xy, 400, 400)
    }
}

class MonsterHealthBar extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#F0B"
        this.ctx.fillRect(...this.anchorAbs.xy, 480, 30)
    }
}
class EnemyHealthBar extends MonsterHealthBar {
    drawContents() {
        this.ctx.fillStyle="#C0C"
        this.ctx.fillRect(...this.anchorAbs.xy, 480, 30)
    }
}

export class BattleNode extends nodes.Node {
    constructor(battle) {
        super(battle.state)
        this.battle = battle

        this.actionMenu = new ActionMenu(this)
        this.actionMenu.anchorPos = vecs.Vec2(12, 48)

        this.actionFocusPanel = new ActionFocusPanel(this)
        this.actionFocusPanel.anchorPos = vecs.Vec2(12, 480)

        this.mapPanel = new MapPanel(this)
        this.mapPanel.anchorPos = vecs.Vec2(480, 48)

        this.monsterStatsPanel = new MonsterStatsPanel(this)
        this.monsterStatsPanel.anchorPos = vecs.Vec2(186, 48)

        this.monsterHealthBar = new MonsterHealthBar(this)
        this.monsterHealthBar.anchorPos = vecs.Vec2(6,6)

        this.enemyHealthBar = new MonsterHealthBar(this)
        this.enemyHealthBar.anchorPos = vecs.Vec2(480,6)

        this.messageTickerPanel = new MessageTickerPanel(this)
        this.messageTickerPanel.anchorPos = vecs.Vec2(480, 504)

        this.children = [this.actionMenu, this.actionFocusPanel, this.messageTickerPanel, this.monsterHealthBar, this.enemyHealthBar, this.monsterStatsPanel, this.mapPanel]

        this.activeWarpPanel = this.actionMenu
    }

//    get lab() { return this.tank.lab }
    get monster() { return this.battle.monster }

    drawContents() {
    }

    doCancel() {
//        this.state.curNode = this.lab.createNode()
    }

    warpKeydown(event) {
        if (event.key == "ArrowDown") {
            this.warpArrowKey(dirconst.S)
        } else if (event.key == "ArrowUp") {
            this.warpArrowKey(dirconst.N)
        } else if (event.key == "ArrowLeft") {
            this.warpArrowKey(dirconst.W)
        } else if (event.key == "ArrowRight") {
            this.warpArrowKey(dirconst.E)
        } else if (event.key == "Enter") {
            this.warpSelectKey()
        } else if (event.key == "Escape") {
            this.warpCancelKey()
        } else {
            console.log("AK dir", event)
        }
    }

    warpArrowKey(dir) {
        this.activeWarpPanel.warpArrowKey(dir)
    }
    warpSelectKey() {
        this.activeWarpPanel.doSelect()
    }
    warpCancelKey() {
        this.activeWarpPanel.doCancel()
    }
}
