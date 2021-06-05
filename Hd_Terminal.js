const CMD = {
    circle: 'CIRCLE', 
    intersect: 'INTERSECT', 
    bisector: 'BISECTOR', 
    altitude: 'ALTITUDE', 
    median: 'MEDIAN',
    parallel: 'PARALLEL',
    perpendicular: 'PERPENDICULAR',
    name: 'NAME'
}

const OTHER_CMD = {
    clear: 'CLEAR',
    manual: 'MANUAL',
    history: 'HISTORY',
    save: 'SAVE',
    load: 'LOAD'
}

const WHERE = {
    IN_HISTORY: 0,
    IN_MANUAL: 1,
    IN_GRAPH: 2
}

const MANUAL = `Hello, I'm Hien. Welcome to DrawingGraph!(test)

Syntax manual:

circle OA: circle with center O and radius OA
intersect AB CD E: line AB and CD intersect at E
bisector AD BC: AD is the angle bisector of /_BAC
altitude AD BC: AD is the altitude from A to BC
altitude AOB: altitude angle /_AOB 
(don't use altutide AO OB)
median AD BC: D is median through A to BC
(press space to autocomplete)

clear: clear all commands
manual: syntax manual
history: history

click "Code" to enter draw-mode
name AB: set name and link AB (in draw-mode)
(cannot drag in draw-mode)
`

export class Hd_Terminal {
    constructor(terminal, Graph, ctx, history = null, writeSpeed = 40) {
        this.terminal = terminal
        this.writeSpeed = writeSpeed
        this.cmd = ""

        this.history = history
        this.HISTORY = []
        this.where = WHERE.IN_MANUAL

        this.Graph = Graph
        this.ctx = ctx

        this.terminalWrite(MANUAL, this.history, 30)
        this.history.disabled = true

        this.terminalStart()
        this.terminal.addEventListener("keydown", (e) => this.terminalInputHandler(e))

        this.mode = MODE.CODE

        this.STORE_POS = []
    }

    newGraph(graph) {
        this.Graph = graph
    }

    store_pos(pos) {
        this.STORE_POS.push(pos)
    }

    terminalStart() {
        this.terminal.value = ''
        this.terminalWrite("Have a nice day :>\n\nChamcham:>>")
    }

    async terminalWrite(text, terminal = this.terminal, writeSpeed = this.writeSpeed) {
        let counter = 0;
    
        let writer = () => {
            terminal.disabled = true;
            if (counter < text.length) {
                let terminalText = (`${(terminal.value).replace("|","")}${text.charAt(counter)}`);
                if (counter !== text.length-1) {
                    terminalText = `${terminalText}|`
                }
                terminal.value = terminalText;
                counter++;
                setTimeout(writer, writeSpeed);
            } else {
                clearTimeout(writer);
                terminal.disabled = false;
                terminal.blur();
                terminal.focus();
            }
        }

        writer()
    }

    terminalInputHandler(e) {
        if (e.keyCode === 13) { // Enter
            this.terminalWrite("\nChamcham:>>")

            if (this.mode == MODE.CODE) this.cmdCODE_Exe()
            else if (this.mode == MODE.DRAW) this.cmdDRAW_Exe()

            this.HISTORY.push(this.cmd)
            if (this.where == WHERE.IN_HISTORY) this.history.value += '>>' + this.cmd + '\n'

            this.cmd = ""
        }
        else if (e.keyCode === 8) { // Backspace
            this.cmd = this.cmd.slice(0, -1)
        }
        else if (e.keyCode === 17 || e.keyCode === 32) {
            for (const key in CMD) {
                if (this.cmd.length <= 3 && CMD[key].startsWith(this.cmd)) {
                    this.terminal.value += CMD[key].slice(this.cmd.length).toLowerCase()
                    this.cmd += CMD[key].slice(this.cmd.length)
                }
            }
            this.cmd += ' '
        }
        else if (e.keyCode >= 48 && e.keyCode <= 90) {
            this.cmd += String.fromCharCode(e.keyCode)
        }
        else if (e.keyCode === 190) { //dot
            this.cmd += String.fromCharCode(46)
        }
    }

    cmdCODE_Exe(cmd = this.cmd) {
        const argvs = cmd.split(/\s+/)

        switch (argvs[0]) {
            case CMD.circle:
                if (argvs[1].length == 2) {
                    this.Graph.circleGenerate(argvs[1])
                    this.Graph.drawGraph(this.ctx)
                }
                else if (argvs[1].length == 1) {
                    this.Graph.inscribedCircleGenerate(argvs[2], argvs[1])
                    this.Graph.drawGraph(this.ctx)
                }
                else if (argvs[1].length == 3) {
                    this.Graph.circumCircleGenerate(argvs[1], argvs[2])
                    this.Graph.drawGraph(this.ctx)
                }
                break

            case CMD.intersect:
                this.Graph.intersectGenerate(argvs[1], argvs[2], argvs[3])
                this.Graph.drawGraph(this.ctx)
                break

            case CMD.altitude:
                if (argvs[1].length == 3) {
                    this.Graph.altitudeAngleGenerate(argvs[1])
                    this.Graph.drawGraph(this.ctx)
                }
                else if (argvs[1].length == 2 && argvs[2].length == 2) {
                    this.Graph.altitudeGenerate(argvs[2], argvs[1])
                    this.Graph.drawGraph(this.ctx)
                }
                break

            case CMD.bisector:
                this.Graph.bisectorGenerate(argvs[2], argvs[1])
                this.Graph.drawGraph(this.ctx)
                break

            case CMD.median:
                this.Graph.medianGenerate(argvs[2], argvs[1], argvs[3])
                this.Graph.drawGraph(this.ctx)
                break

            case CMD.parallel:
                this.Graph.parallelGenerate(argvs[2], argvs[1])
                this.Graph.drawGraph(this.ctx)
                break

            case CMD.perpendicular:
                this.Graph.perpendicularGenerate(argvs[2], argvs[1])
                this.Graph.drawGraph(this.ctx)
                break

            case CMD.name:
                this.Graph.v(argvs[1]).updateVertex(parseFloat(argvs[2]), parseFloat(argvs[3]))
                this.Graph.drawGraph(this.ctx)
                break

            case OTHER_CMD.clear:
                this.terminal.value = ''
                break

            case OTHER_CMD.manual:
                this.history.value = ''
                this.terminalWrite(MANUAL, this.history, 30)
                this.history.disabled = true
                this.where = WHERE.IN_MANUAL
                break

            case OTHER_CMD.history:
                if (this.where != WHERE.IN_HISTORY) {
                    this.history.value = ''
                    for (const history of this.HISTORY) {
                        this.history.value += '>>' + history + '\n'
                    }
                    this.where = WHERE.IN_HISTORY
                }
                break

            case OTHER_CMD.save:
                this.Save(argvs[1])
                break

            case OTHER_CMD.load:
                this.Load()
                break

            default:
                this.Graph.polygonGenerate(argvs[0])
                this.Graph.drawGraph(this.ctx)
                break
        }
    }

    cmdDRAW_Exe(cmd = this.cmd) {
        const argvs = cmd.split(/\s+/)

        switch (argvs[0]) {
            default:
                if (this.STORE_POS.length == 2) {
                    this.Graph.lineGenerare(argvs[0], this.STORE_POS[0], this.STORE_POS[1])
                    this.Graph.drawGraph(this.ctx)
                }
                this.STORE_POS = []
                break
        }
    }

    HISTORYtoText() {
        let textHistory = ''

        for (const history of this.HISTORY) {
            textHistory += history + '\n'
        }

        for (const vertex of this.Graph.graph) {
            textHistory += 'NAME ' + vertex.name + ' ' + vertex.x + ' ' + vertex.y + '\n'
        }

        return textHistory
    }

    Save(filename = 'hd_graph.txt') {
        filename = filename.toLowerCase()
        let type = filename.slice(-3)
        if (filename.length <= 4) filename = 'hd_graph.' + type

        let element = document.createElement('a')
        if (type === 'txt') element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.HISTORYtoText()))
        else element.setAttribute('href', document.getElementById('canvas').toDataURL("image/" + type).replace("image/" + type, "image/octet-stream"))
        element.setAttribute('download', filename)
    
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    Load() {
        let fileSelector = document.createElement('input')
        fileSelector.setAttribute('type', 'file')
        fileSelector.setAttribute('accept', '.txt')

        fileSelector.addEventListener('change', (event) => {
            const file = event.target.files
            const fileReader = new FileReader()
            fileReader.readAsText(file[0])
    
            fileReader.onload = (event) => {
                for (const cmd of fileReader.result.split('\n')) {
                    this.cmdCODE_Exe(cmd)
                }
            }
        })

        document.body.appendChild(fileSelector)
        fileSelector.click()
        document.body.removeChild(fileSelector)
    }
}