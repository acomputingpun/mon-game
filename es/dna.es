import * as utils from '/es/utils.es'

class dnaGeneral {
    static get img() { return `gene${this.char}` }
    static get gtype() { return null }
    static get isAnimal() { return this.gtype == "animal" }
    static get isRobot() { return this.gtype == "robot" }
    static get isAlien() { return this.gtype == "alien" }
}

class dnaAnimal extends dnaGeneral {
    static get gtype() { return "animal" }
}
class dnaAlien extends dnaGeneral {
    static get gtype() { return "alien" }
}
class dnaRobot extends dnaGeneral {
    static get gtype() { return "robot" }
    static get backCol() { return "#999" }
}

let aRed = utils.hsvToHex(0, 0.45, 0.95)
let aDarkRed = utils.hsvToHex(0, 0.75, 0.55)

let aYlw = utils.hsvToHex(0.16, 0.45, 0.95)
let aDarkYlw = utils.hsvToHex(0.16, 0.75, 0.55)

let aGrn = utils.hsvToHex(0.33, 0.45, 0.95)
let aDarkGrn = utils.hsvToHex(0.33, 0.75, 0.55)

let aBlu = utils.hsvToHex(0.66, 0.45, 0.95)
let aDarkBlu = utils.hsvToHex(0.66, 0.75, 0.55)

class dnaA extends dnaAnimal {
    static get foreCol() { return aDarkRed }
    static get backCol() { return aRed }
    static get char() { return "A" }
}
class dnaG extends dnaAnimal {
    static get foreCol() { return aDarkGrn }
    static get backCol() { return aGrn }
    static get char() { return "G" }
}
class dnaT extends dnaAnimal {
    static get foreCol() { return aDarkBlu }
    static get backCol() { return aBlu }
    static get char() { return "T" }
}
class dnaC extends dnaAnimal {
    static get foreCol() { return aDarkYlw }
    static get backCol() { return aYlw }
    static get char() { return "C" }
}

class dna0 extends dnaRobot {
    static get foreCol() { return "#DDC" }
    static get char() { return "0" }
}
class dna1 extends dnaRobot {
    static get foreCol() { return "#DDC" }
    static get char() { return "1" }
}

class dnaU extends dnaAlien {
    static get foreCol() { return "#C0C" }
    static get backCol() { return "#222" }
    static get char() { return "U" }
}


let animalGenes = [dnaA, dnaG, dnaC, dnaT]
let robotGenes = [dna0, dna1]
let alienGenes = [dnaU]
export var genes = [...animalGenes, ...robotGenes, ...alienGenes]
//export var genes = [...animalGenes]

export function fromChar(char) {
    for (let gene of genes) {
        if (gene.char == char) {
            return gene
        }
    }
    throw `Invalid DNA char - ${char}`
}

export function fromChars(chars) {
    return new DNAString( [...chars].map( (char) => fromChar(char) ) )
}

class DNAString {
    constructor(genes) {
        this.genes = genes
    }

    get chars () { return [...this.genes].map((gene) => gene.char).join("") }
    get length() { return this.genes.length }

    replace(index, newGene) {
        let newGenes = [...this.genes]
        newGenes[index] = newGene
        return new DNAString(newGenes)
    }
    replaceChar(index, char) {
        return this.replace(index, fromChar(char))
    }

    slice(start, end) {
        return new DNAString(this.genes.slice(start, end))
    }

    *allSegmentPoses() {
        for (let index = 0; index < this.genes.length; index++) {
            for (let k = index; k < this.genes.length; k++) {
                yield [index, k+1]
            }
        }
    }
    *allSegments() {
        for (let index = 0; index < this.genes.length; index++) {
            yield* this.segmentsFrom(index)
        }
    }
    *segmentsFrom(index) {
        for (let k = index; k < this.genes.length; k++) {
            yield this.slice(index, k+1)
        }
    }
}
