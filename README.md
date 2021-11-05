## Starfight: Original card game application built with full stack JavaScript

Frontend: HTML, CSS, JQuery  
Backend: Node.js, MongoDB

This application is not currently hosted online, so it is necessary to run it locally to see it in action.

## How to run a local version of this application:

	1. Clone the repository
	2. Download and install mongodb
	3. Run a mongo daemon (mongod)
	4. Start a mongo shell (mongosh) at port 27017
	5. Start the application by running app.js, if successful it will listen at port 8080
	6. Visit http://localhost:8080/ in a browser (for best performance, use Firefox or Chrome)
	7. Click the "Play" button on the main page
	8. Create an account or log in if you have already created one
	9. When you are prompted to 'Create or join a base', select 'New base' and enter a 'Base name.' Other players will need to know this base name in order to join.
	10. Choose a difficulty and a pilot ability, then click 'Confirm' to create the game
	11. The app only supports human players, so you will need at least two players to start a game. To accomplish this locally, visit http://localhost:8080/ in an incognito window or different browser and log in to the app with a different account. 
	12. To join the same game session, the second player must choose 'Join Base' and enter the 'Base name' that was defined by the first player. Once a second player has joined, the first player will be able to launch the game.

	Game rules are available at http://localhost:8080/rules

## About the file structure:

starfight/js: modularized javascript code  
starfight/sass: modularized css scripts  
starfight/views: html templates  
starfight/dist: A final distribution version of the code is combined here via a gulpfile.

A finalized version of the application code is also placed in the main starfight directory.
