const CMD = {
    circle: 'CIRCLE', 
    intersect: 'INTERSECT', 
    bisector: 'BISECTOR', 
    altitude: 'ALTITUDE', 
    median: 'MEDIAN',
}

const OTHER_CMD = {
    clear: 'CLEAR',
    manual: 'MANUAL',
    history: 'HISTORY'
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
    constructor(terminal, Graph, ctx, history = null, writeSpeed = 60) {
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

    static x = 0

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
                if (CMD[key][0] == this.cmd[0] && this.cmd.length <= 2) {
                    this.terminal.value += CMD[key].slice(1).toLowerCase()
                    this.cmd += CMD[key].slice(1)
                }
            }
            this.cmd += ' '
        }
        else if (e.keyCode >= 48 && e.keyCode <= 90) {
            this.cmd += String.fromCharCode(e.keyCode)
        }
    }

    cmdCODE_Exe() {
        const argvs = this.cmd.split(/\s+/)

        switch (argvs[0]) {
            case CMD.circle:
                this.Graph.circleGenerate(argvs[1])
                this.Graph.drawGraph(this.ctx)
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
                this.Graph.medianGenerate(argvs[2], argvs[1])
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

            default:
                this.Graph.polygonGenerate(argvs[0])
                this.Graph.drawGraph(this.ctx)
                break
        }
    }

    cmdDRAW_Exe() {
        const argvs = this.cmd.split(/\s+/)

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
}