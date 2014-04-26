  'use strict';

  var Cloud = require('../prefabs/cloud.js');

  function Play() {}

  Play.prototype = {
  	create: function () {

  		var worldWidth = this.game.width * 2;
  		var worldHeight = this.game.height * 4;

  		this.game.physics.startSystem(Phaser.Physics.ARCADE);
  		this.game.world.setBounds(0, 0, worldWidth, worldHeight);
  		this.sky = this.game.add.tileSprite(0, 0, worldWidth, this.game.height, 'sky', 0);

  		this.game.stage.backgroundColor = this._calculateDepthColor();

  		this.clouds = this.game.add.group();

  		for (var i = 0; i < 8; i++) {
  			this._generateCloud(true);
  		}

  		this.cursors = this.game.input.keyboard.createCursorKeys();
  	},
  	update: function () {
  		var cameraSpeed = 10;

  		if (this.cursors.up.isDown) {
  			this.game.camera.y -= cameraSpeed;
  		} else if (this.cursors.down.isDown) {
  			this.game.camera.y += cameraSpeed;
  		}

  		if (this.cursors.left.isDown) {
  			this.game.camera.x -= cameraSpeed;
  		} else if (this.cursors.right.isDown) {
  			this.game.camera.x += cameraSpeed;
  		}

  		this.game.stage.backgroundColor = this._calculateDepthColor();
  	},
  	render: function () {
  		this.game.debug.cameraInfo(this.game.camera, 32, 32);
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
  	_calculateDepthColor: function () {
  		var hue = 153 / 255; // Static
  		var saturation = 1.0; // Static
  		var lightness = 113 / 255; // Ranges from 0 to 113

  		if (this.game.camera.y > this.game.height)
  			lightness *= ((this.game.world.height - this.game.camera.y) / (this.game.world.height-this.game.height));

  		var color = this.game.HSVtoRGB(hue, saturation, lightness);

  		if (this.prevColor != color) {
  			this.prevColor = color;
  		}

  		return color;
  	}
  };

  module.exports = Play;