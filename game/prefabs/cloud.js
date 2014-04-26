'use strict';

var Cloud = function (game) {
	Phaser.Sprite.call(this, game, 0, 0, 'cloud', 0);

	this.anchor.setTo(0.5, 0.5);

	this.game.physics.arcade.enableBody(this);

	this.body.allowGravity = false;
	this.body.immovable = true;
};

Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.prototype.constructor = Cloud;

Cloud.prototype.update = function () {
	this.checkOffScreen();
};

Cloud.prototype.reset = function (isInitial) {
	var data = this.generateNewData(isInitial);

	this.x = data.x;
	this.y = data.y;
	this.frame = data.frame;
	this.body.velocity.x = data.velocity;

	var deltaY = this.game.rnd.integerInRange(-10, 10);
	var delay = this.game.rnd.integerInRange(0, 100);

	this.game.add.tween(this).to({ y: data.y + deltaY }, 350, Phaser.Easing.Linear.NONE, true, delay, 10000, true);

	this.exists = true;
};

Cloud.prototype.generateNewData = function (isInitial) {

	var result = {
		velocity: this.game.rnd.integerInRange(10, 50) * (this.game.rnd.frac() > 0.5 ? -1 : 1),
		y: this.game.rnd.integerInRange(10, 500),
		frame: this.game.rnd.integerInRange(0, 2)
	};

	if (isInitial) {
		result.x = this.game.rnd.integerInRange(0, this.game.world.width);
	}
	else if (result.velocity > 0) {
		result.x = this.game.rnd.integerInRange(-500, -100);
	} else {
		result.x = this.game.rnd.integerInRange(this.game.world.width + 100, this.game.world.width + 500);
	}

	return result;
};

Cloud.prototype.checkOffScreen = function () {
	if (this.exists && (
		(this.x < -this.width && this.body.velocity.x < 0) ||
		(this.x > this.game.world.width+this.width && this.body.velocity.x > 0)
	)) {
		this.reset();
	}
};

module.exports = Cloud;
