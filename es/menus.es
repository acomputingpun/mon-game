import * as drawscions from '/es/ui/drawscions.es'
import * as dirconst from '/es/dirconst.es'
import * as utils from '/es/utils.es'

export class MenuItem {
    constructor (text, data) {
        this.text = text
        this.data = data
    }
}

export class MenuPanel extends drawscions.Scion {
    constructor(parent) {
        super(parent)
        this.menuItems = []
        this._highlightedIndex = null
    }

    get highlightedIndex() { return this._highlightedIndex }

    shiftHighlightedIndex(delta) {
        this.setHighlightedIndex(utils.median3(0, (this._highlightedIndex + delta), this.menuItems.length-1))
    }
    setHighlightedIndex(value) {
        this._highlightedIndex = value
    }
    clearHighlightedIndex() {
        this._highlightedIndex = null
    }
    warpArrowKey(dir) {
        if (this._highlightedIndex == null) {
            throw `Can't shift selected index in menu ${this}, it's null!`
        } else {
            if (dir.xy == dirconst.S.xy) {
                this.shiftHighlightedIndex(1)
            } else if (dir.xy == dirconst.N.xy) {
                this.shiftHighlightedIndex(-1)
            }
        }
    }

    drawContents() {
        let xyDrawAbs = this.anchorAbs
        for (let [index, menuItem] of this.menuItems.entries()) {
            xyDrawAbs = this.drawMenuItem(xyDrawAbs, index)
        }
    }
    drawMenuItem(drawAbs, index) {
        let menuItem = this.menuItems[index]
        //
        return xyDrawAbs.add(vecs.Vec2(0, 100))
    }

    doSelect() {
        throw "To be overridden!"
    }
    doCancel() {
        throw "To be overridden!"
    }
    get highlightedData() {
        if (this._highlightedIndex != null) {
            return this.menuItems[this._highlightedIndex].data
        } else {
            return null
        }
    }
}
