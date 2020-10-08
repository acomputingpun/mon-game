import * as vecs from '/es/vectors.es'
import * as dirconst from '/es/dirconst.es'

import * as drawscions from '/es/ui/drawscions.es'
import * as nodes from '/es/nodes.es'
import * as menus from '/es/menus.es'
import * as utils from '/es/utils.es'

export class BattleMonster {
    constructor(monster) {
        this.monster = monster

        this.health = 100

        this.possibleActions = [new BodySlam(), new Crush(), new Overwhelm()]
    }

    canSubmitAction(action) {
        return this.possibleActions.includes(action)
    }
}

export class BattleAction {
    constructor() {
        this.tickerMessage = `error: ticker message not set for action ${this.shortName}`
        this.damage = 0
    }
    get monster() { return this._monster }

    roll() {
        this.damage = 5
    }

    get desc() { throw "To be overridden!" }
    get damageMods() {}

    get shortText() { throw "To be overridden!" }
    get shortName() { return "?UNDEF ACTION?" }
}

class BodySlam extends BattleAction {
    constructor() {
        super()
    }
    get shortName() { return "BodySlam" }
    getDamage() { return this.monster.strength }
}

class Crush extends BattleAction {
    constructor() {
        super()
    }
    get shortName() { return "Crush" }
}

class Overwhelm extends BattleAction {
    constructor() {
        super()
    }
    get shortName() { return "Overwhelm" }
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
        this.parent.doPlayerSubmitAction(this.selectedMenuItem.data)
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
    constructor(parent) {
        super(parent)
        this.messages = []
        this.activeMessages = []
    }

    get hasFocus() {
        return this.parent.activeWarpPanel == this
    }

    preDrawTickContents() {
        for (let message of this.activeMessages) {
            console.log("checking", message, "AM", this.activeMessages)
            if (message.finished) {
                utils.aRemove(this.activeMessages, message)
            }
        }
        if (this.activeMessages.length == 0 && this.hasFocus) {
            this.parent.doCompleteAction()
        }
    }

    drawContents() {
        if (this.hasFocus) {
            this.ctx.fillStyle="#AAB"
        } else {
            this.ctx.fillStyle="#BBC"
        }
        this.ctx.fillRect(...this.anchorAbs.xy, 600, 240)
//        this.renderer.drawChars("msgticker", ...this.anchorAbs.xy)
        super.drawContents()

        this.ctx.fillStyle="#000"
        let yPos = this.anchorAbs.y
        for (let message of this.messages) {
            yPos += this.renderer.wrapText(message.visibleText, this.anchorAbs.x, yPos, 600, 10)
        }
    }

    warpArrowKey(dir) {
    }
    doSelect() {
        for (let message of this.activeMessages) {
            message.doFinish()
        }
        this.parent.doCompleteAction()
    }
    doCancel() {
    }
    addMessage(messageText) {
        let message = new Message(this, messageText)
        this.messages.push(message)
        this.activeMessages.push(message)
    }
}

class Message {
    constructor(parent, messageText) {
        this.parent = parent
        this.startMS = this.renMS
        this.messageText = messageText
    }
    get renMS() { return this.parent.renMS }
    get localMS() { return this.renMS - this.startMS }
    get finishMS() { return this.messageText.length * 25 }
    get frac() { return Math.min(this.localMS / this.finishMS, 1) }
    get finished() { return this.frac >= 1 }

    get visibleText() {
        if (this.finished) {
            return this.messageText
        } else {
            return this.messageText.slice( 0, this.localMS / 25 )
        }
    }
    doFinish() {
        this.startMS = this.renMS - this.finishMS
    }
}

class MonsterStatsPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#AB0"
        this.ctx.fillRect(...this.anchorAbs.xy, 400, 400)
        this.renderer.drawChars("monstatspanel", ...this.anchorAbs.xy)

        super.drawContents()
    }
}

class MapPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#D07"
        this.ctx.fillRect(...this.anchorAbs.xy, 400, 400)
        this.renderer.drawChars("mappanel", ...this.anchorAbs.xy)

        super.drawContents()
    }
}

class MonsterHealthBar extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle="#F0B"
        this.ctx.fillRect(...this.anchorAbs.xy, 480, 30)
        this.renderer.drawChars("monhel", ...this.anchorAbs.xy)

        super.drawContents()
    }
}
class EnemyHealthBar extends MonsterHealthBar {
    drawContents() {
        this.ctx.fillStyle="#C0C"
        this.ctx.fillRect(...this.anchorAbs.xy, 480, 30)
        this.renderer.drawChars("enhel", ...this.anchorAbs.xy)
    }
}

export class AdvancingActionWarp {
    constructor(parent) {
        this.parent = parent
    }

    warpArrowKey(dir) {
        console.log("AAW wak", dir)
    }
    doCancel() {
        console.log("AAW docancel")
    }
    doSelect() {
        console.log("AAW dossel")
    }

}

export class PerformAttackWarp extends AdvancingActionWarp {
    constructor(parent) {
        this.parent = parent
    }

    begin() {
        this.parent.messageTickerPanel.addMessage("This is a test message that is occuring because the player selected an attack!")
    }

    drawContents() {
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

        this.enemyHealthBar = new EnemyHealthBar(this)
        this.enemyHealthBar.anchorPos = vecs.Vec2(480,6)

        this.messageTickerPanel = new MessageTickerPanel(this)
        this.messageTickerPanel.anchorPos = vecs.Vec2(480, 504)

        this.children = [this.actionMenu, this.actionFocusPanel, this.messageTickerPanel, this.monsterHealthBar, this.enemyHealthBar, this.monsterStatsPanel, this.mapPanel]

        this.advanceBattleWarp = new AdvancingActionWarp(this)

        this.activeWarpPanel = this.actionMenu
    }

//    get lab() { return this.tank.lab }

    drawContents() {
    }

    doCancel() {
//        this.state.curNode = this.lab.createNode()
    }

    doActionMenu() {
        this.activeWarpPanel = this.actionMenu
    }

    doPlayerSubmitAction(action) {
        if (this.battle.playerMonster.canSubmitAction(action)) {
            action.roll()
            this.activeWarpPanel = this.messageTickerPanel
            this.messageTickerPanel.addMessage( action.tickerMessage )
        } else {
            console.log("Unable to submit action!")
        }
    }
    doEnemyAction() {
    }

    doCompleteAction(action) {
        if (this.battle.curTurn == this.battle.playerMonster) {
            this.doActionMenu()
        } else {
            this.doEnemyAction()
        }
    }

    /*
    doAdvanceBattle() {
        if (this.battle.curTurn == this.battle.playerMonster) {
            if (this.battle.playerMonster.curAction == null) {
                if (this.activeWarp == null) {
                    this.activeWarp = this.actionMenu
                } else {
                    throw ("Well this shouldn't have happened!")
                }
            } else {
                if (this.activeWarp != this.messageTickerPanel) {
                    this.activeWarp = this.advanceBattleWarp
                }
            }
        } else if (this.battle.curTurn == this.battle.enemyMonster) {
            this.activeWarp = this.advanceBattleWarp
        } else {
            throw ("ERROR: battle turn incompatibility")
        }
    }
    */

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
