  'use strict';

  var Cloud = require('../prefabs/cloud.js');

  function Play() {}

  Play.prototype = {
  	create: function () {

  		this.game.stage.backgroundColor = '#005AE1';

  		var worldWidth = this.game.width * 2;
  		var worldHeight = this.game.height * 10;

  		this.game.physics.startSystem(Phaser.Physics.ARCADE);
  		this.game.world.setBounds(0, 0, worldWidth, worldHeight);
  		this.sky = this.game.add.tileSprite(0, 0, worldWidth, this.game.height, 'sky', 0);

  		this.clouds = this.game.add.group();

  		for (var i = 0; i < 8; i++) {
  			this._generateCloud(true);
  		}

  		this.cursors = this.game.input.keyboard.createCursorKeys();
  	},
  	update: function () {
  		if (this.cursors.up.isDown) {
  			this.game.camera.y -= 4;
  		} else if (this.cursors.down.isDown) {
  			this.game.camera.y += 4;
  		}

  		if (this.cursors.left.isDown) {
  			this.game.camera.x -= 4;
  		} else if (this.cursors.right.isDown) {
  			this.game.camera.x += 4;
  		}

  		var depth = this.game.camera.y / this.game.world.height;
		

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
  	}
  };

  module.exports = Play;