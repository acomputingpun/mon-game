import * as utils from '/es/utils.es'
import * as dna from '/es/dna.es'
import * as mutations from '/es/mutations.es'
import * as genotypes from '/es/genotypes.es'

const DNA_CHUNK_LEN = 3
const DNA_WRAP = false
const BASE_STRING_LEN = 5

class Rule {
    constructor (dnaString, mutation) {
        this.dnaString = dnaString
        this.mutation = mutation
    }

    get genes() { return this.dnaString.genes }
    get chars() { return this.dnaString.chars }
}
class GeneralRuleset {
    constructor(roller) {
        this.roller = roller
        this._backing = {"":null}
        this.setup()
    }

    lookup(dnaString) {
        return this.lookupChars(dnaString.chars)
    }
    lookupChars(chars) {
        return this._backing[chars] || this._backing[""]
    }
    insert(dnaString, mutation) {
        this.insert(dnaString.chars, mutation)
    }
    insertChars(chars, mutation) {
        this._backing[chars] = mutation
    }

    tryInsert(dnaString, mutation) {
        this.tryInsertChars(dnaString.chars, mutation)
    }
    tryInsertChars(chars, mutation) {
        if (this.lookupChars(chars) == null) {
            this.insertChars(mutation)
        }
    }

    getActiveSegments(dnaString) {
        return [...dnaString.allSegments()].filter( (seg) => this.lookup(seg) )
    }
    getActiveSegmentPoses(dnaString) {
        return [...dnaString.allSegmentPoses()].filter( (segpos) => this.lookup(dnaString.slice(...segpos)) )
    }


    getMutations(dnaString) {
        return this._segsToMuts(this.getActiveSegments(dnaString))
    }
    _segsToMuts(segments) {
        return segments.map( segment => this.lookup(segment) )
    }

    get baseGenes() {
        return dna.fromChars("AGTC").genes
    }
    *createBaseDNAStrings() {
        yield new dna.fromChars("AAAAA")
        yield new dna.fromChars("CCCCC")
        yield new dna.fromChars("TTCAA")
        yield new dna.fromChars("TCC01")
        yield new dna.fromChars("UUGGG")
    }
}

export class StubRuleset extends GeneralRuleset {
    setup() {
        this.insertChars( "AA", new mutations.Basic(1,1,1,1) )
        this.insertChars( "CCC", new mutations.Basic(0,0,3,3) )
        this.insertChars( "CC", new mutations.Empty() )
    }
}

/*

export class Ruleset {
    constructor(roller) {
        this.genotypes =  [...genotypes.genotypeClasses.map(genotypeClass => new genotypeClass(roller))]

        this.cTable = {}
        this.setup(roller)

        this._backing = {"":null}
    }

    lookup(dnaString) {
        return this.lookupChars(dnaString.chars)
    }
    lookupChars(chars) {
        return this._backing[chars] || this.backing[""]
    }

    stringToMuts(dnaString) {
        return this.segsToMuts(this.stringToSegs(dnaString))
    }
    stringToSegs(dnaString) {
        return dnaString.allSegments().filter( (seg) => this.lookup(seg) != null )
    }
    segsToMuts(segments) {
        return segments.map( seg => seg.mutation )
    }


///

    setup(roller) {
        let geneChars = dna.genes.map(gene => gene.char)
        let permutations = [...utils.permutations(geneChars, DNA_CHUNK_LEN)]

        for (let permutation of permutations) {
            let cString = permutation.join("")
            let dnaChunk = new DNAChunk(dna.fromString(cString).genes, this)
            dnaChunk.index = dnaChunk.genotype.getNextIndex()
            this.cTable[cString] = dnaChunk
        }

        console.log(this.cTable)
    }

    findGenotype(genotypeClass) {
        for (let genotype of this.genotypes) {
            if (genotype.constructor == genotypeClass) {
                return genotype
            }
        }
        throw (`Can't find genotype ${genotypeClass}`)
    }

    findDNAChunk(genes) {
        return this.cTable[ genes.map(gene=>gene.char).join("") ]
    }

    get baseGenes() {
        return dna.genes.filter(gene => gene.isAnimal)
    }

    *createBaseDNAStrings() {
        for (let baseGene of this.baseGenes) {
            let genes = []
            for (let i = 0; i < BASE_STRING_LEN; i++) {
                genes.push(baseGene)
            }
            yield new DNAString(genes, this)
        }
    }
}

class DNAString {
    constructor(genes, ruleset) {
        this.genes = genes
        this.ruleset = ruleset

        this.chunks = this._toChunks()
        this.mutations = this._toMutations()
    }

    _toChunks() {
        let chunks = []
        let dgenes = this.genes.concat(this.genes) 
        let dlen = DNA_WRAP ? this.genes.length : (this.genes.length+1-DNA_CHUNK_LEN) 
        for (let i = 0; i < dlen; i++) {
            let chunkGenes = []
            for (let j = 0; j < DNA_CHUNK_LEN; j++) {
                chunkGenes.push(dgenes[i+j])
            }
            chunks.push( this.ruleset.findDNAChunk(chunkGenes) )
        }
        return chunks
    }

    _toMutations() {
        return this.chunks.map(chunk => chunk.mutation)
    }

    toString() {
        return this.genes.map(gene => gene.char).join("")
    }

    replace(index, newGene) {
        let newGenes = [...this.genes]
        newGenes[index] = newGene
        return new DNAString(newGenes, this.ruleset)
    }
}

class DNAChunk {
    constructor(genes, ruleset) {
        if (genes.length != DNA_CHUNK_LEN) {
            throw ("invalid chunk length!")
        }
        this.genes = genes
        this.ruleset = ruleset

        this.variance = this.getVariance()
        this.genotype = this.ruleset.findGenotype(this.getGenotypeClass())
    }

    getGenotypeClass() {
        let animal = false
        let alien = false
        let robot = false
        for (let gene of this.genes) {
//            console.log("Gene", gene, "type", gene.gtype)
            if (gene.isAlien) {
                alien = true
            } else if (gene.isAnimal) {
                animal = true
            } else if (gene.isRobot) {
                robot = true
            }
        }

        if (alien && robot && animal) {
            return genotypes.Invalid
        } else if (alien && robot) {
            return genotypes.Invalid
        } else if (alien && animal) {
            return genotypes.AlienHybrid
        } else if (robot && animal) {
            return genotypes.Cyborg
        } else if (animal) {
            if (this.variance == 1) {
                return genotypes.Animal1
            } else if (this.variance == 2) {
                return genotypes.Animal2
            } else {
                return genotypes.Animal3
            }
        } else if (robot) {
            return genotypes.Robot
        } else if (alien) {
            return genotypes.Alien
        } else {
            console.log("this", this)
            throw "Invalid genotype!"
        }
    }
    getVariance() {
        return [...new Set(this.genes)].length
    }

    get mutation() {
        return this.genotype.lookup(this.index)
    }
}*/
