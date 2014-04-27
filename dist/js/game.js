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
},{"./states/boot":5,"./states/gameover":6,"./states/menu":7,"./states/play":8,"./states/preload":9}],2:[function(require,module,exports){
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

	if (this.game.device.desktop) {
		var deltaY = this.game.rnd.integerInRange(-20, 20);
		var delay = this.game.rnd.integerInRange(0, 100);

		if (this.tween) this.tween.stop();

		this.tween = this.game.add.tween(this).to({ y: data.y + deltaY }, 500, Phaser.Easing.Linear.NONE, true, delay, 10000, true);
	}

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

	this.maxAir = 15;
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
	
	var scoreStyle = { font: "48px Arial Black", fill: '#000', stroke: '#fff', strokeThickness: 3,  align: 'center' };
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

},{}],4:[function(require,module,exports){
'use strict';

var Treasure = function (game) {
	Phaser.Sprite.call(this, game, -100, -100, 'treasure', 0);

	this.anchor.setTo(0.5, 0.5);

	this.game.physics.p2.enable(this, false);
	this.body.setCircle(20);

	this.body.allowGravity = false;
	this.body.static = true;
};

Treasure.prototype = Object.create(Phaser.Sprite.prototype);
Treasure.prototype.constructor = Treasure;

Treasure.prototype.update = function() {
  
};

Treasure.prototype.reset = function (x, y) {

	this.x = this.body.x = x;
	this.y = this.body.y = y;

	this.value = Math.round(100 * (this.y / this.game.height));

	this.frame = this.game.rnd.integerInRange(0, 2);

	if (this.tween) this.tween.stop();

	this.tween = this.game.add.tween(this).to({ y: y - 10 }, 500, Phaser.Easing.Linear.NONE, true, this.game.rnd.integerInRange(0, 100), 10000, true);
};

module.exports = Treasure;

},{}],5:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
	preload: function () {
		this.load.image('preloader', 'assets/preloader.gif');
		this.load.image('jimmyboh', 'assets/splashscreen.png');
	},
	create: function () {

		window.Game = this.game;
		this.game.stage.disableVisibilityChange = true;

		this.game.input.maxPointers = 1;
		this.game.state.start('preload');
	}
};

module.exports = Boot;

},{}],6:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
	preload: function () {

	},
	create: function () {
		var style = { font: '64px Arial Black', fill: '#ffffff', align: 'center' };
		this.titleText = this.game.add.text(this.game.width / 2, 100, 'Game Over!', style);
		this.titleText.anchor.setTo(0.5, 0.5);

		var scoreStyle = { font: '48px Arial Black', fill: '#ffffff', align: 'center' };
		this.scoreText = this.game.add.text(this.game.width / 2, 300, 'Your Score: ' + this.game.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), scoreStyle);
		this.scoreText.anchor.setTo(0.5, 0.5);

		var highscoreText = this.game.score > this.game.highscore ? 'NEW HIGH SCORE!' : 'High Score: ' + this.game.highscore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		this.highText = this.game.add.text(this.game.width / 2, 400, highscoreText, scoreStyle);
		this.highText.anchor.setTo(0.5, 0.5);

		this.instructionText = this.game.add.text(this.game.width / 2, 600, 'Click To Restart!', { font: '36px Arial Black', fill: '#ffffff', align: 'center' });
		this.instructionText.anchor.setTo(0.5, 0.5);

		this.game.highscore = Math.max(this.game.highscore, this.game.score);
		if (window.localStorage)
			window.localStorage['highscore'] = this.game.highscore;

	},
	update: function () {
		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('menu');
		}
	}
};
module.exports = GameOver;

},{}],7:[function(require,module,exports){
'use strict';

function Menu() {}

Menu.prototype = {
	preload: function () {

	},
	create: function () {
		this.game.stage.backgroundColor = '#005AE1';

		var style = { font: '72px Arial Black', fill: '#0ff', align: 'center', stroke:'#000080', strokeThickness: 10 };
		
		this.titleText = this.game.add.text(this.game.width/2, 200, 'Aquam Adventure', style);
		this.titleText.anchor.setTo(0.5, 0.5);

		this.instructionsText = this.game.add.text(this.game.width/2, 400, 'Click and drag to swim around!\nCollect all the treasures before your air runs out!', { font: '36px Arial', fill: '#ffffff', align: 'center' });
		this.instructionsText.anchor.setTo(0.5, 0.5);
	},
	update: function () {
		this.game.scale.refresh();

		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('play');
		}
	}
};

module.exports = Menu;

},{}],8:[function(require,module,exports){
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

  		this._createMuteButton();

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
  	},
  	_createMuteButton: function () {
  		this.muteButton = this.game.add.sprite(20, 20, 'mute', 0);
  		this.muteButton.fixedToCamera = true;
  		this.muteButton.inputEnabled = true;
  		this.muteButton.events.onInputDown.add(function () {
  			this.game.sound.mute = !this.game.sound.mute;
  			this.muteButton.frame = this.game.sound.mute ? 1 : 0;
  			return false;
  		}, this);
  	}
  };

  module.exports = Play;
},{"../prefabs/cloud.js":2,"../prefabs/player.js":3,"../prefabs/treasure.js":4}],9:[function(require,module,exports){
'use strict';

function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
	preload: function () {
		this.ready = false;
		this.loaded = false;

		this.game.time.events.add(Phaser.Timer.SECOND * 1, this.timerComplete, this);

		this.game.add.sprite(0, 0, 'jimmyboh');

		this.loadingBar = this.add.sprite(this.game.width / 2, 0, 'preloader');
		this.loadingBar.anchor.setTo(0.5, 0);

		this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.setPreloadSprite(this.loadingBar);

		// Images
		var images = ['sky', 'rotate', 'player', 'arrow', 'hurt'];
		for (var i in images)
			this.load.image(images[i], 'assets/' + images[i] + '.png');

		//this.load.image('sky', 'assets/sky.png');
		//this.load.image('rotate', 'assets/rotate.png');
		//this.load.image('player', 'assets/player.png');
		//this.load.image('arrow', 'assets/arrow.png');
		//this.load.image('hurt', 'assets/hurt.png');

		// Sprite sheets
		this.load.spritesheet('cloud', 'assets/clouds.png', 201, 160, 3);
		this.load.spritesheet('treasure', 'assets/treasure.png', 40, 40, 3);
		this.load.spritesheet('mute', 'assets/mute.png', 90, 90, 2);

		// Sounds
		var sounds = {
			'splash': 3,
			'treasure': 3,
			'death': 2
		};
		for (var s in sounds)
			for (var i = 0; i < sounds[s]; i++)
				this.load.audio(s + i, ['assets/' + s + i + '.mp3', 'assets/' + s + i + '.ogg']);

		this.buildAddons();

		if (window.localStorage) {
			this.game.highscore = parseInt(window.localStorage['highscore']);

			if (isNaN(this.game.highscore)) {
				this.game.highscore = 0;
				window.localStorage['highscore'] = 0;
			}
		}
	},
	create: function () {
		this.loadingBar.cropEnabled = false;
	},
	update: function () {
		if (this.loaded && this.ready) {
			this.game.state.start('menu');
		}
	},
	onLoadComplete: function () {
		this.loaded = true;
		this.loadingBar.destroy();
	},
	timerComplete: function () {
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
				var hue2rgb = function (p, q, t) {
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