import * as nodes from '/es/nodes.es'
import * as fonts from '/es/ui/fonts.es'
import * as tanks from '/es/tanks.es'
import * as menus from '/es/menus.es'

export class Lab {
    constructor(state) {
        this.state = state
        this.tanks = [new tanks.Tank(this), new tanks.Tank(this), new tanks.Tank(this)]
    }

    createNode() {
        return new LabNode(this)
    }

    get ruleset() { return this.state.ruleset }
}

////
export class GeneralLabNode extends nodes.MenuNode {
    constructor(lab) {
        super(lab.state)
        this.lab = lab
    }

    drawContents() {
        super.drawContents()
        // draw lab background
        this.ctx.fillText("LAB BACKGROUND HERE", 500, 500)
    }
}

export class WalkToTankNode extends GeneralLabNode {
    constructor(tank) {
        super(tank.lab)
    }

    drawContents() {
        this.state.curNode = this.tank.createNode()
    }
}


export class LabNode extends GeneralLabNode {
    constructor(lab) {
        super(lab)
        for (let [index, tank] of this.lab.tanks.entries()) {
            if (tank.monster == null) {
                this.menuItems.push( new menus.MenuItem(`Create monster in tank ${index} (-300 research, -1 gene)`, tank) )
            } else {
                this.menuItems.push(new menus.MenuItem(`Inspect monster in tank ${index}`, tank) )
            }
        }
        this.menuItems.push(new menus.MenuItem("Perform experiments (+100 research, +1 week)", this.doExperiments) )
        this.menuItems.push(new menus.MenuItem("Synthesise DNA (-200 research, +1 gene)", this.doMakeDNA) )
    }
    
    warpMenuSelect(data) {
        if (this.lab.tanks.includes(data)) {
            this.state.curNode = data.createNode()
        } else {
            super.warpMenuSelect(data)
        }
    }
    doExperiments() {
        this.state.inventory.research += 100
        this.state.inventory.week += 1
    }
    doMakeDNA() {
        if (this.state.inventory.research < 200) {
            console.log("Can't afford it")
        } else {
            this.state.inventory.research -= 200
            this.state.inventory.genes += 1
        }
    }
}

///
