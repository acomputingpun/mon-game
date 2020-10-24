import * as colours from '/es/ui/colours.es'
import * as fonts from '/es/ui/fonts.es'
import * as dirconst from '/es/dirconst.es'
import * as utils from '/es/utils.es'
import * as drawscions from '/es/ui/drawscions.es'

export class Node extends drawscions.Ancestor {
    constructor(state) {
        super(state)
    }

    warpKeydown(event) {
    }
    warpKeypress(event) {
    }

// Drawing functions

    drawContents() {
        throw "Called drawContents() of base Node!"
    }

    drawHud() {
        this.ctx.strokeRect(50, 770, 1000, 30)
        this.ctx.fillText(`RESEARCH ${this.state.inventory.research}`, 60, 775)
        this.ctx.fillText(`GENES ${this.state.inventory.genes}`, 260, 775)
        this.ctx.fillText(`WEEK ${this.state.inventory.week}`, 660, 775)
    }

    drawMonsterStats(xDraw, yDraw, monster) {
        this.ctx.strokeRect(xDraw, yDraw, 350, 210)

        this.ctx.strokeStyle=colours.MAIN_TEXT
        this.ctx.fillStyle=colours.MAIN_TEXT
        this.ctx.font = fonts.MONSTER_STAT_TEXT
        this.ctx.textBaseline = "top"
        this.ctx.textAlign = "center"

        this.ctx.fillText(monster.monName, xDraw+175, yDraw+10)

        this.ctx.strokeRect(xDraw+10, yDraw+50, 330, 30)
        this.ctx.strokeRect(xDraw+10, yDraw+90, 330, 30)
        this.ctx.strokeRect(xDraw+10, yDraw+130, 330, 30)
        this.ctx.strokeRect(xDraw+10, yDraw+170, 330, 30)

        this.ctx.textAlign = "right"
        this.ctx.fillText("STRENGTH", xDraw+280, yDraw+55)
        this.ctx.fillText("AGILITY", xDraw+280, yDraw+95)
        this.ctx.fillText("INTELLECT", xDraw+280, yDraw+135)
        this.ctx.fillText("ENDURANCE", xDraw+280, yDraw+175)

        this.ctx.textAlign = "left"
        this.ctx.fillText(monster.strength, xDraw+300, yDraw+55)
        this.ctx.fillText(monster.agility, xDraw+300, yDraw+95)
        this.ctx.fillText(monster.intellect, xDraw+300, yDraw+135)
        this.ctx.fillText(monster.endurance, xDraw+300, yDraw+175)
   }
}

export class MenuNode extends Node {
    constructor(state) {
        super(state)
        this.menuItems = []
        this.highlightedIndex = 0
    }

    get xyMenuShift() { return [0, 50] }
    get xMenuShift() { return this.xyMenuShift[0] }
    get yMenuShift() { return this.xyMenuShift[1] }
    get font() { return fonts.MENU_TEXT }

    drawContents() {
        this.drawHud()
        this.drawMenuItems(100, 100)
    }

    drawMenuItems(xDraw, yDraw) {
        for (let menuItem of this.menuItems) {
            this.drawMenuItem(xDraw, yDraw, menuItem)
            xDraw += this.xMenuShift
            yDraw += this.yMenuShift
        }
    }

    drawMenuItem(xDraw, yDraw, menuItem) {
        let index = this.menuItems.indexOf(menuItem)
        let iChar = "123456789"[index]
        this.ctx.font = fonts.MENU_TEXT
        this.ctx.fillText(`${iChar}) ${menuItem.text}`, xDraw, yDraw)
    }

    warpKeypress(event) {
        let key = event.key.toLowerCase()
        let charCode = key.charCodeAt(0) - "1".charCodeAt(0)
        if (0 <= charCode && charCode <= 10) {
            this.warpMenuSelectIndex(charCode)
        } else {
            console.log(`uw key |${key}|`)
        }
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
        if (dir.xy == dirconst.S.xy) {
            this.shiftHighlightedIndex(1)
        } else if (dir.xy == dirconst.N.xy) {
            this.shiftHighlightedIndex(-1)
        }
    }
    warpSelectKey(dir) {
        this.warpMenuSelectIndex(this.highlightedIndex)
    }
    shiftHighlightedIndex(delta) {
        this.highlightedIndex = utils.median3(0, (this.highlightedIndex + delta), this.menuItems.length-1)
    }
    get highlightedData() { return this.menuLookup(this.highlightedIndex) }

    warpMenuSelectIndex(index) {
        let menuItem = this.menuLookup(index)
        if (menuItem != null) {
            this.warpMenuSelect(menuItem.data)
        } else {
            console.log(`US menuitem ${index}`)
        }
    }

    warpMenuSelect(data) {
        data.bind(this)()
    }

    menuLookup(index) {
        return this.menuItems[index]
    }
}

export class TextInputNode extends Node {
    constructor(state) {
        super(state)
        this.text = ""
    }

    drawContents() {
        let [xDraw, yDraw] = [100, 100]
        this.ctx.fillText(`enter text:${this.text}`, xDraw, yDraw)
    }

    warpInputSelect(text) {
        throw ("called InputSelect of base node - to be overridden!")
    }

    warpKeydown(event) {
//        console.log("keyis", event)
        if (event.key == "Backspace") {
            this.text = this.text.slice(0, -1)
        }
    }
    warpKeypress(event) {
        if (event.key == "Enter") {
            this.warpInputSelect(this.text)
        } else {
            this.text = this.text.concat(event.key)
        }
    }
}
