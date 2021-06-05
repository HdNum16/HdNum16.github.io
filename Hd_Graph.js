export class Hd_Graph {
    constructor() {
        this.graph = []
        this.index = {}
        this.viewVertexName = true
    }

    addVertex(vertex) {
        if (!(vertex.name in this.index)) {
            this.index[vertex.name] = this.graph.length
            this.graph.push(vertex)
        }
    }

    updateGraph(cur_vertex, x, y) {
        if (this.v(cur_vertex).dependence == 0) {
            this.v(cur_vertex).updateVertex(x, y)

            for (let vertex of this.graph) {
                if (vertex.generator[0] !== undefined) {
                    let temp = vertex.generator[0]()
                    vertex.updateVertex(temp.x, temp.y)
                }
            }
        }
    }

    drawGraph(ctx) {
        ctx.fillStyle = 'rgb(214, 184, 144)';
        ctx.fillRect(0, 0, 1000, 770);

        for (const vertex of this.graph) {
            vertex.drawVertex(ctx)
            vertex.drawEdge(ctx)
            if (this.viewVertexName) vertex.drawName(ctx)
        }
    }

    v(name = '') {
        return this.graph[this.index[name]]
    }

    // ________________

    polygonGenerate(names, edge = true) {
        for (let i = 0; i < names.length; i++) {
            this.addVertex(new Vertex(names[i], i*100+Math.floor(Math.random()*500), i*10+Math.floor(Math.random()*500)))
        }
        if (edge && names.length > 1) {
            for (let i = 0; i < names.length; i++) {
                if (i < names.length-1) this.v(names[i]).addEdge(this.v(names[i+1]))
                else this.v(names[i]).addEdge(this.v(names[0]))
            }
        }
    }

    lineGenerare(AB, pos_A, pos_B) { // for draw-mode only
        if (pos_A.x == pos_B.x && pos_A.y == pos_B.y) {
            this.addVertex(new Vertex(AB[0], pos_A.x, pos_A.y))
        }
        else {
            this.addVertex(new Vertex(AB[0], pos_A.x, pos_A.y))
            this.addVertex(new Vertex(AB[1], pos_B.x, pos_B.y))

            this.v(AB[0]).addEdge(this.v(AB[1]))
        }
    }

    circleGenerate(OA) {
        for (let i = 0; i < OA.length; i++) {
            this.addVertex(new Vertex(OA[i], i*100+Math.floor(Math.random()*500), i*10+Math.floor(Math.random()*500)))
        }

        this.v(OA[0]).addCircle(this.v(OA[1]))
    }

    inscribedCircleGenerate(ABC, center) {
        this.addVertex(this.findInscribedCircle(ABC, center))

        this.v(center).dependence = 1
        this.v(center).updateGenerator(() => this.findInscribedCircle(ABC, center))
    }

    findInscribedCircle(ABC, center) {
        let AB = this.v(ABC[0]).EuclidDistance(this.v(ABC[1]))
        let BC = this.v(ABC[1]).EuclidDistance(this.v(ABC[2]))
        let CA = this.v(ABC[2]).EuclidDistance(this.v(ABC[0]))

        let x = (BC * this.v(ABC[0]).x + CA * this.v(ABC[1]).x + AB * this.v(ABC[2]).x) / (AB + BC + CA)
        let y = (BC * this.v(ABC[0]).y + CA * this.v(ABC[1]).y + AB * this.v(ABC[2]).y) / (AB + BC + CA)
        return new Vertex(center, x, y)
    }

    circumCircleGenerate(ABC, center) {
        this.addVertex(this.findCircumCircle(ABC, center))

        this.v(center).dependence = 1
        this.v(center).updateGenerator(() => this.findCircumCircle(ABC, center))
    }

    findCircumCircle(ABC, center) {
        let A = {x: this.v(ABC[0]).x, y: this.v(ABC[0]).y}
        let B = {x: this.v(ABC[1]).x, y: this.v(ABC[1]).y}
        let C = {x: this.v(ABC[2]).x, y: this.v(ABC[2]).y}

        let y = ((A.x*A.x + A.y*A.y - B.x*B.x - B.y*B.y)*(B.x - C.x)/2 - (B.x*B.x + B.y*B.y - C.x*C.x - C.y*C.y)*(A.x - B.x)/2) / ((B.x - C.x)*(A.y - B.y) - (A.x - B.x)*(B.y - C.y))
        let x = ((A.x*A.x + A.y*A.y - B.x*B.x - B.y*B.y)/2 - (A.y - B.y)*y) / (A.x - B.x)
        return new Vertex(center, x, y)
    }

    intersectGenerate(AB, CD, intersect) {
        if (CD.length == 4) { // CD = (OA) as an example
            this.polygonGenerate(AB, false)
            for (const vertex of AB) {
                let temp = this.findMedian(CD[1] + vertex, vertex, this.v(CD[1]).EuclidDistance(this.v(CD[2])) / this.v(CD[1]).EuclidDistance(this.v(vertex)))
                this.v(vertex).updateVertex(temp.x, temp.y)
            }
            for (const vertex of AB) {
                this.v(vertex).updateGenerator(() => this.findMedian(CD[1] + vertex, vertex, this.v(CD[1]).EuclidDistance(this.v(CD[2])) / this.v(CD[1]).EuclidDistance(this.v(vertex))))
            }
        }
        else if (AB.length == 1 && CD.length == 2) {
            this.polygonGenerate(CD)
            this.parallelGenerate(CD, CD[0] + AB)
        }
        else {
            this.polygonGenerate(AB)
            this.polygonGenerate(CD)

            this.addVertex(this.findIntersect(AB, CD, intersect))

            this.v(intersect).dependence = 1
            this.v(intersect).updateGenerator(() => this.findIntersect(AB, CD, intersect))
        }
    }

    findIntersect(AB, CD, intersect) {
        let a1 = (this.v(AB[1]).y - this.v(AB[0]).y) / (this.v(AB[1]).x - this.v(AB[0]).x)
        let b1 = (this.v(AB[0]).y*this.v(AB[1]).x - this.v(AB[1]).y*this.v(AB[0]).x) / (this.v(AB[1]).x - this.v(AB[0]).x)

        let a2 = (this.v(CD[1]).y - this.v(CD[0]).y) / (this.v(CD[1]).x - this.v(CD[0]).x)
        let b2 = (this.v(CD[0]).y*this.v(CD[1]).x - this.v(CD[1]).y*this.v(CD[0]).x) / (this.v(CD[1]).x - this.v(CD[0]).x)

        let x = (b1 - b2) / (a2 - a1)
        let y = (b1*a2 -b2*a1) / (a2 - a1)
        return new Vertex(intersect, x, y)
    }

    bisectorGenerate(BC, AD) {
        this.polygonGenerate(BC)
        this.addVertex(this.findBisector(BC, AD))

        this.v(AD[1]).addEdge(this.v(AD[0]))
        this.v(AD[1]).dependence = 1
        this.v(AD[1]).updateGenerator(() => this.findBisector(BC, AD))
    }

    findBisector(BC, AD) {
        let l = this.v(AD[0]).EuclidDistance(this.v(BC[0]))
        let r =  this.v(AD[0]).EuclidDistance(this.v(BC[1]))
        let rate = l / (l + r)
        return this.findMedian(BC, AD[1], rate)
    }

    altitudeGenerate(BC, AH) {
        this.polygonGenerate(BC)
    
        this.addVertex(this.findAltitude(BC, AH))
        this.v(AH[1]).addEdge(this.v(AH[0]))
        this.v(AH[1]).dependence = 1
        this.v(AH[1]).updateGenerator(() => this.findAltitude(BC, AH))
    }

    findAltitude(BC, AH) {
        let a = this.v(BC[0]).y - this.v(BC[1]).y
        let b = this.v(BC[1]).x - this.v(BC[0]).x
        let c = this.v(BC[1]).y*this.v(BC[0]).x - this.v(BC[0]).y*this.v(BC[1]).x
        let temp = -(a*this.v(AH[0]).x + b*this.v(AH[0]).y + c) / (a*a + b*b)
        let x = temp*a + this.v(AH[0]).x
        let y = temp*b + this.v(AH[0]).y
        return new Vertex(AH[1], x, y)
    }

    altitudeAngleGenerate(ABC) {
        let temp = this.findAltitudeAngle(ABC)
        this.v(ABC[1]).updateVertex(temp.x, temp.y)
        this.v(ABC[1]).updateGenerator(() => this.findAltitudeAngle(ABC))
    }

    findAltitudeAngle(ABC) {
        let M = this.findMedian(ABC[0] + ABC[2], ABC[1])
        let rate = this.v(ABC[0]).EuclidDistance(this.v(ABC[2])) / (2 * this.EuclidDistance(M.x, M.y, this.v(ABC[1]).x, this.v(ABC[1]).y))
        
        let x = M.x + (this.v(ABC[1]).x - M.x) * rate
        let y = M.y + (this.v(ABC[1]).y - M.y) * rate
        return new Vertex(M.name, x, y)
    }

    medianGenerate(BC, AM, rate = 1/2) {
        // this.polygonGenerate(BC)
        if (AM.length == 1) {
            this.addVertex(this.findMedian(BC, AM, rate))
            this.v(AM).dependence = 1
            this.v(AM).updateGenerator(() => this.findMedian(BC, AM, rate))
        }
        else {
            this.addVertex(this.findMedian(BC, AM[1]))

            this.v(AM[1]).addEdge(this.v(AM[0]))
            this.v(AM[1]).dependence = 1
            this.v(AM[1]).updateGenerator(() => this.findMedian(BC, AM[1]))
        }
    }

    findMedian(BC, M, rate = 1/2) {
        let x = this.v(BC[0]).x + (this.v(BC[1]).x - this.v(BC[0]).x) * rate
        let y = this.v(BC[0]).y + (this.v(BC[1]).y - this.v(BC[0]).y) * rate
        return new Vertex(M, x, y)
    }

    parallelGenerate(BC, AP) {
        this.addVertex(this.findParallel(BC, AP))

        this.v(AP[1]).addEdge(this.v(AP[0]))
        this.v(AP[1]).updateGenerator(() => this.findParallel(BC, AP, this.v(AP[0]).EuclidDistance(this.v(AP[1]))))
    }

    findParallel(BC, AP, length) {
        if (length) {
            let lx = this.v(BC[1]).x - this.v(BC[0]).x
            let ly = this.v(BC[1]).y - this.v(BC[0]).y

            let rate = length / Math.sqrt(lx*lx + ly*ly)

            if (Math.abs(lx) >= Math.abs(ly) && lx * (this.v(AP[1]).x - this.v(AP[0]).x) <= 0) {lx *= -1; ly *= -1}
            else if (Math.abs(lx) < Math.abs(ly) && ly * (this.v(AP[1]).y - this.v(AP[0]).y) < 0) {lx *= -1; ly *= -1}

            let x = this.v(AP[0]).x + lx * rate
            let y = this.v(AP[0]).y + ly * rate
            return new Vertex(AP[1], x, y)
        }
        else {
            if (BC[0] == AP[0]) {
                let x = (this.v(BC[1]).x - this.v(BC[0]).x) / 2 + this.v(AP[0]).x
                let y = (this.v(BC[1]).y - this.v(BC[0]).y) / 2 + this.v(AP[0]).y
                return new Vertex(AP[1], x, y)
            }
            else {
                let x = this.v(BC[1]).x - this.v(BC[0]).x + this.v(AP[0]).x
                let y = this.v(BC[1]).y - this.v(BC[0]).y + this.v(AP[0]).y
                return new Vertex(AP[1], x, y)
            }
        }
    }

    perpendicularGenerate(BC, AP) {
        this.addVertex(this.findPerpendicular(BC, AP))

        this.v(AP[1]).addEdge(this.v(AP[0]))
        this.v(AP[1]).updateGenerator(() => this.findPerpendicular(BC, AP, this.v(AP[0]).EuclidDistance(this.v(AP[1]))))
    }

    findPerpendicular(BC, AP, length) {
        if (length) {
            let lx = -this.v(BC[1]).y + this.v(BC[0]).y
            let ly = this.v(BC[1]).x - this.v(BC[0]).x

            let rate = length / Math.sqrt(lx*lx + ly*ly)

            if (Math.abs(lx) >= Math.abs(ly) && lx * (this.v(AP[1]).x - this.v(AP[0]).x) <= 0) {lx *= -1; ly *= -1}
            else if (Math.abs(lx) < Math.abs(ly) && ly * (this.v(AP[1]).y - this.v(AP[0]).y) < 0) {lx *= -1; ly *= -1}

            let x = this.v(AP[0]).x + lx * rate
            let y = this.v(AP[0]).y + ly * rate
            return new Vertex(AP[1], x, y)
        }
        else {
            let x = -this.v(BC[1]).y + this.v(BC[0]).y + this.v(AP[0]).x
            let y = this.v(BC[1]).x - this.v(BC[0]).x + this.v(AP[0]).y
            return new Vertex(AP[1], x, y)
        }
    }

    //----------------

    EuclidDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
    }

    AnyPointNereHere(pos) {
        for (const vertex of this.graph) {
            if (this.EuclidDistance(pos.x, pos.y, vertex.x, vertex.y) <= 8) {
                return vertex
            }
        }
        return false
    }

    drawLineTemp(ctx, from_pos, to_pos, color = 'white') {
        ctx.beginPath();
        ctx.lineWidth = 2;
        if (from_pos.x == to_pos.x && from_pos.y == to_pos.y) ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.moveTo(from_pos.x, from_pos.y);
        ctx.lineTo(to_pos.x, to_pos.y);
        ctx.stroke();
    }

    //----------------

    moveAll(from_pos, to_pos) {
        let dx = to_pos.x - from_pos.x
        let dy = to_pos.y - from_pos.y

        for (const vertex of this.graph) {
            vertex.updateVertex(vertex.x + dx, vertex.y + dy)
        }
    }
}

export class Vertex {
    constructor(name = '', x = -1, y = -1) {
        this.x = x
        this.y = y
        this.name = name
        this.dependence = 0
        this.generator = []
        this.edge = new Set()
        this.circle = new Set()
    }

    addEdge(edge) {
        this.edge.add(edge)
    }

    addCircle(circle) {
        this.circle.add(circle)
    }

    updateVertex(x, y) {
        this.x = x
        this.y = y
    }

    updateGenerator(generator) {
        this.generator.push(generator)
    }

    drawVertex(ctx, color = 'black') {
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }

    drawEdge(ctx, color = 'black') {
        for (const edge of this.edge) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(edge.x, edge.y);
            ctx.stroke();
        }

        for (const circle of this.circle) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.arc(this.x, this.y, this.EuclidDistance(circle), 0, 2 * Math.PI, true);
            ctx.stroke();
        }
    }

    drawName(ctx, color = 'black') {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.font = "bold 16px Arial"
        // ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.fillText(this.name, this.x - 6, this.y - 10)
        // ctx.stroke()
    }

    EuclidDistance(vertex_1, vertex_2) {
        if (vertex_2 === undefined) vertex_2 = this
        return Math.sqrt((vertex_2.x-vertex_1.x)*(vertex_2.x-vertex_1.x) + (vertex_2.y-vertex_1.y)*(vertex_2.y-vertex_1.y))
    }
}