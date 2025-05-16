var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

var canvas = document.getElementById("matter-container");
var circlesContainer = document.getElementById("circles-container");
var thoughtContainer = document.getElementById("thought-container");
var engine = Engine.create();

var render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    wireframes: true,
    background: "transparent",
  },
});

var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

Matter.Composite.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

var runner = Runner.create();
Runner.run(runner, engine);

const wallOptions = { isStatic: true, restitution: 0.8 };

const container = document.getElementById("simulation-container");
const width = container.clientWidth;
const height = container.clientHeight;

const ground = Bodies.rectangle(width / 2, height - 10, width, 20, wallOptions);
const leftWall = Bodies.rectangle(10, height / 2, 20, height, wallOptions);
const rightWall = Bodies.rectangle(
  width - 10,
  height / 2,
  20,
  height,
  wallOptions
);
const ceiling = Bodies.rectangle(width / 2, 10, width, 20, wallOptions);

Matter.Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

const floatForce = 0.0002;
const randomForce = 0.0001;

function createCircle(text) {
  console.log(ground);
  const width = render.options.width;
  const height = render.options.height;
  const baseSize = 40;
  const scaleFactor = 2;
  const maxSize = 150;

  const size = Math.min(baseSize + text.length * scaleFactor, maxSize);
  const radius = size / 1.5;

  const spawnMargin = 50;

  const newCircle = Bodies.circle(
    spawnMargin + Math.random() * (width / 4),
    spawnMargin + Math.random() * (height / 2),
    radius,
    {
      frictionAir: 0.01,
      restitution: 0.8,
    }
  );

  const elem = document.createElement("div");
  elem.className = "circle";
  elem.textContent = text;
  elem.style.width = `${size}px`;
  elem.style.height = `${size}px`;
  elem.style.borderRadius = "50%";
  elem.style.display = "flex";
  elem.style.justifyContent = "center";
  elem.style.alignItems = "center";
  elem.style.textAlign = "center";
  circlesContainer.appendChild(elem);

  const renderCircle = () => {
    const { x, y } = newCircle.position;
    elem.style.transform = `translate(${x - size / 2}px, ${
      y - size / 2
    }px) rotate(${newCircle.angle}rad)`;
  };

  Matter.Events.on(engine, "afterUpdate", renderCircle);

  Matter.Composite.add(engine.world, newCircle);
  return newCircle;
}

const circles = [];

document.getElementById("circleForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("circleText").value;
  if (text) {
    circles.push(createCircle(text));
    document.getElementById("circleText").value = "";
  }
});

// const containerButton = document.getElementById("container-button");

// Add the event listener
containerButton.addEventListener("click", function () {
  // This function will be executed when the element is clicked
  console.log("Button clicked!");
  createContainer();
});

function createContainer() {
  // Container dimensions and positioning
  const containerOffset = 110; // Distance from bottom
  const containerLeftX = width / 4;
  const containerRightX = (3 * width) / 4;
  const containerWidth = width / 2; // Width between side walls
  const containerHeight = height / 2; // Height of side walls
  const wallThickness = 20;

  const bottomY = height - containerOffset; // Y position of bottom wall's center
  const containerVerticalCenter = (height / 2 + bottomY) / 2; // Midpoint between top and bottom
  const sideHeight = height - containerOffset - height / 4; // Height that reaches bottom wall

  const bottomSide = Bodies.rectangle(
    width / 2, // centered horizontally
    height - containerOffset, // offset from bottom
    containerWidth, // width
    wallThickness, // height
    wallOptions
  );

  const leftSide = Bodies.rectangle(
    containerLeftX,
    containerVerticalCenter,
    wallThickness,
    sideHeight,
    wallOptions
  );

  const rightSide = Bodies.rectangle(
    containerRightX,
    containerVerticalCenter,
    wallThickness,
    sideHeight,
    wallOptions
  );

  const elem = document.createElement("div");
  elem.className = "container";
  elem.style.left = `${width / 2}px`;
  elem.style.top = `${height - containerOffset - containerHeight / 2}px`;
  elem.style.width = `${containerWidth}px`;
  elem.style.height = `${containerHeight}px`;
  thoughtContainer.appendChild(elem);

  // TODO - store state somewhere
  // const containerButton = document.getElementById("container-button");
  containerButton.disabled = true;

  Matter.Composite.add(engine.world, [leftSide, bottomSide, rightSide]);
}

function checkBounds(circle) {
  // Ensure circle does not exist the canvas
  const width = render.options.width;
  const height = render.options.height;
  const radius = circle.circleRadius;
  if (circle.position.x < radius) {
    Matter.Body.setPosition(circle, { x: radius, y: circle.position.y });
    Matter.Body.setVelocity(circle, {
      x: Math.abs(circle.velocity.x),
      y: circle.velocity.y,
    });
  }
  if (circle.position.x > width - radius) {
    Matter.Body.setPosition(circle, {
      x: width - radius,
      y: circle.position.y,
    });
    Matter.Body.setVelocity(circle, {
      x: -Math.abs(circle.velocity.x),
      y: circle.velocity.y,
    });
  }
  if (circle.position.y < radius) {
    Matter.Body.setPosition(circle, { x: circle.position.x, y: radius });
    Matter.Body.setVelocity(circle, {
      x: circle.velocity.x,
      y: Math.abs(circle.velocity.y),
    });
  }
  if (circle.position.y > height - radius) {
    Matter.Body.setPosition(circle, {
      x: circle.position.x,
      y: height - radius,
    });
    Matter.Body.setVelocity(circle, {
      x: circle.velocity.x,
      y: -Math.abs(circle.velocity.y),
    });
  }
}

Matter.Events.on(engine, "beforeUpdate", () => {
  circles.forEach((circle) => {
    Matter.Body.applyForce(circle, circle.position, {
      x: (Math.random() - 0.5) * randomForce,
      y: -floatForce,
    });
    checkBounds(circle);
  });
});

function resizeCanvas() {
  var container = document.getElementById("simulation-container");
  var canvas = document.getElementById("matter-container");
  var width = container.clientWidth;
  var height = container.clientHeight;

  // Update canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Update render bounds
  render.bounds.max.x = width;
  render.bounds.max.y = height;
  render.options.width = width;
  render.options.height = height;

  // Update wall positions and sizes
  Matter.Body.setPosition(ground, { x: width / 2, y: height - 10 });
  Matter.Body.setPosition(leftWall, { x: 10, y: height / 2 });
  Matter.Body.setPosition(rightWall, { x: width - 10, y: height / 2 });
  Matter.Body.setPosition(ceiling, { x: width / 2, y: 10 });

  // Update wall sizes
  Matter.Body.setVertices(
    ground,
    Bodies.rectangle(width / 2, height - 10, width, 20).vertices
  );
  Matter.Body.setVertices(
    ceiling,
    Bodies.rectangle(width / 2, 10, width, 20).vertices
  );
  Matter.Body.setVertices(
    leftWall,
    Bodies.rectangle(10, height / 2, 20, height).vertices
  );
  Matter.Body.setVertices(
    rightWall,
    Bodies.rectangle(width - 10, height / 2, 20, height).vertices
  );

  // Force render to update
  Matter.Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: width, y: height },
  });
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
