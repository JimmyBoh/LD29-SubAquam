'use strict';

var Player = function (game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'player', 0);
	window.player = this;
	this.anchor.setTo(0.9, 0.5);
	this.game.physics.p2.enableBody(this, false);

	this.maxVelocity = {
		y: 40,
		x: 40
	}

	this.isDragging = false;

	this.arrow = this.game.add.sprite(-100, -100, 'arrow');
	this.game.physics.p2.enableBody(this.arrow, false);
	this.arrow.anchor.setTo(0.9, 0.5);
	this.arrow.alpha = 0;
	this.arrow.body.static = true;

	this.game.input.onDown.add(this._onInputDown, this);
	this.game.input.onUp.add(this._onInputUp, this);

	// new Spring(world, bodyA, bodyB, restLength, stiffness, damping, worldA, worldB, localA, localB)
	this.spring = this.game.physics.p2.createSpring(this.arrow, this, 1, 0, 2, null, null, null, [-100, 45]);
	this.stiffness = 6;
	this.restLength = 1;
	this.spring.stiffness = 0;
	this.spring.restLength = 999999999;

	this.isUnderwater = false;
	this.isAbovewater = true;

	this._stopDragging();

	this.game.camera.follow(this, Phaser.Camera.PLATFORMER);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {

	//this.anchor.setTo(0.9, 0.5);

	this.isUnderwater = this.y > this.game.height;
	this.isAbovewater = !this.isUnderwater;


	if (this.wasUnderwater && this.isAbovewater)
		this._stopDragging();

	if (this.wasAbovewater && this.isUnderwater && this.game.input.activePointer.isDown)
		this._startDragging(this.game.input.activePointer);


	this._updateGravity();
	this._updateArrow();

	this._updateInput();

	this._fixVelocity();

	this.wasUnderwater = this.isUnderwater;
	this.wasAbovewater = this.isAbovewater;
};

Player.prototype._onInputDown = function (pointer, e) {
	this._startDragging(pointer);
}

Player.prototype._onInputUp = function (pointer, e) {
	this._stopDragging();
}

Player.prototype._updateInput = function () {
	if (!this.game.input.activePointer.isDown && this.isDragging) {
		this._stopDragging();
	}
}

Player.prototype._startDragging = function (pointer) {
	if (this.isAbovewater) return;

	this.isDragging = true;

	this.arrow.x = this.arrow.body.x = pointer.worldX;
	this.arrow.y = this.arrow.body.y = pointer.worldY;

	this.arrow.alpha = 1;

	//this.body.angularVelocity = 0;

	// Enable the spring
	this.spring.stiffness = this.stiffness;
	this.spring.restLength = this.restLength;
}

Player.prototype._stopDragging = function(){
	this.isDragging = false;

	this.arrow.alpha = 0;

	// Disable the spring
	this.spring.stiffness = 0;
	this.spring.restLength = 999999999;
}

Player.prototype._updateArrow = function () {

	if (this.isDragging) {
		var p2 = this.arrow;
		var p1 = this;

		var rot = Math.atan2(p2.y - p1.y, p2.x - p1.x);

		this.arrow.body.rotation = rot;

		this.arrow.body.x = this.game.input.activePointer.worldX;
		this.arrow.body.y = this.game.input.activePointer.worldY;
	} else {
		this.arrow.x = this.x;
		this.arrow.y = this.y;

		if ((Math.abs(this.y - this.game.height) < 2) && this.body.velocity.y < 2) {
			//this.body.rotation = 0;
			//this.body.setZeroVelocity();
		} else {
			//this.body.angularVelocity = 0;
			//this.body.rotation = Math.atan2(-this.body.velocity.y, -this.body.velocity.x);
		}

		
	}
}

Player.prototype._updateGravity = function () {

	if (this.y < this.game.height) {
		this.body.data.gravityScale = 1;
	}
	else {
		this.body.data.gravityScale = -0.25;
		if (this.prevY && this.prevY < this.game.height) {
			//console.log('SPLASH');
		}
	}

	this.prevY = this.y;
}

Player.prototype._fixVelocity = function () {
	if (this.body.velocity.y > 0) {
		if (this.body.velocity.y > this.maxVelocity.y) {
			//this.body.velocity.y = this.maxVelocity.y;
			//console.log('maxed y');
		}
	} else if (this.body.velocity.y < 0) {
		if (this.body.velocity.y < -this.maxVelocity.y) {
			//this.body.velocity.y = -this.maxVelocity.y;
			//console.log('maxed y');
		}
	}

	if (this.body.velocity.x > 0) {
		if (this.body.velocity.x > this.maxVelocity.x) {
			//this.body.velocity.x = this.maxVelocity.x;
			//console.log('maxed x');
		}
	} else if (this.body.velocity.x < 0) {
		if (this.body.velocity.x < -this.maxVelocity.x) {
			//this.body.velocity.x = -this.maxVelocity.x;
			//console.log('maxed x');
		}
	}
}

module.exports = Player;
