'use strict';

var Treasure = function (game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'treasure', 0);

	this.anchor.setTo(0.5, 0.5);

	this.game.physics.p2.enable(this, false);
	this.body.setCircle(20);

	this.body.allowGravity = false;
	this.body.static = true;

};

Treasure.prototype = Object.create(Phaser.Sprite.prototype);
Treasure.prototype.constructor = Treasure;

Treasure.prototype.update = function() {
  
  
  
};

Treasure.prototype.reset = function (x, y) {
	
	this.x = x;
	this.y = y;

	this.frame = this.game.rnd.integerInRange(0, 2);

	if (this.tween) this.tween.stop();

	this.tween = this.game.add.tween(this).to({ y: y - 10 }, 500, Phaser.Easing.Linear.NONE, true, this.game.rnd.integerInRange(0, 100), 10000, true);
};

module.exports = Treasure;
