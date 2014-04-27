  'use strict';

  var Cloud = require('../prefabs/cloud.js');
  var Player = require('../prefabs/player.js');
  var Treasure = require('../prefabs/treasure.js');

  function Play() {}

  Play.prototype = {
  	create: function () {
  		var worldWidthInScreens = 3;
  		var worldHeightInScreens = 6;

  		var worldWidth = this.game.width * worldWidthInScreens;
  		var worldHeight = this.game.height * worldHeightInScreens;

  		this.game.world.setBounds(0, 0, worldWidth, worldHeight);

  		this.game.physics.startSystem(Phaser.Physics.P2JS);
  		this.game.physics.p2.defaultRestitution = 0.8;
  		this.game.physics.p2.gravity.y = 500;

  		this.sky = this.game.add.tileSprite(0, 0, worldWidth, this.game.height, 'sky', 0);

  		this.game.stage.backgroundColor = this._calculateDepthColor();

  		this.clouds = this.game.add.group();

  		var cloudCount = this.game.device.desktop ? 8 : 4;

  		for (var i = 0; i < cloudCount; i++) {
  			this._generateCloud(true);
  		}

  		this.treasures = this.game.add.group();

  		var rows = 2 * worldHeightInScreens;
  		var cols = 3 * worldWidthInScreens;

  		for (var row = 3; row < rows; row++) {
  			for (var col = 1; col < cols; col++) {
  				var x = worldWidth * (col / cols);
  				var y = worldHeight * (row / rows);
  				this._generateTreasure(x, y);
  			}
  		}

  		var sounds = {
  			'splash': 3,
  			'treasure': 3,
  			'death': 2
  		};

  		for (var s in sounds) {
  			this[s + 'Sounds'] = [];
  			for (var i = 0; i < sounds[s]; i++) {
  				this[s + 'Sounds'][i] = this.game.add.audio(s + i);
  				//this[s + 'Sounds'][i].volume = 0.5;
  			}
  		}

  		this.player = new Player(this.game, 300, 300);

  		this.player.body.onBeginContact.add(this._playerHit, this);
  	},
  	update: function () {
  		this.game.stage.backgroundColor = this._calculateDepthColor();

  		this._checkPlayer();
  	},
  	render: function () {

  	},
  	_generateCloud: function (isIntial) {
  		var cloud = this.clouds.getFirstExists(false);

  		if (!cloud) {
  			cloud = new Cloud(this.game);
  			this.clouds.add(cloud);
  		}

  		cloud.reset(isIntial);

  		return cloud;
  	},
  	_generateTreasure: function (x, y) {
  		var treasure = this.treasures.getFirstExists(false);

  		if (!treasure) {
  			treasure = new Treasure(this.game, x, y);
  			this.treasures.add(treasure);
  		}

  		treasure.reset(x, y);

  		return treasure;
  	},
  	_calculateDepthColor: function () {
  		var hue = 153 / 255; // STATIC
  		var saturation = 1.0; // STATIC
  		var lightness = 113 / 255; // Ranges from 0 to 113

  		if (this.game.camera.y > this.game.height)
  			lightness *= ((this.game.world.height - this.game.camera.y) / (this.game.world.height - this.game.height));

  		var color = this.game.HSVtoRGB(hue, saturation, lightness);

  		if (this.prevColor != color) {
  			this.prevColor = color;
  		}

  		return color;
  	},
  	_playerHit: function (body, shapeA, shapeB, equation) {

  		switch (true) {
  			case (body && body.sprite instanceof Treasure):
  				this._playTreasure();
  				this.player.score += body.sprite.value;
  				body.sprite.exists = false;
  				break;
  		}
  	},
  	_checkPlayer: function () {
  		if (this.player.air <= 0) {
  			this._playDeath();
  			this.game.score = this.player.score;
  			this.treasures.destroy();
  			this.clouds.destroy();
  			this.player.destroy();

  			this.game.state.start('gameover');
  			return;
  		}

  		if (this.player.wasAbovewater === this.player.isUnderwater && Math.abs(this.player.body.velocity.y) > 2) {
  			var volume = Math.abs(this.player.body.velocity.y) / 50;
  			if (volume > 0.5) volume = 0.5;
  			this._playSplash(volume);
  		}
  	},

  	_playSplash: function (volume) {
  		this._playSound('splash', 3, volume);
  	},
  	_playTreasure: function (volume) {
  		var pick = this.game.rnd.integerInRange(0, 2);
  		this.treasureSounds[pick].play('', 0, volume);
  	},
  	_playDeath: function (volume) {
  		var pick = this.game.rnd.integerInRange(0, 1);
  		this.deathSounds[pick].play('', 0, volume);
  	},
  	_playSound: function (name, number, volume) {
  		volume = volume || 0.5;
  		var pick = this.game.rnd.integerInRange(0, number - 1);
  		this[name + 'Sounds'][pick].play('', 0, volume);
  	}
  };

  module.exports = Play;