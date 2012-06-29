 // shim layer with setTimeout fallback - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})();


var PFC = (function(PFC, $){

	var ctx =  document.getElementById('canvas').getContext('2d'),
	images = [],
	particleSystem,
	emitters
	;
	

	this.captureClick = function(){
		$('#canvas').click(function(e){
			e.preventDefault();
			PFC.system.emit(particleSystem,images,e.pageX-20, e.pageY-20);
		});
	};
	this.loop = function(){

		particleSystem = new PFC.physics.System();
		particleSystem.forces.push(PFC.physics.gravity);
		particleSystem.forces.push(PFC.physics.wind);
	//	particleSystem.forces.push(PFC.physics.drag);

		(function animationLoop(){
			requestAnimFrame(animationLoop);
			particleSystem.update(1/60);
			PFC.system.renderCanvasImage(ctx,particleSystem.particles);
		})();

	};
	this.init = function(){

		images[0] = new Image();
		images[0].onLoad = $(window).load(function(){ this.loop();});
		images[0].src = 'resources/images/spark.png';

		this.captureClick();

		ctx.canvas.width  = window.innerWidth;
 		ctx.canvas.height = window.innerHeight;
		ctx.fillStyle="#000000";
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
	}();

	return PFC; 
})(window.PFC || {}, jQuery);

PFC.physics = {
	Vector : function(x,y){
	//console.log(arguments)
		this.x = x;
		this.y = y;
	},
	Particle : function(position){
		this.position = position;
		this.velocity = new PFC.physics.Vector(0,0);
		this.img;
		this.life = 0;
		this.MAXLIFE = 500;
		this.active = true;
	},
	gravity : function(particle, time){
		particle.velocity.y += 30*time;
	},
	wind : function(particle, time){
		particle.velocity.x += 20*Math.random()*time;
	},
	drag : function(particle, time){
		particle.velocity.imuls(0.97);
	},
	System : function(){
		this.particles = [];
		this.forces = [];
	}
};

/*		VECTORS		*/

PFC.physics.Vector.prototype = {
	/* Vector Algebra I don't really understand */
	muls : function(n) {return new PFC.physics.Vector(this.x*n, this.y*n);},
	imuls : function(n) { this.x*= n; this.y*= n; return this;},
	
	mul : function(v) {return new PFC.physics.Vector(this.x*v.x, this.y*v.y);},
	imul : function(v) { this.x*= v.x; this.y*= v.y; return this;},

	divs : function(n) {return new PFC.physics.Vector(this.x/n, this.y/n);},
	div : function(v) { return new PFC.physics.Vector(this.x/v.x, this.y/v.y);},

	adds : function(n) {return new PFC.physics.Vector(this.x+n, this.y+n);},
	iadds : function(s) { this.x+= s; this.y+= s; return this;},

	add : function(v) {return new PFC.physics.Vector(this.x+v.x, this.y+v.y);},
	iadd : function(v) {this.x+= v.x; this.y+= v.y; return this; },

	subs : function(n) {return new PFC.physics.Vector(this.x-n, this.y-n);},
	isubs : function(s) { this.x-= s; this.y-= s; return this;},

	sub : function(v) {return new PFC.physics.Vector(this.x-v.x, this.y-v.y);},
	isub : function(v) { this.x-= v.x; this.y-= v.y; return this;},
	
	set : function(x,y) {this.x = x; this.y = y;}
};

/*		PARTICLES		*/

PFC.physics.Particle.prototype = {
	update : function(time){ 
		this.position = this.position.add(this.velocity.muls(time));
		this.life++;
		if(this.life > this.MAXLIFE) this.active = false;
	}
};

/*		PARTICLE SYSTEM		*/

PFC.physics.System.prototype = {
	update : function(time){
		for (var i = 0; i < this.particles.length; i++ ){
			var particle = this.particles[i];
			for (var j = 0; j < this.forces.length; j++ ){
				var force = this.forces[j];
				force(particle, time);
			}
			particle.update(time);
			if (!particle.active) {delete this.particles[i]; this.particles.splice(i,1);}
		}
	}
};

/*		TOOLS		*/

PFC.tools = {
	fuzzy : function(range, base){ return (base || 0) + (Math.random()-0.5)*range*2; },
	choice : function(array) {return array[Math.floor(Math.random()*array.length)]; }
};

PFC.system = {
	renderCanvasImage : function (ctx, particles, fade){
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.globalCompositeOperation = 'lighter';
		for(var i = 0; i < particles.length; i++ ){
			var particle = particles[i];
			ctx.save();
			ctx.translate(particle.position.x, particle.position.y);
			ctx.drawImage(particle.img, particle.img.width, particle.img.height);
			ctx.restore();		
		}
		ctx.globalCompositeOperation = 'source-over';
	},
	emit : function(particleSystem,images,x,y){
		var position = new PFC.physics.Vector(x,y); 
		for (var i = 0; i < 1000; i++){
			var	particle = new PFC.physics.Particle(position),
			alpha = PFC.tools.fuzzy(Math.PI),
			radius = Math.random()*100
			;
			particle.velocity.x = Math.cos(alpha)*radius;
			particle.velocity.y = Math.sin(alpha)*radius;
			particle.img = images[0];
			
			particleSystem.particles.push(particle);
		}		
	},
}; 

