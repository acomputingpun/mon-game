import * as vecs from '/es/vectors.es'

export class Scion {
    constructor(parent) {
        this.parent = parent
        this.children = []
        this.anchorPos = vecs.Vec2(0, 0)
    }

    get state() { return this.parent.state }
    get runner() { return this.state.runner }
    get renderer() { return this.runner.renderer }
    get ctx() { return this.renderer.ctx }
    get renMS() { return this.renderer.renMS }

    get anchorAbs() { return this.anchorPos.add(this.parent.anchorAbs)  }
    anchorAbsShift(x,y) { return this.anchorAbs.add(vecs.Vec2(x, y)) }

    preDrawTick(){
        this.preDrawTickContents()
        for (let child of this.children) {
            child.preDrawTick()
        }
    }
    preDrawTickContents(){ }

    draw() {
        this.drawContents()
        for (let child of this.children) {
            child.draw()
        }
    }

    drawContents(){ }
}

export class Ancestor extends Scion {
    constructor(state) {
        super(null)
        this._state = state
    }
    get state() { return this._state }
    get anchorAbs() { return vecs.Vec2(0,0) }
}
