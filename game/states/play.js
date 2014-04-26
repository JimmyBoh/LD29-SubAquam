  'use strict';

  var Cloud = require('../prefabs/cloud.js');
  var Player = require('../prefabs/player.js');
  var Treasure = require('../prefabs/treasure.js');

  function Play() {}

  Play.prototype = {
  	create: function () {

  		var worldWidth = this.game.width * 2;
  		var worldHeight = this.game.height * 3;

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

  		this.player = new Player(this.game, 300, 300);
  		this.game.add.existing(this.player);

  		this.treasures = this.game.add.group();

  		var rows = 6;
  		var cols = 6;

  		for (var row = 3; row < rows; row++) {
  			for (var col = 1; col < cols; col++) {
  				var x = worldWidth * (col / cols);
  				var y = worldHeight * (row / rows);
  				this._generateTreasure(x, y);
  			}
  		}
  	},
  	update: function () {
  		this.game.stage.backgroundColor = this._calculateDepthColor();
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
  		var hue = 153 / 255; // Static
  		var saturation = 1.0; // Static
  		var lightness = 113 / 255; // Ranges from 0 to 113

  		if (this.game.camera.y > this.game.height)
  			lightness *= ((this.game.world.height - this.game.camera.y) / (this.game.world.height - this.game.height));

  		var color = this.game.HSVtoRGB(hue, saturation, lightness);

  		if (this.prevColor != color) {
  			this.prevColor = color;
  		}

  		return color;
  	}
  };

  module.exports = Play;