import Phaser from 'phaser';

var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function GameScene() {
        Phaser.Scene.call(this, { key: 'gameScene', active: true });

        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = null;
        this.bombs;
        this.sky;
    },

    preload: function() {
        this.load.image('sky', 'src/assets/sprites/sky.png');
        this.load.image('ground', 'src/assets/sprites/platform.jpg');
        this.load.image('star', 'src/assets/sprites/star.png');
        this.load.image('bomb', 'src/assets/sprites/bomb.png');
        this.load.spritesheet('dude', 'src/assets/player/player.png', { frameWidth: 32, frameHeight: 33.5 });
        this.load.image('utils', 'src/assets/sprites/utils.png');
        this.load.image('gameOver', 'src/assets/sprites/game-over.jpeg');
        this.load.image('next', 'src/assets/sprites/next.jpeg');
    },

    create: function() {
        this.sky = this.add.image(400, 300, 'sky');

        var platforms = this.physics.add.staticGroup();

        this.bombs = this.physics.add.group();
        this.bombs.create(300, 200, 'bomb');
        this.bombs.create(420, 320, 'bomb');
        this.bombs.create(50, 200, 'bomb');

        this.generateBombs();


        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');
        platforms.create(850, 120, 'ground');

        var player = this.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        var stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function(child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(this.bombs, platforms);

        this.physics.add.overlap(player, stars, this.collectStar, null, this);

        this.physics.add.collider(player, this.bombs, this.hitBomb, null, this);

        this.player = player;

    },


    update: function() {
        var cursors = this.cursors;
        var player = this.player;

        if (cursors.left.isDown) {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);

            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    },

    collectStar: function(player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

    },

    hitBomb: function(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play('turn');

        this.gameOver = true;
        let gameOver = this.add.image(350, 230, 'utils').setOrigin(0, 0).setInteractive()
        gameOver.on('pointerdown', () => {
            this.scene.start('gameScene');
        })

    },

    generateBombs: function() {
        this.bombs.children.iterate(function(child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            child.setBounce(1);
            child.setCollideWorldBounds(true);
            child.setVelocity(Phaser.Math.Between(-200, 200), 20);
        });
    }

});

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);