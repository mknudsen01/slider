const Game = (function() {
  let openPosition = null;
  let tiles = [];
  let columnCount = 4;
  let rowCount = 4;

  const getOpenPosition = () => openPosition;
  const setOpenPosition = (position) => openPosition = position;
  const getRowCount = () => rowCount;
  const setRowCount = (count) => rowCount = count;
  const getColumnCount = () => columnCount;
  const setColumnCount = (count) => columnCount = count;
  const getTileCount = () => rowCount * columnCount;
  const getOrderedPositions = () => Array.from(Array(rowCount * columnCount).keys());
  const addTile = (tile) => tiles.push(tile);
  const getTiles = () => tiles;
  const clearTiles = () => tiles = [];

  const solvePuzzle = () => {
    tiles.forEach((tile, index) => {
      tile.position = index;
    })
    setOpenPosition(getTileCount() - 1);
    View.solvePuzzle({ tiles, rowCount, columnCount });
  }

  const resetPuzzle = () => {
    let shuffledPositions = shuffle(Game.getOrderedPositions());
    let startPositions = shuffledPositions.slice(0, shuffledPositions.length - 1);
    setOpenPosition(shuffledPositions.slice(-1)[0]);

    tiles.forEach((tile, index) => {
      tile.position = startPositions[index];
    })
    View.resetPuzzle({ tiles, rowCount, columnCount });
  }

  const checkSolved = (e) => {
    let tileCount = getTileCount();
    let solved = getOpenPosition() === tileCount - 1 && tiles.slice(0, tileCount - 1).every((tile, index) => {
      return tile.position === tile.correct;
    })
    if (solved) {
      endPuzzle();
      View.endPuzzle();
    }
  }

  const createTiles = () => {
    clearTiles();
    getOrderedPositions().forEach(position => {
      let tile = {
        node: View.createTile({ position, columnCount, rowCount, tileCount: getTileCount() }),
        correct: position,
        position: position,
      };

      addTile(tile);
      View.addTile(tile.node);
    })
  }

  const findTileWithPosition(tile, position) {
    return tile && tile.position === position;
  }

  const moveTile = (e) => {
    // if not an arrow key, stop
    if (!positionChanges[e.keyCode]) return;

    // e.g., if left arrow pushed and open position is 2, tile to move is (2 - -1), or 3
    let openPosition = getOpenPosition();
    let maybeNewOpenPosition = openPosition - positionChanges[e.keyCode];
    let movingTile = tiles.find(tile => findTileWithPosition(tile, maybeNewOpenPosition));
    let totalTiles = getTileCount();

    // if can't find tile or tile can't move a certain direction, stop
    if (!movingTile) return;
    if (openPosition <= (columnCount - 1) && e.keyCode === DOWN_ARROW) return;
    if (openPosition >= (totalTiles - columnCount) && e.keyCode === UP_ARROW) return;
    if (movingTile.position % columnCount === (columnCount - 1) && e.keyCode === RIGHT_ARROW) return;
    if (movingTile.position % columnCount === 0 && e.keyCode === LEFT_ARROW) return;

    // switch the open position and the tile we just moved's current position
    let temp = openPosition;
    setOpenPosition(movingTile.position);
    movingTile.position = temp;
    // [openPosition, movingTile.position] = [movingTile.position, openPosition];

    // animate tile movement
    View.moveTile({tile: movingTile, rowCount, columnCount});
  }

  const adjustRowsAndColumns = () => {
    window.removeEventListener('keydown', Game.moveTile);
    window.removeEventListener('transitionend', Game.checkSolved)
    setRowCount(View.rowCountInput.value);
    setColumnCount(View.columnCountInput.value);
    positionChanges[UP_ARROW] = -columnCount;
    positionChanges[DOWN_ARROW] = columnCount;
    setOpenPosition(rowCount * columnCount - 1);
    View.tileContainer.innerHTML = '';
    View.resizeTileContainer();
    createTiles();
    window.addEventListener('keydown', Game.moveTile);
    window.addEventListener('transitionend', Game.checkSolved)
  }

  const endPuzzle = () => true;

  return {
    getOpenPosition,
    setOpenPosition,
    getRowCount,
    getColumnCount,
    getTileCount,
    setRowCount,
    setColumnCount,
    getOrderedPositions,
    solvePuzzle,
    addTile,
    getTiles,
    clearTiles,
    resetPuzzle,
    checkSolved,
    createTiles,
    moveTile,
    adjustRowsAndColumns,
  }
})();

const View = {
  containerHeight: 400,
  containerWidth: 400,
  backgroundImageUrl: "images/1.jpg",
  imageOffsetX: 200,
  imageOffsetY: 0,
  congratsMessage: document.querySelector('p[data-message="congrats"]'),
  shuffleButton: document.querySelector('button[data-control="shuffle"]'),
  solveButton: document.querySelector('button[data-control="solve"]'),
  tileContainer: document.querySelector('div[data-ui="tile-container"]'),
  rowCountInput: document.querySelector('input[name="rows"]'),
  columnCountInput: document.querySelector('input[name="columns"]'),

  solvePuzzle: function({ tiles, rowCount, columnCount }) {
    tiles.forEach(tile => this.moveTile({ tile, rowCount, columnCount }));
  },

  moveTile: function({tile, columnCount, rowCount}) {
    if (!this.congratsMessage.classList.contains('invisible')) {
      addClasses(View.congratsMessage, 'invisible');
    }
    let row = Math.floor(tile.position / columnCount);
    let column = tile.position % columnCount;
    tile.node.style.top = `${(row * (this.containerHeight / rowCount)) + (row * 1)}px`;
    tile.node.style.left = `${(column * (this.containerWidth / columnCount)) + (column * 1)}px`;
  },

  resetPuzzle: function({ tiles, rowCount, columnCount }) {
    addClasses(this.congratsMessage, 'invisible');
    tiles.forEach(tile => this.moveTile({ tile, rowCount, columnCount }));
  },

  createTile: function({ position, columnCount, rowCount, tileCount }) {
    let tile = document.createElement('div');
    let row = Math.floor(position / columnCount);
    let column = position % columnCount;
    let tileWidth = this.containerWidth / columnCount;
    let tileHeight = this.containerHeight / rowCount;
    addClasses(tile, 'tile');
    if (position === tileCount - 1) {
      addClasses(tile, 'invisible');
    }
    tile.style.backgroundImage = `url(${this.backgroundImageUrl})`;
    tile.style.backgroundPositionX = `${0 - this.imageOffsetX - (column * tileWidth)}px`;
    tile.style.backgroundPositionY = `${0 - this.imageOffsetY - (row * tileHeight)}px`;
    tile.style.height = tileHeight;
    tile.style.width =  tileWidth;
    tile.style.top = `${(row * (this.containerHeight / rowCount)) + (row * 1)}px`;
    tile.style.left = `${(column * (this.containerWidth / columnCount)) + (column * 1)}px`;
    return tile;
  },

  addTile: function(tile) {
    this.tileContainer.appendChild(tile);
  },

  resizeTileContainer: function() {
    this.tileContainer.style.height = this.containerHeight;
    this.tileContainer.style.width = this.containerWidth;
  },

  endPuzzle: function() {
    removeClasses(this.congratsMessage, 'invisible');
  },
};

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



View.resizeTileContainer();
Game.createTiles();

// bind events and shuffle puzzle to start
window.addEventListener('keydown', Game.moveTile);
window.addEventListener('transitionend', Game.checkSolved) // if a tile moves, check if it solves the puzzle
View.shuffleButton.addEventListener('click', Game.resetPuzzle);
View.solveButton.addEventListener('click', Game.solvePuzzle);
View.rowCountInput.addEventListener('change', Game.adjustRowsAndColumns);
View.columnCountInput.addEventListener('change', Game.adjustRowsAndColumns);
Game.resetPuzzle();
