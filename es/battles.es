import * as vecs from '/es/vectors.es'
import * as dirconst from '/es/dirconst.es'
import * as utils from '/es/utils.es'

import * as drawscions from '/es/ui/drawscions.es'
import * as animas from '/es/ui/animas.es'
import * as nodes from '/es/nodes.es'
import * as menus from '/es/menus.es'
import * as actions from '/es/actions.es'

export class BattleMonster {
    constructor(parent, monster) {
        this.parent = parent
        this.monster = monster

        this.health = 100

        this.possibleActions = [new actions.BodySlam(this), new actions.Crush(this), new actions.Overwhelm(this)]
    }

    get otherMonster() {
        if (this == this.parent.playerMonster) {
            return this.parent.enemyMonster
        } else if (this == this.parent.enemyMonster) {
            return this.parent.playerMonster
        } else {
            throw `Error: tried to get OtherMOnster of monster not in parent battle - something has gone very wrong!`
        }
    }

    get shortName() {
        return this.monster.name
    }

    canSubmitAction(action) {
        return this.possibleActions.includes(action)
    }

    doRequestActionFrom(bRunner) {
        throw `To be overridden!`
    }

    lookupStatValue(statName) {
        if (statName == "strength") {
            return this.monster.strength
        } else if (statName == "endurance") {
            return this.monster.endurance
        } else {
            throw `Error - lookup of invald stat value ${statName}`
        }
    }
}

export class PlayerBattleMonster extends BattleMonster {
    doRequestActionFrom(bRunner) {
        console.log("Completed enemy turn, now player turn to choose action!")
        bRunner.node.doActionMenu()
    }
}
export class EnemyBattleMonster extends BattleMonster {
    doRequestActionFrom(bRunner) {
        console.log("Completed player turn, now enemy turn!")
        let action = this.selectAction()
        bRunner.doSubmitAction(action)
    }

    selectAction() {
        return this.possibleActions[0]
    }
}

export class Battle {
    constructor(location, monster) {
        this.location = location

        this.playerMonster = new PlayerBattleMonster(this, monster)
        this.enemyMonster = new EnemyBattleMonster(this, location.monster)

        this.curTurn = this.playerMonster
    }
    get state() { return this.location.state }

    createNode() {
        return new BattleNode(this)
    }
    advanceTurn() {
        if (this.curTurn == this.playerMonster) {
            this.curTurn = this.enemyMonster
        } else if (this.curTurn == this.enemyMonster) {
            this.curTurn = this.playerMonster
        } else {
            throw `ERROR: battle initiative fault - turn assigned to nonexistant actor`
        }
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
        this.parent.bRunner.doSubmitAction(this.selectedMenuItem.data)
    }
    doRefresh() {
        // TODO: Does an animation to flicker the menu as it repopulates itself
        this.refreshMenuItems()
        this.selectedIndex = 0
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
//            console.log("checking", message, "AM", this.activeMessages)
            if (message.finished) {
                utils.aRemove(this.activeMessages, message)
            }
        }
        if (this.activeMessages.length == 0 && this.hasFocus) {
            this.parent.bRunner.doCompleteAction()
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
        this.parent.bRunner.doCompleteAction()
    }
    doCancel() {
    }
    addMessage(messageText) {
        let message = new Message(this, messageText).doStart()
        this.messages.push(message)
        this.activeMessages.push(message)
    }
}

class Message extends animas.Anima {
    constructor(parent, messageText) {
        super()
        this.parent = parent
        this.messageText = messageText
    }

    get durationMS() { return this.messageText.length * this.letterMS }
    get letterMS() { return 25 }

    get visibleText() {
        if (this.finished) {
            return this.messageText
        } else {
            return this.messageText.slice( 0, this.localMS / this.letterMS )
        }
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

class BarAnima extends animas.Anima {
    constructor(parent, initialValue, maxValue) {
        super(parent)
        this._targetValue = initialValue
        this._baseValue = initialValue
        this._maxValue = maxValue
    }

    get durationMS () { return Math.abs(this._targetValue - this._baseValue) * this.fillMoveMS }
    get fillMoveMS() { return 30 }

    get value() {
        if (!this.running) {
            return this._targetValue
        } else {
            return this._baseValue + ((this._targetValue - this._baseValue) * this.frac)
        }
    }
    get valueFrac() {
        return this.value / this._maxValue
    }

    adjustTo(value) {
        this.adjust( this.value - value )
    }

    adjust(delta) {
        let newBaseValue = this.value
        this._baseValue = newBaseValue
        this._targetValue = this._targetValue + delta
        this.doStart()
    }
}

class MonsterHealthBar extends drawscions.Scion {
    constructor(parent) {
        super(parent)
        this.barAnima = new BarAnima(this, 90, 100)
    }

    get xDrawSize() { return 480 }

    drawContents() {
        this.ctx.fillStyle="#F0B"
        this.ctx.fillRect(...this.anchorAbs.xy, this.xDrawSize, 30)

        this.ctx.fillStyle="#B5D"
        this.ctx.fillRect(...this.anchorAbs.xy, this.barAnima.valueFrac * this.xDrawSize, 25)

        this.renderer.drawChars(`${Math.trunc(this.barAnima.value)}`, ...this.anchorAbs.xy)
//        this.renderer.drawChars("monhel", ...this.anchorAbs.xy)
    }

    takeDamage(damage) {
        this.barAnima.adjust( -damage )
    }
}

class EnemyHealthBar extends MonsterHealthBar {
    drawContents() {
        this.ctx.fillStyle="#C0C"
        this.ctx.fillRect(...this.anchorAbs.xy, this.xDrawSize, 30)

        this.ctx.fillStyle="#B5D"
        this.ctx.fillRect(...this.anchorAbs.xy, this.barAnima.valueFrac * this.xDrawSize, 25)

        this.renderer.drawChars(`${Math.trunc(this.barAnima.value)}`, ...this.anchorAbs.xy)
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

export class BattleRunner {
    constructor(node) {
        this.node = node
    }
    get battle () { return this.node.battle }

    doSubmitAction(action) {
        if (this.battle.curTurn.canSubmitAction(action)) {
            let rolledAction = action.roll()
            rolledAction.doApply(this)
            this.node.activeWarpPanel = this.node.messageTickerPanel
            this.node.actionMenu.selectedIndex = null
            return true
        } else {
            console.log("Unable to submit action!")
            return false
        }
    }

    doCompleteAction(action) {
        this.battle.advanceTurn()
        this.battle.curTurn.doRequestActionFrom(this)
    }

    addTickerMessage(messageText) {
        this.node.messageTickerPanel.addMessage(messageText)
    }
    dealDamageTo(damage, monster) {
        this.node.lookupHealthBar(monster).takeDamage(damage)
    }

}

export class BattleNode extends nodes.Node {
    constructor(battle) {
        super(battle.state)
        this.battle = battle
        this.bRunner = new BattleRunner(this)

        this.actionMenu = new ActionMenu(this)
        this.actionMenu.anchorPos = vecs.Vec2(12, 48)

        this.actionFocusPanel = new ActionFocusPanel(this)
        this.actionFocusPanel.anchorPos = vecs.Vec2(12, 480)

        this.mapPanel = new MapPanel(this)
        this.mapPanel.anchorPos = vecs.Vec2(480, 48)

        this.monsterStatsPanel = new MonsterStatsPanel(this)
        this.monsterStatsPanel.anchorPos = vecs.Vec2(186, 48)

        this.playerHealthBar = new MonsterHealthBar(this)
        this.playerHealthBar.anchorPos = vecs.Vec2(6,6)

        this.enemyHealthBar = new EnemyHealthBar(this)
        this.enemyHealthBar.anchorPos = vecs.Vec2(500,6)

        this.messageTickerPanel = new MessageTickerPanel(this)
        this.messageTickerPanel.anchorPos = vecs.Vec2(480, 504)

        this.children = [this.actionMenu, this.actionFocusPanel, this.messageTickerPanel, this.playerHealthBar, this.enemyHealthBar, this.monsterStatsPanel, this.mapPanel]

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
        this.actionMenu.doRefresh()
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

    lookupHealthBar(monster) {
        if (monster == this.battle.playerMonster) {
            return this.playerHealthBar
        } else if (monster == this.battle.enemyMonster) {
            return this.enemyHealthBar
        } else {
            console.log("monster is", monster)
            throw `ERROR: looking up healthbar of monster ${monster} not in battle!`
        }
    }
}
