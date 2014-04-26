  'use strict';

  function Play() {}

  Play.prototype = {
  	create: function () {
  		this.game.physics.startSystem(Phaser.Physics.ARCADE);
  		this.game.world.setBounds(0, 0, 1280 * 2, 720 * 10);
  		this.sky = this.game.add.tileSprite(0, 0, 1280 * 2, 720, 'sky', 0);

  		this.clouds = this.game.add.group();



  		this.cursors = this.game.input.keyboard.createCursorKeys();

  		this.sprite = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'yeoman');
  		this.sprite.inputEnabled = true;

  		this.game.physics.arcade.enable(this.sprite);
  		this.sprite.body.collideWorldBounds = true;
  		this.sprite.body.bounce.setTo(1, 1);
  		this.sprite.body.velocity.x = this.game.rnd.integerInRange(-500, 500);
  		this.sprite.body.velocity.y = this.game.rnd.integerInRange(-500, 500);
  	},
  	update: function () {
  		if (this.cursors.up.isDown) {
  			this.game.camera.y -= 4;
  		}
  		else if (this.cursors.down.isDown) {
  			this.game.camera.y += 4;
  		}

  		if (this.cursors.left.isDown) {
  			this.game.camera.x -= 4;
  		}
  		else if (this.cursors.right.isDown) {
  			this.game.camera.x += 4;
  		}
  	},
  	render: function () {
  		this.game.debug.cameraInfo(this.game.camera, 32, 32);
  	},
  	_generateClouds: function () {
  		var cloud = this.pipes.getFirstExists(false);
  		if (!cloud) {
  			cloud = new PipeGroup(this.game, this.pipes);
  		}
  		cloud.reset();
  	}
  };

  module.exports = Play;