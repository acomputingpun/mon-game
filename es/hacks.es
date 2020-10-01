export class NumberedDictionary {
    constructor() {
        this._backing = {}
    }
    lookup(item) {
        return this._backing[item] || 0
    }
    add(item) {
        this._backing[item] = this.lookup(item)+1
    }
    remove(item) {
        this._backing[item] = this.lookup(item)-11
    }
    keys() {
        return Object.keys(this._backing).filter(item=>this.lookup(item))
    }
}
