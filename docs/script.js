// var Engine = Matter.Engine,
//     Render = Matter.Render,
//     Runner = Matter.Runner,
//     Bodies = Matter.Bodies,
//     Composite = Matter.Composite;
//     Mouse = Matter.Mouse;
//     MouseConstraint = Matter.MouseConstraint;

// var canvas = document.getElementById('matter-container');
// var engine = Engine.create();
// const circle = {
//   w: 140,
//   h: 140,
//   body: Matter.Bodies.circle(
//     150,
//     150,
//     70,
//     {frictionAir: .01, gravity: 0, restitution: 1}
//   ),
//   elem: document.querySelector("#circle"),
//   render() {
//     const {x, y} = this.body.position;
//     this.elem.style.top = `${y - this.h / 2}px`;
//     this.elem.style.left = `${x - this.w / 2}px`;
//     this.elem.style.transform = `rotate(${this.body.angle}rad)`;
//   },
// };
// const wallOptions = { isStatic: true, restitution: .8 };
// const ground = Bodies.rectangle(300, 600, 600, 60, wallOptions);
// const leftWall = Bodies.rectangle(100, 300, 60, 600, wallOptions);
// const rightWall = Bodies.rectangle(600, 300, 60, 600, wallOptions);
// const ceiling = Bodies.rectangle(300, 60, 600, 60, wallOptions);
// Matter.Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);
// const mouseConstraint = Matter.MouseConstraint.create(
//   engine, {element: document.body}
// );
// Matter.Composite.add(
//   engine.world, [ ground, mouseConstraint]
// );
// const floatForce = 0.0002;
// const randomForce = 0.0001;
// const canvasWidth = 600;
// const canvasHeight = 600;
// Matter.Events.on(engine, "beforeUpdate", () => {
//   circles.forEach(circle => {
//     Matter.Body.applyForce(circle.body, circle.body.position, { 
//       x: 0,
//       y: -floatForce
//     });
//     Matter.Body.applyForce(circle.body, circle.body.position, { 
//       x: (Math.random() - 0.5) * randomForce,
//       y: 0
//     });
//   });
// });
// function createCircle(text) {
//   const randomSize = Math.floor(Math.random() * (140 - 60 + 1)) + 60; // 
//   const newCircle = {
//     w: randomSize,
//     h: randomSize,
//     body: Matter.Bodies.circle(
//       Math.random() * canvasWidth,
//       Math.random() * canvasHeight,
//       70,
//       {frictionAir: .01, gravity: 0, restitution: .8}
//     ),
//     elem: document.createElement('div'),
//     render() {
//       const {x, y} = this.body.position;
//       this.elem.style.top = `${y - this.h / 2}px`;
//       this.elem.style.left = `${x - this.w / 2}px`;
//       this.elem.style.transform = `rotate(${this.body.angle}rad)`;
//       this.elem.style.width = `${this.w}px`;
//       this.elem.style.height = `${this.h}px`;
//     },
//   };
//   newCircle.elem.className = 'circle';
//   newCircle.elem.textContent = text;
//   document.body.appendChild(newCircle.elem);
//   Matter.Composite.add(engine.world, newCircle.body);
//   return newCircle;
// }
// const circles = [circle];
// document.getElementById('circleForm').addEventListener('submit', function(e) {
//   e.preventDefault();
//   const text = document.getElementById('circleText').value;
//   if (text) {
//     circles.push(createCircle(text));
//     document.getElementById('circleText').value = '';
//   }
// });


// (function rerender() {
//   circles.forEach(circle => circle.render());
//   Matter.Engine.update(engine);
//   requestAnimationFrame(rerender);
// })();

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

var canvas = document.getElementById('matter-container');
var circlesContainer = document.getElementById('circles-container');
var engine = Engine.create();

var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: 600,
        height: 600,
        wireframes: true,
        background: 'transparent'
    }
});


var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

Matter.Composite.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;


// Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

const wallOptions = { isStatic: true, restitution: .8 };
const ground = Bodies.rectangle(300, 590, 600, 20, wallOptions);
const leftWall = Bodies.rectangle(10, 300, 20, 600, wallOptions);
const rightWall = Bodies.rectangle(590, 300, 20, 600, wallOptions);
const ceiling = Bodies.rectangle(300, 10, 600, 20, wallOptions);

Matter.Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);


const floatForce = 0.0002;
const randomForce = 0.0001;
const canvasWidth = 600;
const canvasHeight = 600;

function createCircle(text) {
    const randomSize = Math.floor(Math.random() * (80 - 40 + 1)) + 40;

    const spawnMargin = 50;

    const newCircle = Bodies.circle(
        spawnMargin + Math.random() * (canvasWidth / 4),
        spawnMargin,
        randomSize / 2,
        {
            frictionAir: 0.01,
            restitution: 0.8
        }
    );

    const elem = document.createElement('div');
    elem.className = 'circle';
    elem.textContent = text;
    elem.style.width = `${randomSize}px`;
    elem.style.height = `${randomSize}px`;
    circlesContainer.appendChild(elem);

    const renderCircle = () => {
        const { x, y } = newCircle.position;
        elem.style.transform = `translate(${x - randomSize/2}px, ${y - randomSize/2}px) rotate(${newCircle.angle}rad)`;
    };

    Matter.Events.on(engine, 'afterUpdate', renderCircle);

    Matter.Composite.add(engine.world, newCircle);
    return newCircle;
}

const circles = [];

document.getElementById('circleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const text = document.getElementById('circleText').value;
    if (text) {
        circles.push(createCircle(text));
        document.getElementById('circleText').value = '';
    }
});

Matter.Events.on(engine, "beforeUpdate", () => {
    circles.forEach(circle => {
        Matter.Body.applyForce(circle, circle.position, { 
            x: (Math.random() - 0.5) * randomForce,
            y: -floatForce
        });
    });
});

function resizeCanvas() {
  var container = document.getElementById('simulation-container');
  var canvas = document.getElementById('matter-container');
  var width = container.clientWidth;
  var height = container.clientHeight;

  canvas.width = width;
  canvas.height = height;

  // Update Matter.js render bounds
  render.bounds.max.x = width;
  render.bounds.max.y = height;
  render.options.width = width;
  render.options.height = height;

  // Update wall positions
  Matter.Body.setPosition(ground, { x: width/2, y: height });
  Matter.Body.setPosition(leftWall, { x: 0, y: height/2 });
  Matter.Body.setPosition(rightWall, { x: width, y: height/2 });
  Matter.Body.setPosition(ceiling, { x: width/2, y: 0 });
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Call once to set initial size

