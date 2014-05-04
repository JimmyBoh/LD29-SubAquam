'use strict';

function Menu() {}

Menu.prototype = {
	preload: function () {

	},
	create: function () {
		this.game.stage.backgroundColor = '#005AE1';

		var style = { font: '72px Arial Black', fill: '#0ff', align: 'center', stroke:'#000080', strokeThickness: 10 };
		
		this.titleText = this.game.add.text(this.game.width/2, 200, 'Aquam', style);
		this.titleText.anchor.setTo(0.5, 0.5);
		
		style.font = '48px Arial Black'
		this.subTitleText = this.game.add.text(this.game.width/2, 280, 'Adventure', style);
		this.subTitleText.anchor.setTo(0.5, 0.5);

		this.instructionsText = this.game.add.text(this.game.width/2, 500, 'Click and drag to swim around!\nCollect all the treasures before your air runs out!', { font: '36px Arial', fill: '#ffffff', align: 'center' });
		this.instructionsText.anchor.setTo(0.5, 0.5);
	},
	update: function () {
		this.game.scale.refresh();

		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('play');
		}
	}
};

module.exports = Menu;
