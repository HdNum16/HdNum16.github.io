import {Hd_Graph} from '/Hd_Graph.js'
import {Hd_Terminal} from '/Hd_Terminal.js'

let canvas
let ctx
let Graph

let from_pos = {x:-1, y:-1}
let to_pos = {x:-1, y:-1}
let cur_vertex_name = ''
let to_vertex_name = ''
let mouseOnExistVertex = false

let terminal
let history
let Terminal

function onMouseDown(e) {
    from_pos.x = e.clientX - canvas.getBoundingClientRect().left
    from_pos.y = e.clientY - canvas.getBoundingClientRect().top
    
    if (Terminal.mode == MODE.CODE) {
        const temp = Graph.AnyPointNereHere(from_pos)
        if (temp) {
            cur_vertex_name = temp.name
            mouseOnExistVertex = true
            return
        }

        mouseOnExistVertex = false
        return
    }
    else if (Terminal.mode == MODE.DRAW) {
        const temp = Graph.AnyPointNereHere(from_pos)
        if (temp) {
            cur_vertex_name = temp.name
            from_pos.x = temp.x
            from_pos.y = temp.y

            mouseOnExistVertex = true
        }
        else {
            Graph.drawGraph(ctx)
            Graph.drawLineTemp(ctx, from_pos, from_pos)

            mouseOnExistVertex = false
        }

        to_pos.x = -1
        to_pos.y = -1
    }
}

function onMouseMove(e) {
    if(e.buttons != 1) return

    if (Terminal.mode == MODE.CODE) {
        if(e.buttons != 1) return

        if (mouseOnExistVertex) {
            from_pos.x = e.clientX - canvas.getBoundingClientRect().left
            from_pos.y = e.clientY - canvas.getBoundingClientRect().top
    
            Graph.updateGraph(cur_vertex_name, from_pos.x, from_pos.y)
            Graph.drawGraph(ctx)
        }
    }
    else if (Terminal.mode == MODE.DRAW) {
        to_pos.x = e.clientX - canvas.getBoundingClientRect().left
        to_pos.y = e.clientY - canvas.getBoundingClientRect().top

        const temp = Graph.AnyPointNereHere(to_pos)
        if (temp) {
            to_vertex_name = temp.name
            to_pos.x = temp.x
            to_pos.y = temp.y
        }

        Graph.drawGraph(ctx)
        if (!mouseOnExistVertex) Graph.drawLineTemp(ctx, from_pos, from_pos)
        Graph.drawLineTemp(ctx, from_pos, to_pos)
        Graph.drawLineTemp(ctx, to_pos, to_pos)
    }
}

function onMouseUp(e) {
    if (Terminal.mode == MODE.DRAW) {
        if(cur_vertex_name != '' && to_vertex_name != '') {
            Graph.v(cur_vertex_name).addEdge(Graph.v(to_vertex_name))
        }
        else {
            Terminal.store_pos(from_pos)
            Terminal.store_pos(to_pos)
            Terminal.terminalWrite('name: ')
        }

        cur_vertex_name = ''
        to_vertex_name = ''
    }
}

async function init() {
    const viewVertexButton = document.getElementById('view-vertex-button')
    const eraseButton = document.getElementById('erase-button')
    const modeButton = document.getElementById('mode-button')

    viewVertexButton.addEventListener('click', () => {
        Graph.viewVertexName = !Graph.viewVertexName
        Graph.drawGraph(ctx)
    })
    eraseButton.addEventListener('click', () => {
        Graph = new Hd_Graph()
        Terminal.newGraph(Graph)
        Graph.drawGraph(ctx)
    })
    modeButton.addEventListener('click', () => {
        Terminal.mode *= -1
        if (Terminal.mode == MODE.CODE) modeButton.innerText = 'Code'
        else if (Terminal.mode == MODE.DRAW) modeButton.innerText = 'Draw'
        mouseOnExistVertex = false
    })

    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)

    terminal = document.getElementById('terminal')
    history = document.getElementById('history')

    Graph = new Hd_Graph()

    Terminal = new Hd_Terminal(terminal, Graph, ctx, history)
}

document.addEventListener('DOMContentLoaded', init)

// Duong song song
// Duong trung truc
// Giao voi duong tron
