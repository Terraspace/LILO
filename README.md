# 1.What is LILO?

LILO is a Javascript framework that was born out of frustration at trying to build visually rich or interactive web and mobile applications. HTML and CSS were primarily designed for marking up documents, and this they are very useful for. Creating user interfaces and applications was never a good fit.

Over the years we have encountered so many headaches working with HTML, CSS and browsers.

1. 1)No two browsers behave the same way, especially when dealing with CSS/HTML mark-up.
This extends the development and testing time as you go round in circles getting the same result under different browsers.
2. 2)HTML5 in its raw form is simply too slow to deliver what is expected on mobile devices when looking at complex visual applications (IE: games, rendering, simulation, real-time etc).
3. 3)Complexity when attempting to separate logic from display and dealing with responsive designs.
4. 4)Obtuse implementation of style construction via CSS, (IE: display, float, block, media queries, selectors etc)

Lilo attempts to solve a lot of this head-ache by creating a robust library of controls and core framework which works exclusively in HTML5 canvas and WebGL. It unifies all platform and device event models and provides a clean way of developing modular code.

All controls being rendered via HTML5 Canvas and WebGL are ensured to look the same across all platforms as this appears to be one standard across all devices and browsers which has been adhered to accurately.

All controls are implemented entirely in code or via imported layout scripts, this means there is NO HTML or CSS anywhere.

Controls are easily added, extended or customized.

Lilo is built to work with both Electron and Cocoon.IO to allow the same code to be directly compiled for x86 native code on Windows, OSX, Linux and for iOS, Windows Store and Android via Cocoon.IO

It supports Cocoon.IO Canvas+ accelerated mode (as well as Webview and Webview+) to deliver 60fps performance for all user interfaces and complex graphical applications.

A novel approach to styling has been taken with Lilo in which all controls are rendered in a real-time / interactive manner and style logic is provided as code (via a style method) to determine the exact properties of the control. This allows you to design anything you can imagine, link controls positions to other controls, anchor them and relate their sizing to other controls without the need for applying complex or obscure CSS.





# 2. Getting started

Simply include **lilo.js** and the stub (&quot;empty&quot;) **cordova.js** (this file allows direct compatibility with Cocoon.IO).

| &lt;!DOCTYPE html&gt;&lt;html lang=&quot;en&quot; xmlns=&quot;http://www.w3.org/1999/xhtml&quot;&gt;&lt;head&gt;    &lt;title&gt; ../ Terraspace /.. &lt;/title&gt;    &lt;meta charset=&quot;utf-8&quot;/&gt;    &lt;meta http-equiv=&quot;Content-Security-Policy&quot;/&gt;    &lt;meta name=&quot;viewport&quot; id=&quot;liloviewport&quot; content=&quot;user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0&quot;/&gt;    &lt;meta name=&quot;apple-mobile-web-app-capable&quot; content=&quot;yes&quot;/&gt;    &lt;meta http-equiv=&quot;Content-type&quot; content=&quot;text/html;charset=UTF-8&quot;/&gt;    &lt;style type=&quot;text/css&quot;&gt;        body {            margin:0px;            padding:0px;            overflow: hidden;        }    &lt;/style&gt;     &lt;script type=&quot;text/javascript&quot; src=&quot;cordova.js&quot;&gt;&lt;/script&gt;    &lt;script type=&quot;text/javascript&quot; src=&quot;scripts/lilo.js&quot;&gt;&lt;/script&gt;    &lt;script type=&quot;text/javascript&quot; src=&quot;scripts/mainview.js&quot;&gt;&lt;/script&gt;     &lt;script type=&quot;text/javascript&quot;&gt;     **var** MainView; _/\* Main application view \*/_ _    /\* Initialize and start our app \*/_    **function** InitApp() {               _/\* Initialize the Lilo UI Framework \*/_        Lilo.Engine.Initialize( Lilo.WEBGL, **null** , **null** );        Lilo.Engine.DEBUG = **false** ; _/\* Don&#39;t show debug output \*/_        Lilo.Engine.SetDepthTesting( **false** ); _/\* Only using 2D WebGL features, so disable \*/_         MainView = CreateMainView();        Lilo.Engine.SetView( MainView );            } _    /\* Generic app exit method \*/_    **function** ExitApp() {        Lilo.Engine.Exit();    }     &lt;/script&gt;&lt;/head&gt;&lt;body onload=&quot;LiloInit();&quot;&gt;&lt;/body&gt;&lt;/html&gt;
 |
| --- |









# 3. Lilo Rendering and Layouts

Lilo can use one of two composition arrangements, a single 2D Canvas layer, or a WebGL layer stacked with a 2D Canvas layer. The WebGL layer is always at the back. All controls on both sets of layers are rendered in Z order per layer.

![alt tag](http://www.terraspace.co.uk/gfx/doc2.png)

The main structural layout item of **LILO** is the **View.** Only one view can be active at any one time and it occupies the entire display. Controls can be added to views in any way you see fit. Lilo provides container controls to additionally structure layout such as **Window** , **Dialog** , **Panel** , **Group** etc. Lilo does not try to impose any form of layout on you but rather expects you to provide style settings and a style method for each control which defines its visual style. Most controls also implement transitions such as wipes, fade, animation, update etc. By taking this approach all controls can be implemented in a responsive manner using code to define their logic. This allows you to separate controls, panels, dialogs into logical modules and separate source files and achieve a degree of separation between layout and code not normally possible while still having the layout be manipulated and dynamically responsive to changes in the code or data. This allows an MVC style of use if required.

Lilo comes with a number of built-in controls which are easily extended or customised:

**View, Button, Panel, Image, TextBox, Rect, Label, Checkbox, Video, PixelView, PaintView, Spinner, ProgressBar, Window, Slider, Group, RowSet, Select, SlideMenu, Toggle, ActionBar, Texture, GLImage, GLCheckerboard.**









Here are some examples of how to create a control and define its initial settings, style handler and event handlers:

| **function** CreateMainView() {     **var** view = Lilo.Engine.CreateView(&quot;mainview&quot;);     **var** buffer0 = Lilo.Engine.CreateFrameBuffer( Lilo.SCREEN\_WIDTH, Lilo.SCREEN\_HEIGHT );        **var** toplogo = **new** Lilo.Image(&quot;toplogo&quot;, &quot;gfx/logo2.png&quot;, {        opacity:1.0, radius:0.0, z:2, rotation:0.0,        style : **function** () {            **this**.height = Lilo.SCREEN\_HEIGHT/3.6;            **this**.width = **this**.height / **this**.aspect;            **this**.x = (Lilo.SCREEN\_WIDTH/2) - ( **this**.width/2);            **this**.y =-20;        }    });     **var** bkg = **new** Lilo.GLImage(&quot;glbkg&quot;, &quot;gfx/bkg.png&quot;, {        x:0, y:0, z:0, rotation:0.0, width:100, height:100, glControl: **true** ,        isVisible : **true** , opacity :1.0, priority:0, renderTarget: buffer0,        style : **function** () {            **this**.x = (Lilo.SCREEN\_WIDTH/2);            **this**.y = (Lilo.SCREEN\_HEIGHT/2);            **this**.width = Lilo.SCREEN\_WIDTH;            **this**.height = Lilo.SCREEN\_HEIGHT;        }    });     **var** cb = **new** Lilo.GLCheckerBoard(&quot;glchecker&quot;, {        x:0, y:0, z:1, rotation:0.0, width:100, height:100, glControl: **true** ,        isVisible : **true** , opacity :1.0, priority:1, renderTarget: buffer0,        style : **function** () {            **this**.width = Lilo.SCREEN\_WIDTH;            **this**.height = Lilo.SCREEN\_HEIGHT;        },        animate : **function** () {            **this**.fxrotation +=0.1;        }    });     **var** warplogo = **new** Lilo.GLImage(&quot;warplogo&quot;, &quot;gfx/electronics.png&quot;, {        x:0, y:0, z:2, rotation:0.0, width:100, height:100, glControl: **true** ,        isVisible : **true** , opacity :0.5, priority:0, renderTarget: buffer0,        style : **function** () {            **this**.width = Lilo.SCREEN\_WIDTH/2.5;            **this**.height = **this**.width \ ***this**.aspect;            **this**.x = (Lilo.SCREEN\_WIDTH/2);            **this**.y = Lilo.SCREEN\_HEIGHT - ((Lilo.SCREEN\_HEIGHT) - **this**.height/2);            **this**.scale =4+ (Math.sin( Lilo.Engine.frameNumber/50 ) \*3);            **this**.x = (Lilo.SCREEN\_WIDTH/2) + ((Math.sin( Lilo.Engine.frameNumber/50 )) \* (Lilo.SCREEN\_WIDTH/7));            **this**.y = (Lilo.SCREEN\_HEIGHT/2) + ((Math.cos( Lilo.Engine.frameNumber/50 )) \* (Lilo.SCREEN\_HEIGHT/7));            **this**.fxrotation -=0.25;        },        onrenderdone : **function** ( glCtx, ctx )        {            **if** ( **this**.renderTarget != **null** )            {             _//   Lilo.Engine.LoadFrameBuffer( this.renderTarget );_              **var** img = Lilo.Engine.FindControlById(&quot;imgComp&quot;);             img.SetTexture( Lilo.Engine.fboTextures[**this**.renderTarget] );            }        }            });     **var** imgComp = **new** Lilo.GLImage(&quot;imgComp&quot;, &quot;gfx/bkg.png&quot;, {        x:0, y:0, z:3, rotation:0.0, width:100, height:100, glControl: **true** ,        isVisible : **true** , opacity :1.0, priority:0, renderTarget: **null** ,        style : **function** () {            **this**.x = (Lilo.SCREEN\_WIDTH/2);            **this**.y = (Lilo.SCREEN\_HEIGHT/2);            **this**.width = Lilo.SCREEN\_WIDTH;            **this**.height = Lilo.SCREEN\_HEIGHT;        }    });     **var** mainPanel = **new** Lilo.Panel(&quot;mainpanel&quot;, {        x:0, y:0, z:0, rotation:0.0, width:100, height:100, isVisible : **true** , opacity :1, radius:0,        foreground:&quot;rgba(0,0,0,1.0)&quot;, background:&quot;rgba(200,215,255,1.0)&quot;, touchPan: **true** ,         clipped: **true** , hideoverflow: **true** , horiz\_scroll: **true** , scroll\_tips: **true** , transparent: **true** ,        style : **function** () {            **this**.width = Lilo.SCREEN\_WIDTH/1.3;            **this**.height = Lilo.SCREEN\_HEIGHT/1.45;            **this**.x = (Lilo.SCREEN\_WIDTH/2) - ( **this**.width/2);            **this**.y = Lilo.SCREEN\_HEIGHT - **this**.height -50;        }    });        **var** copyLabel = **new** Lilo.Label(&quot;copylbl&quot;, &quot; © copyright 2016 Terraspace ltd&quot;, {        x:0, y:0, z:3, position: Lilo.POSITION\_RELATIVE, radius:0, opacity:1.0,         foreground:&quot;rgba(255,255,255,1.0)&quot;, fontFace:&quot;Arial&quot;, fontSize:25, textAlign:&#39;center&#39;,        style : **function** () {            **this**.fontSize = Lilo.Engine.GetResolutionFontSize(25, 2048);            **this**.width = Lilo.SCREEN\_WIDTH/1.3;            **this**.height =20;            **this**.x = (Lilo.SCREEN\_WIDTH/2) - ( **this**.width/2);            **this**.y = Lilo.SCREEN\_HEIGHT -35;        }    });     **var** hjwasmLabel = **new** Lilo.Label(&quot;hjwasmlbl&quot;, &quot;HJWASM&quot;, {        x:0, y:0, z:15, position: Lilo.POSITION\_ABSOLUTE, radius:0, opacity:1.0,         foreground:&quot;rgba(255,255,255,1.0)&quot;, fontFace:&quot;Arial&quot;, fontSize:30, textAlign:&#39;center&#39;, fontWeight:&#39;bold&#39;,        style : **function** () {            **this**.fontSize = Lilo.Engine.GetResolutionFontSize(30, 2048);            **this**.width =150;            **this**.height =20;            **var** panel = Lilo.Engine.FindControlById(&quot;mainpanel&quot;);            **this**.x = (Lilo.SCREEN\_WIDTH/2) - ( **this**.width/2);            **this**.y = panel.y -35;        },        onclick : **function** () {            **var** panel = Lilo.Engine.FindControlById(&quot;mainpanel&quot;);            **var** subpanel = Lilo.Engine.FindControlById(&quot;hjwasmpanel&quot;);            panel.ScrollTo( subpanel.x, 0, 1 );        }           });     **var** liloLabel = **new** Lilo.Label(&quot;lilolbl&quot;, &quot;LILO&quot;, {        x:0, y:0, z:15, position: Lilo.POSITION\_ABSOLUTE, radius:0, opacity:1.0,         foreground:&quot;rgba(255,255,255,1.0)&quot;, fontFace:&quot;Arial&quot;, fontSize:30, textAlign:&#39;center&#39;, fontWeight:&#39;bold&#39;,        style : **function** () {            **this**.fontSize = Lilo.Engine.GetResolutionFontSize(30, 2048);            **this**.width =150;            **this**.height =20;            **var** panel = Lilo.Engine.FindControlById(&quot;mainpanel&quot;);            **var** lbl = Lilo.Engine.FindControlById(&quot;hjwasmlbl&quot;);            **this**.x = lbl.x +200;            **this**.y = panel.y -35;        },        onclick : **function** () {            Lilo.Engine.OpenURL(&quot;https://github.com/Terraspace/LILO&quot;,&quot;\_blank&quot;);        }    });     **var** dbLabel = **new** Lilo.Label(&quot;dblbl&quot;, &quot;DBShell&quot;, {        x:0, y:0, z:15, position: Lilo.POSITION\_ABSOLUTE, radius:0, opacity:1.0,         foreground:&quot;rgba(255,255,255,1.0)&quot;, fontFace:&quot;Arial&quot;, fontSize:30, textAlign:&#39;center&#39;, fontWeight:&#39;bold&#39;,        style : **function** () {            **this**.fontSize = Lilo.Engine.GetResolutionFontSize(30, 2048);            **this**.width =150;            **this**.height =20;            **var** panel = Lilo.Engine.FindControlById(&quot;mainpanel&quot;);            **var** lbl = Lilo.Engine.FindControlById(&quot;lilolbl&quot;);            **this**.x = lbl.x +200;            **this**.y = panel.y -35;        },        onclick : **function** () {            **var** panel = Lilo.Engine.FindControlById(&quot;mainpanel&quot;);            **var** subpanel = Lilo.Engine.FindControlById(&quot;dbshellpanel&quot;);            panel.ScrollTo( subpanel.x, 0, 1 );        }    });     mainPanel.Add( CreateHJWASMPanel() );    mainPanel.Add( CreateDBShellPanel() );     view.Add( hjwasmLabel );    view.Add( liloLabel );    view.Add( dbLabel );    view.Add( copyLabel );    view.Add( bkg );    view.Add( cb );    view.Add( warplogo );    view.Add( imgComp );    view.Add( toplogo );    view.Add( mainPanel );     **return** (view); }  |
| --- |

Lilo aims to provide a number of points to integrate drawing into its rendering and composition pipeline to allow the greatest flexibility. By default everything is handled internally and adding controls requires no additional intervention. There are however use-cases for games, custom rendering or with more complex WebGL controls where you may require more finely grained control of how elements are rendered or composited. Lilo creates the final output on a frame-by-frame basis, the basic flow per frame is as follows:

![alt tag](http://www.terraspace.co.uk/gfx/doc1.png)

For an application UI nothing should require hooking. For a game type scenario one may wish to hook the Pre or Post render calls only and provide an entirely custom implementation of graphics, rendering. These options can be mixed and matched through separate views, some custom, some using purely Lilo controls or a mixture of both.

Lilo can create additional frame buffer objects and WebGL controls can be linked to render to these target buffers instead of the primary screen layer. This offers you the ability to run filters or blit operations and combine the results in unique ways before presenting the final result.

# 4. What&#39;s Next?

Orientation, Gesture, Touch, Pointer, Mouse and keyboard events are all unified, captured and sent to the relevant handlers on all Lilo controls. Event handling respects focus, z-order and visibility clipping. Controls such as Lilo.Textbox being custom-rendered make uses of Cocoon.IO&#39;s programmatic soft-keyboard on mobile devices and regular keyboard / mouse interaction on desktop.

Check out the **examples** , or read the **API documentation**.