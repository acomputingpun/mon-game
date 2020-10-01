import * as ui from '/es/ui.es'
import * as states from '/es/states.es'

export class GameRunner {
    constructor() {
        this.state = new states.State(this)
        this.renderer = new ui.Renderer(this)
    }

    main () {
        this.renderer.startDrawLoop()
    }
}
