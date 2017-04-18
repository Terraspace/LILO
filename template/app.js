		
		function BuildMainView()
		{
			/* 
			Create a new View - LILO View is an entire screen and all it contains, 
			they can be switched between, animated and transitioned 
			*/
			var view = Lilo.Engine.CreateView("MainView");

			/*
			A panel can be used purely as a design element or as a container for other controls.
			A panel can allow other controls to overlap it, be clipped by it and allows for relative or absolute positioning.
			*/
		    var panel = new Lilo.Panel("centerPanel", {
				x: 0, y: 0, z: 1, position: Lilo.POSITION_ABSOLUTE, radius: 15, opacity: 1.0, isVisible: true, background: "rgba(78,85,91,1.0)", clipped: true, hideoverflow: true,
				stroke: true, strokecolor: "rgba(125,124,13,1.0)", strokewidth: 12.5,
				style: function () {
					this.x = (Lilo.SCREEN_WIDTH/2) - (this.width/2);
					this.y = (Lilo.SCREEN_HEIGHT/2) - (this.height/2);
					this.width  = Lilo.SCREEN_WIDTH * 0.7;
					this.height = Lilo.SCREEN_HEIGHT * 0.7;
				},
				animate : function() {
					this.x = Math.sin( Lilo.Engine.frameNumber/150 ) * Lilo.SCREEN_WIDTH*0.25 + (Lilo.SCREEN_WIDTH/2) - (this.width/2);
				}
			});
	
			/*
			An animated image control.
			*/
			var logo = new Lilo.Image("logo", "texture.png", {
				opacity: 1.0, radius: 0.0, position: Lilo.POSITION_ABSOLUTE, z: 2,
				style: function () {
					x = 0;
					y = 0;
					this.width = Lilo.SCREEN_WIDTH/2;
					this.height = Lilo.SCREEN_HEIGHT/2; // this.width * this.aspect; If you want aspect correct images.
				},
				animate : function () {
					this.rotation += 0.1;
				},
				drag : function () {
					var pointer = Lilo.Engine.GetPointer();
					this.x = pointer.x - (this.width*0.5);
					this.y = pointer.y - (this.height*0.5);
				},
				wheel : function(d) {
					if(d>0)
						this.scale += 0.1;
					else
						this.scale -= 0.1;
						
					this.scale = Math.max( this.scale, 1 );
					
				}
			});
			
			/*
			A simple button
			*/
			var btn = new Lilo.Button("btn1", "Click Me", { 
				x: 0, y: 0, z: 2, radius: 10, position: Lilo.POSITION_ABSOLUTE, background: "rgba(50,80,60,1.0)", foreground: "rgba(255,255,255,1.0)",
				fontFace: "Arial", fontSize: 28,
				style : function () {
					var pnl = Lilo.Engine.FindControlById("centerPanel");
					this.width  = Math.max( pnl.width * 0.15, 120 );
					this.height = 45;
					this.x = pnl.x + (pnl.width/2) - (this.width/2);
					this.y = pnl.y - 60;
				},
				onclick : function () {
					Lilo.Engine.DismissKeyboard();
					var userCtl = Lilo.Engine.FindControlById("usrname");
					user = userCtl.text;
				}
			});
			
			/*
			A label control. Labels render using standard text output, but have the option to use a hashtable based image cache which can massively
			accelerate the render of large quantities of text on mobile devices.
			*/
			var lbl1 = new Lilo.Label("lbl1", "Value : ", {
				x: 0, y: 0, z: 3, position: Lilo.POSITION_RELATIVE, radius: 0, opacity: 1.0,
				foreground: "rgba(255,255,255,1.0)", fontFace: "Arial", fontSize: 28, textAlign: 'center',
				style: function () {
					this.height = 30;
					var pnl = Lilo.Engine.FindControlById("centerPanel");
					this.width = pnl.width * 0.25;
					this.y = pnl.height/2 - 15;
					this.x = pnl.width/2 - this.width/2;
					this.fontSize = Lilo.Engine.GetResolutionFontSize(28, 2048);
					this.text = "Value : " + globalValue.toFixed(2) + " -> " + user;
				}
			});	
			
			/*
			A value +/- control.
			*/
			var value1 = new Lilo.ValueChange("valueCtrl", {
				x: 0, y: 0, width: 180, height: 50, z: 4, position: Lilo.POSITION_RELATIVE, radius: 5, foreground: "rgba(248,151,29,1.0)",
				fontFace: "Verdana", fontSize: "20", fontWeight: "bold",
				style: function () {
					var lbl = Lilo.Engine.FindControlById("lbl1");
					this.height = 30;
					this.width = 100;
					this.y = lbl.y + lbl.height + 10;
					this.x = lbl.x + lbl.width/2 - (this.width/2);
				},
				onValueDown: function () {
					globalValue -= 0.1;
				},
				onValueUp: function () {
					globalValue += 0.1;
				}
			});

			/*
			A standard, styled text input. All form style inputs support tabindex.
			*/
			var UserText = new Lilo.TextBox("usrname", "Username", {
				x: 0, y: 0, z: 7, width: 500, height: 60, position: Lilo.POSITION_RELATIVE,
				foreground: "rgba(50,50,50,1.0)", background: "rgba(255,255,255,1.0)", radius: 10, opacity: 1.0,
				fontFace: "Verdana", fontSize: 30, tabindex: 1, maxlength: 100,
				style: function () {
					this.width = Lilo.SCREEN_WIDTH * 0.30;
					this.height = Lilo.SCREEN_HEIGHT * 0.05;
					this.x = (this.container.width / 2) - (this.width / 2);		// All controls can reference their own properties via this, it's container via this.container, or any other control via FindControlById.
					this.y = (this.container.height / 3) + (this.height / 2);
					if (this.text == "Username") {
						this.foreground = "rgba(153,153,153,1.0)";
						this.fontWeight = 'bold';
					} else {
						this.foreground = "rgba(50,50,50,1.0)";
						this.fontWeight = '';
					}
				}
			});
			
			panel.Add( logo );
			panel.Add( lbl1 );
			panel.Add( value1 );
			panel.Add( UserText );
			view.Add( panel );
			view.Add( btn );
			return( view );
		}