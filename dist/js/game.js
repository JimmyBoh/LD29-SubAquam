(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'subaquam');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":3,"./states/gameover":4,"./states/menu":5,"./states/play":6,"./states/preload":7}],2:[function(require,module,exports){
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
		console.log('OFFSCREEN');
		this.reset();
	}
};

module.exports = Cloud;

},{}],3:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
	
	window.Game = this.game;
	this.game.stage.disableVisibilityChange = true;

    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],4:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],5:[function(require,module,exports){
'use strict';

function Menu() {}

Menu.prototype = {
	preload: function () {

	},
	create: function () {



		var style = { font: '65px Arial', fill: '#ffffff', align: 'center' };
		this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'yeoman');
		this.sprite.anchor.setTo(0.5, 0.5);

		this.titleText = this.game.add.text(this.game.world.centerX, 300, '\'Allo, \'Allo!', style);
		this.titleText.anchor.setTo(0.5, 0.5);

		this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play "Click The Yeoman Logo"', { font: '16px Arial', fill: '#ffffff', align: 'center' });
		this.instructionsText.anchor.setTo(0.5, 0.5);

		this.sprite.angle = -20;
		this.game.add.tween(this.sprite).to({ angle: 20 }, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);
	},
	update: function () {
		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('play');
		}
	}
};

module.exports = Menu;

},{}],6:[function(require,module,exports){
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
},{"../prefabs/cloud.js":2}],7:[function(require,module,exports){
'use strict';

function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
	preload: function () {
		this.game.stage.backgroundColor = '#005AE1';
		this.asset = this.add.sprite(this.width / 2, this.height / 2, 'preloader');
		this.asset.anchor.setTo(0.5, 0.5);

		this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.setPreloadSprite(this.asset);

		this.load.image('sky', 'assets/sky.png');

		this.load.spritesheet('cloud', 'assets/clouds.png', 201, 160, 3);


	},
	create: function () {
		this.asset.cropEnabled = false;
	},
	update: function () {
		if (!!this.ready) {
			this.game.state.start('play');
		}
	},
	onLoadComplete: function () {
		this.ready = true;
	}
};

module.exports = Preload;

},{}]},{},[1])