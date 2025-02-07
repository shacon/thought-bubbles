### Creating Containers: Physics and Visual Alignment Guide

#### Canvas Points and Walls

Bottom Wall Positioning

A container is made up of three separate rectangles to make up the bottom, left and right sides
↓
width/2
             ↓
    +------------------+
    |                  |
    |                  |
    |                  |
    |                  | height-110
    |         •        | ←
    |    [==========]  | ← rectangle 20px tall, width/2 wide
    |                  |
    +------------------+
The bottom wall's center point is at (width/2, height-containerOffset). The wall extends horizontally by containerWidth and has a height of wallThickness.
Left Wall Positioning
+------------------+
    |                  |
    |                  |
    |   ‖              |
    |   ‖     height/2 |
    |   •              | ← height/2
    |   ‖              |
    |   ‖              |
    +------------------+
        ↑
      width/4
↑
width/4
The left wall's center point is at (width/4, containerVerticalCenter). The wall extends vertically by sideHeight and has a width of wallThickness.
Right Wall Positioning
+------------------+
    |                  |
    |                  |
    |              ‖   |
    |              ‖   | height/2
    |              •   | ← height/2
    |              ‖   |
    |              ‖   |
    +------------------+
                   ↑
               3*width/4
↑
3*width/4
The right wall's center point is at (3*width/4, containerVerticalCenter). The wall extends vertically by sideHeight and has a width of wallThickness.

CSS and Matter.js Physics Alignment

- The CSS container div must align with the physics bodies to create a visual representation of the body
- CSS positions from top-left, while physics bodies position from their center point (e.g. the first two arguments of a rectangle are the x, y of the middle point)
