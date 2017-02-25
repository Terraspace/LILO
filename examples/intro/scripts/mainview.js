
function CreateMainView() 
{

    var view = Lilo.Engine.CreateView("mainview");

    var buffer0 = Lilo.Engine.CreateFrameBuffer( Lilo.SCREEN_WIDTH, Lilo.SCREEN_HEIGHT );
    
    var toplogo = new Lilo.Image("toplogo", "gfx/logo2.png", {
        opacity: 1.0, radius: 0.0, z: 2, rotation: 0.0,
        style : function () {
            this.height = Lilo.SCREEN_HEIGHT/3.6;
            this.width = this.height / this.aspect;
            this.x = (Lilo.SCREEN_WIDTH/2) - (this.width/2);
            this.y = -20;
        }
    });

    var bkg = new Lilo.GLImage("glbkg", "gfx/bkg.png", {
        x: 0, y: 0, z: 0, rotation: 0.0, width: 100, height: 100, glControl: true,
        isVisible : true, opacity : 1.0, priority: 0, renderTarget: buffer0,
        style : function () {
            this.x = (Lilo.SCREEN_WIDTH/2);
            this.y = (Lilo.SCREEN_HEIGHT/2);
            this.width = Lilo.SCREEN_WIDTH;
            this.height = Lilo.SCREEN_HEIGHT;
        }
    });

    var cb = new Lilo.GLCheckerBoard("glchecker", {
        x: 0, y: 0, z: 1, rotation: 0.0, width: 100, height: 100, glControl: true,
        isVisible : true, opacity : 1.0, priority: 1, renderTarget: buffer0,
        style : function () {
            this.width = Lilo.SCREEN_WIDTH;
            this.height = Lilo.SCREEN_HEIGHT;
        },
        animate : function () {
            this.fxrotation += 0.1;
        }
    });

    var warplogo = new Lilo.GLImage("warplogo", "gfx/electronics.png", {
        x: 0, y: 0, z: 2, rotation: 0.0, width: 100, height: 100, glControl: true,
        isVisible : true, opacity : 0.5, priority: 0, renderTarget: buffer0,
        style : function () {
            this.width = Lilo.SCREEN_WIDTH/2.5;
            this.height = this.width * this.aspect;
            this.x = (Lilo.SCREEN_WIDTH/2);
            this.y = Lilo.SCREEN_HEIGHT - ((Lilo.SCREEN_HEIGHT) - this.height/2);
            this.scale = 4 + (Math.sin( Lilo.Engine.frameNumber/50 ) * 3);
            this.x = (Lilo.SCREEN_WIDTH/2) + ((Math.sin( Lilo.Engine.frameNumber/50 )) * (Lilo.SCREEN_WIDTH/7));
            this.y = (Lilo.SCREEN_HEIGHT/2) + ((Math.cos( Lilo.Engine.frameNumber/50 )) * (Lilo.SCREEN_HEIGHT/7));
            this.fxrotation -= 0.25;
        },
        onrenderdone : function ( glCtx, ctx )
        {
            if( this.renderTarget != null )
            {
             //   Lilo.Engine.LoadFrameBuffer( this.renderTarget );
             var img = Lilo.Engine.FindControlById("imgComp");
             img.SetTexture( Lilo.Engine.fboTextures[ this.renderTarget ] );
            }
        }        
    });

    var imgComp = new Lilo.GLImage("imgComp", "gfx/bkg.png", {
        x: 0, y: 0, z: 3, rotation: 0.0, width: 100, height: 100, glControl: true,
        isVisible : true, opacity : 1.0, priority: 0, renderTarget: null,
        style : function () {
            this.x = (Lilo.SCREEN_WIDTH/2);
            this.y = (Lilo.SCREEN_HEIGHT/2);
            this.width = Lilo.SCREEN_WIDTH;
            this.height = Lilo.SCREEN_HEIGHT;
        }
    });

    var mainPanel = new Lilo.Panel("mainpanel", {
        x: 0, y: 0, z: 0, rotation: 0.0, width: 100, height: 100, isVisible : true, opacity : 1, radius: 0,
        foreground: "rgba(0,0,0,1.0)", background: "rgba(200,215,255,1.0)", touchPan: true, 
        clipped: true, hideoverflow: true, horiz_scroll: true, scroll_tips: true, transparent:true,
        style : function () {
            this.width = Lilo.SCREEN_WIDTH/1.3;
            this.height = Lilo.SCREEN_HEIGHT/1.45;
            this.x = (Lilo.SCREEN_WIDTH/2) - (this.width/2);
            this.y = Lilo.SCREEN_HEIGHT - this.height - 50;
        }
    });
    
    var copyLabel = new Lilo.Label("copylbl", " © copyright 2016 Terraspace ltd", {
        x: 0, y: 0, z: 3, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0, 
        foreground: "rgba(255,255,255,1.0)", fontFace: "Arial", fontSize: 25, textAlign: 'center',
        style : function () {
            this.fontSize = Lilo.Engine.GetResolutionFontSize(25, 2048);
            this.width = Lilo.SCREEN_WIDTH/1.3;
            this.height = 20;
            this.x = (Lilo.SCREEN_WIDTH/2) - (this.width/2);
            this.y = Lilo.SCREEN_HEIGHT - 35;
        }
    });

    view.Add( copyLabel );
    view.Add( bkg );
    view.Add( cb );
    view.Add( warplogo );
    view.Add( imgComp );
    view.Add( toplogo );
    view.Add( mainPanel );

    return(view);

}