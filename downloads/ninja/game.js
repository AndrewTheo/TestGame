
var game = new Phaser.Game(640, 480, Phaser.CANVAS);

window.onload = function() {	
	//var game = new Phaser.Game(640, 480, Phaser.CANVAS);
	

   // if (game.input.activePointer.isDown)
   //  {
   //      andrew();
   //  }
     andrew();
     //var game = null;
  }


function andrew(){

    //var game = new Phaser.Game(640, 480, Phaser.CANVAS);
	var ninja;
	var ninjaGravity = 800;
	var ninjaJumpPower;    
	var score=0;
	var scoreText;
    var topScore;
    var powerBar;
    var powerTween;
    var placedPoles;
	var poleGroup; 
    var minPoleGap = 100;
    var maxPoleGap = 300; 
    var ninjaJumping;
    var ninjaFallingDown;  

    var mode = 0;
      
//game.state.add("menu",menu);
	


	// game.load.image("Logo","SlimeLogo.png");
	var logox = 100;
	var logoy=50;
	// logo = game.add.sprite(logox,logoy,"Logo");

	var playX = 240;
	var playY = 250;

     var play = function(game){}     
     play.prototype = {
		preload:function(){
			game.load.image("ninja", "ninja.png"); 
			game.load.image("pole", "pole.png");
            game.load.image("powerbar", "powerbar.png");

            game.load.image("powerbarFront", "powerbarFront.png");

            game.load.image("Logo","SlimeLogo.png");

            game.load.image("PlayLogo","PlayLogo.png");


		},
		create:function(){
			ninjaJumping = false;
			ninjaFallingDown = false;
			score = 0;
			placedPoles = 0;
			poleGroup = game.add.group();
			topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial"
			});
			updateScore();
			game.stage.backgroundColor = "#87CEEB";
			game.physics.startSystem(Phaser.Physics.ARCADE);
			ninja = game.add.sprite(80,0,"ninja");
			ninja.anchor.set(0.5);
			ninja.lastPole = 1;
			game.physics.arcade.enable(ninja);              
			ninja.body.gravity.y = ninjaGravity;
			game.input.onDown.add(prepareToJump, this);
			addPole(80);


			logo = game.add.sprite(logox,logoy,"Logo");

			logoplay = game.add.sprite(playX,playY,"PlayLogo");


		},
		update:function(){
			game.physics.arcade.collide(ninja, poleGroup, checkLanding);
			if(ninja.y>game.height){
				die();
			}

			if (mode == 0)
			{
				//logo = game.add.sprite(100,50,"Logo");
				logox = 100;
				logoy = 50;

				playX = 240;
				playY = 250;



				game.input.onDown.add(modes, this);


			}

			if (mode == 1)
			{
				logox = 1000;
				logoy = 1000;

				playX = 1000;
				playY = 1000;
			}



		}
	}     
     game.state.add("Play",play);

     game.state.start("Play");




     function modes(){
     	logo.destroy();
     	logoplay.destroy();
     	mode = 1;
     }




     



	function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;	
	}     
	function prepareToJump(){
		
		if (mode == 1){


		if(ninja.body.velocity.y==0){
	          

	          powerBar = game.add.sprite(ninja.x,ninja.y-50,"powerbar");
	          powerBar.width = 0;

	          powerBarFront = game.add.sprite(ninja.x,ninja.y-50,"powerbarFront")

	          powerTween = game.add.tween(powerBar).to({
			   width:100
			}, 1000, "Linear",true); 
	          game.input.onDown.remove(prepareToJump, this);
	          game.input.onUp.add(jump, this);
          }    

      }



	}     
     function jump(){
          ninjaJumpPower= -powerBar.width*3-100
          powerBar.destroy();
          powerBarFront.destroy();

          game.tweens.removeAll();
          ninja.body.velocity.y = ninjaJumpPower*2;
          ninjaJumping = true;
          powerTween.stop();
          game.input.onUp.remove(jump, this);
     }     
     function addNewPoles(){
     	var maxPoleX = 0;
		poleGroup.forEach(function(item) {
			maxPoleX = Math.max(item.x,maxPoleX)			
		});
		var nextPolePosition = maxPoleX + game.rnd.between(minPoleGap,maxPoleGap);
		addPole(nextPolePosition);			
	}
	function addPole(poleX){
		if(poleX<game.width*2){
			placedPoles++;
			var pole = new Pole(game,poleX,game.rnd.between(250,380));
			game.add.existing(pole);
	          pole.anchor.set(0.5,0);
			poleGroup.add(pole);
			var nextPolePosition = poleX + game.rnd.between(minPoleGap,maxPoleGap);
			addPole(nextPolePosition);
		}
	}	
	function die(){
		localStorage.setItem("topFlappyScore",Math.max(score,topScore));	
		game.state.start("Play");
		mode = 0;
	}
	function checkLanding(n,p){
		if(p.y>=n.y+n.height/2){
			var border = n.x-p.x
			if(Math.abs(border)>20){
				n.body.velocity.x=border*2;
				n.body.velocity.y=-200;	
			}
			var poleDiff = p.poleNumber-n.lastPole;
			if(poleDiff>0){
				score+= Math.pow(2,poleDiff);
				updateScore();	
				n.lastPole= p.poleNumber;
			}
			if(ninjaJumping){
               	ninjaJumping = false;              
               	game.input.onDown.add(prepareToJump, this);
          	}
		}
		else{
			ninjaFallingDown = true;
			poleGroup.forEach(function(item) {
				item.body.velocity.x = 0;			
			});
		}			
	}
	Pole = function (game, x, y) {
		Phaser.Sprite.call(this, game, x, y, "pole");
		game.physics.enable(this, Phaser.Physics.ARCADE);
          this.body.immovable = true;
          this.poleNumber = placedPoles;
	};
	Pole.prototype = Object.create(Phaser.Sprite.prototype);
	Pole.prototype.constructor = Pole;
	Pole.prototype.update = function() {
          if(ninjaJumping && !ninjaFallingDown){
               this.body.velocity.x = ninjaJumpPower;
          }
          else{
               this.body.velocity.x = 0
          }
		if(this.x<-this.width){
			this.destroy();
			addNewPoles();
		}
	}	
}

