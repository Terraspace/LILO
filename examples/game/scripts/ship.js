
UE.Gravity = function()
{
    this.position = new UE.Geometry.Vector( 550, 440, 0 );
    this.width = 0;
    this.height = 0;
    this.radius = 300;
    this.mass   = 90;

    this.image    = new Image();
    var obj = this;
    this.image.onload = function() {
        obj.width = this.width;
        obj.height = this.height;
    }
    this.image.src  = "gfx/blackhole.png";

    this.Render = function( ctx )
    {
        ctx.save();
        ctx.translate( this.position.x, this.position.y );
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage( this.image, -(this.width/2), -(this.height/2), this.width, this.height );
        ctx.restore();
    }
}

UE.Ship = function( type )
{
    this.type         = type;
    this.position     = new UE.Geometry.Vector( 520, 520, 0 );
    this.velocity     = new UE.Geometry.Vector( 0, 0, 0 );
    this.acceleration = new UE.Geometry.Vector( 0, 0, 0 );
    this.invaccel     = new UE.Geometry.Vector( 0, 0, 0 );
    this.heading      = new UE.Geometry.Vector( 0, 0, 0 );
    this.turnSpeed    = 4.0;
    this.rotation     = 0.0;
    this.image        = new Image();
    this.loaded       = false;
    this.scale        = 0.10;
    this.imageWidth   = 0;
    this.imageHeight  = 0;
    this.aspect       = 1;
    this.accel        = 0.08;
    this.mass         = 10;

    var obj = this;
    this.image.onload = function() {
        obj.loaded      = true;
        obj.imageWidth  = this.width;
        obj.imageHeight = this.height;
        obj.aspect      = this.height / this.width;
    }
    switch( type )
    {
        case 0 :
            this.image.src = "gfx/ship1.png";
            break;
        case 1 : 
            this.image.src = "gfx/ship2.png";
            break;
        case 2 :
            this.image.src = "gfx/ship3.png";
            break;
        case 3 :
            this.image.src = "gfx/ship4.png";
            break;
    }

    this.Render = function( ctx )
    {        
        if( this.loaded )
        {
            var renderWidth = (this.imageWidth * this.scale);
            var renderHeight = (this.imageHeight * this.scale);
            var renderX = this.position.x;
            var renderY = this.position.y;
            ctx.save();
            ctx.translate( renderX, renderY );
            ctx.rotate( this.rotation * Math.PI / 180 );
            ctx.drawImage( this.image, -(renderWidth/2), -(renderHeight/2), renderWidth, renderHeight );
            ctx.restore();
        }
    }

    this.Update = function( ictrl, bhole )
    {
        if( ictrl.turnLeft == 1 ) {
            this.rotation -= this.turnSpeed;
        }
        if( ictrl.turnRight == 1 ) {
            this.rotation += this.turnSpeed;
        }
 
        this.heading.x = Math.cos( this.rotation * 3.1415 / 180 );
        this.heading.y = Math.sin( this.rotation * 3.1415 / 180 );

        this.acceleration.x = this.heading.x * ( this.accel * ictrl.forward );
        this.acceleration.y = this.heading.y * ( this.accel * ictrl.forward );

        this.invaccel.x = -this.heading.x * ( this.accel * ictrl.reverse );
        this.invaccel.y = -this.heading.y * ( this.accel * ictrl.reverse );

        var dx = bhole.position.x - this.position.x;
        var dy = bhole.position.y - this.position.y;
        var dsqr = (dx*dx)+(dy*dy);
        var d = Math.sqrt( dsqr );
        var gravityForce = ((500 * this.mass * bhole.mass) / dsqr) / 90;
        gravityForce = (gravityForce > 5) ? 5 : gravityForce;
        var toGravity = new UE.Geometry.Vector( bhole.position.x - this.position.x, bhole.position.y - this.position.y, 0 );
        toGravity.Normalize();
        toGravity.ScalarMul( gravityForce );
        this.acceleration.Add( toGravity );

        this.velocity.Add( this.acceleration );
        this.velocity.Add( this.invaccel );
        this.position.Add( this.velocity );

    }

}