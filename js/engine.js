/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on the player and enemy objects (defined in app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas,
     * set the canvas element's height/width and add it to the DOM.
     * We're also setting a few additional variables which will be used to
     * monitor and control gameplay
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastCollisionCount = gsCollisionLimit,
        requestId = 0,
        lastTime;

        canvas.width = 505;
        canvas.height = 606;
        doc.body.appendChild(canvas);


    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods. We've
     * also set it to check the game status - won, lost, or ongoing - as that
     * check needs to occur in every loop as the game progresses.
     */
    function main() {
        /* Get the time delta information which is required if the game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call the update/render functions, pass along the time delta to
         * the update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Call the function which will check our newly-updated entities to see
         * if we should continue the game, or whether it should end as 'won' or
         * 'lost'
        */
        checkGameStatus();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         * We're saving the 'request id' value returned by requestAnimationFrame
         * function so that we will be able to stop the animation - stop the
         * game - if we need to. We initialized the requestId variable to 0 when
         * we declared it - this allows us to use 'undefined' for our test on
         * whether or not to continue the animation because we'll set the
         * requestId to 'undefined' in the 'stopGame' function when the
         * parameters for winning or losing the game are met, or if we determine
         * that the user has clicked the 'stop' or 'reset' button. So anything
         * other than 'undefined' means we should continue the game loop.
         */
        if (requestId !== undefined) {
            requestId = win.requestAnimationFrame(main);
        }
    };


    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop. It will then call the game's 'main' function to commence
     * the animation loop that makes up the game
     */
    function init() {
        lastTime = Date.now();
        main();
    }


    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity data
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }


    /* This is called by the update function and loops through all of the
     * objects within the allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for the
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }


    /* This function is also called by the update function and loops through
     * the objects within the allEnemies array (as defined in app.js). Now
     * that all enemy and player positions have been updated, this function
     * calls an enemy's collided() method to see if the player position
     * intersects (collides) with that enemy's position.
     */
    function checkCollisions() {
        // Note the use of the Array.some method, as opposed to Array.forEach.
        // We use this because we only want to register one collision per game
        // cycle - the enemy.collided function will return 'true' if a collision
        // occurs, and the Array.some method will discontinue looping through
        // the allEnemies array when 'true' is returned. This let's us manage
        // the situation where enemy entities clump together on the screen -
        // if the player entity collides with the clump we don't want to
        // count individual collisions - we only want to register and react
        // to the first one.
        allEnemies.some(function(enemy) {
            enemy.collided();
        });
    }


    /* This function is called every game tick (or loop of the game engine)
     * because that's how games work - they are flipbooks creating the illusion
     * of animation but in reality they are just drawing the entire screen over
     * and over.
     */
    function render() {
        renderBoard();
        renderEntities();
    }


    /* This function draws the "game board" or background - we've separated
     * it out from the 'render' function so that we can call it on it's own,
     * as well as from within the game loop. We will want to call it on it's own
     * both when we first load the page, so that we have something to look at
     * rather than a blank page, and then again when we stop the game.
     */
    function renderBoard() {
        // This array holds the relative URL to the image used
        // for that particular row of the game level.
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            row, col;

        // Loop through the number of rows and columns we've defined for the
        // board and, using the rowImages array, draw the correct image for that
        // portion of the game board "grid"
        for (row = 0; row < rowImages.length; row++) {
            for (col = 0; col < gsBoardColumns; col++) {
                // The drawImage function of the canvas' context element
                // requires 3 parameters: the image to draw, the x coordinate
                // to start drawing and the y coordinate to start drawing.
                // We're using our Resources helpers to refer to our images
                // so that we get the benefits of caching these images, since
                // we're using them over and over.
                ctx.drawImage(Resources.get(rowImages[row]), col * Resources.get(rowImages[row]).width, row * VISIBLE_ROW_HEIGHT);
            }
        }
        // part of rendering the game board is clearing the score display area
        // and displaying a current game score if a game is in progress, and
        renderScore();
    }


    /* This function is called by the renderBoard function. Since the game is
     * lost if player 'dies' a certain number of times, we want to display the
     * 'score' - the number of remaining lives - as the game runs. This gives
     * the user feedback on their progress.
     */
    function renderScore() {
        var txt = "Lives remaining: " + (gsCollisionLimit - player.collisionCount);

        // first we want to clear out the 'score board' area to make sure
        // we don't carry any artifacts from previous game loop forward
        ctx.clearRect(0, 0, canvas.width, 50);

        // Set the various font and style parameters so that we can draw text
        // reflecting the current score
        ctx.font = "Bold 12pt tahoma";
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        // Only write out the score if we have a game in progress, which we can
        // determine by checking our requestId
        if (requestId) {
            ctx.fillText(txt, canvas.width-30, 35);
        }
    }


    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions defined
     * on the enemy and player entities within app.js
     */
    function renderEntities() {
        // Loop through all of the objects within the allEnemies array and call
        // its render function.
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        // And then call the render function for the player object.
        player.render();
    }


    /* This function is called from main and will be checked on every game loop.
     * This is where we determine whether the game should continue, or whether
     * the criteria for 'winning' or 'losing' the game has been met. If either
     * occurs then we will call a function to end the game appropriately
     */
    function checkGameStatus() {
        // has player entity reached "collision limit" and so lost the game?
        if (player.collisionCount >= gsCollisionLimit) {
            gameOver("lost");
        }
        // or has player entity reached the water row, and so won the game?
        if (player.row == 0) {
            gameOver("won");
        }
    }


    /* This function is called when the game status has been determined to be
     * 'won' or 'lost'. We need to stop the game animation, and display a
     * message to the user letting them know what has occurred.
     */
    function gameOver(outcome) {
        stopGame();
        if (outcome == "won") {
            displayStatus("Woo hoo! You won!", "#ffd738","#3500a8");
        } else { // lost the game
            displayStatus("Game over - you lose","#000","#fff");
        }
    }


    /* This function draws a message on the canvas element
     */
    function displayStatus(txt, rectColor, txtColor) {
        ctx.font = "Bold 48px Calibri";
        ctx.textAlign = "center";
        ctx.fillStyle = rectColor;
        ctx.strokeStyle = txtColor;
        ctx.fillRect(0, 120, canvas.width, 140);
        ctx.strokeRect(0, 120, canvas.width, 140);
        ctx.fillStyle = txtColor;
        ctx.fillText(txt, canvas.width/2, 200);
    }


    /* The 'onclick' event handler for the 'Reset' button - calls the functions
     * to take care of the details of stopping the game in progress, and
     * starting the game over
     */
    function resetGame() {
        stopGame();
        startGame();
    }


    /* The 'onclick' event handler for the Stop button, this function uses the
     * value returned by  browser's requestAnimationFrame function to stop the
     * animation callback cycle so that the game 'action' stops, and then calls
     * a function to set up the app so it's ready for the user to start a new
     * game when they want to
     */
    function stopGame() {
        // We only want to try to cancel the animation if it's actually in
        // progress, so we first test to see if we have a requestId. If we don't
        // then there's no animation to stop
        if (requestId) {
            win.cancelAnimationFrame(requestId);
            // since we've stopped the animation loop, set the
            // requestId value to undefined so we have something
            // to test against in both the startGame function and
            // in main, when we check to see if we should call
            // requestAnimationFrame to continue the game loop
            requestId = undefined;
        }
        readyStart();
    }


    /* The 'onclick' event handler for the 'Start' button, this function sets
     * the UI button states, and cleans up from any previous game-in-progress.
     * It then calls the init function which will start the game loop.
     * Note that this function can also be called from the reset button's event
     * handler as starting a new game is part of the process of resetting a
     * game already in progress
     */
    function startGame() {
        // User has initiated a game, and should only be able to click the reset
        // or stop buttons while a game is in progress, so set the UI buttons'
        // 'disabled' states appropriately
        setButtonDisabled(buttonStart, true);
        setButtonDisabled(buttonReset, false);
        setButtonDisabled(buttonStop, false);
        // We also want to know if a game was in progress, and if so we need to
        // do a little cleanpu from the old game before starting a new one. We
        // check this by looking at the requestId value: we know that it is set
        // to 0 when the variable is instantiated, and that it receives a number
        // greater than 0 as the return value of the requestAnimationFrame
        // function. We also know that it would be set to undefined if the
        // the stopGame function has been called. And the stopGame function
        // would have been called as part of the reset process for an existing
        // game, so if requestId is undefined then we have some cleanup to do
        //if (requestId === undefined) initGameSettings();
        initGameSettings();
        // Finally, now that we've got our UI buttons and game settings
        // where we want them, we can call the init function, which will
        // get the actual game play started
        init();
    }


    /* This function is called from the startGame function if we are starting a
     * new game after already having a game in progress. It serves two purposes:
     *   - Resets any global game settings/variables which need
     *     to be initialized or reset in order to clear the progress
     *     of one game and allow a new game to start
     *   - Resets player and enemy positions to 'home' or 'start' positions
    */
    function initGameSettings() {
        player.collisionCount = 0;
        requestId = 0;
        player.goToHome();
        allEnemies.forEach(function(enemy) {
            enemy.spawn();
        });
    }


    /* This function is used to set the enabled/disabled state of the UI buttons
     * so that they are only available to the user at appropriate times.
     * params: btn - a reference to a DOM button element
     *         disabledState - a boolean indicating whether or not the button
     *                         should be disabled
     */
    function setButtonDisabled(btn, disabledState) {
        btn.disabled = disabledState;
    }


    /* This is the function being used as a callback for the Resources 'onready'
     * function, which is called when all of our images have loaded. We are
     * using this to set the game into a 'ready to start' mode by drawing the
     * game board on the screen to give a physical presense on the page, and to
     * make the 'start' button available to the user, where it was previously
     * unavailable/disabled to ensure that the user didn't try to start the game
     * (click the start button) before everything is loaded and ready to go.
     */
    function readyStart() {
        renderBoard();
        setButtonDisabled(buttonStart, false);
        setButtonDisabled(buttonReset, true);
        setButtonDisabled(buttonStop, true);
    }


    /* Go ahead and load all of the images we know we're going to need to draw
     * our game level. Then set 'readyStart' as the callback method, so that
     * when all of these images are properly loaded our game will be ready for
     * the user to start. (We changed from 'init' as callback method because we
     * don't want the game to start automatically on page load - we want user to
     * start it with button click.)
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(readyStart);


    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    /* Assign the game stop, reset and start functions to the global variable,
     * too, so they're easily accessible from the app.js file - we want to be
     * able to set them as the function to call in the button event listeners
     */
    global.startGame = startGame;
    global.resetGame = resetGame;
    global.stopGame  = stopGame;
})(this);