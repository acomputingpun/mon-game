import * as utils from '/es/utils.es'

export function rand(seed) {
    if (seed < 0) {
        return ((-seed) ** (1.9 - 1/seed)) % 1
    } else if (seed > 0) {
        return (seed ** (1.1 + 1/seed)) % 1
    } else {
        return 0
    }
}

export function randint(seed, smallest, largest) {
    return smallest + Math.floor(rand(seed) * (largest-smallest))
}

export function choice(seed, items) {
    return items[randint(seed, 0, items.length)]
}

export function shuffle(seed, items) {
    let ilen = items.length
    for (let k = 0; k < ilen; k++) {
        let j = randint(seed+k, 0, ilen)
        [items[k], items[j]] = [items[j], items[k]]
    }
}

export function halfbell(seed) {
    return utils.toHalfbell(rand(seed))
}


export class Roller {
    constructor(firstSeed) {
        this.seed = firstSeed
    }

    rand() {
        return rand(this.seed++)
    }
    randint(smallest, largest) {
        return randint(this.seed++, smallest, largest)
    }
    choice(items) {
        return choice(this.seed++, items)
    }
    shuffle(items) {
        shuffle(this.seed++, items)
    }
}
