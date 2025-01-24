
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
    const baseSize = 40;
    const scaleFactor = 2;
    const maxSize = 150;
    
    const size = Math.min(baseSize + (text.length * scaleFactor), maxSize);
    const radius = size / 1.5;

    const spawnMargin = 50;

    const newCircle = Bodies.circle(
        spawnMargin + Math.random() * (canvasWidth / 4),
        spawnMargin + Math.random() * (canvasHeight / 2),
        radius,
        {
            frictionAir: 0.01,
            restitution: 0.8
        }
    );

    const elem = document.createElement('div');
    elem.className = 'circle';
    elem.textContent = text;
    elem.style.width = `${size}px`;
    elem.style.height = `${size}px`;
    elem.style.borderRadius = '50%';
    elem.style.display = 'flex';
    elem.style.justifyContent = 'center';
    elem.style.alignItems = 'center';
    elem.style.textAlign = 'center';
    circlesContainer.appendChild(elem);


    const renderCircle = () => {
        const { x, y } = newCircle.position;
        elem.style.transform = `translate(${x - size/2}px, ${y - size/2}px) rotate(${newCircle.angle}rad)`;
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

function checkBounds(circle) {
  // Ensure circle does not exist the canvas
  const radius = circle.circleRadius;
  if (circle.position.x < radius) {
      Matter.Body.setPosition(circle, { x: radius, y: circle.position.y });
      Matter.Body.setVelocity(circle, { x: Math.abs(circle.velocity.x), y: circle.velocity.y });
  }
  if (circle.position.x > canvasWidth - radius) {
      Matter.Body.setPosition(circle, { x: canvasWidth - radius, y: circle.position.y });
      Matter.Body.setVelocity(circle, { x: -Math.abs(circle.velocity.x), y: circle.velocity.y });
  }
  if (circle.position.y < radius) {
      Matter.Body.setPosition(circle, { x: circle.position.x, y: radius });
      Matter.Body.setVelocity(circle, { x: circle.velocity.x, y: Math.abs(circle.velocity.y) });
  }
  if (circle.position.y > canvasHeight - radius) {
      Matter.Body.setPosition(circle, { x: circle.position.x, y: canvasHeight - radius });
      Matter.Body.setVelocity(circle, { x: circle.velocity.x, y: -Math.abs(circle.velocity.y) });
  }
}

Matter.Events.on(engine, "beforeUpdate", () => {
    circles.forEach(circle => {
        Matter.Body.applyForce(circle, circle.position, { 
            x: (Math.random() - 0.5) * randomForce,
            y: -floatForce
        });
        checkBounds(circle);
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

