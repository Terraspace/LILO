# 1.What is LILO?

LILO is a Javascript framework that was born out of frustration at trying to build visually rich or interactive web and mobile applications. HTML and CSS were primarily designed for marking up documents, and this they are very useful for. Creating user interfaces and applications was never a good fit.

Over the years we have encountered so many headaches working with HTML, CSS and browsers.

1. No two browsers behave the same way, especially when dealing with CSS/HTML mark-up.
This extends the development and testing time as you go round in circles getting the same result under different browsers.
2. HTML5 in its raw form is simply too slow to deliver what is expected on mobile devices when looking at complex visual applications (IE: games, rendering, simulation, real-time etc).
3. Complexity when attempting to separate logic from display and dealing with responsive designs.
4. Obtuse implementation of style construction via CSS, (IE: display, float, block, media queries, selectors etc)

Lilo attempts to solve a lot of this head-ache by creating a robust library of controls and core framework which works exclusively in HTML5 canvas and WebGL. It unifies all platform and device event models and provides a clean way of developing modular code.

All controls being rendered via HTML5 Canvas and WebGL are ensured to look the same across all platforms as this appears to be one standard across all devices and browsers which has been adhered to accurately.

All controls are implemented entirely in code or via imported layout scripts, this means there is NO HTML or CSS anywhere.

Controls are easily added, extended or customized.

Lilo is built to work with both Electron and Cocoon.IO to allow the same code to be directly compiled for x86 native code on Windows, OSX, Linux and for iOS, Windows Store and Android via Cocoon.IO

It supports Cocoon.IO Canvas+ accelerated mode (as well as Webview and Webview+) to deliver 60fps performance for all user interfaces and complex graphical applications.

A novel approach to styling has been taken with Lilo in which all controls are rendered in a real-time / interactive manner and style logic is provided as code (via a style method) to determine the exact properties of the control. This allows you to design anything you can imagine, link controls positions to other controls, anchor them and relate their sizing to other controls without the need for applying complex or obscure CSS.





# 2. Getting started

Simply include **lilo.js** and the stub (&quot;empty&quot;) **cordova.js** (this file allows direct compatibility with Cocoon.IO).

![alt tag](http://www.terraspace.co.uk/gfx/doc3.png)








# 3. Lilo Rendering and Layouts

Lilo can use one of two composition arrangements, a single 2D Canvas layer, or a WebGL layer stacked with a 2D Canvas layer. The WebGL layer is always at the back. All controls on both sets of layers are rendered in Z order per layer.

![alt tag](http://www.terraspace.co.uk/gfx/doc2.png)

The main structural layout item of **LILO** is the **View.** Only one view can be active at any one time and it occupies the entire display. Controls can be added to views in any way you see fit. Lilo provides container controls to additionally structure layout such as **Window** , **Dialog** , **Panel** , **Group** etc. Lilo does not try to impose any form of layout on you but rather expects you to provide style settings and a style method for each control which defines its visual style. Most controls also implement transitions such as wipes, fade, animation, update etc. By taking this approach all controls can be implemented in a responsive manner using code to define their logic. This allows you to separate controls, panels, dialogs into logical modules and separate source files and achieve a degree of separation between layout and code not normally possible while still having the layout be manipulated and dynamically responsive to changes in the code or data. This allows an MVC style of use if required.

Lilo comes with a number of built-in controls which are easily extended or customised:

**View, Button, Panel, Image, TextBox, Rect, Label, Checkbox, Video, PixelView, PaintView, Spinner, ProgressBar, Window, Slider, Group, RowSet, Select, SlideMenu, Toggle, ActionBar, Texture, GLImage, GLCheckerboard.**









Here are some examples of how to create a control and define its initial settings, style handler and event handlers:

![alt tag](http://www.terraspace.co.uk/gfx/code-0.png)

Lilo aims to provide a number of points to integrate drawing into its rendering and composition pipeline to allow the greatest flexibility. By default everything is handled internally and adding controls requires no additional intervention. There are however use-cases for games, custom rendering or with more complex WebGL controls where you may require more finely grained control of how elements are rendered or composited. Lilo creates the final output on a frame-by-frame basis, the basic flow per frame is as follows:

![alt tag](http://www.terraspace.co.uk/gfx/doc1.png)

For an application UI nothing should require hooking. For a game type scenario one may wish to hook the Pre or Post render calls only and provide an entirely custom implementation of graphics, rendering. These options can be mixed and matched through separate views, some custom, some using purely Lilo controls or a mixture of both.

Lilo can create additional frame buffer objects and WebGL controls can be linked to render to these target buffers instead of the primary screen layer. This offers you the ability to run filters or blit operations and combine the results in unique ways before presenting the final result.

# 4. What&#39;s Next?

Orientation, Gesture, Touch, Pointer, Mouse and keyboard events are all unified, captured and sent to the relevant handlers on all Lilo controls. Event handling respects focus, z-order and visibility clipping. Controls such as Lilo.Textbox being custom-rendered make uses of Cocoon.IO&#39;s programmatic soft-keyboard on mobile devices and regular keyboard / mouse interaction on desktop.

Check out the **examples** , or read the **API documentation**.