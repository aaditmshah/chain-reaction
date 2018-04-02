addEventListener("DOMContentLoaded", function () {
    var player  = 0;
    var phase   = 0;
    var board   = new Array(25).fill(0);
    var atoms   = [];
    var add     = 1;
    var split   = 1;
    var animate = true;

    const canvas  = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const worker  = new Worker("scripts/worker.js");
    const monaco  = new Worker("scripts/monaco.js");
    const channel = new MessageChannel;

    const audio = {
        add1:     new Audio("audio/add.ogg"),
        add2:     new Audio("audio/add.ogg"),
        add3:     new Audio("audio/add.ogg"),
        add4:     new Audio("audio/add.ogg"),
        add5:     new Audio("audio/add.ogg"),
        add6:     new Audio("audio/add.ogg"),
        add7:     new Audio("audio/add.ogg"),
        add8:     new Audio("audio/add.ogg"),
        split1:   new Audio("audio/split.ogg"),
        split2:   new Audio("audio/split.ogg"),
        gameover: new Audio("audio/gameover.ogg")
    };

    worker.postMessage({ type: "boot", player, phase, board, atoms, monaco: channel.port1 }, [channel.port1]);
    monaco.postMessage({ player, board, worker: channel.port2 }, [channel.port2]);

    worker.addEventListener("message", function (event) {
        player = event.data.player;
        phase  = event.data.phase;
        board  = event.data.board;
        atoms  = event.data.atoms;

        const {sound} = event.data;

        if (sound === "add") {
            audio[sound + add].play();
            add = add + 1;
            if (add === 9) add = 1;
        } else if (sound === "split") {
            audio[sound + split].play();
            split = 3 - split;
        } else if (sound) audio[sound].play();

        if (sound === "gameover") {
            worker.terminate();
            monaco.terminate();
            animate = false;
        }
    });

    canvas.addEventListener("click", function (event) {
        const {offsetX, offsetY} = event;
        worker.postMessage({ type: "click", offsetX, offsetY });
    });

    const red   = "#B22222";
    const green = "#228B22";
    const black = "#0A0A0A";

    const phi = (1 + Math.sqrt(5)) / 2;

    const radius1 = 6 / phi;
    const radius2 = 6 * phi;
    const radius3 = 6;

    const draw = callback => {
        const loop = epoch => requestAnimationFrame(now => {
            if (animate) loop(epoch);
            callback(now - epoch);
        });

        requestAnimationFrame(loop);
    };

    const drawAtom = (x, y, radius, radians) => {
        const cx = x + radius * Math.cos(radians);
        const cy = y + radius * Math.sin(radians);

        context.beginPath();
        context.arc(cx, cy, 10, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    };

    draw(now => {
        const radians1 = phase * Math.PI / 180;
        const radians2 = radians1 + Math.PI / 3;
        const radians3 = radians2 + Math.PI / 3;

        context.clearRect(0, 0, 400, 400);

        context.strokeStyle = player === 1 ? green : red;

        context.beginPath();

        for (var i = 39.5; i < 400; i += 80) {
            context.moveTo(i, 39.5);
            context.lineTo(i, 359.5);
            context.moveTo(39.5, i);
            context.lineTo(359.5, i);
        }

        context.stroke();

        context.strokeStyle = black;

        for (var i = 0; i < 5; i++) {
            const y = 80 * i + 39.5;

            for (var j = 0; j < 5; j++) {
                const x = 80 * j + 39.5;

                const point = board[5 * i + j];

                context.fillStyle = point < 0 ? green : red;

                const atoms = Math.abs(point);

                if (atoms >= 1) drawAtom(x, y, radius1, radians1);
                if (atoms >= 2) drawAtom(x, y, radius2, radians2);
                if (atoms >= 3) drawAtom(x, y, radius3, radians3);
            }
        }

        context.fillStyle = player === 1 ? green : red;

        for (const {x, y} of atoms) {
            context.beginPath();
            context.arc(x, y, 10, 0, 2 * Math.PI);
            context.stroke();
            context.fill();
        }
    });
});
