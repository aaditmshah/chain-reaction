var player, phase, board, atoms, monaco, keyframes = 0;

const timer = (interval, callback) => {
    const epoch = performance.now();

    const loop = expected => {
        const actual = performance.now();
        const next = expected + interval;
        setTimeout(loop, next - actual, next);
        callback(actual - epoch);
    };

    setTimeout(loop, interval, epoch + interval);
};

const switchPlayer = () => {
    player = 1 - player;

    if (player === 1) {
        setTimeout(() => monaco.postMessage({ type: "request" }), 1000);
    }
};

const addAtom = (x, y, post = false) => {
    const j = Math.floor(x / 80);
    const i = Math.floor(y / 80);
    const k = 5 * i + j;

    if (post) monaco.postMessage({ type: "update", move: 1 << k });

    const point = board[k];

    const betweenX = j > 0 && j < 4;
    const betweenY = i > 0 && i < 4;

    const capacity = betweenX && betweenY ? 3
                   : betweenX || betweenY ? 2 : 1;

    if (post) {
        if (player === 0 && point >= 0) {
            var sound = null;

            if (point < capacity) {
                board[k]++;
                switchPlayer();
                sound = "add";
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
                sound = "split";
            }

            postMessage({ player, phase, board, atoms, sound });
        } else if (player === 1 && point <= 0) {
            var sound = null;

            if (-point < capacity) {
                board[k]--;
                switchPlayer();
                sound = "add";
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
                sound = "split";
            }

            postMessage({ player, phase, board, atoms, sound });
        }
    } else if (player === 0) {
        if (point >= 0) {
            if (point < capacity) {
                board[k]++;
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
            }
        } else {
            if (-point < capacity) {
                board[k] = -board[k] + 1;
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
            }
        }
    } else {
        if (point <= 0) {
            if (-point < capacity) {
                board[k]--;
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
            }
        } else {
            if (point < capacity) {
                board[k] = -board[k] - 1;
            } else {
                board[k] = 0;
                splitMolecule(i, j, capacity);
            }
        }
    }
};

const splitMolecule = (i, j, capacity) => {
    keyframes = 10;

    const x = 80 * j + 39.5;
    const y = 80 * i + 39.5;

    const right = { x, y, dx: +8, dy: +0 };
    const left  = { x, y, dx: -8, dy: -0 };
    const down  = { x, y, dx: +0, dy: +8 };
    const up    = { x, y, dx: -0, dy: -8 };

    switch (capacity) {
    case 3:
        atoms.push(right, left, down, up);
        break;
    case 2:
        if (i === 0) {
            atoms.push(right, left, down);
        } else if (i === 4) {
            atoms.push(right, left, up);
        } else if (j === 0) {
            atoms.push(right, down, up);
        } else if (j === 4) {
            atoms.push(left, down, up);
        }
        break;
    case 1:
        if (i === 0 && j === 0) {
            atoms.push(right, down);
        } else if (i === 0 && j === 4) {
            atoms.push(left, down);
        } else if (i === 4 && j === 0) {
            atoms.push(right, up);
        } else if (i === 4 && j === 4) {
            atoms.push(left, up);
        }
    }
};

addEventListener("message", function (event) {
    switch (event.data.type) {
    case "boot":
        player = event.data.player;
        phase  = event.data.phase;
        board  = event.data.board;
        atoms  = event.data.atoms;
        monaco = event.data.monaco;

        monaco.start();

        monaco.addEventListener("message", function (event) {
            const move = event.data;

            const x = 80 * (move % 5) + 39.5;
            const y = 80 * Math.floor(move / 5) + 39.5;

            addAtom(x, y, true);
        });

        timer(1000 / 30, now => {
            var sound = null;

            phase = (phase + 6) % 360;

            if (keyframes > 0) {
                for (const atom of atoms) {
                    atom.x += atom.dx;
                    atom.y += atom.dy;
                }

                if (--keyframes === 0) {
                    const copy = atoms.splice(0);
                    for (const {x, y} of copy) addAtom(x, y);
                    if (player === 0 && board.every(x => x >= 0)) sound = "gameover";
                    else if (player === 1 && board.every(x => x <= 0)) sound = "gameover";
                    else if (keyframes > 0) sound = "split";
                    else switchPlayer();
                }
            }

            postMessage({ player, phase, board, atoms, sound });
        });

        break;
    case "click":
        const {offsetX, offsetY} = event.data;

        if (keyframes === 0 && player === 0) addAtom(offsetX, offsetY, true);
    }
});
