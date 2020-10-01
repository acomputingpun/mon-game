export class Mutation {
    constructor () {
        this.known = false
    }

    adjustStats(aeis, specialAtts) {
        let [a,e,i,s] = aeis
        return [a+this.a, e+this.e, i+this.i, s+this.s]
    }

    get strength() {
        return this.s
    }
    get endurance() {
        return this.e
    }
    get agility() {
        return this.a
    }
    get intellect() {
        return this.i
    }
    
    get knownDesc() {
        let items = []
        if (this.s > 0) {
            items.push(`STR +${this.s}`)
        } else if (this.s < 0) {
            items.push(`STR ${this.s}`)
        }

        if (this.a > 0) {
            items.push(`AGI +${this.a}`)
        } else if (this.a < 0) {
            items.push(`Agility ${this.a}`)
        }

        if (this.i > 0) {
            items.push(`INT +${this.i}`)
        } else if (this.i < 0) {
            items.push(`INT ${this.i}`)
        }

        if (this.e > 0) {
            items.push(`END +${this.e}`)
        } else if (this.e < 0) {
            items.push(`END ${this.e}`)
        }

        return items.join(", ")
    }
    get unknownDesc() {
        return "???"
    }
    get desc() {
        if (this.known) {
            return this.knownDesc
        } else {
            return this.unknownDesc
        }
    }
}

export class Basic extends Mutation {
    constructor (a,e,i,s) {
        super()
        this.a=a
        this.e=e
        this.i=i
        this.s=s
    }
}

export class Empty extends Mutation {
    constructor () {
        super()
        this.a=0
        this.e=0
        this.i=0
        this.s=0
    }
}
