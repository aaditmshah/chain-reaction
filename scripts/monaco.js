addEventListener("message", function (event) {
    const {player, board, worker} = event.data;

    worker.start();

    var w = 33080895;
    var x = 0;
    var y = 0;
    var z = 0;

    const corner = { "-1": [1,1,1], "0": [1,0,0], "1": [0,1,1] };
    const edge   = { "-2": [1,0,1], "-1": [1,1,0], "0": [0,0,0], "1": [0,1,0], "2": [0,0,1] };
    const center = { "-3": [1,1,1], "-2": [1,1,0], "-1": [1,0,1], "0": [1,0,0], "1": [0,0,1], "2": [0,1,0], "3": [0,1,1] };

    board.forEach((point, i) => {
        const xpos = i % 5;
        const ypos = (i - xpos) / 5;

        const [a, b, c] = [0,4,20,24].includes(i) ? corner[point]
                        : [0,4].includes(xpos) || [0,4].includes(ypos)
                        ? edge[point] : center[point];

        x |= a << i;
        y |= b << i;
        z |= c << i;
    });

    const getMoves = (x, y, z) => {
        const moves = [];

        var m = y | z;

        for (m = (w | x | m) & ~(x & m); m; m &= m - 1) moves.push(m & -m);

        return moves;
    };

    const playMove = (x, y, z, m) => {
        var x2 = y & z, y2 = w ^ y ^ z ^ w & x2, z2 = ~z & (x | y), m2 = ~m;

        x  = x2 & m | m2 & x;
        y2 = y2 & m | m2 & y;
        z2 = z2 & m | m2 & z;
        m &= z & (w | y);

        y = y2, z = z2;

        while (m) {
            let news = [m >> 5, m << 1 & 32472030, m >> 1 & 16236015, m << 5 & 33554400];

            m = 0;

            for (let n of news) {
                x2 = y & z, y2 = w ^ y ^ z ^ w & x2, z2 = ~z & (x | y), m2 = ~n;

                x  = x2 & n | m2 & x;
                y2 = y2 & n | m2 & y;
                z2 = z2 & n | m2 & z;
                m |= n & z & (w | y);

                y = y2, z = z2;

                if ((x & (y | z)) === 0) return { x, y, z, lost: true };
            }
        }

        x ^= y | z;

        return { x, y, z, lost: false };
    };

    const getChild = (x, y, z, move) => {
        const child = playMove(x, y, z, move);

        child.moves    = child.lost ? [0] : getMoves(child.x, child.y, child.z);
        child.children = new Map;
        child.w = 0;
        child.n = 0;

        return child;
    };

    var tree = { x, y, z, lost: false, moves: getMoves(x, y, z), children: new Map, w: 0, n: 0 };

    var playouts = 0;

    worker.addEventListener("message", function (event) {
        switch (event.data.type) {
        case "update":
            const m = event.data.move;
            if (tree.children.has(m)) tree = tree.children.get(m);
            else tree = getChild(tree.x, tree.y, tree.z, m);
            playouts = 0;
            break;
        case "request":
            let best, move, value = 0;

            for (const [m, child] of tree.children) {
                const val = child.w / child.n;

                if (val > value) {
                    value = val;
                    best  = child;
                    move  = m;
                }
            }

            if (value === 0) move = tree.moves[Math.floor(tree.moves.length * Math.random())];

            worker.postMessage(Math.log(move) / Math.log(2));
        }
    });

    const c = Math.sqrt(2);

    const channel = new MessageChannel;
    channel.port1.postMessage(null);
    channel.port2.start();

    channel.port2.addEventListener("message", function () {
        if (playouts < 1000000) {
            playouts++;

            var node = tree;

            var color = 0;

            const list = [[], []];

            while (node.moves.length === 0) {
                list[color].push(node);
                color = 1 - color;
                const N = node.n++;

                let best, value = 0;

                for (const [m, child] of node.children) {
                    const val = child.w / child.n + c * Math.sqrt(Math.log(N) / child.n);

                    if (val > value) {
                        value = val;
                        best  = child;
                    }
                }

                node = best;
            }

            list[color].push(node);
            color = 1 - color;
            node.n++;

            if (node.lost) {
                for (const node of list[1 - color]) node.w++;
                return channel.port1.postMessage(null);
            }

            const [move] = node.moves.splice(Math.floor(node.moves.length * Math.random()), 1);
            const child  = getChild(node.x, node.y, node.z, move);

            node.children.set(move, child);
            list[color].push(node = child);
            color = 1 - color;
            node.n++;

            while (!node.lost) {
                const moves = getMoves(node.x, node.y, node.z);
                const move  = moves[Math.floor(moves.length * Math.random())];
                node  = playMove(node.x, node.y, node.z, move);
                color = 1 - color;
            }

            for (const node of list[1 - color]) node.w++;
        }

        channel.port1.postMessage(null);
    });
});
