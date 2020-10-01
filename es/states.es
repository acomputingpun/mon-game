import * as pseudo from '/es/pseudo.es'
import * as rulesets from '/es/rulesets.es'
import * as nodes from '/es/nodes.es'
import * as labs from '/es/labs.es'
import * as cities from '/es/cities.es'
import * as names from '/es/names.es'
import * as utils from '/es/utils.es'
import * as hacks from '/es/hacks.es'
import * as menus from '/es/menus.es'

export class State {
    constructor(runner) {
        this.runner = runner
        this.nameMaker = null
        this.roller = null
        this.ruleset = null

        this.lab = null
        this.city = null
        this.inventory = null

        this.curNode = new StartGameNode(this)
    }

    doStartGame(docName) {
        this.docName = docName
        this.setupRuleset(utils.easyHash(docName))
        this.lab = new labs.Lab(this)
        this.city = new cities.City(this)
        this.inventory = new Inventory(this)
        this.curNode = this.lab.createNode()
    }
    setupRuleset(seed) {
        this.seed = seed
        this.roller = new pseudo.Roller(seed)
        this.ruleset = new rulesets.StubRuleset(this.roller)
        this.nameMaker = new names.NameMaker(this)
    }

    doStartDebug(docName) {
        this.doStartGame(docName)
        let tank = this.lab.tanks[0]
        tank.createMonster( [...tank.baseDNAStrings()][0] )
        this.curNode = this.city.createNode(tank.monster)
    }
}

const FAST_START = true

export class Inventory {
    constructor(state) {
        this.state = state
        this.research = 0
        this.week = 1
        this.genes = 0
        this.rGenes = new hacks.NumberedDictionary()

        if (FAST_START) {
            this.research = 1000
            this.genes = 7
        }
    }
}

export class StartGameNode extends nodes.MenuNode {
    constructor(state) {
        super(state)
        this.menuItems = [new menus.MenuItem("start game", this.doStartGame), new menus.MenuItem("start debug", this.doStartDebug), new menus.MenuItem("enter seed", this.doEnterSeed)]
    }

    drawContents() {
        this.drawMenuItems(500, 300)
    }

    doStartDebug() {
        this.state.doStartDebug("Dr. Destruction")
    }
    doStartGame() {
        this.state.doStartGame("Dr. Destruction")
    }
    doEnterSeed() {
        console.log("seed", this)
        this.state.curNode = new EnterSeedNode(this)
    }
}

export class EnterSeedNode extends nodes.TextInputNode {
    constructor(parent) {
        super(parent.state)
    }

    warpInputSelect(text) {
        this.state.doStartGame(`Dr. ${text}`)
    }
}

