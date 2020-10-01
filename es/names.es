import * as pseudo from '/es/pseudo.es'

let DEBUG_BORING_NAMES = true

export class NameMaker {
    constructor(state) {
        this.state = state
    }

    NAME(seed) {
        this.roller = new pseudo.Roller(this.state.seed + seed)
        if (DEBUG_BORING_NAMES) {
            return "THE MONSTER"
        } else {
            return [this.TITLE(), this.ADJECTIVE(), this.NAMESET(), this.SUFFIX()].join("")
        }
    }

    TITLE() {
        let r = this.roller.rand()
        if (r <= .8) {
            return "THE "
        } else if (r <= .95) {
            return ""
        } else {
            return this.state.docName.toUpperCase().concat("'S ")
        }
    }
    ADJECTIVE() {
        if (this.roller.rand() <= .75) {
            return this.roller.choice(["AUGMENTED ", "MAGNIFICENT ", "GIANT ", "NUCLEAR ", "ALIEN ", "INDESTRUCTIBLE ", "CHAOTIC ", "PATENTED ", "HORRIBLE ", "TITANIC ", "GEOMETRIC ", "INSIDIOUS ", "TEMPORAL ", "DREADED ", "MANY-LEGGED ", "CARAPACED ", "ARMORED ", "BERSERK ", "ULTIMATE ", "WINGED ", "ANCIENT ", "PREHISTORIC ", "GENETIC ", "SCIENTIFIC ", "RAVENOUS ", "JURASSIC ", "CRETACEOUS ", "ABOMINABLE ", "POWERFUL ", "RAVAGING ", "MAD ", "APOCALYPTIC ", "ADVANCED ", "TERRIFYING ", "FEARFUL ", "FOUL ", "MUTATED ", "MODIFIED ", "FREAK ", "CHIMERIC ", "ATOMIC "])
        } else if (this.roller.rand() <= .80) {
            return ""
        } else {
            return [this.ADJECTIVE(), this.ADJECTIVE()].join("")
        }
    }
    NAMESET() {
        let r = this.roller.rand()
        if (r <= .6) {
            return [this.PREFIX(), this.BIOTYPE()].join("")
        } else if (r <= .7) {
            return [this.BIOTYPE(), "-", this.BIOTYPE()].join("")
        } else {
            return this.NAMEOID()
        }
    }
    NAMEOID() {
        let startoid = this.STARTOID()
        let endoid = this.ENDOID()
        if (startoid.slice(-1) == endoid[0]) {
            endoid = endoid.slice(1)
        }
        return [startoid, endoid].join("") 
    }
    STARTOID() {
        return this.roller.choice(["PLAS", "GORM", "GOD", "ZAG", "CTH", "HAST", "FANG", "DOOM", "BLAST", "NETH", "CROL", "CENT", "LEGIO", "GRIP", "KILL", "BURN", "XAR", "NEP"])
    }
    ENDOID() {
        return this.roller.choice(["THULHU", "TRON", "MAX", "RA", "OID", "ROID", "ZILLA", "MORPH", "KHAN", "ICON", "MIN", "LORD", "VERT", "LON", "REX", "OSAUR"])
    }
    BIOTYPE() {
        return this.ANIMAL()
    }

    ANIMAL() {
        return this.roller.choice( ["CAT", "DRAGON", "SPIDER", "WOLF", "OCTOPUS", "TIGER", "MOUSE", "LIZARD", "CROCODILE", "GORILLA", "SHARK", "BEAST", "LION", "MONSTER", "SCORPION", "FLY", "REPTILE", "BABOON", "HYDRA", "COBRA", "WORM", "BEAR", "MORPH"])
    }
    PREFIX() {
        return this.roller.choice( [ "NEO-", "ULTRA", "MEGA", "XENO", "RETRO", "AMINO", "MACRO", "BIO-", "GIGA", "TURBO", "HYPER", "GEO-", "SUPER", "NECRO", "UR-", "ECO-", "ARCH-", "HANTA", "VERTI", "MEGALO", "TETRA", "NITRO", "DELTA"])
    }
    SUFFIX() {
        let r = this.roller.rand()
        if (r <= .95) {
            return ""
        } else if (r <= .98) {
            return " MK. 4"
        } else {
            return " ALPHA"
        }
    }
}
