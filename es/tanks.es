import * as fonts from '/es/ui/fonts.es'
import * as colours from '/es/ui/colours.es'
import * as drawscions from '/es/ui/drawscions.es'
import * as ui_genes from '/es/ui/genes.es'

import * as menus from '/es/menus.es'
import * as nodes from '/es/nodes.es'
import * as dna from '/es/dna.es'
import * as monsters from '/es/monsters.es'
import * as vecs from '/es/vectors.es'
import * as dirconst from '/es/dirconst.es'
import * as utils from '/es/utils.es'

var DEBUG_DRAW_TESTING = false

export class Tank {
    constructor(lab) {
        this.lab = lab
        this.monster = null
        this.mutsThisWeek = 1
    }
    createNode() {
        if (this.monster == null && (this.state.inventory.research >= 300 && this.state.inventory.genes >= 1) ) {
            this.state.inventory.research -= 300
            this.state.inventory.genes -= 1
            return new CreateMonsterNode(this)
        } else if (this.monster == null) {
            return this.lab.createNode()
        } else {
            return new FullTankNode(this)
        }
    }

    baseDNAStrings() {
        return this.ruleset.createBaseDNAStrings()
    }
    createMonster(dnaString) {
        this.monster = new monsters.Monster(this, dnaString)
    }
    removeMonster() {
        this.monster = null
    }

    get state() { return this.lab.state }
    get ruleset() { return this.state.ruleset }

    get mutateCost() { return 100 * this.mutsThisWeek }
}

export class GeneralTankNode extends nodes.MenuNode {
    constructor(tank) {
        super(tank.state)
        this.tank = tank
    }

    get lab() { return this.tank.lab }
    get monster() { return this.tank.monster }
    get ruleset() { return this.state.ruleset }

    doCancel() {
        this.state.curNode = this.lab.createNode()
    }

    drawContents() {
        this.drawHud()
        this.drawMenuWindow( 600, 180 )
        this.drawTank( 100, 270 )
        if (this.monster != null) {
            this.drawMonsterStats( 120, 30, this.monster)
        }

        if (DEBUG_DRAW_TESTING) {
            let axy = [100, 200]
            let bxy = [200, 300]
            let cxy = [200, 100]
            let dxy = [300, 200]

            let exy = [400, 300]
            let fxy = [400, 100]
            let gxy = [500, 200]

            this.ctx.beginPath()
            this.ctx.moveTo(...axy)
            this.ctx.bezierCurveTo(...bxy, ...cxy, ...dxy)
            this.ctx.bezierCurveTo(...exy, ...fxy, ...gxy)
            this.ctx.stroke()

            this.ctx.beginPath()
            this.ctx.arc(...axy, 5, 0,2*Math.PI )
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.arc(...bxy, 5, 0,2*Math.PI )
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.arc(...cxy, 5, 0,2*Math.PI )
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.arc(...dxy, 5, 0,2*Math.PI )
            this.ctx.stroke()
        }
    }

    drawTank(xDraw, yDraw) {
        this.ctx.strokeStyle=colours.MAIN_TEXT

        this.ctx.strokeRect(xDraw+0, yDraw+0, 400, 20)
        this.ctx.strokeRect(xDraw+0, yDraw+450, 400, 20)
        this.ctx.strokeRect(xDraw+20, yDraw+20, 360, 430)

        if (this.monster != null) {
            this.drawMonsterForm(xDraw+200, yDraw+220)
        }
    }

    drawMonsterForm(xDraw, yDraw) {
        this.ctx.fillStyle=colours.FADE_TEXT
        this.ctx.textBaseline = "middle"
        this.ctx.textAlign = "center"
        this.ctx.fillText("[monster image here]", xDraw, yDraw)
    }
    drawMenuWindow(xDraw, yDraw) {
        this.ctx.strokeStyle=colours.MAIN_TEXT
        this.ctx.strokeRect(xDraw+0, yDraw+0, 500, 400)

        this.drawMenuItems(xDraw, yDraw)
    }

    drawDNAString(xDraw, yDraw, dnaString) {
        this.ctx.font = fonts.DNA_CHAR
        this.ctx.textBaseline = "middle"
        this.ctx.textAlign = "center"

        for (let gene of dnaString.genes) {
            this.renderer.drawGene(gene, xDraw, yDraw)
            xDraw += 40
        }
    }
}

export class EmptyTankNode extends GeneralTankNode {
    // Unused
    constructor(tank) {
        super(tank)
        this.menuItems.push(new menus.MenuItem("create monster", this.doCreateMonster))
        this.menuItems.push(new menus.MenuItem("create mutant", this.doCreateMutant))
        this.menuItems.push(new menus.MenuItem("never mind", this.doCancel))
    }

    doCreateMonster() {
        this.state.curNode = new CreateMonsterNode(this.tank)
    }
    doCreateMutant() {
    }
}

export class CreateMonsterNode extends GeneralTankNode {
    constructor(tank, dnaStrings) {
        super(tank)
        console.log(this.ctx)
        for (let dnaString of this.tank.baseDNAStrings()) {
            this.menuItems.push(new menus.MenuItem("USE DNA STRING:", dnaString ))
        }
        this.menuItems.push(new menus.MenuItem("cancel", null))
    }

    drawMenuItems(xDraw, yDraw) {
        super.drawMenuItems(xDraw+250, yDraw+25)
    }
    drawMenuItem(xDraw, yDraw, menuItem) {
        this.ctx.fillStyle = colours.MAIN_TEXT
        this.ctx.textAlign = "right"
        this.ctx.textBaseline = "middle"
        super.drawMenuItem(xDraw-10, yDraw, menuItem)
        if (menuItem.data != null) {
            this.drawDNAString(xDraw+10, yDraw, menuItem.data)
        }
    }

    warpMenuSelect(data) {
        if (data != null) {
            this.tank.createMonster(data)
            this.state.curNode = this.tank.createNode()
        } else {
            this.state.inventory.research += 300
            this.state.inventory.genes += 1
            this.state.curNode = this.tank.lab.createNode()
        }
    }
}

export class FullTankNode extends GeneralTankNode {
    constructor(tank) {
        super(tank)
        this.menuItems.push(new menus.MenuItem(`Modify genetic code (-${this.mutateCost} research)`, this.doMutateMonster))
        this.menuItems.push(new menus.MenuItem("Attack the city! (+1 week)", this.doCommandMonster))
        this.menuItems.push(new menus.MenuItem(`Release into the wilds (${this.releaseValue} research)`, this.doReleaseMonster))
        this.menuItems.push(new menus.MenuItem("Back to lab", this.doCancel))
    }
    get releaseValue() {
        return 100
    }

    doMutateMonster() {
        this.state.curNode = new EditStringNode(this.tank)
    }
    doCommandMonster() {
        this.state.curNode = this.state.city.createNode(this.tank.monster)
    }
    doCancel() {
        this.state.curNode = this.lab.createNode()
    }
    doReleaseMonster() {
        this.state.curNode = new AreYouSureReleaseNode (this.tank)
    }
}

export class AreYouSureReleaseNode extends GeneralTankNode {
    constructor(tank) {
        super(tank)
        this.menuItems.push(new menus.MenuItem("never mind", this.doCancel))
        this.menuItems.push(new menus.MenuItem("yes", this.doRelease))
    }
    doRelease() {
        this.tank.removeMonster()
        this.state.curNode = this.tank.createNode()
    }
    doCancel() {
        this.state.curNode = this.tank.createNode()
    }
}

class SideInjectorFlyer extends drawscions.Scion {
    drawContents() {
        this.ctx.drawImage(this.renderer.img.uiScrsel, ...this.anchorAbs.add(vecs.Vec2(-180, -30)).xy )
    }
}
export class CurrentStringSelectorFlyer extends ui_genes.AbstractSelectGenesPanel {
    get genes() { return this.parent.dnaString.genes }
    get geneDrawShift() { return vecs.Vec2(0, 72) }

    constructor(parent) {
        super(parent)
        this.highlightFlyer = new SideInjectorFlyer(this)
        this.children = [this.highlightFlyer]

        this.setHighlightedIndex(0)
    }

    warpArrowKey(dir) {
        if (dir.xy == dirconst.S.xy) {
            this.shiftHighlightedIndex(1)
        } else if (dir.xy == dirconst.N.xy) {
            this.shiftHighlightedIndex(-1)
        }
    }
    doSelect() {
        this.parent.activeWarpPanel = this.parent.insertSelector
        this.parent.insertSelector.setHighlightedIndex( this.parent.insertSelector.genes.indexOf(this.selectedGene) )
        this.parent.refreshAdjustedString()
    }
    doCancel() {
        this.parent.doCancel()
    }
}

class InsertHighlightFlyer extends drawscions.Scion {
    get lTick() { return (this.renderer.renMS / 400) }

    drawContents() {
        this.ctx.fillStyle = "#ffffff"
        this.ctx.globalAlpha = 0.6 + (Math.sin(this.lTick) * 0.15)
        this.ctx.fillRect( this.anchorAbs.x-78, this.anchorAbs.y-6, 138, 66 )
        this.ctx.globalAlpha = 1
    }
}
export class InsertSelectorFlyer extends ui_genes.AbstractSelectGenesPanel {
    get genes() { return this.state.ruleset.baseGenes }
    get geneDrawShift() { return vecs.Vec2(0, 60) }
    get geneDrawAnchor() { return vecs.Vec2(96, 24) }

    constructor(parent) {
        super(parent)
        this.bgSprite = this.renderer.yRepeated(this.renderer.img.uiWinBG, 258)

        this.highlightFlyer = new InsertHighlightFlyer(this)
        this.children = [this.highlightFlyer]
    }

    setHighlightedIndex(value) {
        super.setHighlightedIndex(value)
        this.parent.refreshAdjustedString()
    }
    warpArrowKey(dir) {
        if (dir.xy == dirconst.S.xy) {
            this.shiftHighlightedIndex(1)
        } else if (dir.xy == dirconst.N.xy) {
            this.shiftHighlightedIndex(-1)
        }
    }

    drawContents() {
        this.ctx.drawImage(this.bgSprite, ...this.anchorPos.add(vecs.Vec2(0, 12)).xy)
        this.ctx.drawImage(this.renderer.img.uiWinN, ...this.anchorPos.xy)
        this.ctx.drawImage(this.renderer.img.uiWinS, ...this.anchorPos.add(vecs.Vec2(0, this.bgSprite.height)).xy )

        for (let [index, gene] of this.genes.entries()) {
            this.renderer.drawGene(gene, ...this.nwGeneAbs(index).xy)
            this.ctx.drawImage(this.renderer.img.uiCross, ...this.nwCrossAbs(index).xy )
            this.renderer.drawChars(`0${this.state.inventory.rGenes.lookup(gene)}`.slice(-2), ...this.nwDigitAbs(index).xy )
        }
    }
    doSelect() {
        this.parent.doMutate()
    }
    doCancel() {
        this.parent.activeWarpPanel = this.parent.curStringSelector
        this.clearHighlightedIndex()
        this.parent.refreshAdjustedString()
    }
    get selectedGene() {
        return this.genes[this.highlightedIndex]
    }
    nwCrossAbs(index) { return this.nwGeneAbs(index).add(vecs.Vec2(-24, 18)) }
    nwDigitAbs(index) { return this.nwGeneAbs(index).add(vecs.Vec2(-72, 12)) }
    nwSelectLocal(index) { return this.nwGeneLocal(index).add(vecs.Vec2(-78, -6)) }
}

class LocalMutationBracketsPanel extends drawscions.Scion {
    drawContents() {
        this.ctx.fillStyle = "#99cdde"
        this.ctx.fillRect( this.anchorAbs.x, this.anchorAbs.y, 600, 600 )

        this.ctx.strokeStyle="#FFF"
        this.ctx.lineWidth=6
        this.ctx.beginPath()
        this.ctx.moveTo(this.anchorAbs.x+3, this.anchorAbs.y)
        this.ctx.lineTo(this.anchorAbs.x+3, this.anchorAbs.y+600)

        this.ctx.moveTo(this.anchorAbs.x+597, this.anchorAbs.y)
        this.ctx.lineTo(this.anchorAbs.x+597, this.anchorAbs.y+600)

        this.ctx.stroke()
    }
}
class LocalMutationBracketsFlyer extends ui_genes.AbstractMutationBracketsPanel {
    get genesPanel() { return this.parent.curStringSelector }
}

class ScrollBackground extends drawscions.Scion {
    constructor(parent) {
        super(parent)

        this.bgSprite = this.renderer.yRepeated(this.renderer.img.uiScrollBG, 600)

        this.scrollBack = new ui_genes.AnimatedScrollBackground(this, 600, "scrollAB")
        this.scrollBack.anchorPos = vecs.Vec2(6, 0)

        this.children = [this.scrollBack]
    }
    drawContents() {
        this.ctx.drawImage(this.bgSprite, ...this.anchorPos.xy)
    }
    get geneAnchorPos() {
        return this.anchorPos.add(vecs.Vec2(24, 306))
    }
}

export class EditStringNode extends GeneralTankNode {
    constructor(tank) {
        super(tank)

        this.baseBack = new ScrollBackground(this)
        this.baseBack.anchorPos = vecs.Vec2(264, 72)

        this.curStringSelector = new CurrentStringSelectorFlyer(this)
        this.curStringSelector.anchorPos = this.baseBack.geneAnchorPos.add(vecs.Vec2(0, -this.curStringSelector.geneDrawShift.y*this.monster.dnaString.genes.length*0.5))

        this.insertSelector = new InsertSelectorFlyer(this)
        this.insertSelector.anchorPos = vecs.Vec2(60, 60)

        this.mutsBack = new LocalMutationBracketsPanel(this)
        this.mutsBack.anchorPos = vecs.Vec2(378, 72)

        this.mutsFlyer = new LocalMutationBracketsFlyer(this)
        this.mutsFlyer.anchorPos = vecs.Vec2(0, 0)

        this.activeWarpPanel = this.curStringSelector

//        this.children = [this.scrollBack, this.curStringSelector, this.mutsPanel, this.insertSelector]
        this.children = [this.mutsBack, this.baseBack, this.curStringSelector, this.insertSelector, this.mutsFlyer]
        this.refreshAdjustedString()
        this.mutsFlyer.refreshMuts()
    }

    get dnaString() { return this._adjustedString }
    get genes() { return this.dnaString.genes }

    drawContents() {
        this.mutsFlyer.updateBrackets()
        this.mutsFlyer.updateDescs()
        this.drawHud()
    }
    refreshAdjustedString() {
        if (this.activeWarpPanel == this.curStringSelector) {
            this._adjustedString = this.monster.dnaString
        } else {
            this._adjustedString = this.monster.dnaString.replace(this.curStringSelector.highlightedIndex, this.insertSelector.selectedGene)
        }
        this.mutsFlyer.refreshMuts()
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

    doCancel() {
        this.state.curNode = this.lab.createNode()
    }
    doMutate() {
        if (this.state.inventory.research >= this.mutateCost) {
            this.state.inventory.research -= this.mutateCost
            this.tank.createMonster(this._adjustedString)
            this.state.curNode = this.tank.createNode()
        } else {
            console.log("can't afford it")
        }
    }

    get mutateCost() {
        return this.tank.mutateCost
    }
}
