import * as fonts from '/es/ui/fonts.es'
import * as colours from '/es/ui/colours.es'
import * as drawscions from '/es/ui/drawscions.es'

import * as utils from '/es/utils.es'
import * as vecs from '/es/vectors.es'

export class GeneHighlightFlyer extends drawscions.Scion {
    drawContents() {
        this.ctx.strokeRect( this.anchorAbs.x-6, this.anchorAbs.y-6, 66, 66 )
    }
}

export class AnimatedScrollBackground extends drawscions.Scion {
    constructor(parent, height, iName) {
        super(parent)
        this.height = height

        this.localSprite = document.createElement("canvas")
        this.localCtx = this.localSprite.getContext('2d');

        let image = this.renderer.img[iName]; // If any of these semicolons are removed, everything breaks.  Why?  WHO KNOWS.
        [this.sWidth, this.sHeight] = [image.width, image.height];
        [this.localSprite.width, this.localSprite.height] = [this.sWidth, this.height+this.sHeight];

        for (let yDraw = 0; yDraw < this.height+this.sHeight; yDraw+=this.sHeight) {
            this.localCtx.drawImage(image, 0, yDraw)
        }
    }
    get lTick() { return this.renderer.localMS / 150 }

    drawContents() {
       this.ctx.drawImage(this.localSprite, 0, this.sHeight - ((this.lTick*6)%this.sHeight), this.sWidth, this.height, ...this.anchorAbs.xy, this.sWidth, this.height)
    }
}

export class AbstractViewGenesPanel extends drawscions.Scion {
    constructor(parent) {
        super(parent)
    }

    get genes() { throw "To be overridden!" }
    get geneDrawShift() { throw "To be overridden!" }
    get geneDrawAnchor() { return vecs.Vec2(0,0) }

    drawContents() {
        for (let [index, gene] of this.genes.entries()) {
            this.renderer.drawGene(gene, ...this.nwGeneAbs(index).xy)
        }
    }

    geneLocal(index) { return this.geneDrawAnchor.add(this.geneDrawShift.sMul(index)) }
    nwGeneLocal(index) { return this.geneLocal(index).add(vecs.Vec2(0, 0)) }
    neGeneLocal(index) { return this.geneLocal(index).add(vecs.Vec2(54, 0)) }
    seGeneLocal(index) { return this.geneLocal(index).add(vecs.Vec2(54, 54)) }

    geneOuter(index) { return this.anchorPos.add(this.geneLocal(index)) }
    nwGeneOuter(index) { return this.anchorPos.add(this.nwGeneLocal(index)) }
    neGeneOuter(index) { return this.anchorPos.add(this.neGeneLocal(index)) }
    seGeneOuter(index) { return this.anchorPos.add(this.seGeneLocal(index)) }

    geneAbs(index) { return this.anchorAbs.add(this.geneLocal(index)) }
    nwGeneAbs(index) { return this.anchorAbs.add(this.nwGeneLocal(index)) }
    neGeneAbs(index) { return this.anchorAbs.add(this.neGeneLocal(index)) }
    seGeneAbs(index) { return this.anchorAbs.add(this.seGeneLocal(index)) }
}

export class AbstractSelectGenesPanel extends AbstractViewGenesPanel {
    constructor(parent) {
        super(parent)
        this.highlightFlyer = new GeneHighlightFlyer(this)
        this._selectedIndex = null
        this.children = []
    }

    get selectedIndex() { return this._selectedIndex }
    get selectedGene() { return this.genes[this.selectedIndex] }

    set selectedIndex(data) {
        if (data == null) {
            this.children = []
        } else {
            this._selectedIndex = data
            this.highlightFlyer.anchorPos = this.geneLocal(data)
            this.children = [this.highlightFlyer]
        }
    }
    shiftSelectedIndex(delta) {
        this.selectedIndex = utils.median3(0, (this.selectedIndex + delta), this.genes.length-1)
    }
}

///

class SegmentBracket extends drawscions.Scion {
    constructor(parent, segPos) {
        super(parent)
        this.segPos = segPos
    }
    get start() { return this.segPos[0] }
    get end() { return this.segPos[1] }
    get length() { return this.end-this.start }
    get dnaString() { return this.parent.dnaString }
    get segment() { return this.dnaString.slice(...this.segPos) }

    get localIndex() { return this.parent.brackets.indexOf(this) } 
    get localIndexChar() { return String.fromCharCode("A".charCodeAt(0)+this.localIndex) }

    drawContents() {
        let yBotAbs = this.anchorAbs.y + (this.length*72)-24

        this.ctx.drawImage(this.renderer.img.brk_top__3, this.anchorAbs.x, this.anchorAbs.y-3)
        this.ctx.drawImage(this.renderer.img.brk_bot__3, this.anchorAbs.x, yBotAbs)

        this.renderer.drawChars(`${this.localIndexChar}`, this.anchorAbs.x+3, this.anchorAbs.y+9, 3)

        this.ctx.strokeStyle="#000"
        this.ctx.lineWidth=3
        this.ctx.beginPath()
        this.ctx.moveTo(this.anchorAbs.x+7.5, this.anchorAbs.y+27)
        this.ctx.lineTo(this.anchorAbs.x+7.5, yBotAbs)
        this.ctx.stroke()
    }
}

class SegmentDesc extends drawscions.Scion {
    constructor(parent, segPos) {
        super(parent)
        this.segPos = segPos
    }
    get dnaString() { return this.parent.dnaString }
    get segment() { return this.dnaString.slice(...this.segPos) }
    get mutation() { return this.parent.state.ruleset.lookup(this.segment) }

    get localIndex() { return this.parent.descs.indexOf(this) } 
    get localIndexChar() { return String.fromCharCode("A".charCodeAt(0)+this.localIndex) }

    drawContents() {
/*        this.ctx.textBaseline = "middle"
        this.ctx.textAlign = "left"
        this.ctx.font = fonts.MENU_TEXT
        this.ctx.strokeStyle=colours.BORDER

        this.ctx.fillRect(...this.anchorAbs.xy, 400, 39)*/

        let xDraw = this.anchorAbs.x+6

        this.renderer.drawChars(`${this.localIndexChar})`, xDraw, this.anchorAbs.y+12, 3)
        xDraw += 24

        for (let gene of this.segment.genes) {
            this.renderer.drawGene(gene, xDraw, this.anchorAbs.y+6, 3)
            xDraw +=30
        }
        xDraw +=6

        this.renderer.drawChars(`${this.mutation.desc}`, xDraw, this.anchorAbs.y+12, 3)
//        this.ctx.fillText(`segment here ${this.segment.chars} | ${this.mutation.desc}`, this.anchorAbs.x+20, this.anchorAbs.y+20)
    }
}

export class AbstractMutationBracketsPanel extends drawscions.Scion {
    constructor(parent) {
        super(parent)

        this.brackets = []
        this.descs = []
    }

    get ruleset() { return this.state.ruleset }
    get dnaString() { return this.parent.dnaString } 
    get activeSegmentPoses() { return this.state.ruleset.getActiveSegmentPoses(this.dnaString) } 

    get genesPanel() { return this.parent.genesPanel }

    updateDescs() {
        for (let [index, desc] of this.descs.entries()) {
            desc.anchorPos = vecs.Vec2(460, 72+54*index)
        }
    }
    updateBrackets() {
        let rows = [-1]

        for (let cur of this.brackets) {
            let stackingIndex = 0
            for (let rIndex of rows.keys()) {
                if (rows[rIndex] == -1) {
                    stackingIndex = rIndex
                    rows[rIndex] = cur.end
                    rows[rIndex+1] = -1
                    break
                } else if (cur.start >= rows[rIndex]) {
                    rows[rIndex] = cur.end
                    stackingIndex = rIndex
                    break
                }
            }
            cur.anchorPos = this.genesPanel.neGeneOuter(cur.start).add(vecs.Vec2(48 + stackingIndex*12, 0) )
        }
    }

    refreshMuts() {
        // needs to be called or there will be no brackets/descs
        this.brackets = []
        this.descs = []
        for (let segPos of this.activeSegmentPoses) {
            this.brackets.push(new SegmentBracket(this, segPos))
            this.descs.push(new SegmentDesc(this, segPos))
        }
        this.children = [...this.brackets, ...this.descs]
    }
}
