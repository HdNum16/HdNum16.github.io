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
        else if (this.v(cur_vertex).dependence == 2) {
            let temp = this.v(cur_vertex).generator[1](x, y)
            if (temp) {
                this.v(cur_vertex).updateVertex(temp.x, temp.y)

                for (let vertex of this.graph) {
                    if (vertex.generator[0] !== undefined) {
                        temp = vertex.generator[0]()
                        vertex.updateVertex(temp.x, temp.y)
                    }
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

    polygonGenerate(names) {
        for (let i = 0; i < names.length; i++) {
            this.addVertex(new Vertex(names[i], i*100+Math.floor(Math.random()*500), i*10+Math.floor(Math.random()*500)))
        }
        if (names.length > 1) {
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

    intersectGenerate(line1, line2, intersect) {
        this.polygonGenerate(line1)
        this.polygonGenerate(line2)

        this.addVertex(this.findIntersect(line1, line2, intersect))

        this.v(intersect).dependence = 1
        this.v(intersect).updateGenerator(() => this.findIntersect(line1, line2, intersect))
    }

    findIntersect(line1, line2, intersect) {
        let a1 = (this.v(line1[1]).y - this.v(line1[0]).y) / (this.v(line1[1]).x - this.v(line1[0]).x)
        let b1 = (this.v(line1[0]).y*this.v(line1[1]).x - this.v(line1[1]).y*this.v(line1[0]).x) / (this.v(line1[1]).x - this.v(line1[0]).x)

        let a2 = (this.v(line2[1]).y - this.v(line2[0]).y) / (this.v(line2[1]).x - this.v(line2[0]).x)
        let b2 = (this.v(line2[0]).y*this.v(line2[1]).x - this.v(line2[1]).y*this.v(line2[0]).x) / (this.v(line2[1]).x - this.v(line2[0]).x)

        let x = (b1 - b2) / (a2 - a1)
        let y = (b1*a2 -b2*a1) / (a2 - a1)
        return new Vertex(intersect, x, y)
    }

    bisectorGenerate(line, mid) {
        this.polygonGenerate(line)
        this.addVertex(this.findBisector(line, mid))

        this.v(mid[1]).addEdge(this.v(mid[0]))
        this.v(mid[1]).dependence = 1
        this.v(mid[1]).updateGenerator(() => this.findBisector(line, mid))
    }

    findBisector(line, mid) {
        let l = this.v(mid[0]).EuclidDistance(this.v(line[0]))
        let r =  this.v(mid[0]).EuclidDistance(this.v(line[1]))
        let rate = l / (l + r)
        return this.findMedian(line, mid[1], rate)
    }

    altitudeGenerate(line, altitude) {
        this.polygonGenerate(line)
    
        this.addVertex(this.findAltitude(line, altitude))
        this.v(altitude[1]).addEdge(this.v(altitude[0]))
        this.v(altitude[1]).dependence = 1
        this.v(altitude[1]).updateGenerator(() => this.findAltitude(line, altitude))
    }

    findAltitude(line, altitude) {
        let a = this.v(line[0]).y - this.v(line[1]).y
        let b = this.v(line[1]).x - this.v(line[0]).x
        let c = this.v(line[1]).y*this.v(line[0]).x - this.v(line[0]).y*this.v(line[1]).x
        let temp = -(a*this.v(altitude[0]).x + b*this.v(altitude[0]).y + c) / (a*a + b*b)
        let x = temp*a + this.v(altitude[0]).x
        let y = temp*b + this.v(altitude[0]).y
        return new Vertex(altitude[1], x, y)
    }

    altitudeAngleGenerate(AOB) {
        let AO = AOB[0] + AOB[1]
        let OB = AOB[1] + AOB[2]
        let new_vertex = this.findAltitude(OB, AO)
        this.v(AO[1]).updateVertex(new_vertex.x, new_vertex.y)
        this.v(AO[1]).dependence = 2
        this.v(AO[1]).updateGenerator((x, y) => this.findAltitude(OB, AO))
        this.v(AO[1]).updateGenerator((x, y) => this.findAltitudeAngle(AO, OB, x, y), 1)
    }

    findAltitudeAngle(AO, OB, x, y) {
        let midx = (this.v(AO[0]).x + this.v(OB[1]).x) / 2
        let midy = (this.v(AO[0]).y + this.v(OB[1]).y) / 2
        let R = this.v(AO[0]).EuclidDistance(this.v(OB[1])) / 2

        if (x > midx + R) x = midx + R
        else if (x < midx - R) x = midx - R

        let delta = R*R - (x-midx)*(x-midx)

        let y1 = midy + Math.sqrt(delta)
        let y2 = midy - Math.sqrt(delta)

        if (Math.abs(y - y1) <= Math.abs(y-y2)) return new Vertex(AO[1], x, y1)
        else return new Vertex(AO[1], x, y2)
    }

    medianGenerate(line, median, rate = 1/2) {
        this.polygonGenerate(line)
        if (median.length == 1) {
            this.addVertex(this.findMedian(line, median, rate))
            this.v(median).updateGenerator(() => this.findMedian(line, median, rate))
        }
        else {
            this.addVertex(this.findMedian(line, median[1]))

            this.v(median[1]).addEdge(this.v(median[0]))
            this.v(median[1]).dependence = 1
            this.v(median[1]).updateGenerator(() => this.findMedian(line, median[1]))
        }
    }

    findMedian(line, median_point, rate = 1/2) {
        let x = this.v(line[0]).x + (this.v(line[1]).x - this.v(line[0]).x) * rate
        let y = this.v(line[0]).y + (this.v(line[1]).y - this.v(line[0]).y) * rate
        return new Vertex(median_point, x, y)
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
}

export class Vertex {
    constructor(name = '', x = -1, y = -1) {
        this.x = x
        this.y = y
        this.name = name
        this.dependence = 0
        this.generator = [undefined, undefined]
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

    updateGenerator(generator, index = 0) {
        this.generator[index] = generator
    }

    drawVertex(ctx, color = 'white') {
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }

    drawEdge(ctx, color = 'white') {
        for (const edge of this.edge) {
            // edge.drawVertex(ctx)
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(edge.x, edge.y);
            ctx.stroke();
        }

        for (const circle of this.circle) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
            ctx.arc(this.x, this.y, this.EuclidDistance(circle), 0, 2 * Math.PI, true);
            ctx.stroke();
        }
    }

    drawName(ctx, color = 'black') {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.font = "20px serif";
        ctx.strokeStyle = color
        ctx.strokeText(this.name, this.x - 6, this.y - 10);
        ctx.stroke();
    }

    EuclidDistance(vertex_1, vertex_2) {
        if (vertex_2 === undefined) vertex_2 = this
        return Math.sqrt((vertex_2.x-vertex_1.x)*(vertex_2.x-vertex_1.x) + (vertex_2.y-vertex_1.y)*(vertex_2.y-vertex_1.y))
    }
}