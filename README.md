# What is LILO?

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