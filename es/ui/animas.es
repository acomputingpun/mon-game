export class Anima {
    constructor() {
        this.startMS = null
    }
    get renMS() { return this.parent.renMS }
    get localMS() { return this.renMS - this.startMS }
    get frac() { return Math.min(this.localMS / this.durationMS, 1) }
    get finished() { return this.frac >= 1 }
    get started() { return this.startMS != null }

    get durationMS() { throw `Not implemeted durationMS() of anima ${this}` }

    doStart() {
        this.startMS = this.renMS
        return this
    }
    doFinish() {
        this.startMS = this.renMS - this.durationMS
        return this
    }
}
