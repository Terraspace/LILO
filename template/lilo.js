
/* jshint maxparams: 8, curly: false, maxdepth: 4, maxcomplexity:25, loopfunc: true */

// DatePicker
// ColorPicker
// SplitPanel
// Tree view
// Accordion
// Menubar
// Tab group
// Alt names
// Generate Indexable content
// Load a view from an imperative file/markup
// Chart and Graph
// Richedit

var Cocoon = Cocoon || {};
window.devicePixelRatio = window.devicePixelRatio || 1;

var Lilo = Lilo || {}; // Use existing namespace, or create a new one if it doesn't exist.

//=================================================================================================
// LILO.
//=================================================================================================
(function () {

    // Namespace constants.
    Lilo.POSITION_ABSOLUTE = 0;
    Lilo.POSITION_RELATIVE = 1;
    Lilo.CANVAS = 0;
    Lilo.WEBGL = 1;
    Lilo.DESKTOP = 0;
    Lilo.MOBILE = 1;
    Lilo.WHEELUP = -1;
    Lilo.WHEELDOWN = 1;
    Lilo.KEY_BACKSPACE = 8;
    Lilo.KEY_ENTER = 13;
    Lilo.KEY_SPACE = 32;
    Lilo.KEY_LEFTARROW = 37;
    Lilo.KEY_RIGHTARROW = 39;
    Lilo.KEY_UPARROW = 38;
    Lilo.KEY_DOWNARROW = 40;
    Lilo.KEY_HOME = 36;
    Lilo.KEY_END = 35;
    Lilo.KEY_DELETE = 46;
    Lilo.KEY_TAB = 9;
    Lilo.KEY_ESC = 27;
    Lilo.KEY_E = 69;
    Lilo.KEY_F = 70;
    Lilo.KEY_K = 75;
    Lilo.KEY_C = 67;
    Lilo.KEY_D = 68;
    Lilo.KEY_R = 82;
    Lilo.KEY_V = 86;
    Lilo.KEY_H = 72;
    Lilo.KEY_P = 80;
    Lilo.KEY_T = 84;
    Lilo.KEY_N = 78;
    Lilo.KEY_S = 83;
    Lilo.KEY_O = 79;
    Lilo.KEY_X = 88;
    Lilo.KEY_Q = 81;
    Lilo.KEY_Y = 89;
    Lilo.KEY_Z = 90;
    Lilo.KEY_PLUS = 187;
    Lilo.KEY_MINUS = 189;
    Lilo.KEY_H = 72;
    Lilo.KEY_LEFTANGLEBRACKET = 188;
    Lilo.KEY_RIGHTANGLEBRACKET = 190;
    Lilo.KEY_ONE = 49;
    Lilo.KEY_TWO = 50;
    Lilo.KEY_THREE = 51;
    Lilo.KEY_FOUR = 52;

    Lilo.AUTO = -1;
    Lilo.PIXELS = 0;
    Lilo.PERCENT = 1;

    Lilo.KEYBOARD_TEXT   = 0;   // Represents a generic text input keyboard.
    Lilo.KEYBOARD_NUMBER = 1;   // Represents a number like input keyboard.
    Lilo.KEYBOARD_PHONE  = 2;	// Represents a phone like input keyboard.
    Lilo.KEYBOARD_EMAIL  = 3;	// Represents an email like input keyboard.
    Lilo.KEYBOARD_URL	 = 4;   // Represents an URL like input keyboard.

    Lilo.DEBUGMODE = true;     // Enable Lilo Debugging output.

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.FILE File System/Localstorage management.
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.File = {

        ErrorHandler: function (fileName, e) {
            var msg = '';
            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'Storage quota exceeded';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'File not found';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'Security error';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'Invalid modification';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'Invalid state';
                    break;
                default:
                    msg = 'Unknown error : ' + e.code;
                    break;
            };
            console.log('Error (' + fileName + '): ' + msg);
        },

        GetMobilePathtoLocalStorage: function() {
            var pathToFile;
            if (device.platform == "Android")
                pathToFile = cordova.file.externalApplicationStorageDirectory;
            else
                pathToFile = cordova.file.dataDirectory;//applicationStorageDirectory;
            return pathToFile; 
        },

        DeleteFile: function (fileName) {
            if (Lilo.Engine.target == Lilo.DESKTOP) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.removeItem(fileName);
                }
            }
            else if (Lilo.Engine.target == Lilo.MOBILE) {
                var pathToFile = Lilo.File.GetMobilePathtoLocalStorage();

                window.resolveLocalFileSystemURL(pathToFile, function (dir) {
                    dir.getFile(fileName, { create: false }, function (fileEntry) {
                        fileEntry.remove(function (file) {
                        }, function (err) {
                            console.log(err);
                        }, function () {
                        });
                    });
                });
            }
        },

        ListFiles: function ( cb ) {
            var names = [];
            if(Lilo.Engine.target == Lilo.DESKTOP)
            {
                for (var i = 0; i <= localStorage.length - 1; i++) { 
                    key = localStorage.key(i);
                    names[i] = key;
                }

                cb( names );
            }
            else if (Lilo.Engine.target == Lilo.MOBILE)
            {
                var pathToFile = Lilo.File.GetMobilePathtoLocalStorage();
                if(Lilo.DEBUGMODE) console.log( "Listing from >> " + pathToFile );

                window.resolveLocalFileSystemURL( pathToFile, function (fileSystem) {
                    var reader = fileSystem.createReader();
                    reader.readEntries(function (entries) 
                    {
                        for (var i=0; i<entries.length; i++) {
                            if(Lilo.DEBUGMODE) console.log( "File >>> ", entries[i].name );
                            names.push(entries[i].name);
                        }

                        cb( names );
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err);
                });
            }

            if(Lilo.DEBUGMODE) console.log( "List count >> " + names.length );
            if(Lilo.DEBUGMODE) console.log( "completed listing" );
        },

        WriteFile: function (fileName, data) {

            if (Lilo.Engine.target == Lilo.DESKTOP) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem(fileName, data + "");
                    return true;
                }
            }
            else if (Lilo.Engine.target == Lilo.MOBILE) {
                var pathToFile = Lilo.File.GetMobilePathtoLocalStorage();

                window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) {
                    directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function (e) {
                                // for real-world usage, you might consider passing a success callback
                                if(Lilo.DEBUGMODE) console.log('Write of file "' + fileName + '"" completed.');
                                return true;
                            };
                            fileWriter.onerror = function (e) {
                                // you could hook this up with our global error handler, or pass in an error callback
                                console.log('Write failed: ' + e.toString());
                            };
                            //var blob = new Blob([data], { type: 'text/plain' });
                            //fileWriter.write(blob);
                            fileWriter.write( data );
                        }, Lilo.File.ErrorHandler.bind(null, fileName));
                    }, Lilo.File.ErrorHandler.bind(null, fileName));
                }, Lilo.File.ErrorHandler.bind(null, fileName));
            }

            return false;
        },

        WriteFileAsync: function (fileName, data, cbSuccess, cbFailed, cbParam) {

            if (Lilo.Engine.target == Lilo.DESKTOP) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem(fileName, data + "");

                    if( cbSuccess != null )
                        cbSuccess( cbParam );
                }
            }
            else if (Lilo.Engine.target == Lilo.MOBILE) {
                var pathToFile = Lilo.File.GetMobilePathtoLocalStorage();

                window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) {
                    directoryEntry.getFile(fileName, { create: true }, function (fileEntry) {
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function (e) {
                                // for real-world usage, you might consider passing a success callback
                                if(Lilo.DEBUGMODE) 
                                    console.log('Write of file "' + fileName + '"" completed.');
                                
                                if( cbSuccess != null )
                                    cbSuccess( cbParam );
                            };
                            fileWriter.onerror = function (e) {
                                // you could hook this up with our global error handler, or pass in an error callback
                                console.log('Write failed: ' + e.toString());
                                if( cbFailed != null )
                                    cbFailed( cbParam );
                            };
                            //var blob = new Blob([data], { type: 'text/plain' });
                            //fileWriter.write(blob);
                            fileWriter.write( data );
                        }, Lilo.File.ErrorHandler.bind(null, fileName));
                    }, Lilo.File.ErrorHandler.bind(null, fileName));
                }, Lilo.File.ErrorHandler.bind(null, fileName));
            }
        },

        ReadFile: function (fileName, cb) {
            if (Lilo.Engine.target == Lilo.DESKTOP) {
                if (typeof (Storage) !== "undefined") {
                    var data = localStorage.getItem(fileName);

                    MPX.Debug.Log( "Read File result: >> >>")
                    MPX.Debug.Log( data + "<< <<" );

                    cb(data);
                }
            }
            else if (Lilo.Engine.target == Lilo.MOBILE) 
            {
                var pathToFile = Lilo.File.GetMobilePathtoLocalStorage();
                window.resolveLocalFileSystemURL(pathToFile, function (directoryEntry) 
                {
                    directoryEntry.getFile(fileName, { create: true }, function (fileEntry) 
                    {
                        fileEntry.file(function (file) 
                        {
                            var reader = new FileReader();
                            reader.onloadend = function (e) {
                                if(Lilo.DEBUGMODE) console.log( "Read File result: >> >>")
                                if(Lilo.DEBUGMODE) console.log( this.result + "<< <<" );
                                
                                cb(this.result);
                            };

                            reader.readAsText(file);
                        }, Lilo.File.ErrorHandler.bind(null, fileName) );
                    }, Lilo.File.ErrorHandler.bind(null, fileName));
                }, Lilo.File.ErrorHandler.bind(null, fileName));
            }
        }
    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.UTIL Utility Functions.
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Util = {

        CreateCORSRequest : function(method, url, async) {
            try
            {
                var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {
                    // Check if the XMLHttpRequest object has a "withCredentials" property.
                    // "withCredentials" only exists on XMLHTTPRequest2 objects.
                    xhr.open(method, url, async);
                } else if (typeof XDomainRequest != "undefined") {
                    // Otherwise, check if XDomainRequest.
                    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                    xhr = new XDomainRequest();
                    xhr.open(method, url);
                } else {
                    // Otherwise, CORS is not supported by the browser.
                    xhr = null;
                }
            }
            catch(err)
            {
            }
            return xhr;
        },

        CheckConnection: function () {

            if (Lilo.Engine.target == Lilo.MOBILE) {
                if (navigator.network.connection.type == Connection.NONE)
                    return (false);
                else
                    return (true);
            }
            else {
                return (navigator.onLine);
            }
        }

    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.INTERNAL Functions, Helpers
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Internal = {
        vertices: [ { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ],
        
        InModalGroup : function( modalControl, control ) {
            var ret = false;
            if(modalControl != null)
            {
                var curControl = control;
                while(curControl.container != null)
                {
                    if(curControl == modalControl)
                    {
                        ret = true;
                        break;
                    }
                    curControl = curControl.container;
                }                    
            }
            else
                ret = true;
            return( ret );
        },

        LoadCanvasPlusWebView: function(htmlPage) {
            Cocoon.App.WebView.on("load", {
                success : function(){
                    Cocoon.App.showTheWebView( 0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio );
                },
                error : function(){
                    console.log("Cannot show the Webview for some reason.");
                    console.log(JSON.stringify(arguments));
                }
            });
            Cocoon.App.loadInTheWebView(htmlPage);
        },

        ApplyParams: function (obj, params) {
            if (obj == null || params == undefined) return;
            obj.x = params.x ? params.x : obj.x;
            obj.y = params.y ? params.y : obj.y;
            obj.width = params.width ? params.width : obj.width;
            obj.height = params.height ? params.height : obj.height;
            obj.zorder = params.z ? params.z : obj.zorder;
            obj.background = params.background ? params.background : obj.background;
            obj.foreground = params.foreground ? params.foreground : obj.foreground;
            obj.styleLogic = params.style ? params.style : obj.styleLogic;
            obj.fontFace = params.fontFace ? params.fontFace : obj.fontFace;
            obj.hover = params.hover ? params.hover : obj.hover;
            obj.fontSize = params.fontSize ? params.fontSize : obj.fontSize;
            obj.fontWeight = params.fontWeight ? params.fontWeight : obj.fontWeight;
            obj.hover = params.hover ? params.hover : obj.hover;
            obj.unhover = params.unhover ? params.unhover : obj.unhover;
            obj.click = params.onclick ? params.onclick : obj.click;
            obj.pointerdown = params.pointerdown ? params.pointerdown : obj.pointerdown;
            obj.pointerup = params.pointerup ? params.pointerup : obj.pointerup;
            obj.doubleclick = params.doubleclick ? params.doubleclick : obj.doubleclick;
            obj.rightclick = params.rightclick ? params.rightclick : obj.rightclick;
            obj.keydown = params.keydown ? params.keydown : obj.keydown;
            obj.keyup = params.keyup ? params.keyup : obj.keyup;
            obj.keypress = params.keypress ? params.keypress : obj.keypress;
            obj.position = params.position ? params.position : obj.position;
            obj.clipped = params.clipped ? true : false;
            obj.drag = params.drag ? params.drag : obj.drag;
            obj.wheel = params.wheel ? params.wheel : obj.wheel;
            obj.scale = params.scale ? params.scale : obj.scale;
            obj.rotation = params.rotation ? params.rotation : obj.rotation;
            obj.opacity = params.opacity ? params.opacity : obj.opacity;
            obj.radius = params.radius ? params.radius : obj.radius;
            obj.animate = params.animate ? params.animate : obj.animate;
            obj.gradient = params.gradient ? params.gradient : obj.gradient;
            obj.maxlength = params.maxlength ? params.maxlength : obj.maxlength;
            obj.password = params.password ? params.password : obj.password;
            obj.tabindex = params.tabindex ? params.tabindex : obj.tabindex;
            obj.isVisible = (params.isVisible == false) ? false : true;
            obj.init = (params.init) ? params.init : obj.init;
            obj.touchPan = (params.touchPan == true) ? true : false;
            obj.horiz_scroll = (params.horiz_scroll == true) ? true : false;
            obj.vert_scroll = (params.vert_scroll == true) ? true : false;
            obj.scroll_tips = (params.scroll_tips == true) ? true : false;
            obj.thickness = (params.thickness) ? params.thickness : obj.thickness;
            obj.progress = (params.progress) ? params.progress : obj.progress;
            obj.modal = (params.modal) ? params.modal : obj.modal;
            obj.hasclose = (params.hasclose == true) ? true : false;
            obj.headerheight = (params.headerheight) ? params.headerheight : obj.headerheight;
            obj.headercolor = (params.headercolor) ? params.headercolor : obj.headercolor;
            obj.hasheader = (params.hasheader) ? params.hasheader : obj.hasheader;
            obj.onclose = (params.onclose) ? params.onclose : obj.onclose;
            obj.defaultAction = (params.defaultAction) ? params.defaultAction : obj.defaultAction;
            obj.rowHeight = (params.rowheight) ? params.rowheight : obj.rowHeight;
            obj.rowacolor = (params.rowacolor) ? params.rowacolor : obj.rowacolor;
            obj.rowbcolor = (params.rowbcolor) ? params.rowbcolor : obj.rowbcolor;
            obj.stroke = (params.stroke == true) ? true : false;
            obj.strokewidth = (params.strokewidth) ? params.strokewidth : obj.strokewidth;
            obj.strokecolor = (params.strokecolor) ? params.strokecolor : obj.strokecolor;
            obj.onchange = (params.onchange) ? params.onchange : obj.onchange;
            obj.hideoverflow = (params.hideoverflow == true) ? true : false;
            obj.shadow = (params.shadow == true) ? true : false;
            obj.stroke = (params.stroke == true) ? true : false;
            obj.userclick = (params.onclick) ? params.onclick : obj.userclick;
            obj.transparent = (params.transparent == true) ? true : false;
            obj.pinch = (params.pinch) ? params.pinch : obj.pinch;
            obj.modalClose = (params.modalClose == true) ? true : false;
            obj.refObj = (params.refObj) ? params.refObj : null;
            obj.itemheight = (params.itemheight) ? params.itemheight : obj.itemheight;
            obj.arrowcolor = (params.arrowcolor) ? params.arrowcolor : obj.arrowcolor;
            obj.showSelected = (params.showSelected == true) ? true : false;
            obj.textAlign = (params.textAlign) ? params.textAlign : obj.textAlign;
            obj.inputType = (params.inputType) ? params.inputType : obj.inputType;
            obj.noWrap = (params.noWrap == true) ? true : false;
            obj.imageCache = (params.imageCache == true) ? true : false;
            obj.onSelect = (params.onSelect) ? params.onSelect : obj.onSelect;
            obj.itemX = (params.itemX) ? params.itemX : obj.itemX;
            obj.dividerheight = (params.dividerheight) ? params.dividerheight : obj.dividerheight;
			obj.selectedGradient = (params.selectedGradient) ? params.selectedGradient : obj.selectedGradient;            
            obj.onchange = (params.onchange) ? params.onchange : obj.onchange;
            obj.dividercolor = (params.dividercolor) ? params.dividercolor : obj.dividercolor;
            obj.itemcolor = (params.itemcolor) ? params.itemcolor : obj.itemcolor;
            obj.focusShift = (params.focusShift) ? false : obj.focusShift;
            obj.caret = (params.caret) ? params.caret : obj.caret;
            obj.hasArrow = (params.hasArrow == true) ? true : false;4
            obj.onValueDown = params.onValueDown ? params.onValueDown : obj.onValueDown;
            obj.onValueUp = params.onValueUp ? params.onValueUp : obj.onValueUp;
            obj.state = params.state ? params.state : obj.state;
            obj.hasWordings = (params.hasWordings == true) ? true : false;
            

            if (obj.opacity < 0) obj.opacity = 0;
        },  

        ApplyParamsRecursive: function(obj, params) {
            if (obj == null || params == undefined) return;
            Lilo.Internal.ApplyParams(obj, params);

            if (obj.controls && obj.controls.length > 0)
            {
                for (var i = 0; i < obj.controls.length; i++)
                {
                    Lilo.Internal.ApplyParamsRecursive(obj.controls[i], params);
                }
            }
        },

        ApplyParamRecursive: function(obj, params) {
            if (obj == null || params == undefined) return;
            
            for(var name in params) 
            {
                var value = params[name];
                obj[name] = value;
            }

            if (obj.controls && obj.controls.length > 0)
            {
                for (var i = 0; i < obj.controls.length; i++)
                {
                    Lilo.Internal.ApplyParamRecursive(obj.controls[i], params);
                }
            }
        },

        ApplyDeltaRecursive: function( obj, params) {

            if (params.param == "opacity")
            {
                obj.opacity += params.value;
                if (obj.opacity > 1) obj.opacity = 1;
                if (obj.opacity < 0) obj.opacity = 0;
            }

            if (params.param == "scale") {
                obj.scale += params.value;
                if (obj.scale > 1) obj.scale = 1;
                if (obj.scale < 0) obj.scale = 0;
            }

            if (obj.controls && obj.controls.length > 0) {
                for (var i = 0; i < obj.controls.length; i++) {
                    if (obj.controls[i].isVisible) {
                        Lilo.Internal.ApplyDeltaRecursive(obj.controls[i], params);
                    }
                }
            }
        },

        GetDimensions: function(obj) {
            return ({minx:obj.x, miny:obj.y, maxx:obj.x+obj.width, maxy:obj.y+obj.height});
        },

        GetAbsCoords: function(obj) {
            var result = { x: obj.x, y: obj.y };
            if (obj.container != null) {
                var o = obj;
                while (o.container) 
                {
                    var sx = o.container.scrollx;
                    var sy = o.container.scrolly;
                    if(sx == undefined) sx = 0;
                    if(sy == undefined) sy = 0;
                    result.x += (o.container.x - sx);
                    result.y += (o.container.y - sy);
                    o = o.container;
                }
            }
            return (result);
        },
		
		ApplyControlTransformationTopLeft: function( control, ctx )
		{
			// Set Control Render Transformation
            if( control.position == Lilo.POSITION_ABSOLUTE )
                ctx.translate( control.x, control.y );
            else if( control.position == Lilo.POSITION_RELATIVE )
                ctx.translate( control.container.x + control.x, control.container.y + control.y );
		},
		
		ApplyControlTransformationCenter: function( control, ctx )
		{
			// Set Control Render Transformation
            if( control.position == Lilo.POSITION_ABSOLUTE )
                ctx.translate( control.x + (control.width / 2), control.y + (control.height / 2) );
            else if( control.position == Lilo.POSITION_RELATIVE )
				ctx.translate(control.container.x + control.x + (control.width/2), control.container.y + control.y + (control.height / 2));

            ctx.rotate( control.rotation * Math.PI / 180 );	
		},

        ResetContainers: function(obj) {

            if (obj._img) {
                obj._img = new Image();
                obj._img.onload = function () {
                    obj._imgReady = true;
                }
                obj._img.src = obj.imgsrc;
            }

            if (obj.controls) {
                for (var i = 0; i < obj.controls.length; i++) {
                    // MORE TODOS here i'm sure..
                    if (obj.controls[i].constructor == Lilo.Image) obj.controls[i] = new Lilo.Image(obj.controls[i].id + "$", obj.controls[i].imgsrc, obj.controls[i]);
                    obj.controls[i].container = obj;
                    obj.controls[i].id += "$";
                    Lilo.Internal.ResetContainers(obj.controls[i]);
                }
            }
        },

        GetDimensionsRecursive: function(obj) {
            var dim;
            if (obj.controls) {
                dim = { minx: 0, miny: 0, maxx: 0, maxy: 0 };
                for (var i = 0; i < obj.controls.length; i++) {
                    if (obj.controls[i].position == Lilo.POSITION_ABSOLUTE) continue;
                    var d;
                    if (obj.controls && !obj.controls[i].clipped)
                        d = Lilo.Internal.GetDimensionsRecursive(obj.controls[i]);
                    else
                        d = Lilo.Internal.GetDimensions(obj.controls[i]);
                    if (d.minx < dim.minx) dim.minx = d.minx;
                    if (d.miny < dim.miny) dim.miny = d.miny;
                    if (d.maxx > dim.maxx) dim.maxx = d.maxx;
                    if (d.maxy > dim.maxy) dim.maxy = d.maxy;
                }
            }
            else {
                dim = Lilo.Internal.GetDimensions(obj);
            }
            return(dim);
        },

        /**
         * Draws a rounded rectangle using the current state of the canvas.
         * If you omit the last three params, it will draw a rectangle
         * outline with a 5 pixel border radius
         * @param {CanvasRenderingContext2D} ctx
         * @param {Number} x The top left x coordinate
         * @param {Number} y The top left y coordinate
         * @param {Number} width The width of the rectangle
         * @param {Number} height The height of the rectangle
         * @param {Number} radius The corner radius. Defaults to 5;
         * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
         * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
         */
        roundRect: function (ctx, x, y, width, height, radius, fill, stroke) {
            if (typeof stroke == "undefined" ) {
                stroke = true;
            }
            if (typeof radius === "undefined") {
                radius = 5;
            }
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            if (stroke) {
                ctx.stroke();
            }
            if (fill) {
                ctx.fill();
            }
        },

        // Given a control, determine it's 4 corners based on it's position, dimension and rotation.
        GetControlPoints : function (ctrl) {
            var cosa, sina;
            var cx, cy;

            if (ctrl.position == Lilo.POSITION_ABSOLUTE)
            {
                cx = ctrl.x + (ctrl.width / 2);
                cy = ctrl.y + (ctrl.height / 2);
            }
            else if (ctrl.position == Lilo.POSITION_RELATIVE)
            {
                cx = Lilo.Internal.GetAbsCoords(ctrl).x + (ctrl.width / 2);
                cy = Lilo.Internal.GetAbsCoords(ctrl).y + (ctrl.height / 2);
            }
            
            var hcw = ctrl.width/2;
            var hch = ctrl.height/2;
            var verts = Lilo.Internal.vertices;

            verts[0].x = (cx - hcw); verts[0].y = (cy - hch);
            verts[1].x = (cx - hcw); verts[1].y = (cy + hch);
            verts[2].x = (cx + hcw); verts[2].y = (cy + hch);
            verts[3].x = (cx + hcw); verts[3].y = (cy - hch);

            if( ctrl.rotation != 0 )
            {
                cosa = Math.cos(ctrl.rotation * Math.PI / 180);
                sina = Math.sin(ctrl.rotation * Math.PI / 180);
                var tx, ty;
                for (var i = 0; i < 4; i++)
                {
                    tx = ((Lilo.Internal.vertices[i].x - cx) * cosa) - ((Lilo.Internal.vertices[i].y - cy) * sina);
                    ty = ((Lilo.Internal.vertices[i].x - cx) * sina) + ((Lilo.Internal.vertices[i].y - cy) * cosa);
                    Lilo.Internal.vertices[i].x = tx + cx;
                    Lilo.Internal.vertices[i].y = ty + cy;
                }
            }
            return (Lilo.Internal.vertices);
        },

        // Test if X,Y is in the polygon defined by vertices.
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        // To support multiple components or holes, every ring must have (0,0) at start and CW/CCW ordered list with first/last vertex repeated. the final vertex must be (0,0).
        PointInPoly : function (vertices,x,y) {
            var i = 0;
            var c = false;
            if (vertices) {
                var j = vertices.length - 1;
                for (; i < vertices.length; j = i++) {
                    if (((vertices[i].y > y) != (vertices[j].y > y)) && (x < (vertices[j].x - vertices[i].x) * (y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
                        c = !c;
                }
            }
            return(c);
        },

        PointInRect: function( x, y, ox, oy, ow, oh )
        {
            return    x >= ox 
                   && x < ox + ow
                   && y >= oy
                   && y < oy + oh
        },

        UpdateZOrder: function( container, zorder )
        {
            container.zorder = zorder;
            if( !container.controls) 
                return;
                 
            for( var i = 0; i < container.controls.length; i++ )
            {
                var c = container.controls[i];
                Lilo.Internal.UpdateZOrder( c, zorder + 1 );
            }
        }
    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.ENGINE
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Engine = {
        version: "1.0.0",
        initialized: false,
        target: Lilo.DESKTOP,
        canvas: null,
        textCanvas: null,
        ctx: null,
        ctxGL: null,
        textCtx: null,
        textCache: {},
        activeView: 0,
        views: [],
        frameTime: 0,
        lastFrameTime: 0,
        frameDuration: 0,
        fps: 0,
        width: 0,
        height: 0,
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
        keyCtrl: false,
        ketAlt: false,
        keyShift: false,
        keyStates: [],
        activeCtrl: null,
        touchTimerID: null,
        touchTime: 0,
        lastTouchX: 0,
        lastTouchY: 0,
        lastTouchStartTime: 0,
        pinchScaling: false,
        pincDelta: 0,
        oldPinchDist: 0,
        preRender: null,
        postRender: null,
        FPS: 0,
        frameNumber: 0,
        kybdFocusCtrl: null,
        isChrome: false,
        clipArea: { x1: 0, y1: 0, x2: 0, y2: 0 },
        clipAreas: [],
        modalControl: null,
        kybdOpen : false,
        imageCache: [],
        oldPinchMag : 0,
        pinchMag : 0,
        wheelChanged : false,
        wheelDeltaActual : 0,
        focusOffset : 0,

		isElectron : function() {
            return (typeof process !== "undefined") && process.versions && (process.versions.electron !== undefined);
        },
		
        NDCToScreen : function( v )
        {
            return( { x : v.x * Lilo.SCREEN_WIDTH, y : v.y * Lilo.SCREEN_HEIGHT } );
        },

        GetResolutionFontSize : function( fontSize, designRes ) {
            var scale = Lilo.SCREEN_WIDTH / designRes;
            return( (fontSize*scale)|0 );
        },

        IsTouchDevice : function() {
            return 'ontouchstart' in document;
        },

        SaveState : function() {
            Lilo.Engine.ctx.save();
            Lilo.Engine.clipAreas.push(Lilo.Engine.clipArea);
        },

        RestoreState : function() {
            Lilo.Engine.ctx.restore();
            Lilo.Engine.clipArea = Lilo.Engine.clipAreas.pop();
        },

        SetClip : function(x1,y1,w,h) {
            var ctx = Lilo.Engine.ctx;
            Lilo.Engine.clipArea.x1 = x1;
            Lilo.Engine.clipArea.y1 = y1;
            Lilo.Engine.clipArea.x2 = x1+w;
            Lilo.Engine.clipArea.y2 = y1+h;
            ctx.beginPath();
            ctx.rect(x1|0,y1|0,w|0,h|0);
            ctx.clip();
        },

        OpenFullScreen : function(element) {
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        },

        ExitFullScreen : function() {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        },

        OpenURL : function(url) {
            //var dialog = new Cocoon.Widget.WebDialog();
            //dialog.show("http://www.ludei.com");
            if (navigator.isCocoonJS)
                CocoonJS.App.openURL(url);
            else
                window.open(url, "_blank");
        },

        ApplyParam : function (obj, param, value) {
            obj[param] = value[param];
        },

        Clone : function (from,newparent,newid) {
            var to = clone(from, true);
            to.container = newparent;
            to.id = newid;
            Lilo.Internal.ResetContainers(to);
            return to;
        },

        FindControlById : function(id) {
            var c = null;
            var v = this.views[this.activeView];
            for (var i = 0; i < v.controls.length; i++)
            {
                if (v.controls[i].id == id) return (v.controls[i]);
                c = Lilo.Engine.FindControlRecursive(v.controls[i], id);
                if (c != null && c != undefined) return (c);
            }
            for (var i=0;i<this.views.length;i++)
            {
                if(this.views[i].constructor == Lilo.Window)
                {
                    if (this.views[i].id == id) return (this.views[i]);

                    if (v.controls[i] != null && v.controls[i] != undefined)
                    {
                        if (v.controls[i].id == id) return (v.controls[i]);
                        c = Lilo.Engine.FindControlRecursive(v.controls[i], id);
                        if (c != null && c != undefined) break;
                    }
                }
            }
            return (c);
        },

        FindControlRecursive : function(ctrl, id) {
            var c = null;
            if (!ctrl.controls) return;
            for (var i = 0; i < ctrl.controls.length; i++) {
                if (ctrl.controls[i].id == id) return (ctrl.controls[i]);
                if(ctrl.controls[i].controls)
                    c = Lilo.Engine.FindControlRecursive(ctrl.controls[i], id);
                if (c != null && c!=undefined) return (c);
            }
            return (c);
        },

        RelayEvent : function(toCtrl, type, args) {
            var caller = "";//arguments.callee.caller.name; not supported in cocoon.js
            if (caller == "drag" || type == "drag") {
                Lilo.Engine.activeCtrl = toCtrl;
                if (toCtrl.drag)
                    toCtrl.drag();
            }
            if (caller == "onclick" || type == "click") {
                if (toCtrl.click)
                    toCtrl.click();
            }
            if (caller == "onwheel" || type == "wheel") {
                if (toCtrl.wheel)
                    toCtrl.wheel(args);
            }
        },

        GetNextTabControl : function( ctrl ) {
            var thisid = ctrl.tabindex;
            var nextctrl = null;
            var best = 100000;
            if (ctrl.container == null) return (null);
            for (var i = 0; i < ctrl.container.controls.length; i++)
            {
                if (ctrl == ctrl.container.controls[i] || !ctrl.container.controls[i].isActive || !ctrl.container.controls[i].isVisible || ctrl.container.controls[i].tabindex == -1) continue;
                if (ctrl.container.controls[i].tabindex >= thisid)
                {
                    var d = ctrl.container.controls[i].tabindex - thisid;
                    if (d < best)
                    {
                        best = d;
                        nextctrl = ctrl.container.controls[i];
                    }
                }
            }
            // We may be at the end of the tab group, so lets try go back to the beginning.
            if (nextctrl == null)
            {
                best = -1;
                for (var i = 0; i < ctrl.container.controls.length; i++)
                {
                    if (ctrl == ctrl.container.controls[i] || !ctrl.container.controls[i].isActive || !ctrl.container.controls[i].isVisible || ctrl.container.controls[i].tabindex == -1) continue;
                    if (ctrl.container.controls[i].tabindex <= thisid) {
                        var d = thisid - ctrl.container.controls[i].tabindex;
                        if (d >= best) {
                            best = d;
                            nextctrl = ctrl.container.controls[i];
                        }
                    }
                }
            }
            return (nextctrl);
        },

        keyDownHandler : function(e) {
            var evt = e || window.event;
            if (evt.ctrlKey) Lilo.Engine.keyCtrl = true;
            if (evt.altKey) Lilo.Engine.keyAlt = true;
            if (evt.shiftKey) Lilo.Engine.keyShift = true;

            var code = 0;
            if (evt.keyCode) code = evt.keyCode;
            else if (evt.which) code = evt.which;
            	//alert(code);
            Lilo.Engine.keyStates[code] = 1;
            switch (code)
            {
                case 16:
                    Lilo.Engine.keyShift = true;
                    break;
                case 17:
                    Lilo.Engine.keyCtrl = true;
                    break;
                case 18:
                    Lilo.Engine.keyAlt = true;
                    break;
            }

            if (Lilo.Engine.kybdFocusCtrl != null)
            {
                switch (code)
                {
                    case (Lilo.KEY_TAB):
                        var next = Lilo.Engine.GetNextTabControl(Lilo.Engine.kybdFocusCtrl);
                        if (next != null)
                        {
                            Lilo.Engine.kybdFocusCtrl = next;
                            Lilo.Engine.activeCtrl = next;
                            if (!(next instanceof Lilo.Checkbox) && Lilo.Engine.kybdFocusCtrl.click) Lilo.Engine.kybdFocusCtrl.click();
                        }
                        break;
                    case (Lilo.KEY_BACKSPACE):
                        if (Lilo.Engine.kybdFocusCtrl.text.length > 0) {
                            Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.text.substring(0, Lilo.Engine.kybdFocusCtrl.cursor - 1) + Lilo.Engine.kybdFocusCtrl.text.substring(Lilo.Engine.kybdFocusCtrl.cursor, Lilo.Engine.kybdFocusCtrl.text.length);

                            if (Lilo.Engine.kybdFocusCtrl.startpos > 1) {

                                var textwidth=0;
                                for (var i = Lilo.Engine.kybdFocusCtrl.startpos - 1; i < Lilo.Engine.kybdFocusCtrl.cursor; i++) {
                                    textwidth += Lilo.Engine.kybdFocusCtrl.charWidths[i];
                                }

                                var availableWidth = Lilo.Engine.kybdFocusCtrl.width - textwidth - 10;
                                if (availableWidth > Lilo.Engine.kybdFocusCtrl.charWidths[Lilo.Engine.kybdFocusCtrl.startpos - 2]) {
                                    Lilo.Engine.kybdFocusCtrl.startpos--;
                                } 
                                if (availableWidth < 0) {
                                    Lilo.Engine.kybdFocusCtrl.cursor--;                                      
                                    return;
                                }
                            }

                            if (Lilo.Engine.kybdFocusCtrl.startpos > 0) {
                                Lilo.Engine.kybdFocusCtrl.startpos--;
                                Lilo.Engine.kybdFocusCtrl.cursor--;
                                return;
                            }
                            Lilo.Engine.kybdFocusCtrl.cursor--;
                            if (Lilo.Engine.kybdFocusCtrl.cursor < 0) Lilo.Engine.kybdFocusCtrl.cursor = 0;
                        }
                        break;
                 case (Lilo.KEY_LEFTARROW):
                        if (Lilo.Engine.keyShift && !Lilo.Engine.kybdFocusCtrl.selecting)
                        {
                            Lilo.Engine.kybdFocusCtrl.selectEnd = Lilo.Engine.kybdFocusCtrl.cursor;
                            Lilo.Engine.kybdFocusCtrl.selecting = true;
                        }

                        if (Lilo.Engine.kybdFocusCtrl.cursor > 0)
                            Lilo.Engine.kybdFocusCtrl.cursor--;
                       
                          if (Lilo.Engine.kybdFocusCtrl.cursor < Lilo.Engine.kybdFocusCtrl.startpos)
                                Lilo.Engine.kybdFocusCtrl.startpos--;
                                

                        if (Lilo.Engine.keyShift && Lilo.Engine.kybdFocusCtrl.selecting)
                        {
                            Lilo.Engine.kybdFocusCtrl.selectStart = Lilo.Engine.kybdFocusCtrl.cursor;
                        }
                        if (!Lilo.Engine.keyShift) {
                            Lilo.Engine.kybdFocusCtrl.selecting = false;
                            Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                            Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        }
                        break;
                    case (Lilo.KEY_RIGHTARROW):
                        if (Lilo.Engine.keyShift && !Lilo.Engine.kybdFocusCtrl.selecting) {
                            Lilo.Engine.kybdFocusCtrl.selectStart = Lilo.Engine.kybdFocusCtrl.cursor;
                            Lilo.Engine.kybdFocusCtrl.selecting = true;
                        }

                        if (Lilo.Engine.kybdFocusCtrl.cursor < Lilo.Engine.kybdFocusCtrl.maxpos) {
                            Lilo.Engine.kybdFocusCtrl.cursor++;
                        }
                        else if (Lilo.Engine.kybdFocusCtrl.cursor < Lilo.Engine.kybdFocusCtrl.text.length) {
                            Lilo.Engine.kybdFocusCtrl.startpos++;
                        }


                        if (Lilo.Engine.keyShift && Lilo.Engine.kybdFocusCtrl.selecting) {
                            Lilo.Engine.kybdFocusCtrl.selectEnd = Lilo.Engine.kybdFocusCtrl.cursor;
                        }
                        if (!Lilo.Engine.keyShift) {
                            Lilo.Engine.kybdFocusCtrl.selecting = false;
                            Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                            Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        }
                        break;
                    case (Lilo.KEY_HOME):
                        if (Lilo.Engine.keyShift) {
                            Lilo.Engine.kybdFocusCtrl.selectEnd = Lilo.Engine.kybdFocusCtrl.cursor;
                            Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                            Lilo.Engine.kybdFocusCtrl.selecting = true;
                        }
                        else {
                            Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                            Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                            Lilo.Engine.kybdFocusCtrl.selecting = false;
                        }
                        Lilo.Engine.kybdFocusCtrl.cursor = 0;
                        Lilo.Engine.kybdFocusCtrl.startpos = 0;
                        break;
                   case (Lilo.KEY_END):
                        if (Lilo.Engine.keyShift) {
                            Lilo.Engine.kybdFocusCtrl.selectEnd = Lilo.Engine.kybdFocusCtrl.text.length;
                            Lilo.Engine.kybdFocusCtrl.selectStart = Lilo.Engine.kybdFocusCtrl.cursor;
                            Lilo.Engine.kybdFocusCtrl.selecting = true;
                        }
                        else {
                            Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                            Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                            Lilo.Engine.kybdFocusCtrl.selecting = false;
                        }
                        
                        if (!Lilo.Engine.kybdFocusCtrl.selecting) {
                            Lilo.Engine.kybdFocusCtrl.cursor = Lilo.Engine.kybdFocusCtrl.text.length;

                            var totwidth = 0;
                            var position = 0;
                            for (var i = Lilo.Engine.kybdFocusCtrl.text.length - 1; i > 0; i--) {
                                var charWidth = Lilo.Engine.kybdFocusCtrl.charWidths[i];
                                if (totwidth + charWidth > Lilo.Engine.kybdFocusCtrl.width - 10)
                                    break;
                                totwidth += charWidth;
                                position++;
                            }

                            Lilo.Engine.kybdFocusCtrl.startpos = Lilo.Engine.kybdFocusCtrl.cursor - position;
                        }
                        
                        break;
                    case (Lilo.KEY_DELETE):
                        if (Lilo.Engine.kybdFocusCtrl.text.length > 0)
                        {
                            if (Lilo.Engine.kybdFocusCtrl.selecting) {
                                Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.text.substring(0, Lilo.Engine.kybdFocusCtrl.selectStart) + Lilo.Engine.kybdFocusCtrl.text.substring(Lilo.Engine.kybdFocusCtrl.selectEnd, Lilo.Engine.kybdFocusCtrl.text.length);
                                Lilo.Engine.kybdFocusCtrl.selecting = false;
                                Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                                Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                            }
                            else
                                Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.text.substring(0, Lilo.Engine.kybdFocusCtrl.cursor) + Lilo.Engine.kybdFocusCtrl.text.substring(Lilo.Engine.kybdFocusCtrl.cursor+1, Lilo.Engine.kybdFocusCtrl.text.length);
                        }
                        break;
                }
            }
            if (code == Lilo.KEY_TAB) {
                cancelBubble(e);
                return cancelDefaultAction(e);
            }
        },

        keyUpHandler : function(e) {
            var evt = e || window.event;
            if (evt.ctrlKey) Lilo.Engine.keyCtrl = true;
            if (evt.altKey) Lilo.Engine.keyAlt = true;
            if (evt.shiftKey) Lilo.Engine.keyShift = true;

            var code = 0;
            if (evt.keyCode) code = evt.keyCode;
            else if (evt.which) code = evt.which;
            Lilo.Engine.keyStates[code] = 0;
            switch (code) {
                case 16:
                    Lilo.Engine.keyShift = false;
                    break;
                case 17:
                    Lilo.Engine.keyCtrl = false;
                    break;
                case 18:
                    Lilo.Engine.keyAlt = false;
                    break;
            }
        },

        keyPressHandler : function(e) {
            var evt = e || window.event;

            var key;
            if (evt.charCode)
            {
                key = evt.charCode;
            } else if (evt.which == null)
            {
                key = evt.keyCode;
            }
            else if (evt.which !== 0 && evt.charCode !== 0)
            {
                key = evt.which;
            } else
            {
                return false;
            }

            // fix backspace in Safari
            if (key === 8) {
                return false;
            }

                 if (evt.keyCode != 13) {
                var char = String.fromCharCode(evt.charCode);
                if (Lilo.Engine.kybdFocusCtrl != null) {
                    Lilo.Engine.kybdFocusCtrl.edited = true;
                    if (Lilo.Engine.kybdFocusCtrl.text.length <= Lilo.Engine.kybdFocusCtrl.maxlength) {
                        Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.text.substring(0, Lilo.Engine.kybdFocusCtrl.cursor) + char + Lilo.Engine.kybdFocusCtrl.text.substring(Lilo.Engine.kybdFocusCtrl.cursor, Lilo.Engine.kybdFocusCtrl.text.length);

                        var ctx = Lilo.Engine.ctx;
                        if (Lilo.Engine.kybdFocusCtrl.font != "") {
                            ctx.font = Lilo.Engine.kybdFocusCtrl.fontWeight + " " + Lilo.Engine.kybdFocusCtrl.fontSize + "px " + Lilo.Engine.kybdFocusCtrl.fontFace;
                        }

                        var textwidth = 0;
                        for (var i = Lilo.Engine.kybdFocusCtrl.startpos; i < Lilo.Engine.kybdFocusCtrl.text.length; i++) {
                            var char = Lilo.Engine.kybdFocusCtrl.text.charAt(i);
                            var metrics = ctx.measureText(char);
                            if ((textwidth + metrics.width) > Lilo.Engine.kybdFocusCtrl.width - 20) {
                                Lilo.Engine.kybdFocusCtrl.startpos++;
                                if (metrics.width > Lilo.Engine.kybdFocusCtrl.charWidths[Lilo.Engine.kybdFocusCtrl.startpos]) {
                                    Lilo.Engine.kybdFocusCtrl.startpos++;
                                }
                                break;
                            }
                            textwidth += metrics.width;
                        }
                        Lilo.Engine.kybdFocusCtrl.cursor++;
                    }
                    if (Lilo.Engine.kybdFocusCtrl.onchange) Lilo.Engine.kybdFocusCtrl.onchange();
                }
            }
            else {
                if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl.defaultAction) Lilo.Engine.kybdFocusCtrl.defaultAction();
            }
        },

        GetContext : function(mode) {
            if (mode == Lilo.CANVAS)
                return (this.ctx);
            else
                return (this.ctxGL);
        },

        touchTimer : function() {
            if(!Lilo.Engine.mouseDrag) Lilo.Engine.touchTime += 100;
            if (Lilo.Engine.touchTime > 2000 && Lilo.Engine.mouseDragX < 40 && Lilo.Engine.mouseDragY < 40)
            {
                Lilo.Engine.mouseButtons[0] = 0;
                Lilo.Engine.mouseButtons[2] = 1;
                Lilo.Engine.mouseDownHandler({ x: Lilo.Engine.mouseX / Lilo.Engine.DevicePixelRatio, y: Lilo.Engine.mouseY / Lilo.Engine.DevicePixelRatio, button: 2, returnValue: false });
                clearInterval(Lilo.Engine.touchTimerID);
                Lilo.Engine.touchTime = 0;
            }
        },

        cancelTouchTimer : function() {
            clearInterval(Lilo.Engine.touchTimerID);
            Lilo.Engine.touchTime = 0;
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
           
           Lilo.Engine.pinchScaling = false;

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
                if (Lilo.Engine.touchTimerID != null) clearInterval(Lilo.Engine.touchTimerID);
                Lilo.Engine.touchTimerID = setInterval(Lilo.Engine.touchTimer, 100);
                var isRightClickT = false;

                // If the time between the last touchstart and this touchstart is less than X we consider it a double click.
                var dx = x - Lilo.Engine.lastTouchX;
                var dy = y - Lilo.Engine.lastTouchY;
                var dist = Math.sqrt((dx * dx) + (dy * dy));
                var now = Date.now();
                var timeDif = now - Lilo.Engine.lastTouchStartTime;
                var isDoubleClickT = false;
                if ((dist < 30 && Lilo.Engine.lastTouchX != 0) && (timeDif <= 200 && Lilo.Engine.lastTouchStartTime != 0)) {
                    Lilo.Engine.dblclickHandler({ clientX: (x | 0), clientY: (y | 0), button: 0, returnValue: false });
                    isDoubleClickT = true;
                }

                Lilo.Engine.lastTouchStartTime = now;
                Lilo.Engine.lastTouchX = x;
                Lilo.Engine.lastTouchY = y;

                if (!isDoubleClickT && !isRightClickT) {
                    if (event.touches) {
                        // Detect pinch zooming
                        if (event.touches.length >= 2) {
                            Lilo.Engine.pinchScaling = true;
                        }
                        else
                            Lilo.Engine.mouseDownHandler({ x: (x | 0), y: (y | 0), button: 0, returnValue: false });
                    }
                }
                event.preventDefault();
                return false;
            }
            if (type == "mouseup") {
                // Initiate a touchstart timer, the duration of which is halted on touchend.
                // if the total movement is less than N at that point and the time is > X we consider it a right click.
                clearInterval(Lilo.Engine.touchTimerID);
                Lilo.Engine.touchTimerID = null;
                Lilo.Engine.touchTime = 0;

                if (Lilo.Engine.pinchScaling) {
                    Lilo.Engine.pinchScaling = false;
                }

                Lilo.Engine.mouseX = (x * Lilo.Engine.DevicePixelRatio) | 0; //get X position of last place touched
                Lilo.Engine.mouseY = (y * Lilo.Engine.DevicePixelRatio) | 0;

                Lilo.Engine.mouseUpHandler({ button: 0, returnValue: false });
                Lilo.Engine.mouseUpHandler({ button: 2, returnValue: false });
                if (event.preventDefault) event.preventDefault();
                return false;
            }
            if (type == "mousemove") {
                
                if( event.touches.length >= 2)
                {
                    Lilo.Engine.pinchScaling = true;
                    var x1 = event.touches[0].clientX | 0;
                    var y1 = event.touches[0].clientY | 0;
                    var x2 = event.touches[1].clientX | 0;
                    var y2 = event.touches[1].clientY | 0;
                    var dx = (x2-x1);
                    var dy = (y2-y1);
                    var d  = Math.sqrt( (dx*dx) + (dy*dy) );
                    Lilo.Engine.oldPinchMag = Lilo.Engine.pinchMag;
                    Lilo.Engine.pinchMag = d;
                }
                else
                {
                    Lilo.Engine.mouseHandler({ clientX: (x | 0), clientY: (y | 0), pageX: (x | 0), pageY: (y | 0), screenX: (x | 0), screenY: (y | 0), returnValue: false });
                }
                if (event.preventDefault) event.preventDefault();
                return false;
            }
        },

        mouseHandler : function(e) {
            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            if (IE) {
                if (Lilo.Engine.isTouch)
                {
                    Lilo.Engine.mouseX = e.clientX;
                    Lilo.Engine.mouseY = e.clientY;
                }
                else
                {
                    Lilo.Engine.mouseX = e.clientX;// + document.body.scrollLeft;
                    Lilo.Engine.mouseY = e.clientY;// + document.body.scrollTop;
                }
            }
            else {  // grab the x-y pos.s if browser is NS
                if (Lilo.Engine.isTouch)
                {
                    Lilo.Engine.mouseX = e.clientX;
                    Lilo.Engine.mouseY = e.clientY;
                }
                else {
                    Lilo.Engine.mouseX = e.pageX;
                    Lilo.Engine.mouseY = e.pageY;
                }
            }
            // catch possible negative values in NS4
            if (Lilo.Engine.mouseX < 0) { Lilo.Engine.mouseX = 0 }
            if (Lilo.Engine.mouseY < 0) { Lilo.Engine.mouseY = 0 }

            Lilo.Engine.mouseX *= Lilo.Engine.DevicePixelRatio;
            Lilo.Engine.mouseY *= Lilo.Engine.DevicePixelRatio;

            if (Lilo.Engine.target == Lilo.DESKTOP) {
                if (Lilo.Engine.mouseDownCount > 0 && Lilo.Engine.mouseButtons[0] > 0 && (Math.abs(Lilo.Engine.mouseX - Lilo.Engine.MouseDragStartX) > 1 || Math.abs(Lilo.Engine.mouseY - Lilo.Engine.MouseDragStartY) > 1)) {
                    Lilo.Engine.mouseDrag = true;
                }
            }
            else if (Lilo.Engine.target == Lilo.MOBILE) {
                if (Lilo.Engine.mouseDownCount > 0 && Lilo.Engine.mouseButtons[0] > 0 && (Math.abs(Lilo.Engine.mouseX - Lilo.Engine.MouseDragStartX) > 10 || Math.abs(Lilo.Engine.mouseY - Lilo.Engine.MouseDragStartY) > 10)) {
                    Lilo.Engine.mouseDrag = true;
                }
            }

            if (Lilo.Engine.mouseDrag)
            {
                Lilo.Engine.mouseDragX = Lilo.Engine.mouseX - Lilo.Engine.MouseDragStartX;
                Lilo.Engine.mouseDragY = Lilo.Engine.mouseY - Lilo.Engine.MouseDragStartY;
            }

            Lilo.Engine.mouseDeltaX = (Lilo.Engine.mouseX - Lilo.Engine.oldMouseX)*0.5;
            Lilo.Engine.mouseDeltaY = (Lilo.Engine.mouseY - Lilo.Engine.oldMouseY)*0.5;

            /* Adjust the mouse position to compensate for the open keyboard */
            Lilo.Engine.mouseY -= Lilo.Engine.focusOffset;

            Lilo.Engine.oldMouseX = Lilo.Engine.mouseX;
            Lilo.Engine.oldMouseY = Lilo.Engine.mouseY;

            cancelBubble(e);
            return cancelDefaultAction(e);
        },

        mouseDownHandler: function(e) {

            Lilo.Engine.mouseDoubleClick = false;

            if (Lilo.Engine.isTouch)
            {
                Lilo.Engine.mouseX = e.x;
                Lilo.Engine.mouseY = e.y;
                Lilo.Engine.mouseX *= Lilo.Engine.DevicePixelRatio;
                Lilo.Engine.mouseY *= Lilo.Engine.DevicePixelRatio;
            }

            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            var eb = e.button;

            if (IE) {
                if (eb & 1 != 0) eb = 0;
                else if (eb & 2 != 0) eb = 2;
                else if (eb & 4 != 0) eb = 1;
            }

            if (eb == 0 && Lilo.Engine.keyCtrl) {
                //mouseButtons[2] = 1;
                //mouseButtons[0] = 0;
                eb = 2;
                Lilo.Engine.fakeRight = true;
            }

            Lilo.Engine.mouseButtons[eb] = 1;
            Lilo.Engine.mouseDownCount = 1;

            // Check for dragging.
            if (eb == 0 && !Lilo.Engine.mouseDrag) {
                Lilo.Engine.MouseDragStartX = Lilo.Engine.mouseX;
                Lilo.Engine.MouseDragStartY = Lilo.Engine.mouseY  - Lilo.Engine.focusOffset;
                Lilo.Engine.MouseDownX = Lilo.Engine.mouseX;
                Lilo.Engine.MouseDownY = Lilo.Engine.mouseY - Lilo.Engine.focusOffset;
            }

            if ((eb === 2 && !Lilo.Engine.fakeRight)) {
                cancelBubble(e);
                if (evt.preventDefault)
                    evt.preventDefault();
                evt.returnValue = false;
            }

            /* Adjust the mouse position to compensate for the open keyboard */
            Lilo.Engine.mouseY -= Lilo.Engine.focusOffset;
            Lilo.Engine.MouseDownY = Lilo.Engine.mouseY + Lilo.Engine.focusOffset;
        },

        mouseUpHandler: function(e) {
            Lilo.Engine.mouseDrag = false; // any up will cancel dragging.
            Lilo.Engine.mouseDragX = 0;
            Lilo.Engine.mouseDragY = 0;
            Lilo.Engine.MouseDragStartX = 0;
            Lilo.Engine.MouseDragStartY = 0;

           // Lilo.Engine.activeCtrl = null;

            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            var eb = e.button;
            if (IE) {
                if (eb & 1 != 0) eb = 0;
                else if (eb & 2 != 0) eb = 2;
                else if (eb & 4 != 0) eb = 1;
            }

            if (eb == 0 && Lilo.Engine.fakeRight) {
                eb = 2;
                Lilo.Engine.fakeRight = false;
            }

            Lilo.Engine.mouseButtons[eb] = 0;
            Lilo.Engine.mouseDownCount = 0;

            cancelBubble(e);
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;
        },

        dblclickHandler : function(e) {
            Lilo.Engine.mouseDoubleClick = true;
            var evt = (e == null ? event : e);
            IE = (document.all ? true : false);
            if (IE)
            {
                Lilo.Engine.mouseX = event.clientX + document.body.scrollLeft;
                Lilo.Engine.mouseY = event.clientY + document.body.scrollTop;
                Lilo.Engine.mouseX *= Lilo.Engine.DevicePixelRatio;
                Lilo.Engine.mouseY *= Lilo.Engine.DevicePixelRatio;
            }
            cancelBubble(e);
            return cancelDefaultAction(e);
        },

        wheelHandler : function(e) {
            if (Lilo.Engine.mouseButtons[0] == 1 || Lilo.Engine.mouseButtons[2] == 1) return; // prevent mouse wheel zooming if either button is pressed (primarily to make life better with a mac magic mouse)

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
                Lilo.Engine.handleWheel(delta);
            /** Prevent default actions caused by mouse wheel.
             * That might be ugly, but we handle scrolls somehow
             * anyway, so don't bother here..
             */
            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
        },

        handleWheel : function(delta) {
            
            Lilo.Engine.wheelChanged = true;
            Lilo.Engine.wheelDeltaActual = delta;

            if (delta < 0) {
                Lilo.Engine.wheelPos -= delta;
            }
            else {
                Lilo.Engine.wheelPos -= delta;
            }
        },

        GetPointer : function() {
            return ({x:Lilo.Engine.mouseX, y:Lilo.Engine.mouseY, buttons:Lilo.Engine.mouseButtons, wheel:Lilo.Engine.wheelPos});
        },

        GetDragDelta : function() {
            return ({ x: Lilo.Engine.mouseDeltaX, y: Lilo.Engine.mouseDeltaY });
        },

        GetDrag : function() {
            return ({ x: Lilo.Engine.mouseDragX, y: Lilo.Engine.mouseDragY });
        },

        GetPinch : function() {
            return( this.pinchMag );
        },

        Exit: function() {
            if (Lilo.Engine.target == Lilo.MOBILE) {
                Cocoon.App.exit();
            }
            else {
                window.close();
            }
        },

        Initialize: function (mode, prerender, postrender) {

            if (!String.prototype.encodeHTML) {
                String.prototype.encodeHTML = function () {
                    return this.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');
                };
            }
            
            Lilo.Engine.isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

            with (Lilo.Engine)
            {

                if (!Date.now) {
                    Date.now = function now() {
                        return new Date().getTime();
                    };
                }

                Lilo.Engine.DevicePixelRatio = window.devicePixelRatio;

                if (prerender)
                    Lilo.Engine.preRender = prerender;
                if (postrender)
                    Lilo.Engine.postRender = postrender;

                if (navigator.isCocoonJS || (Cocoon.App != null && Cocoon.App != undefined))
                {
                    Lilo.Engine.target = Lilo.MOBILE;
                    Cocoon.Touch.enable();
                    Cocoon.Touch.enableInWebView();
                }
                else
                    Lilo.Engine.target = Lilo.DESKTOP;

                if (Lilo.Engine.target == Lilo.MOBILE)
                {
                    // Primary Rendering Canvas Setup.
                    canvas = document.createElement(navigator.isCocoonJS ? 'screencanvas' : 'canvas');
                    if (window.devicePixelRatio != 1) {
                        canvas.style.width = window.innerWidth + "px";
                        canvas.style.height = window.innerHeight + "px";
                    }
                    canvas.width = (window.innerWidth * window.devicePixelRatio)|0;
                    canvas.height = (window.innerHeight * window.devicePixelRatio)|0;
                    if (mode == Lilo.WEBGL) {
                        //ctxGL = canvas.getContext("experimental-webgl");
                    }
                    else {
                        ctx = canvas.getContext("2d");
                        ctx.mozImageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = "high";
                        ctx.msImageSmoothingEnabled = true;
                        ctx.imageSmoothingEnabled = true;
                    }

                    document.body.appendChild(canvas);
                    window.addEventListener('resize', resizeLilo);
                }
                else
                {
                    // Primary Rendering Canvas Setup.
                    canvas = document.createElement("canvas");
                    canvas.oncontextmenu = function (e) {
                        return (false);
                    }
                    if (window.devicePixelRatio != 1) {
                        canvas.style.width = window.innerWidth + "px";
                        canvas.style.height = window.innerHeight + "px";
                    }
                    canvas.width = (window.innerWidth * window.devicePixelRatio)|0;
                    canvas.height = (window.innerHeight * window.devicePixelRatio)|0;
                    if (mode == Lilo.WEBGL) {
                        //ctxGL = canvas.getContext("experimental-webgl");
                    }
                    else {
                        ctx = canvas.getContext("2d", { antialias: true, alpha: false });
                        ctx.mozImageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = "high";
                        ctx.msImageSmoothingEnabled = true;
                        ctx.imageSmoothingEnabled = true;
                    }
                    document.body.appendChild(canvas);
                    window.addEventListener('resize', resizeLilo);
                    window.addEventListener("orientationchange", resizeLilo);

                    for (var i = 0; i < 256; i++)
                        Lilo.Engine.keyStates[i] = 0;

                    window.addEventListener('keydown', Lilo.Engine.keyDownHandler);
                    window.addEventListener('keyup', Lilo.Engine.keyUpHandler);
                    window.addEventListener('keypress', Lilo.Engine.keyPressHandler);

                }
 
                /* Create a backing canvas for rendering text */
                textCanvas = document.createElement("canvas");
                textCanvas.width = 100;
                textCanvas.height = 100;
                textCtx = textCanvas.getContext("2d");
                textCanvas.style.position = 'absolute';
                textCanvas.style.backgroundColor = '#000';
                textCanvas.style.top = '0';
                textCanvas.style.left = '0';
                textCanvas.style.width = '100px';
                textCanvas.style.height = '100px';
                textCanvas.style.zIndex = "0";
                Lilo.Engine.textCanvas = textCanvas;
                Lilo.Engine.textCtx = textCtx;

                canvas.style.position = 'absolute';
                canvas.style.backgroundColor = '#000';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = "1";

                width = canvas.width;
                height = canvas.height;
                Lilo.SCREEN_WIDTH = width;
                Lilo.SCREEN_HEIGHT = height;

                for (var i = 0; i < 10; i++)
                    Lilo.Engine.mouseButtons[i] = 0;
                canvas.addEventListener('mousedown', Lilo.Engine.mouseDownHandler);
                canvas.addEventListener('mouseup', Lilo.Engine.mouseUpHandler);
                canvas.addEventListener('mousemove', Lilo.Engine.mouseHandler);
                canvas.addEventListener('dblclick', Lilo.Engine.dblclickHandler);
                if (document.layers)
                    document.captureEvents(Event.MOUSEDOWN);
                if (canvas.addEventListener)
                    canvas.addEventListener('DOMMouseScroll', Lilo.Engine.wheelHandler, false);
                canvas.onmousewheel = document.onmousewheel = Lilo.Engine.wheelHandler;

                Lilo.Engine.isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

                document.addEventListener('focusout', function (e) {
                    window.scrollTo(0, 0);
                }); //ipad on-screen kybd fix?

                canvas.addEventListener("touchstart", Lilo.Engine.touchHandler, false);
                canvas.addEventListener("touchmove", Lilo.Engine.touchHandler, false);
                canvas.addEventListener("touchend", Lilo.Engine.touchHandler, false);
                canvas.addEventListener("touchcancel", Lilo.Engine.touchHandler, false);

                requestAnimationFrame(Lilo.Engine.Update);
                initialized = true;
            }
        },

        AddView: function( view ) {
            this.views.push( view );
        },

        FindView: function( name ) {
            for(var i=0;i<this.views.length;i++)
            {
                if(this.views[i].name == name)
                {
                    return( this.views[i] );
                }
            }
            return( null );
        },

        AddWindow: function( wind ) {
            this.views.push( wind );
        },

        SetView: function (view)  {
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i] == view) {
                    this.activeView = i;
                    this.views[i].isVisible = true;
                    this.views[i].isActive = true;
                }
                else
                {
                    this.views[i].isVisible = false;
                    this.views[i].isActive = false;
                }
            }
            this.modalControl = null;
        },

        CreateView: function (name) {
            var v = new Lilo.View(name);
            this.views.push(v);
            return (v);
        },

        resizeLilo: function () {
            with (Lilo.Engine)
            {
                canvas.width = window.innerWidth * window.devicePixelRatio;
                canvas.height = window.innerHeight * window.devicePixelRatio;
                width = canvas.width;
                height = canvas.height;
                Lilo.SCREEN_WIDTH = width;
                Lilo.SCREEN_HEIGHT = height;
            }
        },

        Update: function () {
            var ctx = Lilo.Engine.ctx;

            if( navigator.isCocoonJS )
                ctx.clear();

            if (Lilo.Engine.wheelPos != Lilo.Engine.oldWheelPos) {
                Lilo.Engine.wheelDelta = Lilo.Engine.wheelPos - Lilo.Engine.oldWheelPos;
                }

                Lilo.Engine.frameTime = performance.now();
                Lilo.Engine.frameDuration = Lilo.Engine.frameTime - Lilo.Engine.lastFrameTime;
                if (Lilo.Engine.frameDuration == 0) Lilo.Engine.frameDuration = 1;
                var fps = 1000 / Lilo.Engine.frameDuration;
                Lilo.Engine.FPS = fps;

                ctx.fillStyle = "rgba(0,0,0,1.0)";
                ctx.clearRect(0, 0, Lilo.SCREEN_WIDTH, Lilo.SCREEN_HEIGHT);

                if (Lilo.Engine.preRender)
                    Lilo.Engine.preRender(ctx);

                Lilo.Engine.views[Lilo.Engine.activeView].Update(ctx);
                Lilo.Engine.views[Lilo.Engine.activeView].Render(ctx);

                /* Handle any top-level window views */
                for(var i=0;i<Lilo.Engine.views.length;i++)
                {
                    if(Lilo.Engine.views[i].constructor == Lilo.Window && Lilo.Engine.views[i].isVisible && Lilo.Engine.views[i].isActive)
                    {
                        Lilo.Engine.views[i].UpdateAsView(ctx);
                        Lilo.Engine.views[i].Update(ctx);
                        Lilo.Engine.views[i].Render(ctx);
                    }
                }

                if (Lilo.Engine.postRender)
                    Lilo.Engine.postRender(ctx);

               /* Lilo.Engine.ctx.fillStyle = "rgba(100,0,0,1.0)";
                var debugData = "FPS: " + fps.toFixed(2) + " (" + Lilo.Engine.width + " x " + Lilo.Engine.height + ")" + " [DPR=" + Lilo.Engine.DevicePixelRatio + "] Pointer: [" + Lilo.Engine.mouseX + "," + Lilo.Engine.mouseY + "] [" + Lilo.Engine.mouseButtons[0] + "," + Lilo.Engine.mouseButtons[1] + "," + Lilo.Engine.mouseButtons[2] + "] " + Lilo.Engine.mouseDeltaX;
                if (Lilo.Engine.mouseDrag) debugData += " -> Dragging << " + Lilo.Engine.mouseDragX + ">>";
                if (Lilo.Engine.activeCtrl) debugData += " -> Active Ctrl: [" + Lilo.Engine.activeCtrl.id + "]";
                debugData += " wheel: " + Lilo.Engine.wheelPos + " " + Lilo.Engine.focusOffset + " kybdCtrl: " + ((Lilo.Engine.kybdFocusCtrl) ? Lilo.Engine.kybdFocusCtrl.id : "");
                Lilo.Engine.ctx.fillText(debugData, 150, Lilo.SCREEN_HEIGHT - 30);
                */
                Lilo.Engine.oldWheelPos = Lilo.Engine.wheelPos;
                Lilo.Engine.wheelDelta = 0;
                Lilo.Engine.lastFrameTime = Lilo.Engine.frameTime;
                Lilo.Engine.frameNumber++;
                requestAnimationFrame(Lilo.Engine.Update);
        },

        DismissKeyboard: function () {
            if(Lilo.Engine.target == Lilo.MOBILE)
                Cocoon.Dialog.dismissKeyboard();
            Lilo.Engine.kybdOpen = false;
            Lilo.Engine.focusOffset = 0;
        },

        TextCacheExists : function (text, font, fontSize, color) {
            var key = text + "" + font + "" + fontSize + "" + color;
            var obj = Lilo.Engine.textCache[key];
            if(obj)
                return( obj );
            else
                return( null );
        },

        RenderText: function (text, font, fontSize, color) {
            var key = text + "" + font + "" + fontSize + "" + color;
            var obj = Lilo.Engine.textCache[key];
            if(obj)
                return( obj );
            var img = document.createElement('canvas');
            Lilo.Engine.textCanvas = img;
            Lilo.Engine.textCtx = img.getContext('2d');
            Lilo.Engine.textCtx.fillStyle = color;
            Lilo.Engine.textCtx.font = font;
            var metrics = Lilo.Engine.textCtx.measureText(text);
            Lilo.Engine.textCanvas.width = metrics.width;
            Lilo.Engine.textCanvas.height = (fontSize*1.15)|0;
            Lilo.Engine.textCanvas.style.width = metrics.width * Lilo.Engine.DevicePixelRatio;
            Lilo.Engine.textCanvas.style.height = (fontSize * Lilo.Engine.DevicePixelRatio*1.2)|0;
            Lilo.Engine.textCtx.fillStyle = color;
            Lilo.Engine.textCtx.font = font;
            Lilo.Engine.textCtx.textAlign = "left";
            Lilo.Engine.textCtx.textBaseline="top";
            Lilo.Engine.textCtx.fillStyle = color;
            Lilo.Engine.textCtx.fillText( text, 0, 0 );
            //var image = new Image();
	        //image.src = img.toDataURL("image/png");
            Lilo.Engine.textCache[key] = img;
            return( img );
        },

        GetMaxTextLength : function(width, text, ctx, font) {           
            var cwidth = 0;
            var charCount = 0;
            for(var i=0;i<text.length;i++)
            {
                var metrics = ctx.measureText(text.substr(0,i));
                cwidth = metrics.width;
                if(cwidth >= width)
                    break;
                charCount++;
            }
            return(charCount);

        }
    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.View
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.View = function (name)
    {
        this.name = name;
        this.controls = [];
        this.isVisible = true;
        this.isActive = true;
        this.container = { x: 0, y: 0, width:  Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT, scrollx:0, scrolly:0 }; // Default container.
        this.x = 0;
        this.y = 0;
        this.width = Lilo.SCREEN_WIDTH;
        this.height = Lilo.SCREEN_HEIGHT;
        this.rotation = 0;
        this.scale = 1;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.tabindex = -1;
        this.scrollx = 0;
        this.scrolly = 0;
        this.focusShift = false;

        this.Add = function (ctrl) {
            ctrl.container = this;
            this.controls.push(ctrl);
            this.controls.sort(function (a, b) {
                return (a.zorder-b.zorder);
            });
        }

        /*
         * As a view is the root element of all controls, it can clear focus on any of it's children.
         */
        this.ClearFocus = function () {
            for (var i = 0; i < this.controls.length; i++) {
                if(this.controls[i].ClearFocus)
                    this.controls[i].ClearFocus();
            }
        }

        this.GetControls = function () {
            return (this.controls);
        }

        this.GetHitList = function( ctrl, results ) {
            var c = ctrl.GetControls();
            for(var i=0;i<c.length;i++)
            {
                if (!c[i].isVisible || !c[i].isActive) continue;
                if(c[i].CheckBounds && c[i].CheckBounds())
                {
                    var inModalGroup = Lilo.Internal.InModalGroup( Lilo.Engine.modalControl, c[i] );
                    if( inModalGroup )
                    {
                        results.push( c[i] );
                        this.GetHitList( c[i], results );
                    }
                }
            }
        }

        this.Update = function (ctx) {

            for (var i = 0; i < this.controls.length; i++)
            {
                if(this.controls[i].Update && this.controls[i].isVisible)
                    this.controls[i].Update(ctx);
                if(this.controls[i].modal && this.controls[i].isVisible)
                    Lilo.Engine.modalControl = this.controls[i];
            }

            var hitCtrls = [];
            if(Lilo.Engine.activeCtrl)
                hitCtrls.push( Lilo.Engine.activeCtrl );
            else
                this.GetHitList(this, hitCtrls);

            /* Forced-tap out close of modal control group window */
            if( Lilo.Engine.modalControl != null && Lilo.Engine.modalControl.modalClose && Lilo.Engine.mouseButtons[0] == 1 && hitCtrls.length == 0 )
            {
                if(Lilo.Engine.modalControl instanceof Lilo.Panel)
                    Lilo.Engine.modalControl.isVisible = false;
                else
                    Lilo.Engine.modalControl.Hide();
                Lilo.Engine.modalControl = null;
                if( Lilo.Engine.kybdOpen )
                    Lilo.Engine.DismissKeyboard();
            }

            if (hitCtrls.length > 0)
            {

                hitCtrls.sort(function (a, b) {
                    return (b.zorder-a.zorder);
                });

                var ctrlToSignal = hitCtrls[0];
                this.lastCtrl = ctrlToSignal;

                if (Lilo.Engine.mouseDrag) {
                    if (Lilo.Engine.activeCtrl == null) {
                        Lilo.Engine.activeCtrl = ctrlToSignal;
                    }
                }
                
                if (Lilo.Engine.mouseDrag && Lilo.Engine.activeCtrl.isPointerDown)
                {
                    if (Lilo.Engine.activeCtrl.drag) Lilo.Engine.activeCtrl.drag();
                    return;
                }

                if (Lilo.Engine.target == Lilo.DESKTOP) {
                    for (var i = 0; i < Lilo.Engine.keyStates.length; i++) {
                        if (Lilo.Engine.keyStates[i] == 1 && ctrlToSignal.keydown)
                            ctrlToSignal.keydown(i);
                    }
                }

                // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal && (Lilo.Engine.mouseButtons[0] == 1 || Lilo.Engine.mouseButtons[2] == 1)) {
                    if (!Lilo.Engine.kybdFocusCtrl.edited || Lilo.Engine.kybdFocusCtrl.text.length == 0) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                    Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                    Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                    Lilo.Engine.kybdFocusCtrl = null;
                    if(ctrlToSignal instanceof Lilo.TextBox)
                        Lilo.Engine.kybdFocusCtrl = ctrlToSignal;                    
                }
                else if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl.text == Lilo.Engine.kybdFocusCtrl.defaultValue && (Lilo.Engine.mouseButtons[0] == 1 || Lilo.Engine.mouseButtons[2] == 1))
                {
                    Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                    Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                    Lilo.Engine.kybdFocusCtrl.text = "";                    
                }

                if (ctrlToSignal.wheel && Lilo.Engine.wheelDelta != 0) {
                    ctrlToSignal.wheel(Lilo.Engine.wheelDelta);
                    Lilo.Engine.wheelChanged = false;
                }
            
                if (ctrlToSignal.pinch && Lilo.Engine.pinchScaling) {
                    ctrlToSignal.pinch(Lilo.Engine.pinchMag);
                    return;
                }

                /* Process hover, but only for desktop it makes no sense on mobile */
                if (!ctrlToSignal.hasHover && Lilo.Engine.target != Lilo.MOBILE) {
                    if(ctrlToSignal.hover) ctrlToSignal.hover();
                    ctrlToSignal.hasHover = true;
                }
                if (ctrlToSignal.doubleclick && Lilo.Engine.mouseDoubleClick) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.clickstage = 0;
                    Lilo.Engine.mouseButtons[0] = 0;
                    Lilo.Engine.mouseDoubleClick = false;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl = null;
                        if(ctrlToSignal instanceof Lilo.TextBox)
                            Lilo.Engine.kybdFocusCtrl = ctrlToSignal;
                    }
                    ctrlToSignal.doubleclick();
                }
                if (ctrlToSignal.click && Lilo.Engine.mouseButtons[0] == 1 && ctrlToSignal.clickstage == 0) {
                    ctrlToSignal.clickstage = 1;
                }
                
                if (!ctrlToSignal.isPointerDown && Lilo.Engine.mouseButtons[0] == 1) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.isPointerDown = true;
                    if(Lilo.Engine.activeCtrl == null) Lilo.Engine.activeCtrl = ctrlToSignal;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                        if(ctrlToSignal instanceof Lilo.TextBox)
                            Lilo.Engine.kybdFocusCtrl = ctrlToSignal;
                         }
                    if (ctrlToSignal.pointerdown) ctrlToSignal.pointerdown();
                }
                if (!Lilo.Engine.mouseDrag && ctrlToSignal.click && Lilo.Engine.mouseButtons[0] == 0 && ctrlToSignal.clickstage == 1) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.clickstage = 0;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                        if(ctrlToSignal instanceof Lilo.TextBox)
                            Lilo.Engine.kybdFocusCtrl = ctrlToSignal;                           
                    }
                    var dx = Math.abs(Lilo.Engine.mouseX - Lilo.Engine.MouseDownX);
                    var dy = Math.abs(Lilo.Engine.mouseY - Lilo.Engine.MouseDownY);
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if(d < 30)
                    {
                        ctrlToSignal.click();
                    }
                }
                if (ctrlToSignal.rightclick && Lilo.Engine.mouseButtons[2] == 1 && ctrlToSignal.rclickstage == 0) {
                    ctrlToSignal.rclickstage = 1;
                }
                if (ctrlToSignal.rightclick && ctrlToSignal.rclickstage == 1) {
                    ctrlToSignal.rclickstage = 2;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                        if(ctrlToSignal instanceof Lilo.TextBox)
                            Lilo.Engine.kybdFocusCtrl = ctrlToSignal;
                    }
                    ctrlToSignal.rightclick();
                }
               
                if (ctrlToSignal.isPointerDown && Lilo.Engine.mouseButtons[0] == 0 && Lilo.Engine.mouseButtons[2] == 0) {
                    ctrlToSignal.isPointerDown = false;
                    ctrlToSignal.clickstage = 0;
                    if (ctrlToSignal.pointerup) ctrlToSignal.pointerup();
                    if (Lilo.Engine.kybdFocusCtrl && Lilo.Engine.target == Lilo.MOBILE && Lilo.Engine.views[Lilo.Engine.activeView].focusShift)
                        Lilo.Engine.focusOffset = -(Lilo.Engine.kybdFocusCtrl.GetAbsoluteCoords().y - 200);
                    else
                        Lilo.Engine.focusOffset = 0;     
                    Lilo.Engine.mouseDrag = false;            
                }


            }

            if(Lilo.Engine.mouseButtons[0] == 0)
                Lilo.Engine.activeCtrl = null;
        }

        this.Render = function (ctx) {
            if (this.isVisible)
            {
                var controls = this.controls;
                Lilo.Engine.SaveState();
                ctx.translate(0, Lilo.Engine.focusOffset);
    
                for (var i = 0; i <controls.length; i++)
                {
                    if (controls[i].isVisible)
                    {
                        var dim = Lilo.Internal.GetControlPoints(controls[i]);
                        var pts = 0;
                        for (var i2 = 0; i2 < 4; i2++)
                        {
                            if (dim[i2].x >= 0 && dim[i2].x < Lilo.SCREEN_WIDTH && dim[i2].y >= 0 && dim[i2].y < Lilo.SCREEN_HEIGHT)
                            {
                                pts++;
                            }
                        }
                        if (pts > 0) {
                            controls[i].Render(ctx);
                        }
                    }
                    else if (controls[i].styleLogic) {
                        controls[i].styleLogic();
                    }
                }
                //ctx.restore();
                Lilo.Engine.RestoreState();
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Button
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Button = function ( id, text, params )
    {
        //-------------------------
        // Button specific.
        //-------------------------
        this.text = text;
        this.metrics = null;
        this.textAlign = 'center';
        
        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover       = null;
        this.unhover     = null;
        this.click       = null;
        this.pointerdown = null;
        this.pointerup   = null;
        this.doubleclick = null;
        this.rightclick  = null;
        this.keydown     = null;
        this.keyup       = null;
        this.drag        = null;
        this.wheel       = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function(params)
        {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.SetText = function( txt )
        {
            this.text = txt;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.CheckBounds = function ()
        {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x+(this.width/2), this.y+(this.height/2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width/2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            var fillstyle = this.background;
            if (this.gradient != null) {
                ctx.globalAlpha = this.opacity;
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }
            ctx.fillStyle = fillstyle;
            //ctx.strokeStyle = "rgba(0,0,0,1.0)";
            //ctx.lineWidth = 3;
            if (this.radius == 0)
                ctx.fillRect(-(this.width/2), -(this.height/2), this.width, this.height);
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);


            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            var op = this.opacity;
            if (this.gradient != null)
                op = 1.0;
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + op + ")";
            }
            ctx.fillStyle = fillstyle;

            if (this.font != "") {
                ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
            }

            var x, y;
            if(this.textAlign == "center") 
            {
                ctx.textAlign = 'center';
                y = -(this.height/2) + (this.height / 2) + (this.fontSize/2) - 2;
                x = -(this.width/2) + (this.width / 2);
            }
            else
            {
                ctx.textAlign = 'left';
                y = -(this.height/2) + (this.height / 2) + (this.fontSize/2) - 2;
                x = -(this.width/2) + 10;
            }
            ctx.fillText(this.text, x, y);
            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Panel
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Panel = function (id, params) {

        // Panel specific.
        this.controls = [];
        this.cachedcontrols = [];
        this.ctx = null;
        this.createframe = 0; /* store the frame number when created, so we can delay rendering to ensure all updates are staged */

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.scrollx = 0;
        this.scrolly = 0;
        this.maxscrollx = 0;
        this.velocityx = 0;
        this.velocityy = 0;
        this.accelerationx = 0;
        this.accelerationy = 0;
        this.oldsignx = 0;
        this.oldsigny = 0;
        this.signx = 0;
        this.signy = 0;
        this.touchPan = false;
        this.horiz_scroll = true;
        this.vert_scroll = true;
        this.scroll_tips = true;
        this.scrollhandler = null;
        this.dragdir = 0;
        this.stroke = false; 
        this.strokewidth = 1;
        this.strokecolor = "rgba(0,0,0,1.0)";
        this.hideoverflow = false;
        this.shadow = false;
        this.transparent = false;
        this.modal = false;
        this.modalClose = false;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.init = null;

        if (params)
        {
            Lilo.Internal.ApplyParams(this, params);
            if (this.init)
            {
                this.init();
            }
        }

        this.createframe = Lilo.Engine.frameNumber;

        this.AccelDrag = function ()
        {
            this.dragdir = (Math.abs(Lilo.Engine.mouseDragX) > Math.abs(Lilo.Engine.mouseDragY)) ? 1 : 0;
            var dragx = Lilo.Engine.GetDragDelta().x;
            var dragy = Lilo.Engine.GetDragDelta().y;
            this.signx = (dragx < 0) ? -1 : 1;
            this.signy = (dragy < 0) ? -1 : 1;
            if (this.signx != this.oldsignx) { this.accelerationx = 0; this.velocityx = 0; }
            if (this.signy != this.oldsigny) { this.accelerationy = 0; this.velocityy = 0; }
            if (this.dragdir == 1) this.accelerationx += dragx * 0.008;
            if (this.dragdir == 0) this.accelerationy += dragy * 0.008;
            if (this.dragdir == 1) this.velocityx += this.accelerationx;
            if (this.dragdir == 0) this.velocityy += this.accelerationy;
            this.oldsignx = this.signx;
            this.oldsigny = this.signy;
        },

        this.ApplyAccelPan = function () {
            if (!Lilo.Engine.mouseDrag) {
                var maxx = this.GetContentDimensions().maxx;
                var maxy = this.GetContentDimensions().maxy;
                if (maxx >= this.width) this.maxscrollx = maxx - this.width;
                else this.maxscrollx = 0;
                if (maxy >= this.height) this.maxscrolly = maxy - this.height;
                else this.maxscrolly = 0;
                for (var i = 0; i < this.controls.length; i++) {
                    if (this.controls[i].position != Lilo.POSITION_RELATIVE) continue;

                    var d = Math.abs(this.controls[i].x - this.scrollx);
                    if (d < 2) 
                    {
                        this.velocityx *= 0.0;
                        this.accelerationx *= 0.0;
                        this.scrollx = this.controls[i].x;
                    }
                    var d = Math.abs(this.controls[i].y - this.scrolly);
                    if (d < 2) 
                    {
                        this.velocityy *= 0.0;
                        this.accelerationy *= 0.0;
                        this.scrolly = this.controls[i].y;
                    }
                }
            }
            this.scrollx -= this.velocityx;
            this.scrolly -= this.velocityy;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
            this.velocityy *= 0.98;
            this.velocityx *= 0.98;
        },

        this.GetAbsoluteCoords = function () {
            var c = { x: this.x, y: this.y };
            if (this.position == Lilo.POSITION_ABSOLUTE)
                return (c);
            var o = this;
            while (o.container) {
                o = o.container;
                var sx = o.scrollx;
                var sy = o.scrolly;
                if(sx == undefined) sx = 0;
                if(sy == undefined) sy = 0;
                c.x += o.x - sx;
                c.y += o.y - sy;
            }
            return (c);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Show = function () {
            Lilo.Internal.ApplyParamRecursive(this, { isVisible: true });
            this.Update( this.ctx );
        }

        this.Hide = function () {
            Lilo.Internal.ApplyParamRecursive(this, { isVisible: false });
        }

        this.SetScroll = function (x, y) {
            this.scrollx = x;
            this.scrolly = y;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
        }

        this.ScrollTo = function (x, y, d) {
            var deltaX = (x - this.scrollx) / (d * Lilo.Engine.FPS);
            var deltaY = (y - this.scrolly) / (d * Lilo.Engine.FPS);
            var obj = this;
            var sx = x;
            var sy = y;
            if (sx < 0) sx = 0;
            if (sy < 0) sy = 0;
            if (sx > this.maxscrollx) sx = this.maxscrollx;
            if (sy > this.maxscrolly) sy = this.maxscrolly;
            if (obj.scrollhandler != null) obj.scrollhandler = null;
            if (obj.scrollhandler == null) {
                obj.scrollhandler = function () {
                    this.scrollx += deltaX;
                    this.scrolly += deltaY;
                    if (Math.abs(this.scrollx - sx) <= Math.abs(2 * deltaX))
                        this.scrollx = sx;
                    if (Math.abs(this.scrolly - sy) <= Math.abs(2 * deltaY))
                        this.scrolly = sy;
                    if (this.scrollx == sx && this.scrolly == sy)
                        this.scrollhandler = null;
                };
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value:delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000/Lilo.Engine.FPS));
        }

        this.GetContentDimensions = function ()
        {
            return (Lilo.Internal.GetDimensionsRecursive(this));
        }

        this.Add = function (ctrl) {
            ctrl.container = this;
            this.controls.push(ctrl);
            this.SortCachedControlList();
        }

        this.SortCachedControlList = function()
        {
            this.controls.sort(function (a, b) {
                return (a.zorder-b.zorder);
            });
            var c = [];
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].isVisible) continue;
                c.push(this.controls[i]);
                c = c.concat(this.controls[i].GetControls());
            }
            this.cachedcontrols = c;
        }

        this.GetControls = function () {
            return (this.cachedcontrols);
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {

            this.ctx = ctx;

            if (this.styleLogic != null && this.styleLogic != undefined) {
                this.styleLogic();
            }

            if (this.touchPan) {
                if (Lilo.Engine.mouseDrag && Lilo.Engine.activeCtrl == this) this.AccelDrag();
                this.ApplyAccelPan();
            }

            if (this.animate)
                this.animate();
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].Update(ctx);
            }

            if (this.scrollhandler)
                this.scrollhandler();

        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                /*if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else*/
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) 
        {
            /* Don't render a panel until at least 5 frames have passed to allow all updates to bubble */
          //  if(Lilo.Engine.frameNumber < this.createframe+5)
            //    return;

            Lilo.Engine.SaveState();

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            if(!this.transparent)
            {
                if (this.radius == 0) {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                    }
                }
                else {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, false, this.stroke);
                    }
                }

                var fillstyle = this.background;
                if (this.gradient != null) {
                    ctx.globalAlpha = this.opacity;
                    // Create gradient
                    grd = ctx.createLinearGradient(0, 0, 0, this.height);
                    for (var i = 0; i < this.gradient.length; i++) {
                        grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                    }
                    fillstyle = grd;
                }
                else {
                    var i = fillstyle.lastIndexOf(",");
                    if (i != -1) {
                        fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                    }
                }
                ctx.fillStyle = fillstyle;
                
                if(this.shadow)
                {
                    ctx.shadowColor = '#333';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 5;
                }

                if (this.radius == 0) {
                    ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                }
                else {
                    Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);
                }
            }

            if (this.hideoverflow) {
                //ctx.beginPath();
                //ctx.rect(-(this.width / 2) | 0, -(this.height / 2) | 0, (this.width) | 0, (this.height) | 0);
                //ctx.clip();
                Lilo.Engine.SetClip(-(this.width / 2), -(this.height / 2), this.width, this.height);
            }

            //ctx.save();
            Lilo.Engine.SaveState();
            var controlsinview = 0;
            ctx.translate(-(this.x + (this.width / 2)) - this.scrollx, -(this.y + (this.height / 2)) - this.scrolly);

            for (var i = 0; i < this.controls.length; i++)
            {
                if (this.controls[i].isVisible && this.controls[i].width > 0 && this.controls[i].height > 0) {
                    controlsinview++;
                    this.controls[i].Render(ctx);
                }
            }
            //ctx.restore();
            Lilo.Engine.RestoreState();

            // Show content scrolling tips.
            if (this.touchPan && this.scroll_tips)
            {
                var dim = this.GetContentDimensions();
                // right scroll tip
                if (this.scrollx + this.width < dim.maxx && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect((this.width / 2) - 50, -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo((this.width / 2) - 50 + 15, -15);
                    ctx.lineTo((this.width / 2) - 50 + 35, 0);
                    ctx.lineTo((this.width / 2) - 50 + 15, 15);
                    ctx.fill();
                }
                // left scroll tip
                if (this.scrollx > 0 && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-(this.width / 2), -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-(this.width / 2) + 35, -15);
                    ctx.lineTo(-(this.width / 2) + 15, 0);
                    ctx.lineTo(-(this.width / 2) + 35, 15);
                    ctx.fill();
                }
                // top scroll tip
                if (this.scrolly > 0 && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, -(this.height/2), 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,-(this.height / 2) + 30);
                    ctx.lineTo(0,-(this.height / 2) + 10);
                    ctx.lineTo(15,-(this.height / 2) + 30);
                    ctx.fill();
                }
                // bottom scroll tip
                if (this.scrolly + this.height < dim.maxy && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, (this.height / 2)-40, 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,(this.height / 2) - 30);
                    ctx.lineTo(0,(this.height / 2) - 10);
                    ctx.lineTo(15,(this.height / 2) - 30);
                    ctx.fill();
                }
            }

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Image
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Image = function ( id, imgsrc, params ) {

        //-------------------------
        // Image specific.
        //-------------------------
        this.srcwidth = 0;
        this.srcheight = 0;
        this.imgsrc = imgsrc;
        this._imgReady = false;
        this._img = new Image();
        var obj = this;
        this._img.onload = function ()
        {
            obj._imgReady = true;
            obj.srcwidth = this.width;
            obj.srcheight = this.height;
            obj.aspect = this.height / this.width;
            Lilo.Engine.imageCache[imgsrc] = this;
        }
        this._img.src = imgsrc;
        this.aspect = params.height / params.width;
        this.scale = 1;
        
        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if ( params ) {
            Lilo.Internal.ApplyParams( this, params );
        }

        this.SetParams = function ( params ) {
            Lilo.Internal.ApplyParams( this, params );
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function ( ctx ) {
            if (this.styleLogic != null && this.isVisible) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.LoadImage = function( imgurl )
        {
            if(Lilo.Engine.imageCache[imgurl] != undefined)
            {
                this._img = Lilo.Engine.imageCache[imgurl];
                this.srcwidth = this._img.width;
                this.srcheight = this._img.height;
                this.imgsrc = imgurl;
                this.aspect = this.srcheight / this.srcwidth;                
            }
            else
            {
                this.srcwidth = 0;
                this.srcheight = 0;
                this.imgsrc = imgurl;
                this._imgReady = false;
                this._img = new Image();
                var obj = this;
                this._img.onload = function ()
                {
                    obj._imgReady = true;
                    obj.srcwidth = this.width;
                    obj.srcheight = this.height;
                    obj.aspect = this.height / this.width;
                    Lilo.Engine.imageCache[imgurl] = this;
                }
                this._img.src = imgurl;
            }
        }

        this.CheckBounds = function () 
        {
            if(this.isVisible)
            {
                var coords = Lilo.Engine.GetPointer();
                if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y))
                {
                    if (this.clipped) {
                        if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                            return (true);
                        }
                        else {
                            return (false);
                        }
                    }
                    else
                        return (true);
                }
            }
            return (false);
        }

        this.Render = function ( ctx ) {
            if(this.isVisible)            
            {
                Lilo.Engine.SaveState();
                if (this.position == Lilo.POSITION_ABSOLUTE)
                    ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
                else if (this.position == Lilo.POSITION_RELATIVE)
                    ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.scale(this.scale,this.scale);
                ctx.globalAlpha = this.opacity;
                ctx.drawImage(this._img, -(this.width / 2), -(this.height / 2), this.width, this.height);
                Lilo.Engine.RestoreState();
            }
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.TextBox
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.TextBox = function (id, text, params)
    {
        //-------------------------
        // TextBox specific.
        //-------------------------
        this.text = text;
        this.cursor = 0;
        this.selectStart = 0;
        this.selectEnd = 0;
        this.maxlength = 0;
        this.defaultValue = text;
        this.edited = false;
        this.password = false;
        this.selecting = false;
        this.startpos = 0;
        this.maxpos = 0;
        this.tabindex = -1;
        this.metrics = null;
        this.charWidths = [];
        this.inputType = Lilo.KEYBOARD_TEXT;
        this.lastUpdateFrame = 0;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.defaultAction = null;
        this.userclick = null;
        this.onchange = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetAbsoluteCoords = function ()
        {
            var c = { x: this.x, y: this.y };
            if (this.position == Lilo.POSITION_ABSOLUTE)
                return (c);
            var o = this;
            while (o.container)
            {
                o = o.container;
                var sx = o.scrollx;
                var sy = o.scrolly;
                if(sx == undefined) sx = 0;
                if(sy == undefined) sy = 0;
                c.x += (o.x - sx);
                c.y += (o.y - sy);
            }
            return (c);
        }

        this.GetCursorFromPointer = function ()
        {
            
            var curspos = this.startpos;

            var pointer = Lilo.Engine.GetPointer();
            var xofs = pointer.x - this.GetAbsoluteCoords().x;
            var cx = this.GetAbsoluteCoords().x;
            for (var i = this.startpos; i < this.text.length; i++) {
                cx += this.charWidths[i];
                if(cx >= pointer.x)
                    break;
                curspos++;
            }
            return( curspos );
        }

        this.pointerdown = function ()
        {

        }

        this.drag = function ()
        {

        }

        this.click = function ()
        {
            if (this.text == this.defaultValue)
            {
                this.text = "";
                this.cursor = 0;                  
            }
            
            if (Lilo.Engine.kybdOpen) {
                Lilo.Engine.DismissKeyboard();
            }

           // if(!Lilo.Engine.kybdOpen || Lilo.Engine.target != Lilo.MOBILE) {
                var obj = this;
                Lilo.Engine.kybdFocusCtrl = this;
                if (Lilo.Engine.target == Lilo.MOBILE) {
                    Lilo.Engine.kybdOpen = true;
                    Cocoon.Dialog.showKeyboard({
                        type: obj.inputType,
                    }, {
                        insertText: function (inserted) {
                            obj.edited = true;
                            obj.lastUpdateFrame = Lilo.Engine.frameNumber;
                            if (inserted.length == 1) {

                                if (obj.text.length <= obj.maxlength) {
                                    obj.text = obj.text.substring(0, obj.cursor) + inserted + obj.text.substring(obj.cursor, obj.text.length);

                                    var ctx = Lilo.Engine.ctx;
                                    if (obj.font != "") {
                                        ctx.font = obj.fontWeight + " " + obj.fontSize + "px " + obj.fontFace;
                                    }

                                    var textwidth = 0;
                                    for (var i = obj.startpos; i < obj.text.length; i++) {
                                        var char = obj.text.charAt(i);
                                        var metrics = ctx.measureText(char);
                                        if ((textwidth + metrics.width) > obj.width - 20) {
                                            obj.startpos++;
                                            if (metrics.width > obj.charWidths[obj.startpos]) {
                                                obj.startpos++;
                                            }
                                            break;
                                        }
                                        textwidth += metrics.width;
                                    }
                                    obj.cursor++;
                                }
                            }
                            else if (inserted.length <= obj.maxlength) {
                                obj.text = inserted;
                                obj.cursor += inserted.length;
                            }
                            if (obj.onchange) obj.onchange();
                        },
                        deleteBackward: function (deleted) {
                            console.log('deleted');
                            console.log(deleted);

                            if (obj.text.length > 0) {

                                obj.text = obj.text.substring(0, obj.cursor - 1) + obj.text.substring(obj.cursor, obj.text.length);

                                if (obj.startpos > 1) {

                                    var textwidth = 0;
                                    for (var i = obj.startpos - 1; i < obj.cursor; i++) {
                                        textwidth += obj.charWidths[i];
                                    }

                                    var availableWidth = obj.width - textwidth - 10;
                                    if (availableWidth > obj.charWidths[obj.startpos - 2]) {
                                        obj.startpos--;
                                    }
                                    if (availableWidth < 0) {
                                        obj.cursor--;
                                        return;
                                    }
                                }

                                if (obj.startpos > 0) {
                                    obj.startpos--;
                                    obj.cursor--;
                                    return;
                                }
                                obj.cursor--;

                                if (obj.cursor < 0) obj.cursor = 0;

                                if (obj.onchange) obj.onchange();
                            }

                        },
                        done: function () { Lilo.Engine.kybdFocusCtrl = null; Lilo.Engine.DismissKeyboard(); if (obj.onchange) obj.onchange(); },
                        cancel: function () { Lilo.Engine.kybdFocusCtrl = null; Lilo.Engine.DismissKeyboard(); if (obj.onchange) obj.onchange(); }
                    });
                }
                if (!this.edited)
                {
                    this.text = "";
                    this.cursor = 0;
                }
                if(this.userclick) 
                    this.userclick();
           // }
            /* keyboard already open or desktop */
            if (Lilo.Engine.kybdOpen || Lilo.Engine.target != Lilo.MOBILE)
            {
                this.cursor = this.GetCursorFromPointer();
            }
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {

            Lilo.Engine.SaveState();
            if (this.font != "") {
                ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
            }
            ctx.textAlign = 'left';

            var textwidth = 0;
            this.maxpos = this.text.length;
            var mp = 0;
            for (var i = this.startpos; i < this.text.length; i++) {
                var char = this.text.charAt(i);
                var metrics = ctx.measureText(char);

                this.charWidths[i] = metrics.width;

                if ((textwidth + metrics.width) > this.width - 10)
                    break;
                textwidth += metrics.width;
                mp++;
            }
            this.maxpos = (mp > 0) ? mp+this.startpos : this.text.length;

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            var fillstyle = this.background;
            if (this.gradient != null) {
                ctx.globalAlpha = this.opacity;
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }

            ctx.fillStyle = fillstyle;
            ctx.strokeStyle = "rgba(0,0,0,1.0)";
            ctx.lineWidth = 3;
            if (this.radius == 0)
                ctx.fillRect(-(this.width/2), -(this.height/2), this.width, this.height);
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, true);

            ctx.fillStyle = fillstyle;
            if (this.radius == 0)
                ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);

            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            var op = this.opacity;
            if (this.gradient != null)
                op = 1.0;
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + op + ")";
            }
            ctx.fillStyle = fillstyle;
         
            var y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
            var x = -(this.width / 2) + 8;

            
            if (this.password && this.text != this.defaultValue) {
                var pwdtext = "";

                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }
                var metricsPass = ctx.measureText("*");

                if (Lilo.Engine.target == Lilo.MOBILE) {
                    if (Lilo.Engine.frameNumber > this.lastUpdateFrame + 180) {
                        for (var i = 0; i < this.text.length; i++) {
                            if (metricsPass.width * (i + 1) < this.width - 10)
                                pwdtext += "*";
                        }

                    }
                    // Only show last character for 3 seconds.
                    else {
                        for (var i = 0; i < this.text.length - 1; i++) {
                            if (metricsPass.width * (i + 1) < this.width - 10)
                                pwdtext += "*";
                        }

                        pwdtext += this.text.charAt(this.text.length - 1);
                    }
                }
                else {
                    for (var i = 0; i < this.text.length; i++) {
                        if (metricsPass.width * (i + 1) < this.width - 10)
                            pwdtext += "*";
                    }

                }
                ctx.fillText(pwdtext, x, y);
            }
            else
                ctx.fillText(this.text.substring(this.startpos,this.maxpos), x, y);

            
            if (this == Lilo.Engine.kybdFocusCtrl)
            {
                // Draw cursor
                var xpos = -(this.width / 2) + 8;
                var pretext = this.text.substring(this.startpos, this.cursor);
                var metrics = ctx.measureText(pretext);
                var pwdtext = "";
                if (this.password) {
                    if (this.font != "") {
                        ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                    }
                    var metricsPass = ctx.measureText("*");

                    if (Lilo.Engine.target == Lilo.MOBILE) {
                        if (Lilo.Engine.frameNumber > this.lastUpdateFrame + 180) {
                            for (var i = 0; i < this.text.length; i++) {
                                if (metricsPass.width * (i + 1) < this.width - 10)
                                    pwdtext += "*";
                            }

                        }
                        // Only show last character for 3 seconds.
                        else {
                            for (var i = 0; i < this.text.length - 1; i++) {
                                if (metricsPass.width * (i + 1) < this.width - 10 - metricsPass.width)
                                    pwdtext += "*";
                            }

                            pwdtext += pretext.charAt(pretext.length - 1);
                        }
                    }
                    else {
                        for (var i = 0; i < this.text.length; i++) {
                            if (metricsPass.width * (i + 1) < this.width - 10)
                                pwdtext += "*";
                        }

                    }
                    metrics = ctx.measureText(pwdtext);
                }
                
                xpos += metrics.width;
                ctx.fillRect(xpos, -(this.height / 2) + (this.height * 0.15), 2, this.height - (this.height * 0.30));

                // Draw selection
                if (this.selectEnd != this.selectStart)
                {
                    var xpos1 = -(this.width / 2);
                    var pretext1 = this.text.substring(this.startpos, this.selectStart);
                    var metrics1 = ctx.measureText(pretext1);
                    if (pretext1 == "") metrics1.width = 0;
                    xpos1 += metrics1.width;
                    var xpos2 = xpos1;
                    var pretext2 = this.text.substring(this.selectStart, this.selectEnd);
                    var metrics2 = ctx.measureText(pretext2);
                    if (pretext2 == "") metrics2.width = 0;
                    xpos2 += metrics2.width;
                    ctx.fillStyle = "rgba(120,120,170,0.5)";
                    ctx.fillRect(xpos1, -(this.height / 2) + (this.height * 0.15), xpos2-xpos1, this.height - (this.height * 0.30));
                }
            }

            Lilo.Engine.RestoreState();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Rect -> Simple filled rectangle 
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Rect = function (id, params) {

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.oldopacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            //obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    //obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            //Lilo.Engine.SaveState();
           /* if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));
*/
            var x, y;
            if (this.position == Lilo.POSITION_ABSOLUTE)
            {
                x = this.x;
                y = this.y;
            }
            else if (this.position == Lilo.POSITION_RELATIVE)
            {
                x = this.x + this.container.x;
                y = this.y + this.container.y;
            }

            if(this.rotation != 0)
                ctx.rotate(this.rotation * Math.PI / 180);

            if(this.background != "")
            {
                ctx.fillStyle = this.background;
                //ctx.fillRect(-(this.width/2), -(this.height/2), this.width, this.height);
                ctx.fillRect(x, y, this.width, this.height);
            }

            //Lilo.Engine.RestoreState();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Label
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Label = function (id, text, params) {
        
        //-------------------------
        // Label specific.
        //-------------------------
        this.text = text;
        this.dragGrip = false;  // This wouldn't be publically exposed or used, but used in sortable lists.
        this.textAlign = "center";
        this.charWidths = [];   // We track the width in pixels of each character of the text so we can wrap lines.
        this.textWidth = 0;
        this.noWrap = false;
        this.imageCache = false;
        this.caret = false;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.oldopacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;
        this.stroke = true;
        this.refObj = null;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }


        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
           
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            //obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    //obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.SetText = function( newtext )
        {
            if(newtext != this.text)
            {
                this.text = newtext;
                this.charWidths = []; // need this to force update of widths.
            }
        }

        this.Render = function (ctx) {

            if(this.text == null || this.text == "" || this.text == undefined)
                return;
            if(this.width <= 0 || this.height <= 0)
                return;

            Lilo.Engine.SaveState();
            if (this.clipped) {
                Lilo.Engine.SetClip(this.x, this.y, this.width, this.height);
            }

            // On first render check width.
            if(this.charWidths.length == 0)
            {
                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }

                for(var i=0;i<this.text.length;i++)
                {
                    var subtxt = this.text.substr(i,1);
                    var m = ctx.measureText(subtxt);
                    this.charWidths[i] = m.width;
                }

                var metrics = ctx.measureText( this.text );
                this.textWidth = metrics.width;
            }  

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            if(this.rotation != 0)
                ctx.rotate(this.rotation * Math.PI / 180);

            if(this.background != "")
            {
                if (this.gradient != null) {
                    ctx.globalAlpha = this.opacity;
                    // Create gradient
                    grd = ctx.createLinearGradient(0, 0, 0, this.height);
                    for (var i = 0; i < this.gradient.length; i++) {
                        grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                    }
                    fillstyle = grd;
                }
                else {
                    fillstyle = this.background;
                }
                ctx.fillStyle = fillstyle;
                ctx.fillRect(-(this.width/2), -(this.height/2), this.width, this.height);
            }
            
            if(this.stroke)
            {
                ctx.strokeStyle = "rgba(0,0,0,1.0)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-(this.width/2), -(this.height/2), this.width, this.height);
            }

            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
            }
            ctx.fillStyle = fillstyle;

            if(this.imageCache)
            {
                var x, y;
                var lineno = 0;
                var ctxt = this.text;
                var charsRemain = ctxt.length;
                var cwidth;

                if(this.noWrap)
                {
                    var timg = Lilo.Engine.RenderText( this.text, this.fontWeight + " " + this.fontSize + "px " + this.fontFace, this.fontSize, fillstyle );
                    if(this.textAlign == 'center')
                    {
                        y = -(this.height / 2) + (this.height / 2) - (timg.height/2) - (this.fontSize/6);
                        x = -(this.width / 2);
                        this.width = this.textWidth;
                    }
                    else if (this.textAlign == 'left')
                    {
                        y = -(this.height / 2) + (this.height / 2) - (timg.height/2)- (this.fontSize/6);
                        x = -(this.width / 2);
                    }
                    ctx.drawImage( timg, x|0, y|0 );

                }
                else
                {
                    while(charsRemain > 0)
                    {
                        cwidth = 0;
                        var ccount = 0;
                        for(var i=0;i<ctxt.length;i++)
                        {
                            cwidth += this.charWidths[i];
                            if(cwidth >= this.width)
                                break;
                            ccount++;
                            charsRemain--;
                        }            

                        // finding a space between a word 
                        if (charsRemain > 0 && ctxt.substr(ccount, 1) != "") {
                            var newTxt = ctxt.substr(0, ccount);
                            var whiteSpaceIndex = 0;
                            for (var j = newTxt.length - 1; j >= 0; j--) {
                                if (newTxt.charAt(j) == " ") {
                                    ccount = ccount - whiteSpaceIndex;
                                    charsRemain = charsRemain + whiteSpaceIndex;
                                    break;
                                }
                                whiteSpaceIndex++;
                            }
                        }

                        var timg = Lilo.Engine.RenderText( ctxt.substr(0,ccount), this.fontWeight + " " + this.fontSize + "px " + this.fontFace, this.fontSize, fillstyle );
                        if(this.textAlign == 'center')
                        {
                            y = -(this.height / 2) + (this.height / 2) - (timg.height/2) - (this.fontSize/6);
                            x = -(this.width / 2);
                        }
                        else if (this.textAlign == 'left')
                        {
                            y = -(this.height / 2) + (this.height / 2) - (timg.height/2)- (this.fontSize/6);
                            x = -(this.width / 2);
                        }
                    ctx.drawImage( timg, x|0, y+(lineno*this.fontSize+5)|0 );
                    ctxt = ctxt.substring(ccount, ctxt.length);
                    charsRemain = ctxt.length;
                    lineno++;
                    }
                }
            }
            else
            {
                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }
                
                ctx.textAlign = this.textAlign;
                
                var metrics, x, y;
                if(this.textAlign == 'center')
                {
                    metrics = ctx.measureText(this.text);
                    y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
                    x = -(this.width / 2) + (this.width / 2);
                }
                else if (this.textAlign == 'left')
                {
                    metrics = ctx.measureText(this.text);
                    y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
                    x = -(this.width / 2);
                }

                if(metrics.width > this.width) this.width = metrics.width;

                ctx.fillText(this.text, x, y);
            }

            if(this.dragGrip)
            {
                var cx = (this.width/2) - 30;
                var cy = -10;
                ctx.strokeStyle = 'rgba(180,180,180,1.0)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(cx,cy);
                ctx.lineTo(cx + 20, cy);
                ctx.moveTo(cx, cy+10);
                ctx.lineTo(cx + 20, cy+10);
                ctx.moveTo(cx, cy+20);
                ctx.lineTo(cx + 20, cy+20);
                ctx.stroke();
            }
            if(this.caret)
            {
                var cy = 0;
                ctx.lineWidth = 4;
                ctx.strokeStyle = "rgba(180,180,180,1.0)";
                ctx.beginPath();
                ctx.moveTo( this.width/2 - 30, cy - 14 );
                ctx.lineTo( this.width/2 - 12, cy  );
                ctx.lineTo( this.width/2 - 30, cy + 14 );
                ctx.stroke();
            }
            Lilo.Engine.RestoreState();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Checkbox
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Checkbox = function (id, text, checked, params) {

        //-------------------------
        // Checkbox specific.
        //-------------------------
        this.imgsrc = "gfx/check.png";
        this._imgReady = false;
        this._img = new Image();
        this._img.onload = function () {
            this._imgReady = true;
        }
        this._img.src = this.imgsrc;
        this.checked = checked;
        this.text = text;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.stroke = false; 
        this.strokewidth = 1;
        this.strokecolor = "rgba(0,0,0,1.0)";

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;
        this.onchange = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.click = function () {
            this.checked = (this.checked) ? false : true;
            if (this.onchange) this.onchange();
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            var fillstyle = this.background;
            if (this.gradient != null) {
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }
            ctx.fillStyle = fillstyle;

            if (this.stroke) {
                ctx.lineWidth = this.strokewidth;
                ctx.strokeStyle = this.strokecolor;
            }
            

            if (this.radius == 0) {
                if (this.stroke) {
                    ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                }
                ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            }
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, (fillstyle ? true : false), this.stroke);

            if (this.checked) {
                ctx.globalAlpha = this.opacity;
                ctx.drawImage(this._img, -(this.width / 2), -(this.height / 2), this.width, this.height);
            }

            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
            }
            ctx.fillStyle = fillstyle;

            if (this.font != "") {
                ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
            }
            ctx.textAlign = 'left';
            var metrics = ctx.measureText(this.text);
            var y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
            var x = -(this.width / 2) + (this.width) + 10;
            ctx.fillText(this.text, x, y);

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Video
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Video = function (id, vidsrc, params) {

        if (Lilo.Engine.target == Lilo.MOBILE) return; // not supported in cocoon mobile yet.

        //-------------------------
        // Video specific.
        //-------------------------
        this.vidsrc = vidsrc;
        this._vidReady = false;
        this._vid = document.createElement("video");
        this._vid.autoplay = false;
        this._vid.loop = true;
        this._vid.addEventListener('loadedmetadata', function () {
            this._vidReady = true;
        });
        this._vid.src = vidsrc;
        this._vid.controls = true;
        this._vid.style.visibility = "hidden";

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = false;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Play = function () {
            this.isVisible = true;
            this._vid.play();
        }

        this.Pause = function () {
            this._vid.pause();
        }

        this.Stop = function () {
            this.isVisible = false;
            this._vid.pause();
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(this._vid, -(this.width / 2), -(this.height / 2), this.width, this.height);

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.PixelView
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.PixelView = function (id, params) {

        //-------------------------
        // PixelView specific.
        //-------------------------
        this._img = document.createElement("canvas");
        this._img.width = params.width;
        this._img.height = params.height;
        this._img.style.display = "none";
        this._imageData = this._img.getContext("2d").getImageData(0, 0, params.width, params.height);
        this.pbuf = new ArrayBuffer(this._imageData.data.length);
        this.buf8 = new Uint8ClampedArray(this.pbuf);
        this.pixeldata = new Uint32Array(this.pbuf);

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
            if (this.init) {
                this.init();
            }
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (!this.isVisible) return;
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;

            this._imageData.data.set(this.buf8);
            this._img.getContext("2d").putImageData(this._imageData, 0, 0);
            ctx.drawImage(this._img, -(this.width / 2), -(this.height / 2), this.width, this.height);

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.PaintView
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.PaintView = function (id, params) {

        //-------------------------
        // PaintView specific.
        //-------------------------
        this._img = document.createElement("canvas");
        this._img.width = params.width;
        this._img.height = params.height;
        this._img.style.display = "none";
        this._ctx = this._img.getContext("2d");

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            
            this._img.width  = this.width;
            this._img.height = this.height;

            if (this.animate)
                this.animate( ctx );
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.GetContext = function ()
        {
            return (this._ctx);
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.clipped) {
                //ctx.beginPath();
                //ctx.rect(this.x, this.y, this.width, this.height);
                //ctx.clip();
                Lilo.Engine.SetClip(this.x, this.y, this.width, this.height);
            }

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;

            ctx.drawImage(this._img, -(this.width / 2), -(this.height / 2), this.width, this.height);

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Spinner
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Spinner = function (id, params) {

        //-------------------------
        // Spinner specific.
        //-------------------------
        this.progress = 0;
        this.thickness = 20;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            return (false);
            // Spinner's have no user input.
        }

        this.animate = function ()
        {
            this.progress += 0.008;
            if (this.progress >= 1.0) this.progress -= 1.0;
        }

        this.Show = function () {
            this.isVisible = true;
            this.isActive = true;
        }

        this.Hide = function () {
            this.isVisible = false;
            this.isActive = false;
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.Render = function (ctx) {

            if (!this.isVisible) return;

            //ctx.save();
            Lilo.Engine.SaveState();

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x - this.container.scrollx + this.x + (this.width / 2), this.container.y - this.container.scrolly + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
        
            var fillstyle = this.background;
            if (this.gradient != null) {
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }
            ctx.strokeStyle = fillstyle;

            ctx.shadowColor = '#000';
            ctx.shadowBlur = 50;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            ctx.lineWidth = this.thickness;
            if (Lilo.Engine.target == Lilo.MOBILE) {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, -0.1, Math.PI * 2);
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2 - 0.002);
                ctx.stroke();
            }

            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.strokeStyle = this.foreground;
            ctx.lineWidth = this.thickness;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, ((Math.PI * 2) * this.progress)-0.6*Math.PI, ((Math.PI * 2) * this.progress));
            ctx.stroke();

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.ProgressBar
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.ProgressBar = function (id, params) {

        //-------------------------
        // ProgressBar specific.
        //-------------------------
        this.progress = 0;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            return (false);
            // Spinner's have no user input.
        }

        this.Show = function () {
            this.isVisible = true;
            this.isActive = true;
        }

        this.Hide = function () {
            this.isVisible = false;
            this.isActive = false;
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            var fillstyle = this.background;
            if (this.gradient != null) {
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }

            var mstroke = false;
            if(this.stroke)
            {
                ctx.lineWidth = this.strokewidth;
                ctx.strokeStyle = this.strokecolor;
                mstroke = true;
            }
            ctx.fillStyle = fillstyle;
            if (this.radius == 0) 
            {
                ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                if(mstroke)
                    ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            }
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, mstroke);

            if(this.progress > 1) this.progress = 1;

            if(this.progress > 0)
            {
                ctx.fillStyle = this.foreground;
                if (this.radius == 0)
                    ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width*this.progress, this.height);
                else    
                   Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width*this.progress, this.height, this.radius, true, false);
            }
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Window
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Window = function (id, title, params) {

        // Window specific.
        this.title = title;
        this.controls = [];
        this.cachedcontrols = [];
        this.ctx = null;
        this.ofsx = 0;
        this.ofsy = 0;
        this.modal = false;
        this.hasclose = true;
        this.headercolor = "";
        this.hasheader = true;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.scrollx = 0;
        this.scrolly = 0;
        this.maxscrollx = 0;
        this.velocity = 0;
        this.acceleration = 0;
        this.oldsign = 0;
        this.sign = 0;
        this.touchPan = false;
        this.horiz_scroll = true;
        this.vert_scroll = true;
        this.scroll_tips = true;
        this.shadow = false;
        this.modalClose = false;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.init = null;
        this.onclose = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
            if (this.init) {
                this.init();
            }
        }
        this.clipped = true;

        if(this.init)
            this.init();

        this.GetAbsoluteCoords = function () {
             var c = { x: this.x, y: this.y };
            if (this.position == Lilo.POSITION_ABSOLUTE)
                return (c);
            var o = this;
            while (o.container) {
                o = o.container;
                var sx = o.scrollx;
                var sy = o.scrolly;
                if(sx == undefined) sx = 0;
                if(sy == undefined) sy = 0;
                c.x += o.x - sx;
                c.y += o.y - sy;
            }
            return (c);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Show = function () {
            this.isActive = true;
            Lilo.Internal.ApplyParamRecursive(this, { isVisible: true });
            if(this.init)
                this.init();
        }

        this.Hide = function () {
            Lilo.Internal.ApplyParamRecursive(this, { isVisible: false });
            if(this.modal) Lilo.Engine.modalControl = null;
            if(this.init)
                this.init();            
        }

        this.Close = function () {
            this.isActive = false;
            this.Hide();
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.ZoomIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var zoomID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "scale", value: delta });
                if (obj.scale == 1) {
                    clearInterval(zoomID);
                    obj.Show();
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.ZoomOut = function (duration) {
            var obj = this;
            obj.oldscale = obj.scale;
            var delta = (0 - obj.scale) / (duration * Lilo.Engine.FPS);
            var zoomID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "scale", value: delta });
                if (obj.scale == 0) {
                    obj.Hide();
                    clearInterval(zoomID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.GetContentDimensions = function () {
            return (Lilo.Internal.GetDimensionsRecursive(this));
        }
		
        this.Add = function (ctrl) {
           ctrl.container = this;
            this.controls.push(ctrl);
            this.controls.sort(function (a, b) {
                return (a.zorder-b.zorder);
            });
            var c = [];
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].isVisible) continue;
                c.push(this.controls[i]);
                c = c.concat(this.controls[i].GetControls());
            }
            this.cachedcontrols = c;
        }

        this.GetControls = function () {
            return (this.controls);
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.GetHitList = function( ctrl, results ) {
            var c = ctrl.GetControls();
            for(var i=0;i<c.length;i++)
            {
                if (!c[i].isVisible || !c[i].isActive) continue;
                if(c[i].CheckBounds && c[i].CheckBounds())
                {
                    var inModalGroup = Lilo.Internal.InModalGroup( Lilo.Engine.modalControl, c[i] );
                    if( inModalGroup )
                    {
                        results.push( c[i] );
                        this.GetHitList( c[i], results );
                    }
                }
            }
        }

        this.Update = function (ctx) {
            
            this.ctx = ctx;

            if (this.styleLogic != null) {
                this.styleLogic();
            }

            if (this.animate)
                this.animate();
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].Update(ctx);
            }
        }

        this.UpdateAsView = function (ctx)
        {
            if (Lilo.Engine.activeCtrl != null)
            {
                if (Lilo.Engine.activeCtrl.wheel && Lilo.Engine.wheelDelta != 0) {
                    Lilo.Engine.activeCtrl.wheel(Lilo.Engine.wheelDelta);
                    Lilo.Engine.wheelChanged = false;
                }
                
                if (Lilo.Engine.activeCtrl.pinch && Lilo.Engine.pinchScaling) {
                    Lilo.Engine.activeCtrl.pinch(Lilo.Engine.pinchMag);
                }

                if (Lilo.Engine.mouseButtons[0] == 1 && !Lilo.Engine.activeCtrl.isPointerDown) {
                    if (Lilo.Engine.activeCtrl.pointerdown) Lilo.Engine.activeCtrl.pointerdown();
                    Lilo.Engine.activeCtrl.isPointerDown = true;
                }
                
                if (Lilo.Engine.mouseDrag && Lilo.Engine.activeCtrl.isPointerDown)
                {
                    if (Lilo.Engine.activeCtrl.drag) Lilo.Engine.activeCtrl.drag();
                }
                
                if (Lilo.Engine.mouseButtons[0] == 0) {
                    if (Lilo.Engine.activeCtrl.pointerup) Lilo.Engine.activeCtrl.pointerup();
                    Lilo.Engine.activeCtrl.isPointerDown = false;
                    Lilo.Engine.activeCtrl = null;
                }
                return;
            }

            var hitCtrls = [];
            this.GetHitList(this, hitCtrls);

            if (hitCtrls.length > 0)
            {

                hitCtrls.sort(function (a, b) {
                    return (b.zorder-a.zorder);
                });

                var ctrlToSignal = hitCtrls[0];

                if (Lilo.Engine.mouseDrag) {
                    if (Lilo.Engine.activeCtrl == null) {
                        Lilo.Engine.activeCtrl = ctrlToSignal;
                        return;
                    }
                }

                if (Lilo.Engine.target == Lilo.DESKTOP) {
                    for (var i = 0; i < Lilo.Engine.keyStates.length; i++) {
                        if (Lilo.Engine.keyStates[i] == 1 && ctrlToSignal.keydown)
                            ctrlToSignal.keydown(i);
                    }
                }

                // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal && (Lilo.Engine.mouseButtons[0] == 1 || Lilo.Engine.mouseButtons[2] == 1)) {
                    if (!Lilo.Engine.kybdFocusCtrl.edited || Lilo.Engine.kybdFocusCtrl.text.length == 0) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                    Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                    Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                    Lilo.Engine.kybdFocusCtrl = null;
                }
                else if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl.text == Lilo.Engine.kybdFocusCtrl.defaultValue && (Lilo.Engine.mouseButtons[0] == 1 || Lilo.Engine.mouseButtons[2] == 1))
                {
                    Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                    Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                    Lilo.Engine.kybdFocusCtrl.text = "";                    
                }

                if (ctrlToSignal.wheel && Lilo.Engine.wheelDelta != 0) {
                    ctrlToSignal.wheel(Lilo.Engine.wheelDelta);
                }
                /* Process hover, but only for desktop it makes no sense on mobile */
                if (!ctrlToSignal.hasHover && Lilo.Engine.target != Lilo.MOBILE) {
                    if(ctrlToSignal.hover) ctrlToSignal.hover();
                    ctrlToSignal.hasHover = true;
                }
                if (ctrlToSignal.doubleclick && Lilo.Engine.mouseDoubleClick) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.clickstage = 0;
                    Lilo.Engine.mouseButtons[0] = 0;
                    Lilo.Engine.mouseDoubleClick = false;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl = null;
                    }
                    ctrlToSignal.doubleclick();
                }
                if (ctrlToSignal.click && Lilo.Engine.mouseButtons[0] == 1 && ctrlToSignal.clickstage == 0) {
                    ctrlToSignal.clickstage = 1;
                }
                if (ctrlToSignal.click && Lilo.Engine.mouseButtons[0] == 0 && ctrlToSignal.clickstage == 1) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.clickstage = 0;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                    }
                    var dx = Math.abs(Lilo.Engine.mouseX - Lilo.Engine.MouseDownX);
                    var dy = Math.abs(Lilo.Engine.mouseY - Lilo.Engine.MouseDownY);
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if(d < 30)
                        ctrlToSignal.click();
                }
                if (ctrlToSignal.rightclick && Lilo.Engine.mouseButtons[2] == 1 && ctrlToSignal.rclickstage == 0) {
                    ctrlToSignal.rclickstage = 1;
                }
                if (ctrlToSignal.rightclick && Lilo.Engine.mouseButtons[2] == 0 && ctrlToSignal.rclickstage == 1) {
                    ctrlToSignal.rclickstage = 0;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                    }
                    ctrlToSignal.rightclick();
                }
                if (!ctrlToSignal.isPointerDown && ctrlToSignal.hasHover && Lilo.Engine.mouseButtons[0] == 1) {
                    this.ClearFocus();
                    ctrlToSignal.hasFocus = true;
                    ctrlToSignal.isPointerDown = true;
                    if(Lilo.Engine.activeCtrl == null) Lilo.Engine.activeCtrl = ctrlToSignal;
                    // If the activated control is not the one with current keyboard focus, reset keyboard global focus.
                    if (Lilo.Engine.kybdFocusCtrl != null && Lilo.Engine.kybdFocusCtrl != ctrlToSignal) {
                        if (!Lilo.Engine.kybdFocusCtrl.edited) Lilo.Engine.kybdFocusCtrl.text = Lilo.Engine.kybdFocusCtrl.defaultValue;
                        Lilo.Engine.kybdFocusCtrl.selectEnd = 0;
                        Lilo.Engine.kybdFocusCtrl.selectStart = 0;
                        Lilo.Engine.kybdFocusCtrl = null;
                    }
                    if (ctrlToSignal.pointerdown) ctrlToSignal.pointerdown();
                }
                if (ctrlToSignal.isPointerDown && Lilo.Engine.mouseButtons[0] == 0) {
                    ctrlToSignal.isPointerDown = false;
                    ctrlToSignal.clickstage = 0;
                    if (ctrlToSignal.pointerup) ctrlToSignal.pointerup();
                }
            }
        }

        this.pointerdown = function () {
            this.ofsx = Lilo.Engine.GetPointer().x - this.x;
            this.ofsy = Lilo.Engine.GetPointer().y - this.y;
        }

        this.click = function ()
        {
            if (this.hasclose) {
                var pointer = Lilo.Engine.GetPointer();
                var abscoords = this.GetAbsoluteCoords();
                if (pointer.x > abscoords.x+this.width-this.headerheight && pointer.y > abscoords.y && pointer.x < abscoords.x + this.width && pointer.y < abscoords.y + this.headerheight) {
                    if (this.onclose)
                        this.onclose();
                    this.Close();
                }
            }
        }

        this.drag = function ()
        {
            if (this.position == Lilo.POSITION_ABSOLUTE) {
                this.x = Lilo.Engine.GetPointer().x - this.ofsx;
                this.y = Lilo.Engine.GetPointer().y - this.ofsy;
            }
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {

            Lilo.Engine.SaveState();
            var dx = (1 - this.scale) * (this.x + (this.width / 2));
            var dy = (1 - this.scale) * (this.y + (this.height / 2));
            //ctx.translate(dx, dy);
            //ctx.scale(this.scale, this.scale);

            var fillstyle = this.background;
            var i = fillstyle.lastIndexOf(",");
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
            }
            ctx.fillStyle = fillstyle;

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
 
            if (this.radius == 0) {
                if (this.stroke) {
                    ctx.lineWidth = this.strokewidth;
                    ctx.strokeStyle = this.strokecolor;
                    ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                }
            }
            else {
                if (this.stroke) {
                    ctx.lineWidth = this.strokewidth;
                    ctx.strokeStyle = this.strokecolor;
                    Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, false, this.stroke);
                }
            }

           if(this.shadow)
            {
                ctx.shadowColor = '#222';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 10;
                ctx.shadowOffsetY = 10;
            }

            if (this.radius == 0)
                ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);

            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            if (this.clipped) {
               // Lilo.Engine.SetClip(-(this.width / 2), -(this.height / 2), this.width, this.height);
            }

            // Window header area
            /*if (this.hasheader) {
                ctx.fillStyle = this.headercolor;
                if (this.radius == 0)
                    ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.headerheight);
                else
                    Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.headerheight, this.radius, true, false);
                
                fillstyle = this.foreground;
                i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
                ctx.fillStyle = fillstyle;

                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }
                ctx.textAlign = 'left';

                var textwidth = ctx.measureText(this.title).width;
                ctx.fillText(this.title, -(textwidth / 2), -(this.height / 2) + (this.headerheight / 2) + (this.fontSize / 2));

                if (this.hasclose) {
                    ctx.fillStyle = "rgba(40,40,40,1.0)";
                    ctx.fillRect((this.width / 2) - this.headerheight, -(this.height / 2), this.headerheight, this.headerheight);
                    ctx.strokeStyle = "rgba(0,0,0,1.0)";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo((this.width / 2) - this.headerheight+5, -(this.height / 2)+5);
                    ctx.lineTo((this.width / 2)-5, -(this.height / 2) + this.headerheight-5);
                    ctx.moveTo((this.width / 2)-5, -(this.height / 2)+5);
                    ctx.lineTo((this.width / 2) - this.headerheight+5, -(this.height / 2) + this.headerheight-5);
                    ctx.stroke();
                }
            }*/

            var controlsinview = 0;
            ctx.translate(-(this.x + (this.width / 2)), -(this.y + (this.height / 2)));
            for (var i = 0; i < this.controls.length; i++) {
                if(this.controls[i].isVisible)
                {
                    controlsinview++;
                    this.controls[i].Render(ctx);
                }
            }
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Slider
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Slider = function (id, params) {

        //-------------------------
        // Slider specific.
        //-------------------------
        this.value = 0;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            var points = {container:this.container,position:this.position,width:32,height:this.height,rotation:this.rotation,x:this.x+(this.value*(this.width-32)),y:this.y}; // use a custom object as this control only responds to events on the grip.
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(points), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.drag = function () {
            var coords = Lilo.Engine.GetPointer();
            var points = { container: this.container, position: this.position, width: this.width-32, height: this.height/4, rotation: this.rotation, x: this.x+16, y: this.y+(this.height/2) }; // use a custom object as this control only responds to events on the grip.
            var absx = Lilo.Internal.GetAbsCoords(points).x;
            var absy = Lilo.Internal.GetAbsCoords(points).y;
            if (coords.x < absx) coords.x = absx;
            var sliderVec = new Lilo.Vector2(absx+(this.width-32)-absx, 0);
            var dragVec = new Lilo.Vector2(coords.x - absx, coords.y - absy);
            var dvec = dragVec.Project(sliderVec);
            this.value = dvec.Magnitude() / sliderVec.Magnitude();
            if (this.value < 0) this.value = 0;
            if (this.value > 1) this.value = 1;
        }

        this.Show = function () {
            this.isVisible = true;
            this.isActive = true;
        }

        this.Hide = function () {
            this.isVisible = false;
            this.isActive = false;
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            var fillstyle = this.background;
            if (this.gradient != null) {
                // Create gradient
                grd = ctx.createLinearGradient(0, 0, 0, this.height);
                for (var i = 0; i < this.gradient.length; i++) {
                    grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                }
                fillstyle = grd;
            }
            else {
                var i = fillstyle.lastIndexOf(",");
                if (i != -1) {
                    fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                }
            }
            ctx.fillStyle = fillstyle;
            ctx.fillRect(-(this.width / 2)+16, -(this.height/8), this.width-32, (this.height/4));

            ctx.fillStyle = this.foreground;
            if (this.radius == 0)
                ctx.fillRect(-(this.width / 2)+((this.width-32)*this.value), -(this.height / 2), 32, this.height);
            else
                Lilo.Internal.roundRect(ctx, -(this.width / 2)+((this.width-32)*this.value), -(this.height / 2), 32, this.height, this.radius, true, false);

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Group
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Group = function (id, text, params) {
        //-------------------------
        // Group specific.
        //-------------------------
        this.text = text;
        this.metrics = null;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {
            //ctx.save();
            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            ctx.strokeStyle = this.foreground;
            ctx.lineWidth = 3;
            if (this.radius == 0) {
                ctx.beginPath();
                ctx.rect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                ctx.stroke();
            }
            else {
                Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius);
            }

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.RowSet
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.RowSet = function (id, params) {

        //-------------------------
        // RowSet specific.
        //-------------------------
        this.rows = [];
        this.rowHeight = 0;
        this.rowacolor = "rgba(255,0,0,1.0)";
        this.rowbcolor = "rgtba(0,255,0,1.0)";

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Bind = function (rowdata) {
            this.rows = rowdata;
        }

        this.click = function () {

            // Determine which row has been clicked.
            var x = Lilo.Engine.mouseX - Lilo.Internal.GetAbsCoords(this).x;
            var y = Lilo.Engine.mouseY - Lilo.Internal.GetAbsCoords(this).y;
            var rowy = 0;
            var rowid = 0;
            for (var i = 0; i < this.rows.length; i++)
            {
                if (y >= rowy && y <= rowy + this.rowHeight) break;
                rowid++;
                rowy += this.rowHeight;
            }

            // Determine which field in the row is clicked.
            var rowx = 0;
            var fieldid = 0;
            for (var i = 0; i < this.rows[rowid].fields.length; i++) {
                var fieldwidth = this.rows[rowid].fields[i].width;
                if (this.rows[rowid].fields[i].units == Lilo.PERCENT)
                    fieldwidth = (fieldwidth*0.01) * this.container.width;
                if (x >= rowx && x <= rowx + fieldwidth) break;
                fieldid++;
                rowx += fieldwidth;
            }

            // Call the field's handler with row-id.
            if (this.rows[rowid].fields[fieldid].onclick)
                this.rows[rowid].fields[fieldid].onclick(rowid);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.drag = function () {
            Lilo.Engine.RelayEvent(this.container, "drag");
        }

        this.Render = function (ctx) {

            Lilo.Engine.SaveState();
            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;

            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
            }
            ctx.fillStyle = fillstyle;

            if (this.font != "") {
                ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
            }
            ctx.textAlign = 'left';

            var rowY = 0;
            var totalHeight = 0;
            for (var i = 0; i < this.rows.length; i++)
            {
                if(rowY <= this.container.height+this.container.scrolly) 
                {
                    var rowX = 0;
                    ctx.fillStyle = ((i % 2 == 0) ? this.rowacolor : this.rowbcolor);
                    ctx.fillRect(-(this.width / 2), -(this.height / 2)+(i*this.rowHeight), this.width, this.rowHeight);
                    ctx.fillStyle = this.foreground;

                    for (var j = 0; j < this.rows[i].fields.length; j++)
                    {
                        if (this.rows[i].fields[j].type == "text")
                        {
                            var textimg = Lilo.Engine.RenderText(this.rows[i].fields[j].value, (this.fontWeight + " " + this.fontSize + "px " + this.fontFace), this.fontSize, this.foreground);
                            ctx.drawImage( textimg, rowX - (this.width/2), -20 + rowY - (this.height/2) + (this.rowHeight/2) + (this.fontSize/2), textimg.width, textimg.height );

                            //ctx.fillText(this.rows[i].fields[j].value, rowX - (this.width/2), rowY - (this.height/2) + (this.rowHeight/2) + (this.fontSize/2));
                            var textwidth = 0;//ctx.measureText(this.rows[i].fields[j].value).width;
                            var fieldwidth = this.rows[i].fields[j].width;
                            if (this.rows[i].fields[j].units == Lilo.PERCENT)
                                fieldwidth = (fieldwidth * 0.01) * this.width;
                            rowX += ((textwidth > fieldwidth) ? textwidth : fieldwidth);
                        }
                        else if (this.rows[i].fields[j].type == "image" && this.rows[i].fields[j].image != null)
                        {
                            var img = this.rows[i].fields[j].image;
                            var fieldwidth = this.rows[i].fields[j].width;
                            if (this.rows[i].fields[j].units == Lilo.PERCENT)
                                fieldwidth = (fieldwidth * 0.01) * this.width;
                            ctx.drawImage(img._img, (rowX - (this.width / 2)) + (fieldwidth/2)-(img.width/2), (rowY - (this.height / 2)) + (this.rowHeight/2)-(img.height/2), img.width, img.height);
                            rowX += ((img.width > fieldwidth) ? img.width : fieldwidth);
                        }

                        /*ctx.lineWidth = 1;
                        ctx.strokeStyle = "rgba(0,0,0,1.0)";
                        ctx.beginPath();
                        ctx.moveTo((rowX - (this.width / 2)-0.5), rowY - (this.height / 2));
                        ctx.lineTo((rowX - (this.width / 2)-0.5), rowY + this.rowHeight - (this.height / 2));
                        ctx.stroke();*/

                    }
                }

                totalHeight += this.rowHeight;
                rowY += this.rowHeight;
            }
            this.height = totalHeight;

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Lilo.Select
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Select = function ( id, params ) {
   
        // Select specific.
        this.items = [];
        this.controls = [];
        this.cachedcontrols = [];
        this.selectedId = -1;
        this.showSelected = false;
        this.sortMode = false;
        this.dividerheight = 0;
        this.dividercolor = null;
        this.itemcolor = "rgba(0,0,0,1.0)";
        this.hasArrow = false;
        this.arrowcolor = "";


        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.scrollx = 0;
        this.scrolly = 0;
        this.maxscrollx = 0;
        this.velocityx = 0;
        this.velocityy = 0;
        this.accelerationx = 0;
        this.accelerationy = 0;
        this.oldsignx = 0;
        this.oldsigny = 0;
        this.signx = 0;
        this.signy = 0;
        this.touchPan = false;
        this.horiz_scroll = true;
        this.vert_scroll = true;
        this.scrollhandler = null;
        this.dragdir = 0;
        this.stroke = false; 
        this.strokewidth = 1;
        this.strokecolor = "rgba(0,0,0,1.0)";
        this.hideoverflow = false;
        this.itemX = 1;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.init = null;

        if (params)
        {
            Lilo.Internal.ApplyParams(this, params);
            this.items = params.items;
            if (this.init)
            {
                this.init();
            }
        }

        this.SetItemText = function( index, text )
        {
            this.items[ index ].text = text;
            this.items[ index ].lblCtrl.SetText( text );
        }

        this.Clear = function()
        {
            this.selectedId = -1;
            this.items = [];
            this.controls = [];
            this.cachedcontrols = [];
        }

        this.RemoveItem = function( id )
        {
            if( this.items.length > 1 && id < this.items.length )
            {
                var ctrl = this.items[id].lblCtrl;
                for(var i=0;i<this.controls.length;i++)
                {
                    if(this.controls[i] == ctrl) {
                        this.controls.splice( i, 1 );
                        break;
                    }
                }
                this.items.splice( id, 1 );
                this.cachedcontrols = [];

                //this.selectedId++;
                if(this.selectedId >= this.items.length) this.selectedId = this.items.length - 1;
            }
        }

        this.AddItem = function( itemText, itemValue ) {
            var obj = this;
            this.items.push( { selected : false, text : itemText, value: itemValue, lblCtrl: null } );
            var i = this.items.length - 1;
            var lbl = new Lilo.Label("itemlbl"+i, itemText, {
                x: this.itemX, y: (i*(this.itemheight))+(i*this.dividerheight), z: 12, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0, textAlign: 'left', 
                background: this.itemcolor, foreground: this.foreground, fontFace: this.fontFace, fontSize: this.fontSize,fontWeight:this.fontWeight,
                width: 200, height: this.itemheight, refObj : { pos: i }, gradient: this.gradient, imageCache: true,
                style: function () {
                    this.width = this.container.width-this.container.itemX;
                    this.zorder = this.container.zorder + 1;
                },
                drag : function () {
                    Lilo.Engine.RelayEvent( this.container, "drag" );
                },
                onclick : function () {
                    if(!this.container.sortMode)
                    {
                        this.container.selectedId = this.refObj.pos;
                        
                        for(var i=0;i<this.container.items.length;i++)
                        {
                            this.container.controls[i].gradient = obj.gradient;
                        }

                        if (this.container.items[this.refObj.pos])
                        {
                            this.container.items[this.refObj.pos].selected = true;
                            if(this.container.click != null) this.container.click();
                            if(this.container.selectedGradient) this.gradient = this.container.selectedGradient;
                        }
                        else
                            this.gradient = this.container.gradient;

                        if(this.container.userclick != null) this.container.userclick();
                    }
                }
            });
            this.Add( lbl );
            this.items[ this.items.length-1 ].lblCtrl = lbl;
        },

        this.AddItems = function (itemList) {
            if (itemList && itemList.length && itemList.length > 0) {
                for (var i = 0; i < itemList.length; i++) {
                    this.AddItem(itemList[i].text, itemList[i].value);
                }
            }
        },

        this.AddItemFirst = function( itemText, itemValue ) {
            var obj = this;
            var maxval = 0;
            for(var i=0;i<this.items.length;i++)
            {
                this.controls[i].refObj.pos++;
                this.controls[i].y += this.itemheight+1;
                if ( this.items[i].value > maxval )
                    maxval = this.items[i].value;
            }
            
            if(this.selectedId != -1) this.selectedId++;
            
            if(this.items.length == 1)
                this.items[0].selected = true;

            var i = this.items.length;
            var lbl = new Lilo.Label("itemlbl"+i, itemText, {
                x: this.itemX, y: 0, z: 12, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0, textAlign: 'left',
                background: this.itemcolor, foreground: this.foreground, fontFace: this.fontFace, fontSize: this.fontSize,fontWeight:this.fontWeight,
                width: 200, height: this.itemheight, refObj : { pos:0 }, gradient: this.gradient, imageCache: true,
                style: function () {
                    this.width = this.container.width-this.container.itemX;
                    this.zorder = this.container.zorder + 1;
                },
                drag : function () {
                    Lilo.Engine.RelayEvent( this.container, "drag" );
                },
                onclick : function () {
                   if(!this.container.sortMode)
                    {
                        this.container.selectedId = this.refObj.pos;
                        
                        for(var i=0;i<this.container.items.length;i++)
                        {
                            this.container.controls[i].gradient = obj.gradient;
                        }

                        if (this.container.items[this.refObj.pos])
                        {
                            this.container.items[this.refObj.pos].selected = true;
                            if(this.container.click != null) this.container.click();
                            if(this.container.selectedGradient) this.gradient = this.container.selectedGradient;
                        }
                        else
                            this.gradient = this.container.gradient;

                        if(this.container.userclick != null) this.container.userclick();
                    }
                }
            });
            this.items.splice(0,0, { selected : false, text : itemText, value: itemValue, lblCtrl: lbl } );
            this.Add( lbl );
        },

        this.AccelDrag = function () {
            this.dragdir = (Math.abs(Lilo.Engine.mouseDragX) > Math.abs(Lilo.Engine.mouseDragY)) ? 1 : 0;
            var dragx = Lilo.Engine.GetDragDelta().x;
            var dragy = Lilo.Engine.GetDragDelta().y;
            this.signx = (dragx < 0) ? -1 : 1;
            this.signy = (dragy < 0) ? -1 : 1;
            if (this.signx != this.oldsignx) { this.accelerationx = 0; this.velocityx = 0; }
            if (this.signy != this.oldsigny) { this.accelerationy = 0; this.velocityy = 0; }
            if (this.dragdir == 1) this.accelerationx += dragx * 0.008 * (this.width / Lilo.SCREEN_WIDTH) * 0.4;
            if (this.dragdir == 0) this.accelerationy += dragy * 0.008 * (this.height / Lilo.SCREEN_HEIGHT) * 0.4;
            if (this.dragdir == 1) this.velocityx += this.accelerationx;
            if (this.dragdir == 0) this.velocityy += this.accelerationy;
            this.oldsignx = this.signx;
            this.oldsigny = this.signy;
        },

        this.ApplyAccelPan = function () {
            if (!Lilo.Engine.mouseDrag) {
                var maxx = this.GetContentDimensions().maxx;
                var maxy = this.GetContentDimensions().maxy;
                if (maxx >= this.width) this.maxscrollx = maxx - this.width;
                else this.maxscrollx = 0;
                if (maxy >= this.height) this.maxscrolly = maxy - this.height;
                else this.maxscrolly = 0;
                for (var i = 0; i < this.controls.length; i++) {
                    if (this.controls[i].position != Lilo.POSITION_RELATIVE) continue;

                    var d = Math.abs(this.controls[i].x - this.scrollx);
                    if (d < 2) 
                    {
                        this.velocityx *= 0.0;
                        this.accelerationx *= 0.0;
                        this.scrollx = this.controls[i].x;
                    }
                    var d = Math.abs(this.controls[i].y - this.scrolly);
                    if (d < 2) 
                    {
                        this.velocityy *= 0.0;
                        this.accelerationy *= 0.0;
                        this.scrolly = this.controls[i].y;
                    }
                }
            }
            this.scrollx -= this.velocityx;
            this.scrolly -= this.velocityy;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
            this.velocityy *= 0.98;
            this.velocityx *= 0.98;
        },

        this.GetAbsoluteCoords = function () {
            var c = { x: this.x, y: this.y };
            if (this.position == Lilo.POSITION_ABSOLUTE)
                return (c);
            var o = this;
            while (o.container) {
                o = o.container;
                var sx = o.scrollx;
                var sy = o.scrolly;
                if(sx == undefined) sx = 0;
                if(sy == undefined) sy = 0;
                c.x += o.x - sx;
                c.y += o.y - sy;
            }
            return (c);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Show = function () {
            Lilo.Internal.ApplyParamsRecursive(this, { isVisible: true });
        }

        this.Hide = function () {
            Lilo.Internal.ApplyParamsRecursive(this, { isVisible: false });
        }

        this.SetScroll = function (x, y) {
            this.scrollx = x;
            this.scrolly = y;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
        }

        this.ScrollTo = function (x, y, d) {
            var deltaX = (x - this.scrollx) / (d * Lilo.Engine.FPS);
            var deltaY = (y - this.scrolly) / (d * Lilo.Engine.FPS);
            var obj = this;
            var sx = x;
            var sy = y;
            if (sx < 0) sx = 0;
            if (sy < 0) sy = 0;
            if (sx > this.maxscrollx) sx = this.maxscrollx;
            if (sy > this.maxscrolly) sy = this.maxscrolly;
            if (obj.scrollhandler != null) obj.scrollhandler = null;
            if (obj.scrollhandler == null) {
                obj.scrollhandler = function () {
                    this.scrollx += deltaX;
                    this.scrolly += deltaY;
                    if (Math.abs(this.scrollx - sx) <= Math.abs(2 * deltaX))
                        this.scrollx = sx;
                    if (Math.abs(this.scrolly - sy) <= Math.abs(2 * deltaY))
                        this.scrolly = sy;
                    if (this.scrollx == sx && this.scrolly == sy)
                        this.scrollhandler = null;
                };
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value:delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000/Lilo.Engine.FPS));
        }

        this.GetContentDimensions = function () {
            return (Lilo.Internal.GetDimensionsRecursive(this));
        }

        this.Add = function (ctrl) {
            ctrl.container = this;
            this.controls.push(ctrl);
            this.controls.sort(function (a, b) {
                return (a.zorder-b.zorder);
            });
            var c = [];
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].isVisible) continue;
                c.push(this.controls[i]);
                c = c.concat(this.controls[i].GetControls());
            }
            this.cachedcontrols = c;
        }

        this.GetControls = function () {
            return (this.cachedcontrols);
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null && this.styleLogic != undefined) {
                this.styleLogic();
            }

            if (this.touchPan) {
                if (Lilo.Engine.mouseDrag && Lilo.Engine.activeCtrl == this) this.AccelDrag();
                this.ApplyAccelPan();
            }

            if (this.animate)
                this.animate();
            for (var i = 0; i < this.controls.length; i++) {
                this.controls[i].Update(ctx);
            }

            if (this.scrollhandler)
                this.scrollhandler();
      }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.SetSortMode = function() {
            for(var i=0;i<this.controls.length;i++)
            {
                this.controls[i].dragGrip = true;
            }
            this.sortMode = true;
        }

        this.SetViewMode = function() {
            for(var i=0;i<this.controls.length;i++)
            {
                this.controls[i].dragGrip = false;
            }      
            this.sortMode = false;      
        }

        this.SelectId = function( id ) {
            for(var i=0;i<this.items.length;i++)
                this.controls[i].gradient = this.gradient;
            this.selectedId = id;
            this.items[id].selected = true;
            if(this.selectedGradient) this.controls[id].gradient = this.selectedGradient;                   
        }

        this.Render = function (ctx) {
            Lilo.Engine.SaveState();

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            if(!this.transparent)
            {
                if (this.radius == 0) {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                    }
                }
                else {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, false, this.stroke);
                    }
                }

                var fillstyle = this.container.background;
                
                if (this.gradient != null) {
                    ctx.globalAlpha = this.opacity;
                    // Create gradient
                    grd = ctx.createLinearGradient(0, 0, 0, this.height);
                    for (var i = 0; i < this.gradient.length; i++) {
                        grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                    }
                    fillstyle = grd;
                }
                else {
                    var i = fillstyle.lastIndexOf(",");
                    if (i != -1) {
                        fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                    }
                }
				
				if( this.IsFloorList != null )
					fillstyle="rgba(255,255,255,1.0)";
				
                ctx.fillStyle = fillstyle;
				
                if(this.shadow)
                {
                    ctx.shadowColor = '#333';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 5;
                }

                if (this.radius == 0) {
                    ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                }
                else {
                    Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);
                }
            }
			
            if (this.hideoverflow)
                Lilo.Engine.SetClip(-(this.width / 2), -(this.height / 2), this.width, this.height);

            Lilo.Engine.SaveState();
            var controlsinview = 0;
            ctx.translate(-(this.x + (this.width / 2)) - this.scrollx + 15, -(this.y + (this.height / 2)) - this.scrolly);
            for (var i = 0; i < this.controls.length; i++)
            {
                if (this.controls[i].isVisible) {
                    controlsinview++;
                    this.controls[i].Render(ctx);
                }
            }
            for (var i = 0; i < this.controls.length-1; i++)
            {
                if (this.controls[i].isVisible) {
                    ctx.fillStyle = this.dividercolor;
                    ctx.fillRect( this.itemX, (i+1)*this.itemheight+this.y, this.width, 2);
                }
            }
            Lilo.Engine.RestoreState();

            if(this.showSelected && this.selectedId > -1)
            {
                var cx = -(this.width/2) + 10;
                var cy = -(this.height/2) + (this.selectedId * this.itemheight) + (this.itemheight/2);
                ctx.beginPath();
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 7;
                ctx.moveTo(cx,cy);
                ctx.lineTo(cx+10,cy+15);
                ctx.lineTo(cx+30,cy-15);
                ctx.stroke();
            }

            // Show content scrolling tips.
            if (this.touchPan && this.scroll_tips)
            {
                var dim = this.GetContentDimensions();
                // right scroll tip
                if (this.scrollx + this.width < dim.maxx && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect((this.width / 2) - 50, -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo((this.width / 2) - 50 + 15, -15);
                    ctx.lineTo((this.width / 2) - 50 + 35, 0);
                    ctx.lineTo((this.width / 2) - 50 + 15, 15);
                    ctx.fill();
                }
                // left scroll tip
                if (this.scrollx > 0 && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-(this.width / 2), -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-(this.width / 2) + 35, -15);
                    ctx.lineTo(-(this.width / 2) + 15, 0);
                    ctx.lineTo(-(this.width / 2) + 35, 15);
                    ctx.fill();
                }
                // top scroll tip
                if (this.scrolly > 0 && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, -(this.height/2), 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,-(this.height / 2) + 30);
                    ctx.lineTo(0,-(this.height / 2) + 10);
                    ctx.lineTo(15,-(this.height / 2) + 30);
                    ctx.fill();
                }
                // bottom scroll tip
                if (this.scrolly + this.height < dim.maxy && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, (this.height / 2)-40, 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,(this.height / 2) - 30);
                    ctx.lineTo(0,(this.height / 2) - 10);
                    ctx.lineTo(15,(this.height / 2) - 30);
                    ctx.fill();
                }
            }

            //ctx.restore();
            Lilo.Engine.RestoreState();
        }

        /* Build-up Label controls for each item in [] */
        for(var i=0;i<this.items.length;i++)
        {
            var lbl = new Lilo.Label("itemlbl"+i, this.items[i].text, {
                x: this.itemX, y: (i*(this.itemheight))+(i*this.dividerheight), z: 11, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0,  textAlign: 'left',
                background: this.itemcolor, foreground: this.foreground, fontFace: this.fontFace, fontSize: this.fontSize,fontWeight:this.fontWeight,
                width: 200, height: this.itemheight, refObj : { pos:i }, gradient: this.gradient, imageCache: true, 
                style: function () {
                    this.width = this.container.width-this.container.itemX;
                    this.z = this.container.z + 1;
                },
                drag : function () {
                    if(this.container.sortMode)
                    {
                        var pt = Lilo.Engine.GetPointer();
                        if( this.container.CheckBounds() )
                        {
                            var y = (((pt.y - Lilo.Internal.GetAbsCoords( this.container ).y) / this.container.itemheight)|0);
                        }
                    }
                    else
                        Lilo.Engine.RelayEvent( this.container, "drag" );
                },
                onclick : function () {
                    if(!this.container.sortMode)
                    {
                        this.container.selectedId = this.refObj.pos;

                        for(var i=0;i<this.container.items.length;i++)
                        {
                            this.container.controls[i].gradient = this.gradient;
                        }

                        if (this.container.items[this.refObj.pos] && this.container.selectedId > -1)
                        {
                            this.container.items[this.refObj.pos].selected = true;
                            if(this.container.selectedGradient) this.gradient = this.container.selectedGradient;
                        }
                        else
                            this.gradient = this.container.gradient;

                        if(this.container.userclick != null) this.container.userclick();
                    }
                }
            });
            this.items[i].lblCtrl = lbl;

            if (this.hasArrow) {
                this.items[i].lblCtrl.baseRender = this.items[i].lblCtrl.Render;
                this.items[i].lblCtrl.Render = function (ctx) {
                    this.baseRender(ctx);

                    Lilo.Engine.SaveState();
                    ctx.strokeStyle = this.container.arrowcolor;
                    ctx.lineWidth = 3;
                    var cy = this.y + 10;
                    ctx.beginPath();
                    ctx.moveTo((this.width - this.height * 0.4) - 25, cy + this.height * 0.1);
                    ctx.lineTo((this.width - (this.height * 0.4) / 2) - 25, cy + this.height * 0.3);
                    ctx.lineTo((this.width - this.height * 0.4) - 25, cy + this.height * 0.5);
                    ctx.stroke();

                    Lilo.Engine.RestoreState();
                }
            }
            

            this.Add( lbl );
            
            if( this.items[i].selected ) 
                this.selectedId = i;
        }
        this.touchPan = true;
        this.vert_scroll = true;
        this.clipped = true;
        this.hideoverflow = true;
        this.scroll_tips = false;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Lilo.SlideMenu
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.SlideMenu = function (id,title, params) {
   
        // SlideMenu specific.
        this.menuitems = [];
        this.controls = [];
        this.cachedcontrols = [];
        this.sortMode = false;
        this.title = title;
        this.headercolor = "";
        this.hasheader = true;
        this.headerheight = 0;
        this.dividercolor = "rgba(0,0,0,1.0)";
        this.dividerheight = 0;
        this.itemX = 0;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.scrollx = 0;
        this.scrolly = 0;
        this.maxscrollx = 0;
        this.velocityx = 0;
        this.velocityy = 0;
        this.accelerationx = 0;
        this.accelerationy = 0;
        this.oldsignx = 0;
        this.oldsigny = 0;
        this.signx = 0;
        this.signy = 0;
        this.touchPan = false;
        this.horiz_scroll = true;
        this.vert_scroll = true;
        this.scrollhandler = null;
        this.dragdir = 0;
        this.stroke = false; 
        this.strokewidth = 1;
        this.strokecolor = "rgba(0,0,0,1.0)";
        this.hideoverflow = false;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.init = null;
        this.onSelect = null;

        if (params)
        {
            Lilo.Internal.ApplyParams(this, params);
            if (this.init)
            {
                this.init();
            }

            this.menuitems = params.menuitems;

        }

        this.AddMenuItem = function( itemText, childPanel ) {
            this.menuitems.push( { divider: false, text : itemText, control: childPanel } );
        }

        this.AccelDrag = function () {
            this.dragdir = (Math.abs(Lilo.Engine.mouseDragX) > Math.abs(Lilo.Engine.mouseDragY)) ? 1 : 0;
            var dragx = Lilo.Engine.GetDragDelta().x;
            var dragy = Lilo.Engine.GetDragDelta().y;
            this.signx = (dragx < 0) ? -1 : 1;
            this.signy = (dragy < 0) ? -1 : 1;
            if (this.signx != this.oldsignx) { this.accelerationx = 0; this.velocityx = 0; }
            if (this.signy != this.oldsigny) { this.accelerationy = 0; this.velocityy = 0; }
            if (this.dragdir == 1) this.accelerationx += dragx * 0.008;
            if (this.dragdir == 0) this.accelerationy += dragy * 0.008;
            if (this.dragdir == 1) this.velocityx += this.accelerationx;
            if (this.dragdir == 0) this.velocityy += this.accelerationy;
            this.oldsignx = this.signx;
            this.oldsigny = this.signy;
        }

        this.ApplyAccelPan = function () {
            if (!Lilo.Engine.mouseDrag) {
                var maxx = this.GetContentDimensions().maxx;
                var maxy = this.GetContentDimensions().maxy;
                if (maxx >= this.width) this.maxscrollx = maxx - this.width;
                else this.maxscrollx = 0;
                if (maxy >= this.height) this.maxscrolly = maxy - this.height;
                else this.maxscrolly = 0;
                for (var i = 0; i < this.controls.length; i++) {
                    if (this.controls[i].position != Lilo.POSITION_RELATIVE) continue;

                    var d = Math.abs(this.controls[i].x - this.scrollx);
                    if (d < 2) 
                    {
                        this.velocityx *= 0.0;
                        this.accelerationx *= 0.0;
                        this.scrollx = this.controls[i].x;
                    }
                    var d = Math.abs(this.controls[i].y - this.scrolly);
                    if (d < 2) 
                    {
                        this.velocityy *= 0.0;
                        this.accelerationy *= 0.0;
                        this.scrolly = this.controls[i].y;
                    }
                }
            }
            this.scrollx -= this.velocityx;
            this.scrolly -= this.velocityy;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
            this.velocityy *= 0.98;
            this.velocityx *= 0.98;
        }

        this.GetAbsoluteCoords = function () {
            var c = { x: this.x, y: this.y };
            if (this.position == Lilo.POSITION_ABSOLUTE)
                return (c);
            var o = this;
            while (o.container) {
                o = o.container;
                var sx = o.scrollx;
                var sy = o.scrolly;
                if(sx == undefined) sx = 0;
                if(sy == undefined) sy = 0;
                c.x += o.x - sx;
                c.y += o.y - sy;
            }
            return (c);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.Show = function () {
            Lilo.Internal.ApplyParamsRecursive(this, { isVisible: true });
        }

        this.Hide = function () {
            Lilo.Internal.ApplyParamsRecursive(this, { isVisible: false });
        }

        this.Reset = function() {
             this.SetScroll(0,0);
        }

        this.SetScroll = function (x, y) {
            this.scrollx = x|0;
            this.scrolly = y|0;
            if (this.scrollx < 0) this.scrollx = 0;
            if (this.scrolly < 0) this.scrolly = 0;
            if (this.scrollx > this.maxscrollx) this.scrollx = this.maxscrollx;
            if (this.scrolly > this.maxscrolly) this.scrolly = this.maxscrolly;
        }

        this.ScrollTo = function (x, y, d) {
            var deltaX = (x - this.scrollx) / (d * Lilo.Engine.FPS);
            var deltaY = (y - this.scrolly) / (d * Lilo.Engine.FPS);
            var obj = this;
            var sx = x|0;
            var sy = y|0;
            if (sx < 0) sx = 0;
            if (sy < 0) sy = 0;
            if (sx > this.maxscrollx) sx = this.maxscrollx;
            if (sy > this.maxscrolly) sy = this.maxscrolly;
            if (obj.scrollhandler == null) {
                obj.scrollhandler = function () {
                    this.scrollx += deltaX;
                    this.scrolly += deltaY;
                    if (Math.abs(this.scrollx - sx) <= Math.abs(2 * deltaX))
                        this.scrollx = sx;
                    if (Math.abs(this.scrolly - sy) <= Math.abs(2 * deltaY))
                        this.scrolly = sy;
                    this.scrollx = this.scrollx|0;
                    this.scrolly = this.scrolly|0;
                    if (this.scrollx == sx && this.scrolly == sy)
                        this.scrollhandler = null;
                };
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            obj.Show();
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value:delta });
                if (obj.opacity == 0) {
                    obj.Hide();
                    clearInterval(fadeID);
                }
            }, (1000/Lilo.Engine.FPS));
        }

        this.GetContentDimensions = function () {
            return (Lilo.Internal.GetDimensionsRecursive(this));
        }

        this.Add = function (ctrl) {
            ctrl.container = this;
            this.controls.push(ctrl);
            this.controls.sort(function (a, b) {
                return (a.zorder-b.zorder);
            });
            var c = [];
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].isVisible) continue;
                c.push(this.controls[i]);
                c = c.concat(this.controls[i].GetControls());
            }
            this.cachedcontrols = c;
        }

        this.GetControls = function () {
            return (this.cachedcontrols);
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null && this.styleLogic != undefined) {
                this.styleLogic();
            }

            for (var i=0;i<this.menuitems.length;i++) {
                if( this.menuitems[i].control )
                    this.menuitems[i].control.x = this.width;
            }

            if (this.touchPan) {
                if (Lilo.Engine.mouseDrag && Lilo.Engine.activeCtrl == this) this.AccelDrag();
                this.ApplyAccelPan();
            }

            if (this.animate)
                this.animate();
            
            for (var i = 0; i < this.controls.length; i++) {
                if(this.controls[i].isVisible)
                    this.controls[i].Update(ctx);
            }

            if (this.scrollhandler)
                this.scrollhandler();

            if(this.headerLabel)    
                this.headerLabel.SetText( this.title );
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.Render = function (ctx) {

            Lilo.Engine.SaveState();

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            if(this.rotation != 0)
                ctx.rotate(this.rotation * Math.PI / 180);

            if(!this.transparent)
            {
                if (this.radius == 0) {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        ctx.strokeRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                    }
                }
                else {
                    if (this.stroke) {
                        ctx.lineWidth = this.strokewidth;
                        ctx.strokeStyle = this.strokecolor;
                        Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, false, this.stroke);
                    }
                }

                var fillstyle = this.container.background;
                if (this.gradient != null) {
                    ctx.globalAlpha = this.opacity;
                    // Create gradient
                    grd = ctx.createLinearGradient(0, 0, 0, this.height);
                    for (var i = 0; i < this.gradient.length; i++) {
                        grd.addColorStop(this.gradient[i].pos, this.gradient[i].col);
                    }
                    fillstyle = grd;
                }
                else {
                    var i = fillstyle.lastIndexOf(",");
                    if (i != -1) {
                        fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
                    }
                }
                ctx.fillStyle = fillstyle;
                
                if(this.shadow)
                {
                    ctx.shadowColor = '#333';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 5;
                }

                //if (this.radius == 0) {
                    //ctx.fillRect(-(this.width / 2), -(this.height / 2), this.width, this.height);
                //}
                //else {
                  //  Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, this.radius, true, false);
                //}
            }

            if (this.hideoverflow)
                Lilo.Engine.SetClip((-(this.width / 2)|0), (-(this.height / 2)|0), this.width|0, this.height|0);

            Lilo.Engine.SaveState();
            var controlsinview = 0;
            var nx = (-(this.x + (this.width  / 2)) - this.scrollx)|0;
            var ny = (-(this.y + (this.height / 2)) - this.scrolly)|0;
            ctx.translate(nx, ny);

            for (var i = 0; i < this.controls.length; i++)
            {
                if (this.controls[i].isVisible) {
                    controlsinview++;
                    this.controls[i].Render(ctx);
                }
            }
            
            //first divider after the title 
            if (this.hasheader) {
                ctx.strokeStyle = this.dividercolor;
                ctx.lineWidth = this.dividerheight;
                ctx.beginPath();
                ctx.moveTo(0, 10 + this.headerheight);
                ctx.lineTo(this.width, 10 + this.headerheight);
                ctx.stroke();
            } 

           var cy = (20 + this.headerheight);

            for (var i = 0; i < this.menuitems.length; i++)
            { 
                if(this.menuitems[i].control != null) 
                {
                    ctx.strokeStyle = this.arrowcolor;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(this.width - this.itemheight * 0.5, cy + this.itemheight * 0.1);
                    ctx.lineTo(this.width - (this.itemheight * 0.5) / 2, cy + this.itemheight * 0.3);
                    ctx.lineTo(this.width - this.itemheight * 0.5, cy + this.itemheight * 0.5);
                    ctx.stroke();
                }

                // divider after every menu item.
                ctx.strokeStyle = this.dividercolor;
                ctx.lineWidth = this.dividerheight;
                ctx.beginPath();
                ctx.moveTo(0, cy + this.itemheight - 10);
                ctx.lineTo(this.width, cy + this.itemheight - 10);
                ctx.stroke();

                if(this.menuitems[i].divider)
                    cy += 8;
                else
                    cy += (this.itemheight);
            }

            cy = (this.headerheight / 2) - 10;
            ctx.strokeStyle = this.arrowcolor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.width + this.itemheight * 0.5, cy + this.itemheight * 0.1);
            ctx.lineTo(this.width + (this.itemheight * 0.5) / 2, cy + this.itemheight * 0.3);
            ctx.lineTo(this.width + this.itemheight * 0.5, cy + this.itemheight * 0.5);
            ctx.stroke();

            Lilo.Engine.RestoreState();

            // Show content scrolling tips.
            if (this.touchPan && this.scroll_tips)
            {
                var dim = this.GetContentDimensions();
                // right scroll tip
                if (this.scrollx + this.width < dim.maxx && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect((this.width / 2) - 50, -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo((this.width / 2) - 50 + 15, -15);
                    ctx.lineTo((this.width / 2) - 50 + 35, 0);
                    ctx.lineTo((this.width / 2) - 50 + 15, 15);
                    ctx.fill();
                }
                // left scroll tip
                if (this.scrollx > 0 && this.horiz_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-(this.width / 2), -50, 50, 100);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-(this.width / 2) + 35, -15);
                    ctx.lineTo(-(this.width / 2) + 15, 0);
                    ctx.lineTo(-(this.width / 2) + 35, 15);
                    ctx.fill();
                }
                // top scroll tip
                if (this.scrolly > 0 && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, -(this.height/2), 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,-(this.height / 2) + 30);
                    ctx.lineTo(0,-(this.height / 2) + 10);
                    ctx.lineTo(15,-(this.height / 2) + 30);
                    ctx.fill();
                }
                // bottom scroll tip
                if (this.scrolly + this.height < dim.maxy && this.vert_scroll) {
                    ctx.fillStyle = "rgba(255,255,255,0.8)";
                    ctx.fillRect(-50, (this.height / 2)-40, 100, 40);
                    ctx.beginPath();
                    ctx.fillStyle = "rgba(0,0,0,1.0)";
                    ctx.moveTo(-15,(this.height / 2) - 30);
                    ctx.lineTo(0,(this.height / 2) - 10);
                    ctx.lineTo(15,(this.height / 2) - 30);
                    ctx.fill();
                }
            }

            Lilo.Engine.RestoreState();
        }

        if (this.hasheader) {
            /* Label control for slide menu header */
            var headerLbl = new Lilo.Label("slideHeader", this.title, {
                x: 0, y: 0, z: 13, position: Lilo.POSITION_RELATIVE, radius: this.radius, opacity: 1.0,
                background: this.headercolor, foreground: this.foreground, fontFace: this.fontFace,
                fontSize: this.fontSize, width: 200, height: this.headerheight, fontWeight: 'bold',
                style: function () {
                    this.width = this.container.width;
                    this.x = 0;
                    this.y = 10;
                }
            });
            this.Add(headerLbl);
            this.headerLabel = headerLbl;
        }
        

        /* Build-up Label controls for each item in menu[] */
        var curlbl = new Lilo.Label("slidelbl","", {
            x:0,y:0, z:13, position:Lilo.POSITION_RELATIVE, radius:this.radius, opacity: 1.0,
            background: this.background, foreground: this.foreground, fontFace: this.fontFace, 
            fontSize: this.fontSize, width: 200, height: this.headerheight,
            style: function()
            {
                this.width = this.container.width;
                this.x = this.container.width;
                this.y = 10;
            },
            onclick : function()
            {
                 this.container.ScrollTo( 0, 0, 0.1 );
            }
        });
        this.Add( curlbl );

        var cy = 10 + this.headerheight;

this.Add( this.menuitems[0].control );
        for(var i=0;i<this.menuitems.length;i++)
        {
            if(!this.menuitems[i].divider)
            {
                var lbl = new Lilo.Label("itemlbl"+i, this.menuitems[i].text, {
                    x: this.itemX, y: cy, z: 12, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0, stroke: false,
                    background: this.background, foreground: this.foreground, fontFace: this.fontFace, 
                    fontSize: this.fontSize, textAlign: 'left', imageCache: true, noWrap: true,
                    width: 200, height: this.itemheight, refObj: this.menuitems[i],
                    style: function () {
                        this.width = this.container.width-this.container.itemX;
                        this.z = this.container.z + 1;
                    },
                    drag : function () {
                        Lilo.Engine.RelayEvent(this.container,"drag");
                    },
                    onclick : function () {
                        if (this.container.onSelect)
                            this.container.onSelect(this.refObj);
                        if(this.refObj.control)
                        {
                            this.container.ScrollTo( this.container.width, 0, 0.1 );
                            curlbl.text = this.text;
                        }
                    }
                });
                this.Add( lbl );
                
                if( this.menuitems[i].control != null )
                { 
                    
                    this.menuitems[i].control.y = (this.headerheight+10);
                    this.menuitems[i].controlheight -= (this.headerheight+10);
                    this.menuitems[i].control.x = this.width+1;
                    this.menuitems[i].control.width = this.width - 2;
                }
            }   
            if(this.menuitems[i].divider)
                cy += 8;
            else
                cy += (this.itemheight);
        }

        this.clipped      = true;
        this.hideoverflow = true;
        this.horiz_scroll = true; 
        this.vert_scroll  = true;
        this.touchPan     = true;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.Toggle
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.Toggle = function (id, params) {

        this.state = 0;
        this.controlx = 0;
        this.onchange = null;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.tabindex = -1;
        this.hasWordings = false;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.animate = null;
        this.userclick = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.controlx = -(this.width / 2) + (this.height/2) + 2;

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
            if (this.animate)
                this.animate();
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y))
            {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.drag = function()
        {
            var pointerDrag = Lilo.Engine.GetDrag();
            if(pointerDrag.x > 0) this.state = 1;
            else this.state = 0;
        }

        this.click = function()
        {
            this.state = (this.state == 0) ? 1 : 0;
            if(this.userclick)
                this.userclick();
            if(this.onchange)
                this.onchange();
        }

        this.pointerup = function()
        {
            if(this.onchange)
                this.onchange();
        }

        this.Render = function (ctx) {
            
            Lilo.Engine.SaveState();

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);

            if(this.state == 1)
                ctx.fillStyle = this.foreground;
            else
                ctx.fillStyle = 'rgba(120,120,120,1)';
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.background;
           // Lilo.Internal.roundRect(ctx, -(this.width / 2), -(this.height / 2), this.width, this.height, 25, true, true);


            // left half circle 
            ctx.beginPath();
            ctx.arc(this.controlx, 0, (this.height / 2), 0.5 * Math.PI, 1.5 * Math.PI, false);
            ctx.fill();

            //center block
            ctx.fillRect(this.controlx - 1, -(this.height / 2), this.width - (this.width / 2) + 2, this.height);

            // right half circle
            ctx.beginPath();
            ctx.arc(this.controlx + this.width - (this.width / 2), 0, (this.height / 2), 0.5 * Math.PI, 1.5 * Math.PI, true);
            ctx.fill();

            ctx.beginPath();
            
            if (this.state == 0)
                ctx.arc(this.controlx, 0, (this.height / 2), 0, 2 * Math.PI, false);
            else
                ctx.arc(this.controlx + this.width - (this.width / 2), 0, (this.height / 2), 0, 2 * Math.PI, false);

            if (this.hasWordings) {
                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }
                ctx.fillStyle = 'white';
                if (this.state == 0)
                    ctx.fillText("OFF", this.controlx + this.width / 4, this.height / 5);
                else
                    ctx.fillText("ON", this.controlx - 2, this.height / 5);
            }
    
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = this.background;
            ctx.stroke();
            
            Lilo.Engine.RestoreState();
        }

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.ActionBar
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.ActionBar = function (id, text, params) {
        
        //-------------------------
        // Actionbar specific.
        //-------------------------
        this.text = text;
        this.states = [];
        this.curstate = 0;
        this.ctx = null;

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.oldopacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;
        this.stroke = true;
        this.refObj = null;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.AddState = function( s ) {
            this.states.push( s );
        }

        this.SetState = function( id ) {
            
            if( this.states[ this.curstate ].backfunc != null)
                this.states[ this.curstate ].backfunc();

            this.curstate = id;
            
            if( this.states[ id ].func != null)
                this.states[ id ].func();
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.FadeIn = function (duration) {
            var obj = this;
            var delta = (1) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 1) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.FadeOut = function (duration) {
            var obj = this;
            obj.oldopacity = obj.opacity;
            var delta = (0 - obj.opacity) / (duration * Lilo.Engine.FPS);
            var fadeID = setInterval(function () {
                Lilo.Internal.ApplyDeltaRecursive(obj, { param: "opacity", value: delta });
                if (obj.opacity == 0) {
                    clearInterval(fadeID);
                }
            }, (1000 / Lilo.Engine.FPS));
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.GoBack = function()
        {
             if (this.states[ this.curstate ].prev != null)
            {
                if( this.states[ this.curstate ].backfunc != null )
                    this.states[ this.curstate ].backfunc();
                this.curstate = this.states[ this.curstate ].prev;
                if( this.states[ this.curstate ].func != null )
                    this.states[ this.curstate ].func();                                                     
            }
        }

        this.GoForward = function()
        {
            if (this.states[ this.curstate ].next != null)
            {
                this.curstate = this.states[ this.curstate ].next;
                if( this.states[ this.curstate ].func != null )
                    this.states[ this.curstate ].func(); 
            }
        }

        this.click = function()
        {
            var ctx = this.ctx;
            var pt = Lilo.Engine.GetPointer();
            var coords = Lilo.Internal.GetAbsCoords( this );
            var dx = pt.x - coords.x;
            var dy = pt.y - coords.y;
            if ( this.states[ this.curstate ].secondHeading != "" && this.states[ this.curstate ].secondFunction != null )
            {
                ctx.save();
                if (this.font != "") {
                    ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
                }
                ctx.textAlign = 'center';
                var cx = this.x + (this.width/2);
                var cy = this.y + (this.height/2);
                var heading = this.states[ this.curstate ].heading;
                var y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
                var x = (this.width / 2);
                var sy = 0;
                var heading2 = this.states[ this.curstate ].secondHeading;
                var metrics2 = ctx.measureText(heading2);
                var x2 = x + (( (this.width)+20) - x) / 2;
                ctx.restore();
                if( dx > x2-(0.5*metrics2.width) && dx < x2+(0.5*metrics2.width) && dy > 0 && dy < this.height)
                {
                    if( this.states[ this.curstate ].secondFunction != null )
                        this.states[ this.curstate ].secondFunction();    
                }     
            }
            if (this.states[ this.curstate ].prev != null && dx > 0 && dx < 30)
            {
                if( this.states[ this.curstate ].backfunc != null )
                    this.states[ this.curstate ].backfunc();
                this.curstate = this.states[ this.curstate ].prev;
                if( this.states[ this.curstate ].func != null )
                    this.states[ this.curstate ].func();                                                     
            }
            if (this.states[ this.curstate ].next != null && dx > (this.width-30) && dx < this.width)
            {
                this.curstate = this.states[ this.curstate ].next;
                if( this.states[ this.curstate ].func != null )
                    this.states[ this.curstate ].func(); 
            }
        }

        this.Render = function (ctx) {
            
            // In this control we need to reference ctx from click handlers.
            this.ctx = ctx;

            Lilo.Engine.SaveState();
            if (this.clipped) {
                Lilo.Engine.SetClip(this.x, this.y, this.width, this.height);
            }

            if (this.position == Lilo.POSITION_ABSOLUTE)
                ctx.translate(this.x + (this.width / 2), this.y + (this.height / 2));
            else if (this.position == Lilo.POSITION_RELATIVE)
                ctx.translate(this.container.x + this.x + (this.width / 2), this.container.y + this.y + (this.height / 2));

            ctx.rotate(this.rotation * Math.PI / 180);
  
            if(this.background != "")
            {
                ctx.fillStyle = this.background;
                ctx.fillRect(-(this.width/2), -(this.height/2), this.width, this.height);
            }
            
            if(this.stroke)
            {
                ctx.strokeStyle = "rgba(0,0,0,1.0)";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-(this.width/2), -(this.height/2), this.width, this.height);
            }

            fillstyle = this.foreground;
            i = fillstyle.lastIndexOf(",");
            if (i != -1) {
                fillstyle = fillstyle.substring(0, i) + "," + this.opacity + ")";
            }
            ctx.fillStyle = fillstyle;

            if (this.font != "") {
                ctx.font = this.fontWeight + " " + this.fontSize + "px " + this.fontFace;
            }
            ctx.textAlign = 'center';

            var heading = this.states[ this.curstate ].heading;
            var metrics = ctx.measureText(heading);
            var y = -(this.height / 2) + (this.height / 2) + (this.fontSize / 2) - 2;
            var x = -(this.width / 2) + (this.width / 2);
            
            if(metrics.width > this.width) this.width = metrics.width;

            ctx.fillText(heading, x, y);
            if( this.states[ this.curstate ].secondHeading != null && this.states[ this.curstate ].secondHeading != "" )
            {
                ctx.fillStyle = "rgba(248,151,29,1.0)";
                var x2 = x + (((this.width/2)+20) - x) / 2;
                ctx.fillText( this.states[ this.curstate ].secondHeading, x2, y );
            }
            if( this.states[ this.curstate ].next != null )
            {
                var cy = 0;
                ctx.lineWidth = 4;
                ctx.strokeStyle = "rgba(180,180,180,1.0)";
                ctx.beginPath();
                ctx.moveTo( this.width/2 - 30, cy - 14 );
                ctx.lineTo( this.width/2 - 12, cy  );
                ctx.lineTo( this.width/2 - 30, cy + 14 );
                ctx.stroke();
            }
            if( this.states[ this.curstate ].prev != null )
            {
                var cy = 0;
                ctx.lineWidth = 4;
                ctx.strokeStyle = "rgba(248,151,29,1.0)";
                ctx.beginPath();
                ctx.moveTo( -this.width/2 + 30, cy - 14 );
                ctx.lineTo( -this.width/2 + 12, cy  );
                ctx.lineTo( -this.width/2 + 30, cy + 14 );
                ctx.stroke();
            }

            Lilo.Engine.RestoreState();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // LILO.ValueChange  -> + | - value change control 
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    Lilo.ValueChange = function (id, params) {

        //-------------------------
        // Generic Lilo Management.
        //-------------------------
        this.container = { x: 0, y: 0, width: Lilo.SCREEN_WIDTH, height: Lilo.SCREEN_HEIGHT }; // Default container.
        this.id = id;
        this.zorder = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.styleLogic = null;
        this.background = "";
        this.foreground = "";
        this.scale = 1.0;
        this.rotation = 0.0;
        this.opacity = 1.0;
        this.oldopacity = 1.0;
        this.radius = 0.0;
        this.hasHover = false;
        this.hasFocus = false;
        this.fontFace = "";
        this.fontSize = 10;
        this.fontWeight = "";
        this.tabindex = 0;
        this.isVisible = true;
        this.isActive = true;
        this.position = Lilo.POSITION_ABSOLUTE;
        this.clipped = true;
        this.clickstage = 0;
        this.rclickstage = 0;
        this.isPointerDown = false;
        this.gradient = null;
        this.tabindex = -1;
        this.lastbutton = 0;
        this.timerid = null;

        //---------------------------------
        // Generic Event Handler Delegates.
        //---------------------------------
        this.hover = null;
        this.unhover = null;
        this.click = null;
        this.pointerdown = null;
        this.pointerup = null;
        this.doubleclick = null;
        this.rightclick = null;
        this.keydown = null;
        this.keyup = null;
        this.drag = null;
        this.wheel = null;
        this.onValueDown = null;
        this.onValueUp = null;

        if (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.SetParams = function (params) {
            Lilo.Internal.ApplyParams(this, params);
        }

        this.GetControls = function () {
            return ([]); // This is a singular control, cannot have children.
        }

        this.ClearFocus = function () {
            this.hasFocus = false;
        }

        this.Update = function (ctx) {
            if (this.styleLogic != null) {
                this.styleLogic();
            }
        }

        this.CheckBounds = function () {
            var coords = Lilo.Engine.GetPointer();
            if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this), coords.x, coords.y)) {
                if (this.clipped) {
                    if (Lilo.Internal.PointInPoly(Lilo.Internal.GetControlPoints(this.container), coords.x, coords.y)) {
                        return (true);
                    }
                    else {
                        return (false);
                    }
                }
                else
                    return (true);
            }
            return (false);
        }

        this.rightclick = function()
        {
            var obj = this;
            this.timerid = setInterval(function() {
                if(obj.lastbutton == 0 && obj.onValueDown)
                    obj.onValueDown();
                if(obj.lastbutton == 1 && obj.onValueUp)
                    obj.onValueUp();
            }, 500);
        }

        this.pointerup = function()
        {
            clearInterval( this.timerid );
            this.timerid = null;
        }

        this.doubleclick = function()
        {
            //this.click();
        }

        this.click = function () {

            var p = Lilo.Engine.GetPointer();

            var coords = Lilo.Internal.GetAbsCoords(this);

            if (Lilo.Internal.PointInRect(p.x, p.y, coords.x, coords.y, this.width / 2, this.height)) {
                if (this.onValueDown)
                {
                    this.lastbutton = 0;
                    this.onValueDown();
                }

            } else if (Lilo.Internal.PointInRect(p.x, p.y, coords.x + this.width / 2, coords.y, this.width / 2, this.height)) {
                if (this.onValueUp)
                {
                    this.lastbutton = 1;
                    this.onValueUp();
                }
            }
        }

        this.Render = function (ctx) {

            var x, y;
            if (this.position == Lilo.POSITION_ABSOLUTE) {
                x = this.x;
                y = this.y;
            }
            else if (this.position == Lilo.POSITION_RELATIVE) {
                x = this.x + this.container.x;
                y = this.y + this.container.y;
            }

            if (this.rotation != 0)
                ctx.rotate(this.rotation * Math.PI / 180);

            ctx.fillStyle = this.background;
            ctx.strokeStyle = this.foreground;
            ctx.lineWidth = 2.0;


            if (this.radius == 0) {
                ctx.strokeRect(x, y, this.width, this.height);

                if (this.background)
                    ctx.fillRect(x, y, this.width, this.height);
            }

            else
                Lilo.Internal.roundRect(ctx, x, y, this.width, this.height, this.radius, (this.background != ""), true);


            // split 
            ctx.moveTo(x + this.width / 2, y);
            ctx.lineTo(x + this.width / 2, y + this.height);
            ctx.stroke();

            // minus  

            var d = ((this.width / 2) / 2);
            ctx.moveTo(x + (d - d / 2), y + this.height / 2);
            ctx.lineTo(x + (d + d / 2), y + this.height / 2);
            ctx.stroke();

            // plus 
            var h = ((this.height / 2) / 2);
            ctx.moveTo(x + (this.width / 2) + (d - d / 2), y + this.height / 2);
            ctx.lineTo(x + (this.width / 2) + (d + d / 2), y + this.height / 2);
            ctx.stroke();
            ctx.moveTo(x + (this.width / 2) + d, y + h);
            ctx.lineTo(x + (this.width / 2) + d, y + this.height - h);
            ctx.stroke();
        }
    }

})();

var domReady = false;

function LiloInit() {
    domReady = true;
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

function clone(originalObject, circular) {
    // First create an empty object with
    // same prototype of our original source

    var propertyIndex,
        descriptor,
        keys,
        current,
        nextSource,
        indexOf,
        copies = [{
            source: originalObject,
            target: Object.create(Object.getPrototypeOf(originalObject))
        }],
        cloneObject = copies[0].target,
        sourceReferences = [originalObject],
        targetReferences = [cloneObject];

    // First in, first out
    while (current = copies.shift()) {
        keys = Object.getOwnPropertyNames(current.source);

        for (propertyIndex = 0 ; propertyIndex < keys.length ; propertyIndex++) {
            // Save the source's descriptor
            descriptor = Object.getOwnPropertyDescriptor(current.source, keys[propertyIndex]);

            if (!descriptor.value || typeof descriptor.value !== 'object') {
                Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                continue;
            }

            nextSource = descriptor.value;
            descriptor.value = Array.isArray(nextSource) ?
                [] :
                Object.create(Object.getPrototypeOf(nextSource));

            if (circular) {
                indexOf = sourceReferences.indexOf(nextSource);

                if (indexOf !== -1) {
                    // The source is already referenced, just assign reference
                    descriptor.value = targetReferences[indexOf];
                    Object.defineProperty(current.target, keys[propertyIndex], descriptor);
                    continue;
                }

                sourceReferences.push(nextSource);
                targetReferences.push(descriptor.value);
            }

            Object.defineProperty(current.target, keys[propertyIndex], descriptor);

            copies.push({ source: nextSource, target: descriptor.value });
        }
    }

    return cloneObject;
};

(function () {

    Lilo.Vector3 = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.Magnitude = function () {
            return (Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z)));
        };

        this.SqrMagnitude = function () {
            return ((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
        };

        this.Normalize = function () {
            var imag = 1.0 / this.Magnitude();
            this.x *= imag;
            this.y *= imag;
            this.z *= imag;
        };

        this.Cross = function (v) {
            var result = new Vector3(0, 0, 0);
            result.x = (this.y * v.z) - (this.z * v.y);
            result.y = (this.z * v.x) - (this.x * v.z);
            result.z = (this.x * v.y) - (this.y * v.x);
            return (result);
        };

        this.Dot = function (v) {
            return ((this.x * v.x) + (this.y * v.y) + (this.z * v.z));
        };

        this.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }

        this.Lerp = function (v, t) {
            var result = new Vector3(0, 0, 0);
            result.x = (this.x * t) + (v.x * (1.0 - t));
            result.y = (this.y * t) + (v.y * (1.0 - t));
            result.z = (this.z * t) + (v.z * (1.0 - t));
            return (result);
        }
    };

    Lilo.Vector2 = function (x, y) {
        this.x = x;
        this.y = y;

        this.Magnitude = function () {
            return (Math.sqrt((this.x * this.x) + (this.y * this.y)));
        };

        this.SqrMagnitude = function () {
            return ((this.x * this.x) + (this.y * this.y));
        };

        this.Normalize = function () {
            var imag = 1.0 / this.Magnitude();
            this.x *= imag;
            this.y *= imag;
        };

        this.Dot = function (v) {
            return ((this.x * v.x) + (this.y * v.y));
        };

        this.Set = function (v) {
            this.x = v.x;
            this.y = v.y;
        }

        this.Lerp = function (v, t) {
            var result = new Lilo.Vector2(0, 0, 0);
            result.x = (this.x * t) + (v.x * (1.0 - t));
            result.y = (this.y * t) + (v.y * (1.0 - t));
            return (result);
        }

        this.Project = function (v) {
            var d = new Lilo.Vector2(v.x, v.y);
            d.Normalize();
            var co = this.Dot(d) / d.Dot(d);
            d.x *= co;
            d.y *= co;
            return (d);
        }

    };

})();

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = CryptoJS || function (e, m) {
    var p = {}, j = p.lib = {}, l = function () { }, f = j.Base = { extend: function (a) { l.prototype = this; var c = new l; a && c.mixIn(a); c.hasOwnProperty("init") || (c.init = function () { c.$super.init.apply(this, arguments) }); c.init.prototype = c; c.$super = this; return c }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } },
    n = j.WordArray = f.extend({
        init: function (a, c) { a = this.words = a || []; this.sigBytes = c != m ? c : 4 * a.length }, toString: function (a) { return (a || h).stringify(this) }, concat: function (a) { var c = this.words, q = a.words, d = this.sigBytes; a = a.sigBytes; this.clamp(); if (d % 4) for (var b = 0; b < a; b++) c[d + b >>> 2] |= (q[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((d + b) % 4); else if (65535 < q.length) for (b = 0; b < a; b += 4) c[d + b >>> 2] = q[b >>> 2]; else c.push.apply(c, q); this.sigBytes += a; return this }, clamp: function () {
            var a = this.words, c = this.sigBytes; a[c >>> 2] &= 4294967295 <<
            32 - 8 * (c % 4); a.length = e.ceil(c / 4)
        }, clone: function () { var a = f.clone.call(this); a.words = this.words.slice(0); return a }, random: function (a) { for (var c = [], b = 0; b < a; b += 4) c.push(4294967296 * e.random() | 0); return new n.init(c, a) }
    }), b = p.enc = {}, h = b.Hex = {
        stringify: function (a) { var c = a.words; a = a.sigBytes; for (var b = [], d = 0; d < a; d++) { var f = c[d >>> 2] >>> 24 - 8 * (d % 4) & 255; b.push((f >>> 4).toString(16)); b.push((f & 15).toString(16)) } return b.join("") }, parse: function (a) {
            for (var c = a.length, b = [], d = 0; d < c; d += 2) b[d >>> 3] |= parseInt(a.substr(d,
            2), 16) << 24 - 4 * (d % 8); return new n.init(b, c / 2)
        }
    }, g = b.Latin1 = { stringify: function (a) { var c = a.words; a = a.sigBytes; for (var b = [], d = 0; d < a; d++) b.push(String.fromCharCode(c[d >>> 2] >>> 24 - 8 * (d % 4) & 255)); return b.join("") }, parse: function (a) { for (var c = a.length, b = [], d = 0; d < c; d++) b[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4); return new n.init(b, c) } }, r = b.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(g.stringify(a))) } catch (c) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return g.parse(unescape(encodeURIComponent(a))) } },
    k = j.BufferedBlockAlgorithm = f.extend({
        reset: function () { this._data = new n.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = r.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var c = this._data, b = c.words, d = c.sigBytes, f = this.blockSize, h = d / (4 * f), h = a ? e.ceil(h) : e.max((h | 0) - this._minBufferSize, 0); a = h * f; d = e.min(4 * a, d); if (a) { for (var g = 0; g < a; g += f) this._doProcessBlock(b, g); g = b.splice(0, a); c.sigBytes -= d } return new n.init(g, d) }, clone: function () {
            var a = f.clone.call(this);
            a._data = this._data.clone(); return a
        }, _minBufferSize: 0
    }); j.Hasher = k.extend({
        cfg: f.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { k.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (c, b) { return (new a.init(b)).finalize(c) } }, _createHmacHelper: function (a) {
            return function (b, f) {
                return (new s.HMAC.init(a,
                f)).finalize(b)
            }
        }
    }); var s = p.algo = {}; return p
}(Math);
(function () {
    var e = CryptoJS, m = e.lib, p = m.WordArray, j = m.Hasher, l = [], m = e.algo.SHA1 = j.extend({
        _doReset: function () { this._hash = new p.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (f, n) {
            for (var b = this._hash.words, h = b[0], g = b[1], e = b[2], k = b[3], j = b[4], a = 0; 80 > a; a++) {
                if (16 > a) l[a] = f[n + a] | 0; else { var c = l[a - 3] ^ l[a - 8] ^ l[a - 14] ^ l[a - 16]; l[a] = c << 1 | c >>> 31 } c = (h << 5 | h >>> 27) + j + l[a]; c = 20 > a ? c + ((g & e | ~g & k) + 1518500249) : 40 > a ? c + ((g ^ e ^ k) + 1859775393) : 60 > a ? c + ((g & e | g & k | e & k) - 1894007588) : c + ((g ^ e ^
                k) - 899497514); j = k; k = e; e = g << 30 | g >>> 2; g = h; h = c
            } b[0] = b[0] + h | 0; b[1] = b[1] + g | 0; b[2] = b[2] + e | 0; b[3] = b[3] + k | 0; b[4] = b[4] + j | 0
        }, _doFinalize: function () { var f = this._data, e = f.words, b = 8 * this._nDataBytes, h = 8 * f.sigBytes; e[h >>> 5] |= 128 << 24 - h % 32; e[(h + 64 >>> 9 << 4) + 14] = Math.floor(b / 4294967296); e[(h + 64 >>> 9 << 4) + 15] = b; f.sigBytes = 4 * e.length; this._process(); return this._hash }, clone: function () { var e = j.clone.call(this); e._hash = this._hash.clone(); return e }
    }); e.SHA1 = j._createHelper(m); e.HmacSHA1 = j._createHmacHelper(m)
})();

if (!navigator.isCocoonJS) {
    /* FileSaver.js
     * A saveAs() FileSaver implementation.
     * 2013-01-23
     *
     * By Eli Grey, http://eligrey.com
     * License: X11/MIT
     *   See LICENSE.md
     */

    /*global self */
    /*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
     plusplus: true */

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

    var saveAs = saveAs
        || (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator))
        || (function (view) {
            "use strict";
            var
                doc = view.document
            // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
                , get_URL = function () {
                    return view.URL || view.webkitURL || view;
                }
                , URL = view.URL || view.webkitURL || view
                , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
                , can_use_save_link = "download" in save_link
                , click = function (node) {
                    var event = doc.createEvent("MouseEvents");
                    event.initMouseEvent(
                        "click", true, false, view, 0, 0, 0, 0, 0
                        , false, false, false, false, 0, null
                    );
                    node.dispatchEvent(event);
                }
                , webkit_req_fs = view.webkitRequestFileSystem
                , req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
                , throw_outside = function (ex) {
                    (view.setImmediate || view.setTimeout)(function () {
                        throw ex;
                    }, 0);
                }
                , force_saveable_type = "application/octet-stream"
                , fs_min_size = 0
                , deletion_queue = []
                , process_deletion_queue = function () {
                    var i = deletion_queue.length;
                    while (i--) {
                        var file = deletion_queue[i];
                        if (typeof file === "string") { // file is an object URL
                            URL.revokeObjectURL(file);
                        } else { // file is a File
                            file.remove();
                        }
                    }
                    deletion_queue.length = 0; // clear queue
                }
                , dispatch = function (filesaver, event_types, event) {
                    event_types = [].concat(event_types);
                    var i = event_types.length;
                    while (i--) {
                        var listener = filesaver["on" + event_types[i]];
                        if (typeof listener === "function") {
                            try {
                                listener.call(filesaver, event || filesaver);
                            } catch (ex) {
                                throw_outside(ex);
                            }
                        }
                    }
                }
                , FileSaver = function (blob, name) {
                    // First try a.download, then web filesystem, then object URLs
                    var
                        filesaver = this
                        , type = blob.type
                        , blob_changed = false
                        , object_url
                        , target_view
                        , get_object_url = function () {
                            var object_url = get_URL().createObjectURL(blob);
                            deletion_queue.push(object_url);
                            return object_url;
                        }
                        , dispatch_all = function () {
                            dispatch(filesaver, "writestart progress write writeend".split(" "));
                        }
                    // on any filesys errors revert to saving with object URLs
                        , fs_error = function () {
                            // don't create more object URLs than needed
                            if (blob_changed || !object_url) {
                                object_url = get_object_url(blob);
                            }
                            if (target_view) {
                                target_view.location.href = object_url;
                            }
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        }
                        , abortable = function (func) {
                            return function () {
                                if (filesaver.readyState !== filesaver.DONE) {
                                    return func.apply(this, arguments);
                                }
                            };
                        }
                        , create_if_not_found = { create: true, exclusive: false }
                        , slice
                    ;
                    filesaver.readyState = filesaver.INIT;
                    if (!name) {
                        name = "download";
                    }
                    if (can_use_save_link) {
                        object_url = get_object_url(blob);
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        return;
                    }
                    // Object and web filesystem URLs have a problem saving in Google Chrome when
                    // viewed in a tab, so I force save with application/octet-stream
                    // http://code.google.com/p/chromium/issues/detail?id=91158
                    if (view.chrome && type && type !== force_saveable_type) {
                        slice = blob.slice || blob.webkitSlice;
                        blob = slice.call(blob, 0, blob.size, force_saveable_type);
                        blob_changed = true;
                    }
                    // Since I can't be sure that the guessed media type will trigger a download
                    // in WebKit, I append .download to the filename.
                    // https://bugs.webkit.org/show_bug.cgi?id=65440
                    if (webkit_req_fs && name !== "download") {
                        name += ".download";
                    }
                    if (type === force_saveable_type || webkit_req_fs) {
                        target_view = view;
                    } else {
                        target_view = view.open();
                    }
                    if (!req_fs) {
                        fs_error();
                        return;
                    }
                    fs_min_size += blob.size;
                    req_fs(view.TEMPORARY, fs_min_size, abortable(function (fs) {
                        fs.root.getDirectory("saved", create_if_not_found, abortable(function (dir) {
                            var save = function () {
                                dir.getFile(name, create_if_not_found, abortable(function (file) {
                                    file.createWriter(abortable(function (writer) {
                                        writer.onwriteend = function (event) {
                                            target_view.location.href = file.toURL();
                                            deletion_queue.push(file);
                                            filesaver.readyState = filesaver.DONE;
                                            dispatch(filesaver, "writeend", event);
                                        };
                                        writer.onerror = function () {
                                            var error = writer.error;
                                            if (error.code !== error.ABORT_ERR) {
                                                fs_error();
                                            }
                                        };
                                        "writestart progress write abort".split(" ").forEach(function (event) {
                                            writer["on" + event] = filesaver["on" + event];
                                        });
                                        writer.write(blob);
                                        filesaver.abort = function () {
                                            writer.abort();
                                            filesaver.readyState = filesaver.DONE;
                                        };
                                        filesaver.readyState = filesaver.WRITING;
                                    }), fs_error);
                                }), fs_error);
                            };
                            dir.getFile(name, { create: false }, abortable(function (file) {
                                // delete file if it already exists
                                file.remove();
                                save();
                            }), abortable(function (ex) {
                                if (ex.code === ex.NOT_FOUND_ERR) {
                                    save();
                                } else {
                                    fs_error();
                                }
                            }));
                        }), fs_error);
                    }), fs_error);
                }
                , FS_proto = FileSaver.prototype
                , saveAs = function (blob, name) {
                    return new FileSaver(blob, name);
                }
            ;
            FS_proto.abort = function () {
                var filesaver = this;
                filesaver.readyState = filesaver.DONE;
                dispatch(filesaver, "abort");
            };
            FS_proto.readyState = FS_proto.INIT = 0;
            FS_proto.WRITING = 1;
            FS_proto.DONE = 2;

            FS_proto.error =
                FS_proto.onwritestart =
                    FS_proto.onprogress =
                        FS_proto.onwrite =
                            FS_proto.onabort =
                                FS_proto.onerror =
                                    FS_proto.onwriteend =
                                        null;

            view.addEventListener("unload", process_deletion_queue, false);
            return saveAs;
        }(self));
}