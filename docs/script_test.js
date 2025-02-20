import {initializePeer} from "./networking.js";

initializePeer();

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

// RENDER
var render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    wireframes: true,
    background: "transparent",
  },
});

// MOUSE
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

// RUNNER
var runner = Runner.create();
Runner.run(runner, engine);

// WALLS OF CONTAINER
const wallOptions = { isStatic: true, restitution: 0.8 };
const container = document.getElementById("simulation-container");
const width = container.clientWidth;
const height = container.clientHeight;

// Create the limits of the canvas container to (mostly) keep objects inside
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

const containerButton = document.getElementById("container-button");

// CLASSES
class BubbleManager {
  constructor(render, divContainer) {
    console.log("in the bubble manager constructor");
    this.render = render;
    this.divContainer = divContainer;
    this.bubbles = [];

    // size setting contstants
    this.scaleFactor = 2;
    this.baseSize = 40;
    this.maxSize = 150;
    this.spawnMargin = 50;
    this.idCounter = 0;
  }

  generateId() {
    return `bubble-${this.idCounter++}`;
  }

  getBubblesState() {
    return this.bubbles.map((bubble) => ({
      id: this.generateId(),
      position: bubble.position,
      velocity: bubble.velocity,
      text: bubble.element.textContent, // You'll need to store element reference
      size: bubble.size, // You'll need to store size
    }));
  }

  addBubble(bubble) {
    this.bubbles.push(bubble);
  }

  getBubbles() {
    return this.bubbles;
  }

  createPhysicsBody(bubbleElement, bubbleSize) {
    const width = this.render.options.width;
    const height = this.render.options.height;
    const radius = bubbleSize / 1.5;

    const newBubble = Bodies.circle(
      this.spawnMargin + Math.random() * (width / 4),
      this.spawnMargin + Math.random() * (height / 2),
      radius,
      {
        frictionAir: 0.01,
        restitution: 0.8,
      }
    );
    const renderCircle = () => {
      const { x, y } = newBubble.position;
      bubbleElement.style.transform = `translate(${x - bubbleSize / 2}px, ${
        y - bubbleSize / 2
      }px) rotate(${newBubble.angle}rad)`;
    };

    Matter.Events.on(engine, "afterUpdate", renderCircle);

    Matter.Composite.add(engine.world, newBubble);
    return newBubble;
  }

  calculateSize(text) {
    return Math.min(
      this.baseSize + text.length * this.scaleFactor,
      this.maxSize
    );
  }

  createBubbleElement(text, bubbleSize) {
    const elem = document.createElement("div");
    elem.className = "circle";
    elem.textContent = text;
    elem.style.width = `${bubbleSize}px`;
    elem.style.height = `${bubbleSize}px`;
    elem.style.borderRadius = "50%";
    elem.style.display = "flex";
    elem.style.justifyContent = "center";
    elem.style.alignItems = "center";
    elem.style.textAlign = "center";
    this.divContainer.appendChild(elem);
    return elem;
  }

  createBubble(text) {
    const bubbleSize = this.calculateSize(text);
    const bubbleElement = this.createBubbleElement(text, bubbleSize);
    const physicsBody = this.createPhysicsBody(bubbleElement, bubbleSize);
    // this.bubbles.push(physicsBody);
    this.bubbles.push({
      body: physicsBody,
      element: bubbleElement,
      text: text,
      size: bubbleSize,
    });
  }
}

class WorldManager {
  constructor(render, container, canvas, walls, bubbleManager, engine) {
    this.render = render;
    this.container = container;
    this.canvas = canvas;
    this.walls = walls;
    this.bubbleManager = bubbleManager;
    this.engine = engine;
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();
    this.setupPhysicsEvents();
    this.floatForce = 0.0002;
    this.randomForce = 0.0001;
  }

  setupPhysicsEvents() {
    Matter.Events.on(this.engine, "beforeUpdate", () => this.updatePhysics());
  }

  updatePhysics() {
    const bubbles = this.bubbleManager.getBubbles();
    bubbles.forEach((bubble) => {
      Matter.Body.applyForce(bubble.body, bubble.body.position, {
        x: (Math.random() - 0.5) * this.randomForce,
        y: -this.floatForce,
      });
      this.checkBounds(bubble.body);
    });
  }

  checkBounds(circle) {
    const width = this.render.options.width;
    const height = this.render.options.height;
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

  resizeCanvas() {
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
}

class ContainerManager {
  constructor(engine, thoughtContainer, simulationContainer) {
    this.engine = engine;
    this.thoughtContainer = thoughtContainer;
    this.simulationContainer = simulationContainer;
    this.containerButton = document.getElementById("container-button");

    this.containerButton.addEventListener("click", () =>
      this.createContainer()
    );
  }

  createContainer() {
    // Container dimensions and positioning
    const width = this.simulationContainer.clientWidth;
    const height = this.simulationContainer.clientHeight;
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
    const containerButton = document.getElementById("container-button");
    containerButton.disabled = true;

    Matter.Composite.add(engine.world, [leftSide, bottomSide, rightSide]);
  }
}

const simulationContainer = document.getElementById("simulation-container");
const containerManager = new ContainerManager(
  engine,
  thoughtContainer,
  simulationContainer
);
const bubbleManager = new BubbleManager(render, circlesContainer);
// Listen to user input for bubble creation
document.getElementById("circleForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("circleText").value;
  if (text) {
    bubbleManager.createBubble(text);
    document.getElementById("circleText").value = "";
  }
});

const walls = {
  ground,
  leftWall,
  rightWall,
  ceiling,
};

const worldManager = new WorldManager(
  render,
  container,
  canvas,
  walls,
  bubbleManager,
  engine
);
