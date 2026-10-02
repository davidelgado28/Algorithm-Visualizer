const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const categorySel = document.getElementById('category');
const algoSel = document.getElementById('algorithm');
const playBtn = document.getElementById('playBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedInput = document.getElementById('speed');
const pathTools = document.getElementById('pathTools');
const treeTools = document.getElementById('treeTools');
const messageEl = document.getElementById('message');
const legendEl = document.getElementById('legend');

const ALGOS = {
  sorting: [
    ['bubble', 'Bubble Sort'],
    ['selection', 'Selection Sort'],
    ['insertion', 'Insertion Sort'],
    ['merge', 'Merge Sort'],
    ['quick', 'Quick Sort'],
  ],
  pathfinding: [
    ['dijkstra', 'Dijkstra'],
    ['astar', 'A*'],
    ['bfs', 'BFS'],
    ['dfs', 'DFS'],
  ],
  tree: [
    ['bst-insert', 'Inserção BST'],
    ['bst-search', 'Busca BST'],
    ['bst-inorder', 'Travessia Em Ordem'],
  ],
};

let mode = 'sorting';
let algo = 'bubble';
let running = false;
let paused = false;
let generator = null;
let timer = null;
let stats = { comparisons: 0, swaps: 0, visited: 0, cost: null };

function resizeCanvas() {
  const stage = document.getElementById('stage');
  canvas.width = stage.clientWidth;
  canvas.height = stage.clientHeight;
  draw();
}

function setMessage(msg) { messageEl.textContent = msg || ''; }

function updateStats() {
  document.getElementById('comparisons').textContent = stats.comparisons;
  document.getElementById('swaps').textContent = stats.swaps;
  document.getElementById('visited').textContent = stats.visited;
  document.getElementById('cost').textContent = stats.cost ?? '—';
}

function setLegend(items) {
  legendEl.innerHTML = items
    .map(([color, label]) =>
      `<span><span class="dot" style="background:color"></span>{color}"></span>color"></span>{label}</span>`)
    .join('');
}

function populateAlgos() {
  algoSel.innerHTML = ALGOS[mode]
    .map(([v, l]) => `<option value="v">{v}">v">{l}</option>`)
    .join('');
  algo = ALGOS[mode][0][0];
  pathTools.style.display = mode === 'pathfinding' ? 'flex' : 'none';
  treeTools.style.display = mode === 'tree' ? 'flex' : 'none';
}

let arr = [];

function randomArray(n = 40) {
  arr = Array.from({ length: n }, () => ({
    value: Math.floor(Math.random() * 95) + 5,
    done: false,
  }));
}

function* bubbleSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - i - 1; j++) {
      stats.comparisons++;
      yield { arr: [...a], hi: [j, j + 1], colors: ['y', 'y'], msg: `Comparando a[j].value>{a[j].value} >a[j].value>{a[j + 1].value}?` };
      if (a[j].value > a[j + 1].value) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        stats.swaps++; swapped = true;
        yield { arr: [...a], hi: [j, j + 1], colors: ['r', 'r'], msg: `Trocando a[j].value↔{a[j].value} ↔a[j].value↔{a[j + 1].value}` };
      }
    }
    a[a.length - 1 - i].done = true;
    if (!swapped) { a.forEach(x => x.done = true); yield { arr: [...a], msg: 'Já ordenado — saída antecipada!' }; break; }
  }
  a.forEach(x => x.done = true);
  yield { arr: [...a], msg: '✅ Ordenado!' };
}

function* selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      stats.comparisons++;
      yield { arr: [...a], hi: [min, j], colors: ['p', 'y'], msg: `Comparando a[j].value<{a[j].value} <a[j].value<{a[min].value}?` };
      if (a[j].value < a[min].value) min = j;
    }
    if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; stats.swaps++; }
    a[i].done = true;
    yield { arr: [...a], hi: [i], colors: ['g'], msg: `Posição ifinalizadacom{i} finalizada comifinalizadacom{a[i].value}` };
  }
  a[a.length - 1].done = true;
  yield { arr: [...a], msg: '✅ Ordenado!' };
}

function* insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    yield { arr: [...a], hi: [i], colors: ['p'], msg: `Inserindo ${key.value}` };
    while (j >= 0 && a[j].value > key.value) {
      stats.comparisons++;
      a[j + 1] = a[j];
      stats.swaps++;
      yield { arr: [...a], hi: [j, j + 1], colors: ['y', 'r'], msg: `a[j].value>{a[j].value} >a[j].value>{key.value}, deslocando` };
      j--;
    }
    a[j + 1] = key;
    yield { arr: [...a], hi: [j + 1], colors: ['g'], msg: `key.valueinseridonaposic\ca~o{key.value} inserido na posiçãokey.valueinseridonaposic\c​a~o{j + 1}` };
  }
  a.forEach(x => x.done = true);
  yield { arr: [...a], msg: '✅ Ordenado!' };
}

function* mergeSort(a) {
  yield* ms(a, 0, a.length - 1);
  a.forEach(x => x.done = true);
  yield { arr: [...a], msg: '✅ Ordenado!' };
}
function* ms(a, l, r) {
  if (l >= r) return;
  const m = (l + r) >> 1

function* ms(a, l, r) {
  if (l >= r) return;
  const m = (l + r) >> 1;
  yield* ms(a, l, m);
  yield* ms(a, m + 1, r);
  const merged = [];
  let i = l, j = m + 1;
  while (i <= m && j <= r) {
    stats.comparisons++;
    yield { arr: [...a], hi: [i, j], colors: ['y', 'y'], msg: `Merge: comparando a[i].valuee{a[i].value} ea[i].valuee{a[j].value}` };
    merged.push(a[i].value <= a[j].value ? a[i++] : a[j++]);
  }
  while (i <= m) merged.push(a[i++]);
  while (j <= r) merged.push(a[j++]);
  for (let k = 0; k < merged.length; k++) a[l + k] = { value: merged[k].value ?? merged[k], done: false };
  stats.swaps += merged.length;
  yield { arr: [...a], hi: Array.from({ length: r - l + 1 }, (_, k) => l + k), colors: Array(r - l + 1).fill('g'), msg: `Mesclado [l..{l}..l..{r}]` };
}

function* quickSort(a) {
  yield* qs(a, 0, a.length - 1);
  a.forEach(x => (x.done = true));
  yield { arr: [...a], msg: '✅ Ordenado!' };
}
function* qs(a, lo, hi) {
  if (lo > hi) return;
  if (lo === hi) { a[lo].done = true; return; }
  const pivot = a[hi].value;
  yield { arr: [...a], hi: [hi], colors: ['p'], msg: `Pivô = ${pivot}` };
  let i = lo;
  for (let j = lo; j < hi; j++) {
    stats.comparisons++;
    yield { arr: [...a], hi: [j, hi], colors: ['y', 'p'], msg: `a[j].value<{a[j].value} <a[j].value<{pivot}?` };
    if (a[j].value < pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      stats.swaps++;
      if (i !== j) yield { arr: [...a], hi: [i, j], colors: ['r', 'r'], msg: 'Trocando' };
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  stats.swaps++;
  a[i].done = true;
  yield { arr: [...a], hi: [i], colors: ['g'], msg: `Pivô pivotfixadonaposic\ca~o{pivot} fixado na posiçãopivotfixadonaposic\c​a~o{i}` };
  yield* qs(a, lo, i - 1);
  yield* qs(a, i + 1, hi);
}
const SORT_ALGOS = { bubble: bubbleSort, selection: selectionSort, insertion: insertionSort, merge: mergeSort, quick: quickSort };

const COLS = 40, ROWS = 22;
let grid = [];
let startPos = { r: 5, c: 5 };
let endPos = { r: ROWS - 6, c: COLS - 6 };
let drawTool = null; 

function initGrid() {
  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ wall: false, visited: false, frontier: false, path: false }))
  );
  startPos = { r: 5, c: 5 };
  endPos = { r: ROWS - 6, c: COLS - 6 };
  stats = { comparisons: 0, swaps: 0, visited: 0, cost: null };
  updateStats();
  setMessage('');
}
function neighborsOf(p) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const result = [];
  for (const [dr, dc] of dirs) {
    const r = p.r + dr, c = p.c + dc;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) result.push({ r, c });
  }
  return result;
}
const key = (p) => `p.r,{p.r},p.r,{p.c}`;

function generateMaze() {
  initGrid();
  function divide(r1, r2, c1, c2) {
    if (r2 - r1 < 2 || c2 - c1 < 2) return;
    if (r2 - r1 > c2 - c1) {
      const wallR = r1 + Math.floor(Math.random() * (r2 - r1 - 1)) + 1;
      const gapC = c1 + Math.floor(Math.random() * (c2 - c1 + 1));
      for (let c = c1; c <= c2; c++) if (c !== gapC) grid[wallR][c].wall = true;
      divide(r1, wallR - 1, c1, c2);
      divide(wallR + 1, r2, c1, c2);
    } else {
      const wallC = c1 + Math.floor(Math.random() * (c2 - c1 - 1)) + 1;
      const gapR = r1 + Math.floor(Math.random() * (r2 - r1 + 1));
      for (let r = r1; r <= r2; r++) if (r !== gapR) grid[r][wallC].wall = true;
      divide(r1, r2, c1, wallC - 1);
      divide(r1, r2, wallC + 1, c2);
    }
  }
  divide(0, ROWS - 1, 0, COLS - 1);
  grid[startPos.r][startPos.c].wall = false;
  grid[endPos.r][endPos.c].wall = false;
  draw();
}

function* reconstructPath(cameFrom, current) {
  const path = [current];
  let cost = 0;
  while (cameFrom.has(key(current))) {
    current = cameFrom.get(key(current));
    path.push(current);
    cost++;
  }
  path.reverse();
  for (const p of path) {
    grid[p.r][p.c].path = true;
    yield { msg: `Caminho encontrado! Custo: ${cost}` };
  }
  stats.cost = cost;
}

function* dijkstra() {
  const dist = new Map();
  const cameFrom = new Map();
  const pq = [{ p: startPos, d: 0 }];
  dist.set(key(startPos), 0);
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { p, d } = pq.shift();
    if (d > (dist.get(key(p)) ?? Infinity)) continue;
    stats.visited++;
    grid[p.r][p.c].visited = true;
    if (p.r === endPos.r && p.c === endPos.c) {
      yield* reconstructPath(cameFrom, p);
      return;
    }
    for (const n of neighborsOf(p)) {
      if (grid[n.r][n.c].wall) continue;
      const nd = d + 1;
      if (nd < (dist.get(key(n)) ?? Infinity)) {
        dist.set(key(n), nd);
        cameFrom.set(key(n), p);
        grid[n.r][n.c].frontier = true;
        pq.push({ p: n, d: nd });
      }
    }
    yield { msg: 'Dijkstra: expandindo menor distância...' };
  }
  yield { msg: '❌ Caminho não encontrado!' };
}

function heuristic(p) {
  return Math.abs(p.r - endPos.r) + Math.abs(p.c - endPos.c);
}

function* astar() {
  const g = new Map([[key(startPos), 0]]);
  const cameFrom = new Map();
  const open = [{ p: startPos, f: heuristic(startPos) }];
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { p } = open.shift();
    stats.visited++;
    grid[p.r][p.c].visited = true;
    if (p.r === endPos.r && p.c === endPos.c) {
      yield* reconstructPath(cameFrom, p);
      return;
    }
    for (const n of neighborsOf(p)) {
      if (grid[n.r][n.c].wall) continue;
      const ng = (g.get(key(p)) ?? Infinity) + 1;
      if (ng < (g.get(key(n)) ?? Infinity)) {
        g.set(key(n), ng);
        cameFrom.set(key(n), p);
        grid[n.r][n.c].frontier = true;
        open.push({ p: n, f: ng + heuristic(n) });
      }
    }
    yield { msg: 'A*: expandindo menor f = g + h...' };
  }
  yield { msg: '❌ Caminho não encontrado!' };
}

function* bfs() {
  const queue = [startPos];
  const cameFrom = new Map();
  const seen = new Set([key(startPos)]);
  while (queue.length) {
    const p = queue.shift();
    stats.visited++;
    grid[p.r][p.c].visited = true;
    if (p.r === endPos.r && p.c === endPos.c) {
      yield* reconstructPath(cameFrom, p);
      return;
    }
    for (const n of neighborsOf(p)) {
      if (grid[n.r][n.c].wall || seen.has(key(n))) continue;
      seen.add(key(n));
      cameFrom.set(key(n), p);
      grid[n.r][n.c].frontier = true;
      queue.push(n);
    }
    yield { msg: 'BFS: explorando em largura...' };
  }
  yield { msg: '❌ Caminho não encontrado!' };
}

function* dfs() {
  const cameFrom = new Map();
  const seen = new Set();
  function* go(p) {
    seen.add(key(p));
    stats.visited++;
    grid[p.r][p.c].visited = true;
    if (p.r === endPos.r && p.c === endPos.c) {
      yield* reconstructPath(cameFrom, p);
      return true;
    }
    for (const n of neighborsOf(p)) {
      if (grid[n.r][n.c].wall || seen.has(key(n))) continue;
      cameFrom.set(key(n), p);
      grid[n.r][n.c].frontier = true;
      yield { msg: 'DFS: explorando em profundidade...' };
      if (yield* go(n)) return true;
    }
    return false;
  }
  const found = yield* go(startPos);
  if (!found) yield { msg: '❌ Caminho não encontrado!' };
}

const PATH_ALGOS = { dijkstra, astar, bfs, dfs };

let bst = null; 

function bstInsert(node, value) {
  if (!node) return { value, left: null, right: null };
  if (value < node.value) node.left = bstInsert(node.left, value);
  else if (value > node.value) node.right = bstInsert(node.right, value);
  return node;
}

function randomTree() {
  bst = null;
  const used = new Set();
  while (used.size < 15) {
    const v = Math.floor(Math.random() * 90) + 5;
    if (!used.has(v)) { used.add(v); bst = bstInsert(bst, v); }
  }
}
function bstHeight(n) { return n ? 1 + Math.max(bstHeight(n.left), bstHeight(n.right)) : 0; }

function layoutTree() {
  if (!bst) return [];
  const nodes = [];
  let counter = 0;
  const total = countNodes(bst);
  function walk(n, depth) {
    if (!n) return;
    walk(n.left, depth + 1);
    nodes.push({ node: n, x: (counter++ / (total - 1 || 1)), y: depth });
    walk(n.right, depth + 1);
  }
  function countNodes(n) { return n ? 1 + countNodes(n.left) + countNodes(n.right) : 0; }
  walk(bst, 0);
  return nodes;
}

function* genBstInsert(bstRef) {
  return bstInsert(bstRef);
}

function* bstInsertAnim(value) {
  stats.visited = 0;
  if (!bst) {
    bst = { value, left: null, right: null };
    yield { msg: `Raiz criada com ${value}` };
    return;
  }
  let cur = bst;
  while (true) {
    stats.comparisons++;
    stats.visited++;
    cur.highlight = true;
    draw();
    if (value === cur.value) {
      yield { msg: `${value} já existe — BST não aceita duplicatas` };
      cur.highlight = false;
      return;
    }
    const goLeft = value < cur.value;
    yield { msg: `value{value}value{goLeft ? '<' : '>'} cur.value→indoparaa{cur.value} → indo para acur.value→indoparaa{goLeft ? 'esquerda' : 'direita'}` };
    cur.highlight = false;
    const next = goLeft ? cur.left : cur.right;
    if (!next) {
      if (goLeft) cur.left = { value, left: null, right: null };
      else cur
            else cur.right = { value, left: null, right: null };
      stats.swaps++; 
      yield { msg: `✅ valueinseridocomofilho{value} inserido como filhovalueinseridocomofilho{goLeft ? 'esquerdo' : 'direito'} de ${cur.value}` };
      return;
    }
    cur = next;
  }
}

function* bstSearchAnim(value) {
  stats.visited = 0;
  let cur = bst;
  while (cur) {
    stats.comparisons++;
    stats.visited++;
    cur.highlight = true;
    draw();
    if (value === cur.value) {
      yield { msg: `🎉 Encontrado ${value}!` };
      return;
    }
    const goLeft = value < cur.value;
    yield { msg: `value{value}value{goLeft ? '<' : '>'} cur.value→{cur.value} →cur.value→{goLeft ? 'esquerda' : 'direita'}` };
    cur.highlight = false;
    cur = goLeft ? cur.left : cur.right;
  }
  yield { msg: `❌ ${value} não está na árvore` };
}

function* bstInorderAnim() {
  stats.visited = 0;
  const out = [];
  function* walk(n) {
    if (!n) return;
    yield* walk(n.left);
    stats.visited++;
    n.highlight = true;
    out.push(n.value);
    yield { msg: `Visitando n.value(emordem:{n.value} (em ordem:n.value(emordem:{out.join(', ')})` };
    n.highlight = false;
    yield* walk(n.right);
  }
  yield* walk(bst);
  yield { msg: `✅ Travessia completa: ${out.join(', ')}` };
}

const TREE_OPS = {
  'bst-insert': (v) => bstInsertAnim(v),
  'bst-search': (v) => bstSearchAnim(v),
  'bst-inorder': () => bstInorderAnim(),
};

const COLORS = {
  b: '#30363d', 
  y: '#e3b341', 
  r: '#f85149', 
  g: '#3fb950', 
  p: '#bc8cff', 
};

function drawSorting(frame) {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const a = frame?.arr ?? arr;
  const hi = frame?.hi ?? [];
  const colors = frame?.colors ?? [];
  const n = a.length;
  const barW = W / n;
  const maxV = 100;

  for (let i = 0; i < n; i++) {
    const h = (a[i].value / maxV) * (H - 30);
    const x = i * barW;
    let color = a[i].done ? COLORS.g : COLORS.b;
    const hiIdx = hi.indexOf(i);
    if (hiIdx >= 0) color = COLORS[colors[hiIdx]] ?? COLORS.b;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, H - h, barW - 2, h);
  }
}

function drawPathfinding() {
  const W = canvas.width, H = canvas.height;
  const cellW = W / COLS, cellH = H / ROWS;
  ctx.clearRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      let color = '#21262d';
      if (cell.wall) color = '#58a6ff'; 
      if (cell.wall) color = '#444c56';
      if (cell.visited) color = '#1f3a5f';
      if (cell.frontier) color = '#2563eb';
      if (cell.path) color = '#e3b341';
      ctx.fillStyle = color;
      ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);

      if (startPos.r === r && startPos.c === c) {
        ctx.fillStyle = '#3fb950';
        ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
      }
      if (endPos.r === r && endPos.c === c) {
        ctx.fillStyle = '#f85149';
        ctx.fillRect(c * cellW, r * cellH, cellW - 1, cellH - 1);
      }
      if (cell.path) {
        ctx.fillStyle = '#e3b341';
        ctx.beginPath();
        ctx.arc(c * cellW + cellW / 2, r * cellH + cellH / 2, Math.min(cellW, cellH) / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
function drawTree() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!bst) {
    ctx.fillStyle = '#8b949e';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Insira valores para construir a árvore', W / 2, H / 2);
    return;
  }
  const nodes = layoutTree();
  const positions = new Map();
  const marginX = 60, topY = 50, levelH = Math.min(80, (H - 100) / Math.max(1, bstHeight(bst)));
  for (const { node, x, y } of nodes) {
    positions.set(node, {
      px: marginX + x * (W - 2 * marginX),
      py: topY + y * levelH,
    });
  }
  ctx.lineWidth = 2;
  for (const { node } of nodes) {
    const pos = positions.get(node);
    for (const child of [node.left, node.right]) {
      if (child) {
        const cpos = positions.get(child);
        ctx.beginPath();
        ctx.moveTo(pos.px, pos.py);
        ctx.lineTo(cpos.px, cpos.py);
        ctx.stroke();
      }
    }
  }
  for (const { node } of nodes) {
    const { px, py } = positions.get(node);
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = node.highlight ? '#e3b341' : '#1f3a5f';
    ctx.fill();
    ctx.strokeStyle = node.highlight ? '#e3b341' : '#58a6ff';
    ctx.stroke();
    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, px, py);
  }
}

function draw(frame = null) {
  if (mode === 'sorting') drawSorting(frame);
  else if (mode === 'pathfinding') drawPathfinding();
  else if (mode === 'tree') drawTree();
}

const SPEEDS = { sorting: 30, pathfinding: 20, tree: 30 };

function tick() {
  if (!running || paused || !generator) return;
  const { value, done } = generator.next();
  if (done) {
    stopRun();
    setMessage('Concluído.');
    return;
  }
  currentFrame = value;
  if (value.arr) drawSorting(value.arr);
  else if (mode === 'pathfinding') {
    if (value.msg?.startsWith('Caminho encontrado')) stats.cost = stats.cost ?? 0;
    updateStats();
    drawPathfinding();
  } else if (mode === 'tree') {
    updateStats();
    drawTree();
  }
  if (value.msg) setMessage(value.msg);
  updateStats();
}

function startRun(initialArg) {
  if (running) { 
    paused = !paused;
    playBtn.textContent = paused ? '▶ Retomar' : '⏸ Pausar';
    return;
  }
  stats = { comparisons: 0, swaps: 0, visited: 0, cost: null };

  if (mode === 'sorting') {
    generator = SORT_ALGOS[algo](arr);
  } else if (mode === 'pathfinding') {
    initGrid();
    generator = PATH_ALGOS[algo]();
  } else if (mode === 'tree') {
    const v = parseInt(document.getElementById('nodeValue').value, 10);
    if (algo !== 'bst-inorder') {
      if (!v || v < 1 || v > 99) { setMessage('Digite um valor entre 1 e 99'); return; }
      document.getElementById('nodeValue').value = '';
    }
    generator = TREE_OPS[algo](v);
  }

  running = true;
  paused = false;
  playBtn.textContent = '⏸ Pausar';
  stepBtn.disabled = false;
  setControlsDisabled(true);
  timer = setInterval(tick, 1000 / Number(speedInput.value));
}

function stopRun() {
  running = false;
  paused = false;
  clearInterval(timer);
  playBtn.textContent = '▶ Iniciar';
  stepBtn.disabled = true;
  setControlsDisabled(false);
  draw();
}
function setControlsDisabled(disabled) {
  [categorySel, algoSel, resetBtn].forEach(el => el.disabled = disabled);
}
function stepOnce() {
  if (!generator) return;
  paused = true;
  const { value, done } = generator.next();
  if (done) { stopRun(); setMessage('Concluído.'); return; }
  if (value.arr) drawSorting(value.arr);
  else draw();
  if (value.msg) setMessage(value.msg);
  updateStats();
}

categorySel.addEventListener('change', () => {
  mode = categorySel.value;
  populateAlgos();
  stopRun();
  reset();
});

algoSel.addEventListener('change', () => {
  algo = algoSel.value;
  stopRun();
  reset();
});

playBtn.addEventListener('click', () => {
  if (running && paused) { startRun(); return; }
  startRun();
});

stepBtn.addEventListener('stepBtn' in window ? 'click' : 'click', stepOnce);

resetBtn.addEventListener('click', reset);

function reset() {
  stopRun();
  stats = { comparisons: 0, swaps: 0, visited: 0, cost: null };
  updateStats();
  setMessage('');
  if (mode === 'sorting') randomArray();
  else if (mode === 'pathfinding') initGrid();
  else if (mode === 'tree') randomTree();
  draw();
}
let mouseDown = false;
canvas.addEventListener('mousedown', (e) => {
  if (mode !== 'pathfinding' || running) return;
  mouseDown = true;
  handleGridClick(e);
});
canvas.addEventListener('mousemove', (e) => {
  if (!mouseDown) return;
  handleGridClick(e);
});
window.addEventListener('mouseup', () => (mouseDown = false));

function handleGridClick(e) {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((e.clientX - rect.left) / (rect.width / COLS));
  const r = Math.floor((e.clientY - rect.top) / (rect.height / ROWS));
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  if (drawTool === 'start' || drawTool === 'end') {
    const cell = grid[r][c];
    if (cell.wall) return;
    if (drawTool === 'start') { startPos = { r, c }; drawTool = null; }
    else { endPos = { r, c }; drawTool = null; }
  } else {
    if ((r === startPos.r && c === startPos.c) || (r === endPos.r && c === endPos.c)) return;
    grid[r][c].wall = !grid[r][c].wall;
  }
