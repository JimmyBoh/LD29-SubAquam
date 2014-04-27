
'use strict';
function GameOver() {}

GameOver.prototype = {
	preload: function () {

	},
	create: function () {
		var style = { font: '64px Arial Black', fill: '#ffffff', align: 'center' };
		this.titleText = this.game.add.text(this.game.width / 2, 100, 'Game Over!', style);
		this.titleText.anchor.setTo(0.5, 0.5);

		this.congratsText = this.game.add.text(this.game.width / 2, 300, 'Your Score: ' + this.game.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), { font: '48px Arial Black', fill: '#ffffff', align: 'center' });
		this.congratsText.anchor.setTo(0.5, 0.5);

		this.instructionText = this.game.add.text(this.game.width / 2, 600, 'Click To Restart!', { font: '36px Arial Black', fill: '#ffffff', align: 'center' });
		this.instructionText.anchor.setTo(0.5, 0.5);
	},
	update: function () {
		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('menu');
		}
	}
};
module.exports = GameOver;
