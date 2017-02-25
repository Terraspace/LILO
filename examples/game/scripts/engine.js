
var Cocoon = Cocoon || {};
var UE = UE || {};
window.devicePixelRatio = window.devicePixelRatio || 1;

(function() {

    UE.SCREEN_WIDTH = (window.innerWidth * window.devicePixelRatio)|0;
    UE.SCREEN_HEIGHT = (window.innerHeight * window.devicePixelRatio)|0;

    UE.KEY_SPACE      = 32;
    UE.KEY_LEFTARROW  = 37;
    UE.KEY_RIGHTARROW = 39;
    UE.KEY_UPARROW    = 38;
    UE.KEY_DOWNARROW  = 40;
    UE.KEY_W          = 87;
    UE.KEY_A          = 65;
    UE.KEY_S          = 83;
    UE.KEY_D          = 68;
    UE.KEY_CTRL       = 17;
    UE.KEY_ALT        = 18;
    UE.KEY_SHIFT      = 16;
    UE.KEY_ESC        = 27;
    UE.KEY_ENTER      = 13;

    UE.DESKTOP = 0;                             /* Possible execution targets, desktop or mobile */
    UE.MOBILE  = 1;

    UE.RENDERMODE = {                           /* Primary rendering mode : WebGL or Canvas */
        CANVAS : 0,
        WEBGL  : 1
    };

    UE.Engine = {

        keyStates     : [],                     /* Array of key states for desktop */
        canvas        : null,                   /* Canvas element */
        canvas2       : null,                   /* 2D overlay canvas if using webgl */
        _ctx          : null,                   /* Canvas 2D Context */
        _glCtx        : null,                   /* Canvas WebGL Context */
        target        : UE.DESKTOP,             /* Target can be desktop or mobile */
        isTouch       : false,                  /* Is target device touch capable? */
        initialized   : false,                  /* UE Engine initialized */
        frameTime     : 0,                      /* Frame time-stamp, used to calculate frame duration in ms and thus FPS */
        frameDuration : 0,                      /* Frame duration in ms */
        frameNumber   : 0,                      /* Current frame number */
        fps           : 0,                      /* Current frames-per-second */
        width         : 0,                      /* Canvas width in real pixels */
        height        : 0,                      /* Canvas height in real pixels */
        Debug         : false,                  /* Display debug output */
        renderMode    : UE.RENDERMODE.CANVAS,   /* Use Canvas 2D context or WebGL context */
        mainLoop      : null,                   /* Main game per frame handler */

        mouseX: 0,
        mouseY: 0,
        oldMouseX: 0,
        oldMouseY: 0,
        isTouch: false,
        DevicePixelRatio: 1,
        mouseDrag: false,
        MouseDragStartX: 0,
        MouseDragStartY: 0,
        mouseDragX: 0,
        mouseDragY: 0,
        mouseDeltaX: 0,
        mouseDeltaY: 0,
        MouseDownX: 0,
        MouseDownY: 0,
        mouseDoubleClick: false,
        mouseDownCount: 0,
        mouseButtons: [],
        wheelPos: 0,
        wheelDelta: 0,
        oldWheelPos: 0,
        fakeRight: false,
        touchTimerID: null,
        touchTime: 0,
        lastTouchX: 0,
        lastTouchY: 0,
        lastTouchStartTime: 0,
        pinchScaling: false,
        pincDelta: 0,
        oldPinchDist: 0,

        oldPinchMag : 0,
        pinchMag : 0,
        wheelChanged : false,
        wheelDeltaActual : 0,
        focusOffset : 0,

        isElectron : function() {
            return (typeof process !== "undefined") && process.versions && (process.versions.electron !== undefined);
        },

        touchTimer : function() 
        {
            if(!UE.Engine.mouseDrag) UE.Engine.touchTime += 100;
            if (UE.Engine.touchTime > 2000 && UE.Engine.mouseDragX < 30 && UE.Engine.mouseDragY < 30)
            {
                UE.Engine.mouseButtons[0] = 0;
                UE.Engine.mouseButtons[2] = 1;
                UE.Engine.mouseDownHandler({ x: UE.Engine.mouseX / UE.Engine.DevicePixelRatio, y: UE.Engine.mouseY / UE.Engine.DevicePixelRatio, button: 2, returnValue: false });
                clearInterval(UE.Engine.touchTimerID);
                UE.Engine.touchTime = 0;
            }
        },

        cancelTouchTimer : function() {
            clearInterval(UE.Engine.touchTimerID);
            UE.Engine.touchTime = 0;
        },

        touchHandler : function(event) {
            var first;
            var type;
            var touches = [];
            if (event.changedTouches) {
                touches = event.changedTouches;
            }
            else {
                touches = event.touches;
            }
            first = touches[0];
           
           UE.Engine.pinchScaling = false;

           var x = first.clientX;
           var y = first.clientY;

            switch (event.type) {
                case "touchstart": type = "mousedown"; break;
                case "touchmove": type = "mousemove"; break;
                case "touchend": type = "mouseup"; break;
                case "pointerdown": type = "mousedown"; break;
                case "pointermove": type = "mousemove"; break;
                case "pointerup": type = "mouseup"; break;
                case "touchcancel": type = "mouseup"; break;
                default: return;
            }

            if (event.preventManipulation)
                event.preventManipulation();

            if (type == "mousedown") {

                // Initiate a touchstart timer, the duration of which is halted on touchend.
                // if the total movement is less than N at that point and the time is > X we consider it a right click.
                if (UE.Engine.touchTimerID != null) clearInterval(UE.Engine.touchTimerID);
                UE.Engine.touchTimerID = setInterval(UE.Engine.touchTimer, 100);
                var isRightClickT = false;

                // If the time between the last touchstart and this touchstart is less than X we consider it a double click.
                var dx = x - UE.Engine.lastTouchX;
                var dy = y - UE.Engine.lastTouchY;
                var dist = Math.sqrt((dx * dx) + (dy * dy));
                var timeDif = Date.now() - UE.Engine.lastTouchStartTime;
                var isDoubleClickT = false;
                if ((dist < 30 && UE.Engine.lastTouchX != 0) && (timeDif <= 500 && UE.Engine.lastTouchStartTime != 0)) {
                    UE.Engine.dblclickHandler({ clientX: (x | 0), clientY: (y | 0), button: 0, returnValue: false });
                    isDoubleClickT = true;
                }

                UE.Engine.lastTouchStartTime = Date.now();
                UE.Engine.lastTouchX = x;
                UE.Engine.lastTouchY = y;

                if (!isDoubleClickT && !isRightClickT) {
                    if (event.touches) {
                        // Detect pinch zooming
                        if (event.touches.length >= 2) {
                            UE.Engine.pinchScaling = true;
                        }
                        else
                            UE.Engine.mouseDownHandler({ x: (x | 0), y: (y | 0), button: 0, returnValue: false });
                    }
                }
                event.preventDefault();
                return false;
            }
            if (type == "mouseup") {
                // Initiate a touchstart timer, the duration of which is halted on touchend.
                // if the total movement is less than N at that point and the time is > X we consider it a right click.
                clearInterval(UE.Engine.touchTimerID);
                UE.Engine.touchTimerID = null;
                UE.Engine.touchTime = 0;

                if (UE.Engine.pinchScaling) {
                    UE.Engine.pinchScaling = false;
                }

                UE.Engine.mouseX = (x * UE.Engine.DevicePixelRatio) | 0; //get X position of last place touched
                UE.Engine.mouseY = (y * UE.Engine.DevicePixelRatio) | 0;

                UE.Engine.mouseUpHandler({ button: 0, returnValue: false });
                UE.Engine.mouseUpHandler({ button: 2, returnValue: false });
                if (event.preventDefault) event.preventDefault();
                return false;
            }
            if (type == "mousemove") {
                
                if( event.touches.length >= 2)
                {
                    UE.Engine.pinchScaling = true;
                    var x1 = event.touches[0].clientX | 0;
                    var y1 = event.touches[0].clientY | 0;
                    var x2 = event.touches[1].clientX | 0;
                    var y2 = event.touches[1].clientY | 0;
                    var dx = (x2-x1);
                    var dy = (y2-y1);
                    var d  = Math.sqrt( (dx*dx) + (dy*dy) );
                    UE.Engine.oldPinchMag = UE.Engine.pinchMag;
                    UE.Engine.pinchMag = d;
                }
                else
                {
                    UE.Engine.mouseHandler({ clientX: (x | 0), clientY: (y | 0), pageX: (x | 0), pageY: (y | 0), screenX: (x | 0), screenY: (y | 0), returnValue: false });
                }
                if (event.preventDefault) event.preventDefault();
                return false;
            }
        },

        mouseHandler : function(e) {
            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            if (IE) {
                if (UE.Engine.isTouch)
                {
                    UE.Engine.mouseX = e.clientX;
                    UE.Engine.mouseY = e.clientY;
                }
                else
                {
                    UE.Engine.mouseX = e.clientX;// + document.body.scrollLeft;
                    UE.Engine.mouseY = e.clientY;// + document.body.scrollTop;
                }
            }
            else {  // grab the x-y pos.s if browser is NS
                if (UE.Engine.isTouch)
                {
                    UE.Engine.mouseX = e.clientX;
                    UE.Engine.mouseY = e.clientY;
                }
                else {
                    UE.Engine.mouseX = e.pageX;
                    UE.Engine.mouseY = e.pageY;
                }
            }
            // catch possible negative values in NS4
            if (UE.Engine.mouseX < 0) { UE.Engine.mouseX = 0 }
            if (UE.Engine.mouseY < 0) { UE.Engine.mouseY = 0 }

            UE.Engine.mouseX *= UE.Engine.DevicePixelRatio;
            UE.Engine.mouseY *= UE.Engine.DevicePixelRatio;

            if (UE.Engine.target == UE.DESKTOP) {
                if (UE.Engine.mouseDownCount > 0 && UE.Engine.mouseButtons[0] > 0 && (Math.abs(UE.Engine.mouseX - UE.Engine.MouseDragStartX) > 1 || Math.abs(UE.Engine.mouseY - UE.Engine.MouseDragStartY) > 1)) {
                    UE.Engine.mouseDrag = true;
                }
            }
            else if (UE.Engine.target == UE.MOBILE) {
                if (UE.Engine.mouseDownCount > 0 && UE.Engine.mouseButtons[0] > 0 && (Math.abs(UE.Engine.mouseX - UE.Engine.MouseDragStartX) > 10 || Math.abs(UE.Engine.mouseY - UE.Engine.MouseDragStartY) > 10)) {
                    UE.Engine.mouseDrag = true;
                }
            }

            if (UE.Engine.mouseDrag)
            {
                UE.Engine.mouseDragX = UE.Engine.mouseX - UE.Engine.MouseDragStartX;
                UE.Engine.mouseDragY = UE.Engine.mouseY - UE.Engine.MouseDragStartY;
            }

            UE.Engine.mouseDeltaX = (UE.Engine.mouseX - UE.Engine.oldMouseX)*0.5;
            UE.Engine.mouseDeltaY = (UE.Engine.mouseY - UE.Engine.oldMouseY)*0.5;

            /* Adjust the mouse position to compensate for the open keyboard */
            UE.Engine.mouseY -= UE.Engine.focusOffset;

            UE.Engine.oldMouseX = UE.Engine.mouseX;
            UE.Engine.oldMouseY = UE.Engine.mouseY;

            cancelBubble(e);
            return cancelDefaultAction(e);
        },

        mouseDownHandler: function(e) {

            UE.Engine.mouseDoubleClick = false;

            if (UE.Engine.isTouch)
            {
                UE.Engine.mouseX = e.x;
                UE.Engine.mouseY = e.y;
                UE.Engine.mouseX *= UE.Engine.DevicePixelRatio;
                UE.Engine.mouseY *= UE.Engine.DevicePixelRatio;
            }

            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            var eb = e.button;

            if (IE) {
                if (eb & 1 != 0) eb = 0;
                else if (eb & 2 != 0) eb = 2;
                else if (eb & 4 != 0) eb = 1;
            }

            if (eb == 0 && UE.Engine.keyCtrl) {
                //mouseButtons[2] = 1;
                //mouseButtons[0] = 0;
                eb = 2;
                UE.Engine.fakeRight = true;
            }

            UE.Engine.mouseButtons[eb] = 1;
            UE.Engine.mouseDownCount = 1;

            // Check for dragging.
            if (eb == 0 && !UE.Engine.mouseDrag) {
                UE.Engine.MouseDragStartX = UE.Engine.mouseX;
                UE.Engine.MouseDragStartY = UE.Engine.mouseY  - UE.Engine.focusOffset;
                UE.Engine.MouseDownX = UE.Engine.mouseX;
                UE.Engine.MouseDownY = UE.Engine.mouseY - UE.Engine.focusOffset;
            }

            if ((eb === 2 && !UE.Engine.fakeRight)) {
                cancelBubble(e);
                if (evt.preventDefault)
                    evt.preventDefault();
                evt.returnValue = false;
            }

            /* Adjust the mouse position to compensate for the open keyboard */
            UE.Engine.mouseY -= UE.Engine.focusOffset;
            UE.Engine.MouseDownY = UE.Engine.mouseY + UE.Engine.focusOffset;
        },

        mouseUpHandler: function(e) {
            UE.Engine.mouseDrag = false; // any up will cancel dragging.
            UE.Engine.mouseDragX = 0;
            UE.Engine.mouseDragY = 0;
            UE.Engine.MouseDragStartX = 0;
            UE.Engine.MouseDragStartY = 0;

           // UE.Engine.activeCtrl = null;

            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            var eb = e.button;
            if (IE) {
                if (eb & 1 != 0) eb = 0;
                else if (eb & 2 != 0) eb = 2;
                else if (eb & 4 != 0) eb = 1;
            }

            if (eb == 0 && UE.Engine.fakeRight) {
                eb = 2;
                UE.Engine.fakeRight = false;
            }

            UE.Engine.mouseButtons[eb] = 0;
            UE.Engine.mouseDownCount = 0;

            cancelBubble(e);
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;
        },

        dblclickHandler : function(e) {
            UE.Engine.mouseDoubleClick = true;
            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            if (IE)
            {
                UE.Engine.mouseX = event.clientX + document.body.scrollLeft;
                UE.Engine.mouseY = event.clientY + document.body.scrollTop;
                UE.Engine.mouseX *= UE.Engine.DevicePixelRatio;
                UE.Engine.mouseY *= UE.Engine.DevicePixelRatio;
            }
            cancelBubble(e);
            return cancelDefaultAction(e);
        },

        wheelHandler : function(e) {
            if (UE.Engine.mouseButtons[0] == 1 || UE.Engine.mouseButtons[2] == 1) return; // prevent mouse wheel zooming if either button is pressed (primarily to make life better with a mac magic mouse)

            var delta = 0;
            if (!event) /* For IE. */
                event = window.event;
            if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta / 240;//120;
            } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail / 6; //3;
            }
            /** If delta is nonzero, handle it.
             * Basically, delta is now positive if wheel was scrolled up,
             * and negative, if wheel was scrolled down.
             */
            if (delta)
                UE.Engine.handleWheel(delta);
            /** Prevent default actions caused by mouse wheel.
             * That might be ugly, but we handle scrolls somehow
             * anyway, so don't bother here..
             */
            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
        },

        handleWheel : function(delta) {
            
            UE.Engine.wheelChanged = true;
            UE.Engine.wheelDeltaActual = delta;

            if (delta < 0) {
                UE.Engine.wheelPos -= delta;
            }
            else {
                UE.Engine.wheelPos -= delta;
            }
        },

        GetPointer : function() {
            return ({x:UE.Engine.mouseX, y:UE.Engine.mouseY, buttons:UE.Engine.mouseButtons, wheel:UE.Engine.wheelPos});
        },

        GetDragDelta : function() {
            return ({ x: UE.Engine.mouseDeltaX, y: UE.Engine.mouseDeltaY });
        },

        GetDrag : function() {
            return ({ x: UE.Engine.mouseDragX, y: UE.Engine.mouseDragY });
        },

        GetPinch : function() {
            return( this.pinchMag );
        },

        resizeUE: function () 
        {
            with (UE.Engine)
            {
                canvas.width     = (window.innerWidth * window.devicePixelRatio)|0;
                canvas.height    = (window.innerHeight * window.devicePixelRatio)|0;
                canvas2.width    = (window.innerWidth * window.devicePixelRatio)|0;
                canvas2.height   = (window.innerHeight * window.devicePixelRatio)|0;
                UE.SCREEN_WIDTH  = canvas.width;
                UE.SCREEN_HEIGHT = canvas.height;
                UE.Engine.width  = canvas.width;
                UE.Engine.height = canvas.height;
                UE.Engine.DevicePixelRatio = window.devicePixelRatio;
            }
        },

        keyDownHandler : function( e ) 
        {
            var evt = e || window.event;
            var code = 0;
            if (evt.keyCode) code = evt.keyCode;
            else if (evt.which) code = evt.which;
            UE.Engine.keyStates[code] = 1;
        },

        keyUpHandler : function( e )
        {
            var evt = e || window.event;
            var code = 0;
            if (evt.keyCode) code = evt.keyCode;
            else if (evt.which) code = evt.which;
            UE.Engine.keyStates[code] = 0;
        },

        GetContext : function( type )
        {
            if( type == UE.RENDERMODE.CANVAS )
                return( UE.Engine._ctx );
            else
                return( UE.Engine._glCtx );
        },

        Exit: function() 
        {
            if (window.cordova) 
            {
                if ( navigator.isCocoonJS || (Cocoon.App != null && Cocoon.App != undefined) )
                {
                    Cocoon.App.exit();
                }
            }
            if ( UE.Engine.isElectron() )
            {
                window.close();
            }
            else 
            {
                window.close();
            }
        },

        CreateShader : function( type, source )
        {
            var gl = UE.Engine._glCtx;
            var shader = gl.createShader( type );
            gl.shaderSource( shader, source );
            gl.compileShader( shader );
            var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
            if ( success ) {
                return shader;
            }
            console.log( gl.getShaderInfoLog( shader ) );
            gl.deleteShader( shader );
        },

        CreateProgram : function( vertexShader, fragmentShader )
        {
            var gl = UE.Engine._glCtx;
            var program = gl.createProgram();
            gl.attachShader( program, vertexShader );
            gl.attachShader( program, fragmentShader );
            gl.linkProgram( program );
            var success = gl.getProgramParameter( program, gl.LINK_STATUS );
            if ( success ) {
                return program;
            } 
            console.log( gl.getProgramInfoLog( program ) );
            gl.deleteProgram( program );
        },

        Initialize : function( mainLoop, dbg, type )
        {
            
            //------------------------------------------------------------------------------------
            // User specified settings.
            //------------------------------------------------------------------------------------
            UE.Engine.Debug      = dbg;
            UE.Engine.mainLoop   = mainLoop;
            UE.Engine.renderMode = type;

            //------------------------------------------------------------------------------------
            // Target specific configuration.
            //------------------------------------------------------------------------------------
            if ( window.cordova )
            {
                UE.Engine.target = UE.MOBILE;
                if ( navigator.isCocoonJS || (Cocoon.App != null && Cocoon.App != undefined) )
                {
                    Cocoon.Touch.enable();
                    Cocoon.Touch.enableInWebView();
                }
            }
            else
                UE.Engine.target = UE.DESKTOP;

            //------------------------------------------------------------------------------------
            // Initialize Keyboard state and events.
            //------------------------------------------------------------------------------------
            for ( var i = 0; i < 256; i++ )
                UE.Engine.keyStates[i] = 0;

            window.addEventListener('keydown', UE.Engine.keyDownHandler);
            window.addEventListener('keyup', UE.Engine.keyUpHandler);
            
            //------------------------------------------------------------------------------------
            // Primary Rendering Canvas Setup.
            //------------------------------------------------------------------------------------
            var canvas = document.createElement( navigator.isCocoonJS ? 'canvas' : 'canvas' );
            canvas.style.position = "absolute";
            canvas.style.left = "0px";
            canvas.style.top  = "0px";
            canvas.style.zIndex = 1;
            if (window.devicePixelRatio != 1) 
            {
                canvas.style.width = window.innerWidth + "px";
                canvas.style.height = window.innerHeight + "px";
            }
            canvas.width = (window.innerWidth * window.devicePixelRatio)|0;
            canvas.height = (window.innerHeight * window.devicePixelRatio)|0;
            UE.Engine.canvas = canvas;
            window.addEventListener( 'resize', UE.Engine.resizeUE );
            
            if (type == UE.RENDERMODE.CANVAS)
                document.body.appendChild( canvas );

            var width  = canvas.width;
            var height = canvas.height;
            UE.SCREEN_WIDTH  = width;
            UE.SCREEN_HEIGHT = height;
            UE.Engine.width  = width;
            UE.Engine.height = height;
            
            //------------------------------------------------------------------------------------
            // Setup appropriate context.
            //------------------------------------------------------------------------------------
            if( type == UE.RENDERMODE.CANVAS )
            {
                var ctx = canvas.getContext( "2d" );
                ctx.mozImageSmoothingEnabled = true;
                ctx.imageSmoothingQuality    = "high";
                ctx.msImageSmoothingEnabled  = true;
                ctx.imageSmoothingEnabled    = true;
                UE.Engine._ctx               = ctx;
            }
            else
            {
                var canvas2 = document.createElement( navigator.isCocoonJS ? 'screencanvas' : 'canvas' );
                canvas2.id = "overlay";
                canvas2.style.zIndex = 2;
                canvas2.style.position = "absolute";
                canvas2.style.left = "0px";
                canvas2.style.top  = "0px";                
                if (window.devicePixelRatio != 1) 
                {
                    canvas2.style.width = window.innerWidth + "px";
                    canvas2.style.height = window.innerHeight + "px";
                }
                canvas2.width = (window.innerWidth * window.devicePixelRatio)|0;
                canvas2.height = (window.innerHeight * window.devicePixelRatio)|0;
                UE.Engine.canvas2 = canvas2;
                document.body.appendChild( canvas2 );

                var ctx = canvas.getContext( "webgl", { preserveDrawingBuffer: true, alpha: false } );
                UE.Engine._glCtx = ctx;

                ctx = canvas2.getContext( "2d" );
                ctx.mozImageSmoothingEnabled = true;
                ctx.imageSmoothingQuality    = "high";
                ctx.msImageSmoothingEnabled  = true;
                ctx.imageSmoothingEnabled    = true;
                UE.Engine._ctx               = ctx;                
            }
            
            //------------------------------------------------------------------------------------
            // Disable context menus on desktop.
            //------------------------------------------------------------------------------------
            if(UE.Engine.target == UE.DESKTOP)
            {
                UE.Engine.canvas.oncontextmenu = function ( e ) {
                    return ( false );
                }
                if( type == UE.RENDERMODE.WEBGL )
                {
                    UE.Engine.canvas2.oncontextmenu = function ( e ) {
                        return ( false );
                    }
                }
            }            

            //------------------------------------------------------------------------------------
            // Configure and install mouse and touch handlers.
            //------------------------------------------------------------------------------------
            for (var i = 0; i < 10; i++)
                UE.Engine.mouseButtons[i] = 0;

            canvas2.addEventListener('mousedown', UE.Engine.mouseDownHandler);
            canvas2.addEventListener('mouseup', UE.Engine.mouseUpHandler);
            canvas2.addEventListener('mousemove', UE.Engine.mouseHandler);
            canvas2.addEventListener('dblclick', UE.Engine.dblclickHandler);
            if (document.layers)
                document.captureEvents( Event.MOUSEDOWN );
            if (canvas.addEventListener)
                canvas2.addEventListener('DOMMouseScroll', UE.Engine.wheelHandler, false);
            canvas2.onmousewheel = document.onmousewheel = UE.Engine.wheelHandler;

            UE.Engine.isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

            document.addEventListener('focusout', function (e) {
                window.scrollTo(0, 0);
            });

            canvas2.addEventListener("touchstart", UE.Engine.touchHandler, false);
            canvas2.addEventListener("touchmove", UE.Engine.touchHandler, false);
            canvas2.addEventListener("touchend", UE.Engine.touchHandler, false);
            canvas2.addEventListener("touchcancel", UE.Engine.touchHandler, false);

            //------------------------------------------------------------------------------------
            // All done.
            //------------------------------------------------------------------------------------
            requestAnimationFrame( UE.Engine.Update );
            UE.Engine.initialized = true;
        },

        Update : function() 
        {
            var ctime = performance.now();
            UE.Engine.mainLoop( UE.Engine._glCtx, UE.Engine._ctx );
            UE.Engine.frameDuration = ctime - UE.Engine.frameTime;
            UE.Engine.frameTime = ctime;
            UE.Engine.fps = 1000.0 / UE.Engine.frameDuration;
            UE.Engine.frameNumber++;
            if( UE.Engine.Debug )
            {
                UE.Engine._ctx.fillStyle = "rgba(255,0,0,1.0)";
                UE.Engine._ctx.font = "12px courier";
                UE.Engine._ctx.fillText( "fps:        " + UE.Engine.fps.toFixed(1), 20, 20 );
                UE.Engine._ctx.fillText( "frame time: " + UE.Engine.frameDuration.toFixed(2), 20, 40 );
                UE.Engine._ctx.fillText( "pos:        " + UE.Engine.mouseX + "," + UE.Engine.mouseY, 20, 60 );
                UE.Engine._ctx.fillText( "button:     " + UE.Engine.mouseButtons[0], 20, 80 );
                UE.Engine._ctx.fillText( "drag:       " + UE.Engine.mouseDrag, 20, 100 );
            }
            requestAnimationFrame( UE.Engine.Update );
        }

    };

    UE.Texture = function ( src, minf, maxf ) {
        
        this._img   = new Image();
        this.width  = 0;
        this.height = 0;
        this.loaded = false;
        this._glTexture = null;

        var self = this;
        
        this._img.onload = function() {
            
            self.width = this.width;
            self.height = this.height;
            self.loaded = true;
            var gl = UE.Engine._glCtx;

            // Create a texture.
            self._glTexture = UE.Engine._glCtx.createTexture();
            UE.Engine._glCtx.bindTexture( gl.TEXTURE_2D, self._glTexture );
 
            // Set the parameters so we can render any size image.
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minf );
            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, maxf );
 
            // Upload the image into the texture.
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._img );

        }

        this._img.src = src;
    };

})();

/*
-----------------------------------------------------------------------------------------------------------
Cross Platform Initialization Handlers
Browser, Electron, Cocoon
-----------------------------------------------------------------------------------------------------------
*/
function UEInit() {
    if (!window.cordova)
        InitApp();
}
function onDeviceReady() {
        InitApp();
}
document.addEventListener("deviceready", onDeviceReady, false);

function cancelBubble(e) {
    var evt = e ? e : window.event;
    if (evt.stopPropagation) evt.stopPropagation();
    if (evt.cancelBubble != null) evt.cancelBubble = true;
}

function cancelDefaultAction(e) {
    var evt = e ? e : window.event;
    if (evt.preventDefault) evt.preventDefault();
    else
        evt.returnValue = false;

    return false;
}