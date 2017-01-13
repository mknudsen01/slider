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
  const setTiles = (newTiles) => tiles = newTiles;
  const clearTiles = () => tiles = [];

  const solvePuzzle = () => {
    tiles.forEach((tile, index) => {
      tile.position = index;
    })
    resetOpenPosition();
  }

  const resetOpenPosition = () => {
    setOpenPosition(getTileCount() - 1);
  }

  const shuffleTiles = () => {
    let shuffledPositions = shuffle(Game.getOrderedPositions());
    let startPositions = shuffledPositions.slice(0, shuffledPositions.length - 1);
    setOpenPosition(shuffledPositions.slice(-1)[0]);

    tiles.forEach((tile, index) => {
      tile.position = startPositions[index];
    })
  }

  const isSolved = (e) => {
    let tileCount = getTileCount();
    return getOpenPosition() === tileCount - 1 && tiles.slice(0, tileCount - 1).every((tile, index) => {
      return tile.position === tile.correct;
    })
  }

  const createTiles = () => {
    clearTiles();
    getOrderedPositions().forEach(position => {
      let tile = {
        correct: position,
        position: position,
      };
      addTile(tile);
    })
    return tiles;
  }

  const findTileWithPosition = (tile, position) => {
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
    shuffleTiles,
    isSolved,
    createTiles,
    moveTile,
    resetOpenPosition,
    setTiles,
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
  puzzleContainer: document.querySelector('.puzzle'),
  mainImage: document.querySelector('img[data-ui="main-image"]'),
  imageChoices: document.querySelectorAll('div[data-ui="image-choices"] img'),

  hidePuzzle: function() {
    addClasses(this.puzzleContainer, 'invisible');
  },

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

  createTile: function({ position, columnCount, rowCount }) {
    let tile = document.createElement('div');
    let tileCount = rowCount * columnCount;
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

  updatePuzzleImage: function(e) {
    this.mainImage.src = e.target.src;
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


const Controller = (function() {
  const init = () => {
    resetTiles();
    bindControlsListeners();
    bindPuzzleMovementListeners();
    bindPuzzleConfigListeners();
    bindPuzzleImageChoiceListeners();
  }

  const bindControlsListeners = () => {
    View.shuffleButton.addEventListener('click', resetPuzzle);
    View.solveButton.addEventListener('click', solvePuzzle);
  }

  const bindPuzzleImageChoiceListeners = () => {
    View.imageChoices.forEach(image => {
      image.addEventListener('click', View.updatePuzzleImage.bind(View));
    })
  }

  const bindPuzzleConfigListeners = () => {
    // bind events and shuffle puzzle to start
    View.rowCountInput.addEventListener('change', adjustRowsAndColumns);
    View.columnCountInput.addEventListener('change', adjustRowsAndColumns);
  }

  const solvePuzzle = () => {
    Game.solvePuzzle();
    View.solvePuzzle({ tiles: Game.getTiles(), rowCount: Game.getRowCount(), columnCount: Game.getColumnCount() });
  }

  const bindPuzzleMovementListeners = () => {
    window.addEventListener('keydown', Game.moveTile);
    window.addEventListener('transitionend', checkSolved) // if a tile moves, check if it solves the puzzle
  }

  const unbindPuzzleMovementListeners = () => {
    window.removeEventListener('keydown', Game.moveTile);
    window.removeEventListener('transitionend', Game.isSolved)
  }

  const checkSolved = () => {
    if (Game.isSolved()) {
      View.endPuzzle();
    }
  }

  const resetTiles = () => {
    View.resizeTileContainer();
    let tiles = Game.createTiles();
    tiles.forEach(tile => {
      tile.node = View.createTile({ position: tile.position, columnCount: Game.getColumnCount(), rowCount: Game.getRowCount() })
      View.addTile(tile.node);
    })
    Game.setTiles(tiles);
    Game.resetOpenPosition();
  }

  const resetPuzzle = () => {
    Game.shuffleTiles();
    View.resetPuzzle({ tiles: Game.getTiles(), rowCount: Game.getRowCount(), columnCount: Game.getColumnCount() });
  }

  const adjustRowsAndColumns = () => {
    unbindPuzzleMovementListeners();
    let newRowCount = View.rowCountInput.value;
    let newColumnCount = View.columnCountInput.value;

    Game.setRowCount(newRowCount);
    Game.setColumnCount(newColumnCount);

    positionChanges[UP_ARROW] = -newColumnCount;
    positionChanges[DOWN_ARROW] = newColumnCount;

    Game.setOpenPosition(newRowCount * newColumnCount - 1);
    View.tileContainer.innerHTML = '';
    View.resizeTileContainer();
    resetTiles();
    bindPuzzleMovementListeners();
  }

  const hidePuzzle = () => {

  }

  return {
    init,
  }
})();

Controller.init();
