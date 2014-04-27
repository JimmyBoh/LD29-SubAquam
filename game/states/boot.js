
'use strict';

function Boot() {
}

Boot.prototype = {
	preload: function () {
		this.load.image('preloader', 'assets/preloader.gif');
		this.load.image('jimmyboh', 'assets/splashscreen.png');
	},
	create: function () {

		window.Game = this.game;
		this.game.stage.disableVisibilityChange = true;

		this.game.input.maxPointers = 1;
		this.game.state.start('preload');
	}
};

module.exports = Boot;
