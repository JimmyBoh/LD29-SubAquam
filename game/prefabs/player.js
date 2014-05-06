'use strict';

var Player = function (game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'player', 0);
	this.game.add.existing(this);

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
	this.stiffness = 8;
	this.restLength = 1;
	this.spring.stiffness = 0;
	this.spring.restLength = 999999999;

	this.isUnderwater = false;
	this.isAbovewater = true;

	this.limitDrag = false;

	this.maxAir = 15;//*60*60;
	this.air = this.maxAir;


	this._createHurtOverlay();
	this._createAirBar();
	this._createScore();

	this._stopDragging();
	this.game.camera.follow(this, Phaser.Camera.PLATFORMER);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
	this.wasUnderwater = this.isUnderwater;
	this.wasAbovewater = this.isAbovewater;

	this.isUnderwater = this.y > this.game.height;
	this.isAbovewater = !this.isUnderwater;

	this._updateAir();
	this._updateScore();

	this._updateGravity();
	this._updateArrow();

	this._updateInput();
};

Player.prototype.createGUI = function(){
	this._createAirBar();
	this._createScore();
}

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

	if (this.limitDrag) {
		if (this.wasUnderwater && this.isAbovewater)
			this._stopDragging();

		if (this.wasAbovewater && this.isUnderwater && this.game.input.activePointer.isDown)
			this._startDragging(this.game.input.activePointer);
	}
}

Player.prototype._startDragging = function (pointer) {
	if (this.limitDrag && this.isAbovewater) return;

	this.isDragging = true;

	this.arrow.x = this.arrow.body.x = pointer.worldX;
	this.arrow.y = this.arrow.body.y = pointer.worldY;

	this.arrow.alpha = 1;

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

Player.prototype._createAirBar = function () {
	this.airBar = this.game.add.bitmapData(this.game.width, this.game.height);

	this.airBar.context.fillStyle = 'rgb(255, 0, 0)';

	//	Add the bmd as a texture to an Image object.
	//	If we don't do this nothing will render on screen.
	var airSprite = this.game.add.sprite(0, 0, this.airBar);
	airSprite.fixedToCamera = true;
}

Player.prototype._updateAir = function () {
	if (this.isUnderwater) {
		this.air -= (this.game.time.elapsed / 1000);

		if (this.air < 0)
			this.air = 0;
	}
	else {
		this.air += (this.maxAir / 3) * (this.game.time.elapsed / 1000);
		if (this.air >= this.maxAir)
			this.air = this.maxAir;
	}

	var barX = 1280 - (40 + 40);
	var barY = 40;

	var airRatio = this.air / this.maxAir;

	var barHeight = 320;
	var barWidth = 40;
	var blueHeight = airRatio * barHeight;
	var redHeight = barHeight - blueHeight;

	this.airBar.context.fillStyle = 'rgb(255, 0, 0)';
	this.airBar.context.fillRect(barX, barY, barWidth, redHeight);

	this.airBar.context.fillStyle = 'rgb(0, 0, 255)';
	this.airBar.context.fillRect(barX, barY + redHeight, barWidth, blueHeight);
	this.airBar.dirty = true;

	var hurtAppears = 0.333;
	if (airRatio <= hurtAppears)
		this.hurtOverlay.alpha = 1 - (airRatio / hurtAppears);
	else
		this.hurtOverlay.alpha = 0;
}

Player.prototype._createScore = function(){
	this.score = 0;
	
	var scoreStyle = { font: "72px Courier New", fill: '#000', stroke: '#fff', strokeThickness: 1,  align: 'center' };
	this.scoreText = this.game.add.text(1280 - (80 + 40), 40, "SCORE: 0", scoreStyle);
	this.scoreText.fixedToCamera = true;
	this.scoreText.anchor.set(1, 0);
}

Player.prototype._updateScore = function () {
	this.scoreText.setText("SCORE: " + this.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

Player.prototype._createHurtOverlay = function () {
	this.hurtOverlay = this.game.add.sprite(0, 0, 'hurt');
	this.hurtOverlay.alpha = 0;
	this.hurtOverlay.fixedToCamera = true;
}

module.exports = Player;
