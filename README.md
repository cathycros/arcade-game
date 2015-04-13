frontend-nanodegree-arcade-game
===============================

I.  How to setup and run the game
---------------------------------
	1. File setup - ensure files are present in following directory structure, where 'game-root' is
	   the location of your choice on computer (e.g., c:\udacity\project3\):
		\game-root\index.html
		\game-root\README.md [This readme file]
		\game-root\css\style.css
		\game-root\images\char-boy.png
		\game-root\images\enemy-bug.png
		\game-root\images\grass-block.png
		\game-root\images\stone-block.png
		\game-root\images\water-block.png
		\game-root\js\app.js
		\game-root\js\engine.js
		\game-root\js\resources.js

	2. To run the game, simply double-click index.html in the game-root location, or open a browser
	   and enter:
		file:///game-root/index.html

	3. Game has been tested to work in the following browsers (in a Windows environment - Mac OS,
	   Linux, etc., not tested):
		Chrome v41.0.22
		FireFox v33.1.1
		IE10
		IE11

II. Gameplay
------------
	1. Object of game: Rescue the the boy by moving him from the grassy area at the bottom of the
	   game area to the safety of the water at the top, while avoiding the enemy 'bugs' running
	   through the rocky areas.

	2. Game loads with empty 'game board' and instructions:
		- Use the arrow keys to move, one square at a time: Up, Down, Left, or Right
		- Be careful! If an enemy BUG crashes into you, you'll be sent back to the grassy area and
		  will have to start over!
		- Each time you crash into an enemy, you lose a life - lose all your lives and the game is
		  over

	3. User also has access to three buttons which control game state:
		- User clicks 'Start' to begin a game
	 	- User clicks 'Reset' to reset a game in progress
		- User clicks 'Stop' to stop a game in progress

	4. Once a game is started, a counter at the top of the screen shows "Lives remaining"
		- User starts with 3 lives
		- Each time player entity collides with an enemy bug, a life is lost
		- When no lives remain, the game is over and the user has lost
		- If the user makes it to the water before losing all lives, the game is over and won


III. Differences from original/provided game structure/gameplay
---------------------------------------------------------------
	1. Game does not start automatically when web page loads
		a. Users are presented with a 'Start' button they must click in order to commence the game
		a. A 'Reset' button has been provided so that, while a game is in progress, the user
			can click it to reset and restart the game
		b. A 'Stop' button has been provided so that, while the game is in progress, the user
			can click it to stop the game

	2. A rule has been established to define when the game is lost:
		a. the player entity has a set number of 'lives' available
		b. each time the player collides with an enemy, a life is lost
		c. if all lives are lost then the user loses the game
		d. the default number of lives is 3

	3. The current number of remaining lives is displayed while the game is in progress
		a. This 'score display' is updated in each animation cycle
		b. This provides a visual status for the user so they know how the game is progressing

	4. When the game is won or lost, an appropriate message is displayed to the user


IV. A list of Web sites, books, forums, blog posts, github repositories, etc., used in the making
    of this submission
-------------------------------------------------------------------------------------------------
	1. Provided art assets and game engine
		https://github.com/udacity/frontend-nanodegree-arcade-game

	2. Animation/Gameplay
		https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
		https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
		http://stackoverflow.com/questions/10735922/how-to-stop-a-requestanimationframe-recursion-loop
		https://css-tricks.com/using-requestanimationframe/

	3. HTML5 Canvas
		http://stackoverflow.com/questions/5573594/draw-text-on-top-of-rectangle

	4. JavaScript
		a. Math and misc. functions/functionality
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined

		b. EventTarget.addEventListener() method
			https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
			http://www.javascripter.net/faq/addeventlistenerattachevent.htm
			http://www.unicodegirl.com/from-inline-events-to-addeventlistener.html

		c. Built-in Array.prototype functions - forEach, some, every
			http://stackoverflow.com/questions/7340893/what-is-the-difference-between-map-every-and-foreach
			https://dev.opera.com/articles/javascript-array-extras-in-detail/


V. Additional Notes
-------------------
	HTML validated by The W3C Markup Validation Service (http://validator.w3.org/check)
		W3C Markup Validator results: document was successfully checked as HTML5

	CSS validated by The W3C CSS Validation Service (http://jigsaw.w3.org/css-validator/validator)
		W3C CSS Validator results: document validates as CSS level 3