
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

	if (this.game.device.desktop)
        {
            this.scale.fullscreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 1280;
            this.scale.minHeight = 720;
            this.scale.maxWidth = 1920;
            this.scale.maxHeight = 1080;
            //this.scale.pageAlignHorizontally = true;
            //this.scale.pageAlignVertically = true;
            //this.scale.setScreenSize(true);
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 1136;
            this.scale.minHeight = 640;
            this.scale.maxWidth = 1920;
            this.scale.maxHeight = 1080;
            //this.scale.pageAlignHorizontally = true;
            //this.scale.pageAlignVertically = true;
            //this.scale.forceOrientation(true, false);
            //this.scale.hasResized.add(this.gameResized, this);
            //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
            //this.scale.setScreenSize(true);
        }

    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;
