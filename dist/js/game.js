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
},{"./states/boot":4,"./states/gameover":5,"./states/menu":6,"./states/play":7,"./states/preload":8}],2:[function(require,module,exports){
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
		this.reset();
	}
};

module.exports = Cloud;

},{}],3:[function(require,module,exports){
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

	//this.body.angularVelocity = -1;

	this.arrow = this.game.add.sprite(-100, -100, 'arrow');
	this.game.physics.p2.enableBody(this.arrow, false);
	this.arrow.anchor.setTo(0.9, 0.5);
	//this.arrow.alpha = 0;
	this.arrow.body.static = true;


	this.game.input.onDown.add(this._onInputDown, this);
	this.game.input.onUp.add(this._onInputUp, this);

	this.spring = this.game.physics.p2.createSpring(this.arrow, this, 50, 0, 2);
	this.stiffness = 5;
	this.spring.stiffness = 0;

	this.game.camera.follow(this, Phaser.Camera.PLATFORMER);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
	this._updateGravity();
	this._updateArrow();

	this._updateInput();

	this._fixVelocity();
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
	} else {

	}
}

Player.prototype._startDragging = function(pointer){
	this.isDragging = true;

	this.arrow.x = this.arrow.body.x = pointer.worldX;
	this.arrow.y = this.arrow.body.y = pointer.worldY;

	this.arrow.alpha = 1;

	// Enable the spring
	this.spring.stiffness = this.stiffness;
}

Player.prototype._stopDragging = function(){
	this.isDragging = false;

	this.arrow.alpha = 0;

	// Disable the spring
	this.spring.stiffness = 0;
}

Player.prototype._updateArrow = function () {
	
	if (this.isDragging) {
		var p2 = this.arrow;
		var p1 = this;

		this.arrow.body.rotation = this.body.rotation = this.body.data.rotataion = Math.atan2(p2.y - p1.y, p2.x - p1.x);

		this.arrow.x = this.arrow.body.x = this.game.input.activePointer.worldX;
		this.arrow.y = this.arrow.body.y = this.game.input.activePointer.worldY;
	} else {
		this.arrow.x = this.arrow.body.x = this.x;
		this.arrow.y = this.arrow.body.y = this.y;
	}
}

Player.prototype._updateGravity = function () {

	if (this.y < this.game.height) {
		this.body.data.gravityScale = 1;
	}
	else {
		this.body.data.gravityScale = -0.25;
		if (this.prevY && this.prevY < this.game.height) {
			console.log('SPLASH');
		}
	}

	this.prevY = this.y;
}

Player.prototype._fixVelocity = function () {
	if (this.body.velocity.y > 0) {
		if (this.body.velocity.y > this.maxVelocity.y) {
			this.body.velocity.y = this.maxVelocity.y;
			//console.log('maxed y');
		}
	} else if (this.body.velocity.y < 0) {
		if (this.body.velocity.y < -this.maxVelocity.y) {
			this.body.velocity.y = -this.maxVelocity.y;
			//console.log('maxed y');
		}
	}

	if (this.body.velocity.x > 0) {
		if (this.body.velocity.x > this.maxVelocity.x) {
			this.body.velocity.x = this.maxVelocity.x;
			//console.log('maxed x');
		}
	} else if (this.body.velocity.x < 0) {
		if (this.body.velocity.x < -this.maxVelocity.x) {
			this.body.velocity.x = -this.maxVelocity.x;
			//console.log('maxed x');
		}
	}
}

module.exports = Player;

},{}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
  'use strict';

  var Cloud = require('../prefabs/cloud.js');
  var Player = require('../prefabs/player.js');

  function Play() {}

  Play.prototype = {
  	create: function () {

  		var worldWidth = this.game.width * 2;
  		var worldHeight = this.game.height * 4;

		this.game.world.setBounds(0, 0, worldWidth, worldHeight);

  		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.defaultRestitution = 0.8;
  		this.game.physics.p2.gravity.y = 400;

  		this.sky = this.game.add.tileSprite(0, 0, worldWidth, this.game.height, 'sky', 0);

  		this.game.stage.backgroundColor = this._calculateDepthColor();

  		this.clouds = this.game.add.group();

  		for (var i = 0; i < 8; i++) {
  			this._generateCloud(true);
  		}

  		this.player = new Player(this.game, 300, 300);
  		this.game.add.existing(this.player);

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
  			lightness *= ((this.game.world.height - this.game.camera.y) / (this.game.world.height - this.game.height));

  		var color = this.game.HSVtoRGB(hue, saturation, lightness);

  		if (this.prevColor != color) {
  			this.prevColor = color;
  		}

  		return color;
  	}
  };

  module.exports = Play;
},{"../prefabs/cloud.js":2,"../prefabs/player.js":3}],8:[function(require,module,exports){
//'use strict';

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
		this.load.image('rotate', 'assets/rotate.png');
		this.load.image('player', 'assets/player.png');
		this.load.image('arrow', 'assets/arrow.png');

		this.load.spritesheet('cloud', 'assets/clouds.png', 201, 160, 3);

		this.buildAddons();
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
	},
	buildAddons: function () {
		this.game.HSVtoRGB = function (h, s, l) {
			/**
			* Converts an HSL color value to RGB. Conversion formula
			* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
			* Assumes h, s, and l are contained in the set [0, 1] and
			* returns r, g, and b in the set [0, 255].
			*
			* @param   Number  h       The hue
			* @param   Number  s       The saturation
			* @param   Number  l       The lightness
			* @return  Hex String      The RGB representation
			*/
			var r, g, b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				function hue2rgb(p, q, t) {
					if (t < 0) t += 1;
					if (t > 1) t -= 1;
					if (t < 1 / 6) return p + (q - p) * 6 * t;
					if (t < 1 / 2) return q;
					if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
					return p;
				}

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1 / 3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1 / 3);
			}

			var rgb = [Math.round(r * 255).toString(16), Math.round(g * 255).toString(16), Math.round(b * 255).toString(16)];

			for (var i = 0; i < rgb.length; i++) {
				if (rgb[i].length === 1)
					rgb[i] = '0' + rgb[i];
			}
			return '#' + rgb.join('');
		}

		this.game.GoFull = function () {
			Game.scale.forceLandscape = true;
			Game.scale.forceOrientation(true, false, 'rotate');
			Game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
			Game.scale.startFullScreen();
			setTimeout(function () {
				Game.scale.refresh();
			}, 200);
		}
	}
};

module.exports = Preload;

},{}]},{},[1])