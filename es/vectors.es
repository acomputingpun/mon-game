export class Vector2 {
    constructor(x,y) {
        this.x=x
        this.y=y
        this.xy = [x, y]
    }
    add(other){
        return new Vector2(this.x+other.x,this.y+other.y)
    }
    sub(other){
        return new Vector2(this.x-other.x,this.y-other.y)
    }
    sMul(scalar){
        return new Vector2(this.x*scalar,this.y*scalar)
    }
    lMul(other){
        return new Vector2(this.x*other.x,this.y*other.y)
    }

    get mag(){
        return ((this.x**2+this.y**2)**0.5)
    }
    distTo(other){
        return other.sub(this).mag
    }

    interp(frac, other){
        return this.add(other.sub(this).sMul(frac))
    }
}

export function Vec2(x,y) {
    return new Vector2(x, y)
}
