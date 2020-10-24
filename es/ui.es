import * as genconst from '/es/genconst.es'

import * as utils from '/es/utils.es'
import * as vecs from '/es/vectors.es'
import * as colours from '/es/ui/colours.es'
import * as fonts from '/es/ui/fonts.es'

class Cursor {
    constructor() {
        this.clickedDownOn = null
        this.mousePos = vecs.Vec2(0, 0)
    }

    setPos(mousePos) {
        this.mousePos = mousePos
    }
}

export class Renderer {
    constructor(runner) {
        this.requestAnimationFrame = window.requestAnimationFrame.bind(window)

        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d");  // If this semicolon is removed, the next line doesn't get executed properly.  Why?  Who knows, it's Javascript!

        [this.canvas.width, this.canvas.height] = genconst.mainCanvasSize
        document.body.appendChild(this.canvas)
        this.canvas.setAttribute("tabindex", "1")
        this.ctx.imageSmoothingEnabled = false

        this.panel = null
        this.cursor = new Cursor()

        this.imagesToLoad = []
        this.img = {}

        this.setupImages()
        this.setupListeners()

        this.runner = runner
    }

    setupListeners() {
        this.canvas.addEventListener("keypress", this.warpKeypress.bind(this), false)
        this.canvas.addEventListener("keydown", this.warpKeydown.bind(this), false)
/*        this.canvas.addEventListener("mousemove", this.warpMouseMove.bind(this), false)
        this.canvas.addEventListener("mousedown", this.warpMouseDown.bind(this), false)
        this.canvas.addEventListener("mouseup", this.warpMouseUp.bind(this), false)
        this.canvas.addEventListener("mouseout", this.warpMouseOut.bind(this), false)*/
    }

    setupImages() {
        this.dLoadImage("geneA", 3)
        this.dLoadImage("geneC", 3)
        this.dLoadImage("geneT", 3)
        this.dLoadImage("geneG", 3)
        this.dLoadImage("gene1", 3)
        this.dLoadImage("geneUNDEF", 3)

        this.dLoadImage("geneA")
        this.dLoadImage("geneC")
        this.dLoadImage("geneT")
        this.dLoadImage("geneG")
        this.dLoadImage("gene1")
        this.dLoadImage("geneUNDEF")

        this.dLoadImage("scrollAB")
        this.dLoadImage("uiScrollBG")
        this.dLoadImage("uiScrsel")
        this.dLoadImage("uiCross")
        this.dLoadImage("uiWinN")
        this.dLoadImage("uiWinBG")
        this.dLoadImage("uiWinS")

        this.dLoadImage(`txt/UNDEF`)
        this.dLoadImage(`txt/UNDEF`, 3)
        for (let k of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?! .|()') {
            this.dLoadImage(`txt/${k.charCodeAt(0)}`)
            this.dLoadImage(`txt/${k.charCodeAt(0)}`, 3)
        }

        this.dLoadImage("brk/top", 3)
        this.dLoadImage("brk/bot", 3)
    }
    dLoadImage(iName, pScale=null) {
        this.loadImage(iName, `/img/${iName}.png`, pScale)
    }
    loadImage(iName, src, pScale=null) {
        let pixelSize = pScale || genconst.pixelSize
        this.imagesToLoad.push(iName)
        let newImage = new Image()
        newImage.onload = () => {
            let sprite = document.createElement("canvas")
            let sCtx = sprite.getContext('2d');

            [sprite.width, sprite.height] = [newImage.width*pixelSize, newImage.height*pixelSize]

            sCtx.imageSmoothingEnabled = false
            sCtx.scale(pixelSize, pixelSize)
            sCtx.drawImage(newImage, 0, 0)

            this.setImage(`${iName}__${pixelSize}`, sprite)
            if (pScale == null) {
                this.setImage(iName, sprite)
            }
            utils.aRemove(this.imagesToLoad, iName)
        }
        newImage.src = src
    }
    setImage(iName, sprite) {
        this.img[iName.replace("/", "_")] = sprite
    }

    startDrawLoop() {
        if (this.imagesToLoad.length > 0) {
            console.log("loading images", this.imagesToLoad)
            this.requestAnimationFrame( this.startDrawLoop.bind(this) )
        } else {
            this.firstDrawMS = Date.now()
            this.requestAnimationFrame( this.drawLoop.bind(this) )
        }
    }
    drawLoop() {
        this.drawMS = Date.now()
        this.draw()
        this.drawDebug()
        this.requestAnimationFrame( this.drawLoop.bind(this) )
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle=colours.DARKBG
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.font = fonts.MENU_TEXT
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "top"
        this.ctx.fillStyle=colours.BORDER

        this.curNode.preDrawTick()
        this.curNode.draw()
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
    }

    get renMS() {
        return this.drawMS - this.firstDrawMS
    }

    drawDebug() {
        this.ctx.font = fonts.SMALL_TEXT
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "top"
        this.ctx.fillStyle=colours.BORDER
        this.ctx.fillText("TrueMS " + (this.renMS), 2, 2)

        this.ctx.drawImage(this.img.geneA, 10, 10)
    }

//

    warpMouseMove(event) {
        let canvasOffset = this.canvas.getBoundingClientRect()
        let mousePos = vecs.Vec2(event.clientX - canvasOffset.left, event.clientY - canvasOffset.top)
        this.cursor.setPos(mousePos)
    }
    warpMouseDown(event) {
        let canvasOffset = this.canvas.getBoundingClientRect()
        let mousePos = vecs.Vec2(event.clientX - canvasOffset.left, event.clientY - canvasOffset.top)
        this.cursor.setPos(mousePos)
        this.panel.warpMouseDown(mousePos)
    }
    warpMouseUp(event) {
        let canvasOffset = this.canvas.getBoundingClientRect()
        let mousePos = vecs.Vec2(event.clientX - canvasOffset.left, event.clientY - canvasOffset.top)
        this.cursor.setPos(mousePos)
        this.panel.warpMouseUp(mousePos)
        this.cursor.clickedDownOn = null
    }
    warpMouseOut(event) {
        this.cursor.clickedDownOn = null
        this.cursor.setPos( vecs.Vec2(-100, -100) )
    }

    warpKeydown(event) {
        this.curNode.warpKeydown(event)
    }
    warpKeypress(event) {
        this.curNode.warpKeypress(event)
    }

    get state() { return this.runner.state }
    get curNode() { return this.state.curNode }

// Drawing convenience functions
    wrapText(text, xDraw, yDraw, xWidth, yLineHeight) {
        let words = text.split(' ')
        let line = ''

        let yShift = 0

        for (let word of words) {
            let metric = this.ctx.measureText(line + word + ' ')
            if (metric.width > xWidth) {
                this.ctx.fillText(line, xDraw, yDraw+yShift)
                yShift += yLineHeight
                line = word + ' '
            } else {
                line = line + word + ' '
            }
        }
        this.ctx.fillText(line, xDraw, yDraw+yShift)
        yShift += yLineHeight
        return yDraw+yShift
    }

    drawGene(gene, xDraw, yDraw, pSize=6) {
        let img = this.img[`${gene.img}__${pSize}`] || this.img.geneUNDEF
        this.ctx.drawImage(img, xDraw, yDraw)
    }

    drawChars(chars, xDraw, yDraw, pSize=6) {
        let yShift = 0
        for (let char of chars.toUpperCase()) {
            let charSprite = this.img[`txt_${char.charCodeAt(0)}__${pSize}`] || this.img[`txt_UNDEF_${pSize}`]
            this.ctx.drawImage(charSprite, xDraw, yDraw)
            xDraw += (charSprite.width + pSize)
            yShift = Math.max(yShift, charSprite.height + pSize)
        }
        return [xDraw, yDraw+yShift]
    }

    yRepeated(img, height) {
        let nSprite = document.createElement("canvas")
        let nCtx = nSprite.getContext('2d');

        let nRow = img;

        [nSprite.width, nSprite.height] = [nRow.width, height];
        for (let y = 0; y < nSprite.height; y+= nRow.height) {
            nCtx.drawImage(nRow, 0, y)
        }
        return nSprite
    }
}
