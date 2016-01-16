var COLS = 10, ROWS = 20;
var NUM_ROWS_AT_START;
var MOVES_BEFORE_NEW_ROW;
var num_moves;

var board = [];
var lose;
var victoryCondition;
var interval;
var current; // current moving shape
var currentX, currentY; // position of current shape
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ],
    [1, 0, 0, 0]
];
var colors = [
    'cyan', 'orange', 'blue', 'yellow', 'red', 'green', 'purple', 'black', 'grey'
];
var waitedATick = false;

// creates a new 4x4 shape in global variable 'current'
// 4x4 so as to cover the size when the shape is rotated
function newShape() {
    var id = (Math.random() < 0.075) ? shapes.length - 1 : Math.floor( Math.random() * (shapes.length - 1));
    var shape = shapes[ id ]; // maintain id for color filling
    current = [];
    for ( var y = 0; y < 4; ++y ) {
        current[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                current[ y ][ x ] = id + 1;
            }
            else {
                current[ y ][ x ] = 0;
            }
        }
    }
    // position where the shape will evolve
    currentX = 5;
    currentY = 0;
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }

    for ( var y = ROWS - NUM_ROWS_AT_START; y < ROWS; ++y ) {
        add_row_from_bottom();
    }
}

// keep the element moving down, creating new shapes and clearing lines
function tick() {
    if ( valid( 0, 1 ) ) {
        ++currentY;
    }

    // if the element settled
    else {
        if (!waitedATick) {
            waitedATick = true;
            return;
        }
        freeze();
        clearLines();
        checkVictory();

        if(victoryCondition) {
            victory();
            return false;
        } else if (lose) {
            defeat();
            return false;
        }

        ++num_moves;
        if (num_moves % MOVES_BEFORE_NEW_ROW == 0) {
            num_moves = 0;
            add_row_from_bottom();
        }

        newShape();
    }
}

// stop shape at its position and fix it to board
function freeze() {
    // If this is a bomb
    if (current[0][0] == shapes.length) {
        for (var y = currentY - 1; y <= currentY + 1; y++) {
            for (var x = currentX - 1; x <= currentX + 1; x++) {
                if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                    board[y][x] = 0;
                }
            }
        }
    }
    else {
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                }
            }
        }
    }
}

function moveUpRows()
{
    for ( var y = 1; y < ROWS; ++y ) {
        for ( var x = 0; x < COLS; ++x ) {
            board[ y - 1 ][ x ] = board[ y ][ x ];
            board[ y ][ x ] = 0;
        }
    }
}

function add_row_from_bottom()
{
    moveUpRows();

    for ( var x = 0; x < COLS; ++x ) {
        board[ ROWS - 1 ][ x ] = shapes.length + 1;
    }

    if (MOVES_BEFORE_NEW_ROW >= 5) {
        board[ ROWS - 1][Math.floor( Math.random() * COLS/2)] = 0;
        board[ ROWS - 1 ][COLS/2 + Math.floor( Math.random() * COLS/2)] = 0;
    } else {
        board[ ROWS - 1][Math.floor( Math.random() * COLS)] = 0;
    }

    if (lose) {
        defeat();
        return false;
    }
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current )
{
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
        }
    }

    // Shift the piece to the top of the 4x4 square
    while (newCurrent[0] == [0, 0, 0, 0]) {
        newCurrent[0] = newCurrent[1];
        newCurrent[1] = newCurrent[2];
        newCurrent[2] = newCurrent[3];
        newCurrent[3] = [0, 0, 0, 0];
    }

    // Shift the piece to the left of the 4x4 square
    while (newCurrent[0][0] == 0 && newCurrent[1][0] == 0 && newCurrent[2][0] == 0 && newCurrent[3][0] == 0) {
        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 4; y++) {
                newCurrent[y][x] = newCurrent[y][x+1];
            }
        }
        for (var y = 0; y < 4; y++) {
            newCurrent[y][3] = 0;
        }
    }

    return newCurrent;
}

// check if any lines are filled and clear them
function clearLines()
{
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            document.getElementById( 'clearsound' ).play();
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
}

function checkClearColumn(col_index)
{
    for (var y = 0; y < ROWS; ++y) {
        if (board[y][col_index] != 0) {
            return false;
        }
    }
    return true;
}

function checkVictory()
{
    for (var x = 0; x < COLS - 1; ++x) {
        if (checkClearColumn(x) && checkClearColumn(x + 1)) {
            victoryCondition = true;
        }
    }
}

function keyPress( key )
{
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) ) {
                --currentX;
            }
            break;
        case 'right':
            if ( valid( 1 ) ) {
                ++currentX;
            }
            break;
        case 'down':
            if ( valid( 0, 1 ) ) {
                ++currentY;
            }
            break;
        case 'rotate':
            var rotated = rotate( current );
            if ( valid( 0, 0, rotated ) ) {
                current = rotated;
            }
            break;
    }
}

// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent )
{
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;



    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    // Don't lose if the current shape is a bomb
                    if (offsetY == 1 && current[0][0] !== shapes.length) lose = true; // lose if the current shape at the top row when checked
                    return false;
                }
            }
        }
    }
    return true;
}

function defeat() {
    window.location.replace('gameover.html');
}

function victory() {
    var level = MOVES_BEFORE_NEW_ROW - 1;
    if (level > 0) {
        document.getElementById('levelUp').style.display = 'block';
        document.getElementById('levelUp').style.visibility = 'visible';
        setTimeout(function(){ document.getElementById('levelUp').style.visibility = 'hidden'; }, 5000);
        newGame(level, NUM_ROWS_AT_START);
    } else {
        window.location.replace('victory.html');
    }
}

function newGame(moves_before_new_row, num_rows_at_start) {
    MOVES_BEFORE_NEW_ROW = moves_before_new_row;
    NUM_ROWS_AT_START = num_rows_at_start + ((MOVES_BEFORE_NEW_ROW % 2 == 0) ? 1 : 0);
    clearInterval(interval);
    lose = false;
    victoryCondition = false;
    num_moves = 0;
    init();
    newShape();
    interval = setInterval( tick, 250 );
}

newGame(10, 3);
