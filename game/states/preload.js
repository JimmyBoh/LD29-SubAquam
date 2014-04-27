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
		this.load.image('rotate', 'assets/rotate.png');
		this.load.image('player', 'assets/player.png');
		this.load.image('arrow', 'assets/arrow.png');

		this.load.spritesheet('cloud', 'assets/clouds.png', 201, 160, 3);
		this.load.spritesheet('treasure', 'assets/treasure.png', 40, 40, 3);

		this.buildAddons();
	},
	create: function () {
		this.asset.cropEnabled = false;
	},
	update: function () {
		if (!!this.ready) {
			this.game.state.start('menu');
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
