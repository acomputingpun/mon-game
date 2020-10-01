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
    }

    shiftSelectedIndex(delta) {
        this.selectedIndex = utils.median3(0, (this.selectedIndex + delta), this.menuItems.length-1)
    }
    warpArrowKey(dir) {
        if (dir.xy == dirconst.S.xy) {
            this.shiftSelectedIndex(1)
        } else if (dir.xy == dirconst.N.xy) {
            this.shiftSelectedIndex(-1)
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
    get selectedMenuItem() {
        return this.menuItems[this.selectedIndex]
    }
}

