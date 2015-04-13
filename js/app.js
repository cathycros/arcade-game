/* Create variables for various physical measurements and static values we'll
 * use throughout. Setting them to variables makes the code that uses them
 * easier to read, and provides a single location for changing them, should we
 * change the image sizes, canvas size, etc., associated with the game.
 *
 * The following measurements are not calculable within the program since
 * they're based on the visible image area of the player sprite, which is
 * different from the sprite's actual physical image size. In order to arrive at
 * these values we had to measure the sprite for visible pixel width and height.
 * If we used different sprites, we would need to obtain new values for these
 * measurements.
 */
var PLAYER_WIDTH_OFFSET = 23,
            // Since the visible area of the player image is narrower than the
            //    width of the image itself, we need to establish an 'offset'
            //    value that we can use when checking for collisions. This value
            //    is the distance from the physical edge of the image to the
            //    visible edge of the player sprite. We'll check for enemy
            //    collisions against this value, not against the actual 'x'
            //    position of the sprite. After all, it's not fair to say they
            //    collided if the enemy didn't visibly touch the player!

    VISIBLE_ROW_HEIGHT = 83,
            // This is the height of the visible area of the player sprite and
            //    the visible block componant for the background images (e.g.,
            //    doesn't include the darker areas of the blocks, and doesn't
            //    include the transparant portion of the image).

    ROW_HEIGHT_OFFSET = 25;
            // Because the visible area of the enemy, background blocks and
            //    player sprites are different heights, we want to be able to
            //    consistantly position the enemy and player sprites vertically
            //    within each row created by the background blocks on the
            //    gameboard. We do this by determining a number of pixels to
            //    offset the y-position of the player and enemy sprites to
            //    place them where we want them within the row.


/* Game Settings (gs) - a set of static values that could potentially be
 * set based on user input to influence game difficulty, length, appearance,
 * etc. It's also handy to have these values globally available as they're used
 * in various functions throughout the game.
 */
var gsCollisionLimit = 3,       // Max number of collisions before game is lost
    gsEnemySpeedAdjustor = 0,   // Adjust difficulty of game by faster/slower
                                // enemies
    gsEnemyCount = 3,           // Adjust difficulty of game via more/fewer
                                // enemies
    gsBoardColumns = 5;         // Set game board 'grid' width


/***************/
/* ENEMY CLASS */
/***************/
/* Enemies our player must avoid
 * This function defines the Enemy class and will be called to instantiate each
 * new enemy object
 */
var Enemy = function() {
    // The enemy's 'x' position, which will always begin at 0, is its location
    // along the horizontal path it travels from left to right across the
    // gameboard, and will be updated in every cycle of the game as the enemy
    // 'moves'
    this.x;

    // The enemy's 'y' position represents the row of the game board the enemy
    // is located in - it is randomly chosen when the object is instantiated,
    // and then will remain consistant as that enemy moves from left to right
    // across the board. Because we "recycle" each enemy object, the y position
    // will be randomly reset prior to the enemy starting its next trip from
    // left to right across the board; this will be done in the 'spawn' function
    // The position will be a random choice of one of the "stone" rows in the
    // array of images which makes up the gameboard/background, so will contain
    // a value of 1, 2, or 3
    this.y;

    // A random value representing how quickly the enemy sprite is moved
    // across the row
    this.speed;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

/*****************************/
/* Enemy Prototype Functions */

    /* This function sets/resets an enemy's speed, row, and starting position,
     * either when the game starts or when the enemy entity is 'recycled': we'll
     * always have the same number of enemies, and will use the same entities
     * through the life of the game - we'll just reset their speed, row (y), and
     * horizontal position (x) each time they need to start at the left side of
     * the game board so that each enemy location and speed is always random and
     * unpredictable.
     */
    Enemy.prototype.spawn = function () {
        this.speed = this.setSpeed();
        this.y = this.setRow();
        // We know we're starting the enemy at the left edge of the game board,
        // so we don't have to calculate an x position - it will always be '0'
        this.x = 0;
    }

    /* We want each enemy entity to have a random speed as it moves horizontally
     * across the game board, where 'speed' is equivalent to the distance the
     * entity moves during each loop through the game animation. This function
     * provides a random number to set that speed.
     */
    Enemy.prototype.setSpeed = function() {
        // We've hardcoded a range of 100 - 399 for our random number generation
        // because that seems to provide a good range of speeds, but we could
        // adjust those numbers if we wanted to alter the game play overall.
        // We've also provided a global variable - gsEnemySpeedAdjustor - that
        // could be used to allow a user to alter the game difficulty - faster
        // or slower enemies would make the game harder or easier. However, at
        // this time the adjustor is simply set to '0'
        var maxSpeed = 400,
            minSpeed = 100;
        return Math.floor(Math.random() * (maxSpeed - minSpeed)) + minSpeed + gsEnemySpeedAdjustor;
    }

    /* Enemy entities can appear in one of three 'stone' rows on the game board.
     * This function provides a random number, range 1 - 3, to determine which
     * row will be used for a given entity.
     */
    Enemy.prototype.setRow = function() {
        // The random row number is multiplied by row height to give us a pixel
        // value, but we're then subtracting the "row height offset" value so
        // that when our player and enemy share a row they will have the same y
        // values - this will make collision detection much easier
        var maxRow = 4, // 3 + 1 because the javascript random function goes up
                        // to but does not include the max value
            minRow = 1;
        return ((Math.floor(Math.random() * (maxRow - minRow)) + minRow) * VISIBLE_ROW_HEIGHT) - ROW_HEIGHT_OFFSET;
    }

    /* Update the enemy's x or horizontal position on the game board
     * Parameter: dt, a time delta between ticks, used to provide consistant
     * animation across different computing environments
     */
    Enemy.prototype.update = function(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += this.speed * dt;

        // If enemy x-position goes beyond end of row, call a function to
        // re-'spawn' it to reset its x-position, row (y-position), and speed.
        // - Since the enemy sprite has the same width as the background images,
        //   we can use its width to calculate the width of the board
        if (this.x > (Resources.get(this.sprite).width)*gsBoardColumns) {
            this.spawn();
        }
    }

    /* Check to see if a particular enemy collided with the player entity. This
     * information will be used to determine whether we send player back to
     * starting position, and whether game continues, or is 'lost' if max number
     * of collisions allowable in the game is met
     */
    Enemy.prototype.collided = function() {
        // only check for collision if this enemy is in the same row as player
        if (this.y == player.y) {
            // now we know we're in the same row, we need to see if a collision
            // occurred. We'll do this by checking the edges of visible portion
            // of the enemy and player sprites to see if they touch or overlap

            // the player sprite left and right pixel position needs to be
            // calculated because it's narrower than the physical sprite image
            // size, so add and subtract our previously-determined offset value
            // to get the visible left and right positions
            var pLeft = player.x + PLAYER_WIDTH_OFFSET,
                pRight = pLeft + (Resources.get(this.sprite).width - PLAYER_WIDTH_OFFSET),

                // Since the visible portion of the enemy sprite is close enough
                // to the actual sprite image width, we don't need to use any
                // offset to determine left and right positions
                eLeft = this.x,
                eRight = eLeft + Resources.get(this.sprite).width;

            // What we're actually looking for is whether the enemy's right edge
            // touches or overlaps the player's left edge, and - at the same
            // time - whether the player's left edge touches or overlaps the
            // enemy's right edge?  If both are true then we have a collision.
            if ((eRight >= pLeft) && (pRight >= eLeft)) {
                player.crash();
                // we also don't want to count multiple collisions in one 'user
                // turn', so if we detected one collision then don't bother to
                // look for any more - return 'true' so calling function knows
                // we crashed and won't bother to look at other enemies
                return (true);
            }
        }
        // if no collision detected, return 'false' so calling function knows to
        // keep checking other enemies for collision
        return (false);
    }

    /* Draw the enemy, at its current position, on the canvas
     */
    Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
/* End Enemy definitions */
/*************************/


/****************/
/* PLAYER CLASS */
/****************/
/* The player character/entity in the game. There will only ever be 1 per game.
 */
var Player = function() {
    // col and row are simplified representations of the x and y position of
    // player - makes it easier to think about and deal with movement on the
    // game board grid where possible positions are (col=x,row=y):
    //                     0,0; 1,0; 2,0; 3,0; 4,0
    //                     0,1; 1,1; 2,1; 3,1; 4,1
    //                     0,2; 1,2; 2,2; 3,2; 4,2
    //                     0,3; 1,3; 2,3; 3,3; 4,3
    //                     0,4; 1,4; 2,4; 3,4; 4,4
    //                     0,5; 1,5; 2,5; 3,5; 4,5
    this.col;
    this.row;
    this.x;
    this.y;
    this.collisionCount;
    this.sprite = 'images/char-boy.png';
}

/******************************/
/* Player Prototype Functions */

    /* Move player entity to game board square we have designated as starting
     * location, either at beginning of game, or after collision with an enemy.
     * This provides us an initial point of reference to increment/decrement
     * position based on user input via arrow keys
     */
    Player.prototype.goToHome = function () {
        this.col = 2;
        this.row = 5;
    }

    /* Handle the game actions needed when a player crashes into an enemy entity
     */
    Player.prototype.crash = function() {
        // reset player position to 'home' grass square
        player.goToHome();

        // increment player's 'collision counter' - this will determine when the
        // game is lost
        player.collisionCount++;
    }

    /* Set the player sprite x (column) and y (row) position on the game board -
     * may have moved based on user input, or due to game events
     */
    Player.prototype.update = function() {
        this.x = this.col * Resources.get(this.sprite).width;
        this.y = (this.row * VISIBLE_ROW_HEIGHT) - ROW_HEIGHT_OFFSET;
    };

    /* Draw the player, at its current position, on the canvas
     */
    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    /* This is the function called by the event listener which detects user
     * input. We want to determine if the input was one of the 'game input'
     * keys on the keyboard, and if so we want to make use of that input to
     * move the player around the game board.
     */
    Player.prototype.handleInput = function(keyMove) {
        var minCol = 0, maxCol = gsBoardColumns-1, // minus 1 for 0-based array
            minRow = 0, maxRow = 5;

        if (keyMove == 'left')  { --this.col; }
        if (keyMove == 'up')    { --this.row; }
        if (keyMove == 'right') { ++this.col; }
        if (keyMove == 'down')  { ++this.row; }

        // player can't 'wrap' from end of row to beginning, or beginning of row
        // to end, so if uesr input tries to do so, don't allow it
        if (this.col > maxCol) { this.col = maxCol; }
        if (this.col < minCol) { this.col = minCol; }

        // and we never want player to wrap from top to bottom of columns, or
        // vice versa, so don't let that happen
        if (this.row < minRow) { this.row = minRow; }
        if (this.row > maxRow) { this.row = maxRow; }
    };
/* End Player definitions */
/**************************/

/* Now our enemy and player classes are defined, instantiate entity objects:
 * - all enemy objects go in an array called allEnemies
 * - the player object goes in a variable called player
 */
    var allEnemies = new Array;
    for (var x = 0; x < gsEnemyCount; x++) {
        allEnemies[x] = new Enemy;
    }
    var player = new Player;

/* And add global event listeners to detect any actions the user might take */
    /* Listen for key presses and send the keys to our
     * Player.handleInput() method.
     */
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    });

    /* Get a reference to each of the buttons we've set up and attach a Listener
     * for a click event on each
    */
    var buttonStart = document.getElementById("buttonStart");
    var buttonReset = document.getElementById("buttonReset");
    var buttonStop = document.getElementById("buttonStop");

    buttonStart.addEventListener("click", function() { startGame(); });
    buttonReset.addEventListener("click", function() { resetGame(); });
    buttonStop.addEventListener ("click", function() { stopGame();  });