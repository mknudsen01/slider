let openPosition;
let containerHeight = 400;
let containerWidth = 400;
let rowCount = 4;
let columnCount = 4;
let orderedPositions = Array.from(Array(rowCount * columnCount).keys());
let backgroundImageUrl = "images/1.jpg";
let imageOffsetX = 200;
let imageOffsetY = 0;
let tiles = [];

// DOM elements that we will manipulate
const elements = {
  congratsMessage: document.querySelector('p[data-message="congrats"]'),
  shuffleButton: document.querySelector('button[data-control="shuffle"]'),
  solveButton: document.querySelector('button[data-control="solve"]'),
  tileContainer: document.querySelector('div[data-ui="tile-container"]'),
  rowCount: document.querySelector('input[name="rows"]'),
  columnCount: document.querySelector('input[name="columns"]'),
}

// keyCodes for arrow keys
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
let positionChanges = {
  [LEFT_ARROW]: -1,
  [UP_ARROW]: -4,
  [RIGHT_ARROW]: 1,
  [DOWN_ARROW]: 4,
}

//helpers
function shuffle(values) {
  return values.sort(() => 0.5 - Math.random());
}
function addClasses(element, ...classNames) {
  if (!classNames) return;
  classNames.forEach(name => {
    element.classList.add(name);
  })
}

function removeClasses(element, ...classNames) {
  if (!classNames) return;
  classNames.forEach(name => {
    element.classList.remove(name);
  })
}
// end helpers

function randomPositions() {
  const positions = shuffle(orderedPositions);
  return {
    used: positions.slice(0, orderedPositions.length - 1),
    open: positions.slice(-1)[0],
  }
}

function resetPuzzle() {
  addClasses(elements.congratsMessage, 'invisible');
  let shuffledPositions = randomPositions();
  let startPositions = shuffledPositions.used;
  openPosition = shuffledPositions.open;

  tiles.forEach((tile, index) => {
    tile.position = startPositions[index];
    arrangeTileOnBoard(tile);
  })
}

function solvePuzzle() {
  tiles.forEach((tile, index) => {
    tile.position = index;
    arrangeTileOnBoard(tile);
  })
  openPosition = rowCount * columnCount - 1;
}

function arrangeTileOnBoard(tile) {
  if (!elements.congratsMessage.classList.contains('invisible')) {
    addClasses(elements.congratsMessage, 'invisible');
  }
  let row = Math.floor(tile.position / columnCount);
  let column = tile.position % columnCount;
  tile.style.top = `${(row * (containerHeight / rowCount)) + (row * 1)}px`;
  tile.style.left = `${(column * (containerWidth / columnCount)) + (column * 1)}px`;
}

function findTileWithPosition(tile, position) {
  return tile && tile.position === position;
}

function checkSolved(e) {
  let tileCount = rowCount * columnCount;
  let solved = openPosition === tileCount - 1 && tiles.slice(0, tileCount - 1).every((tile, index) => {
    return tile.position === parseInt(tile.dataset.correct);
  })
  if (solved) endPuzzle();
}

function endPuzzle() {
  removeClasses(elements.congratsMessage, 'invisible');
}

function moveTile(e) {
  // if not an arrow key, stop
  if (!positionChanges[e.keyCode]) return;

  // e.g., if left arrow pushed and open position is 2, tile to move is (2 - -1), or 3
  let maybeNewOpenPosition = openPosition - positionChanges[e.keyCode];
  let movingTile = tiles.find(tile => findTileWithPosition(tile, maybeNewOpenPosition));
  let totalTiles = rowCount * columnCount;
  let tilesInRow = columnCount;


  // if can't find tile or tile can't move a certain direction, stop
  if (!movingTile) return;
  if (openPosition <= (tilesInRow - 1) && e.keyCode === DOWN_ARROW) return;
  if (openPosition >= (totalTiles - tilesInRow) && e.keyCode === UP_ARROW) return;
  if (movingTile.position % tilesInRow === (tilesInRow - 1) && e.keyCode === RIGHT_ARROW) return;
  if (movingTile.position % tilesInRow === 0 && e.keyCode === LEFT_ARROW) return;

  // switch the open position and the tile we just moved's current position
  [openPosition, movingTile.position] = [movingTile.position, openPosition];

  // animate tile movement
  arrangeTileOnBoard(movingTile);
}

function resizeTileContainer() {
  elements.tileContainer.style.height = containerHeight;
  elements.tileContainer.style.width = containerWidth;
}

function createTiles() {
  elements.tileContainer.innerHTML = '';
  tiles = [];
  orderedPositions.forEach((position, index) => {
    let tile = document.createElement('div');
    let row = Math.floor(position / columnCount);
    let column = position % columnCount;
    let tileWidth = containerWidth / columnCount;
    let tileHeight = containerHeight / rowCount;
    tile.dataset.correct = position;
    addClasses(tile, 'tile');
    if (index === orderedPositions.length - 1) {
      addClasses(tile, 'invisible');
    }
    tile.style.backgroundImage = `url(${backgroundImageUrl})`;
    tile.style.backgroundPositionX = `${0 - imageOffsetX - (column * tileWidth)}px`;
    tile.style.backgroundPositionY = `${0 - imageOffsetY - (row * tileHeight)}px`;
    tile.style.height = tileHeight;
    tile.style.width =  tileWidth;
    tile.style.top = `${(row * (containerHeight / rowCount)) + (row * 1)}px`;
    tile.style.left = `${(column * (containerWidth / columnCount)) + (column * 1)}px`;
    elements.tileContainer.appendChild(tile);
    tile.position = position;
    tiles.push(tile);
  })
}

function adjustRowsAndColumns() {
  window.removeEventListener('keydown', moveTile);
  window.removeEventListener('transitionend', checkSolved) // if a tile moves, check if it solves the puzzle
  rowCount = elements.rowCount.value;
  columnCount = elements.columnCount.value;
  positionChanges[UP_ARROW] = -columnCount;
  positionChanges[DOWN_ARROW] = columnCount;
  orderedPositions = Array.from(Array(rowCount * columnCount).keys());
  openPosition = rowCount * columnCount - 1;
  resizeTileContainer();
  createTiles();
  window.addEventListener('keydown', moveTile);
  window.addEventListener('transitionend', checkSolved) // if a tile moves, check if it solves the puzzle
}

resizeTileContainer();
createTiles();

// bind events and shuffle puzzle to start
window.addEventListener('keydown', moveTile);
window.addEventListener('transitionend', checkSolved) // if a tile moves, check if it solves the puzzle
elements.shuffleButton.addEventListener('click', resetPuzzle);
elements.solveButton.addEventListener('click', solvePuzzle);
elements.rowCount.addEventListener('change', adjustRowsAndColumns);
elements.columnCount.addEventListener('change', adjustRowsAndColumns);
resetPuzzle();
