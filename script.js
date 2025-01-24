
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;
    Mouse = Matter.Mouse;
    MouseConstraint = Matter.MouseConstraint;

var engine = Engine.create();

const circle = {
  w: 140,
  h: 140,
  body: Matter.Bodies.circle(
    150,
    150,
    70,
    {frictionAir: .01, gravity: 0, restitution: 1}
  ),
  elem: document.querySelector("#circle"),
  render() {
    const {x, y} = this.body.position;
    this.elem.style.top = `${y - this.h / 2}px`;
    this.elem.style.left = `${x - this.w / 2}px`;
    this.elem.style.transform = `rotate(${this.body.angle}rad)`;
  },
};

const wallOptions = { isStatic: true, restitution: 1 };

const ground = Bodies.rectangle(300, 600, 600, 60, wallOptions);
const leftWall = Bodies.rectangle(100, 300, 60, 600, wallOptions);
const rightWall = Bodies.rectangle(600, 300, 60, 600, wallOptions);
const ceiling = Bodies.rectangle(300, 0, 600, 60, wallOptions);


Matter.Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

const mouseConstraint = Matter.MouseConstraint.create(
  engine, {element: document.body}
);
Matter.Composite.add(
  engine.world, [ ground, mouseConstraint]
);


const floatForce = 0.0002;
const randomForce = 0.0001;
const canvasWidth = 600;
const canvasHeight = 600;

Matter.Events.on(engine, "beforeUpdate", () => {
  circles.forEach(circle => {
    Matter.Body.applyForce(circle.body, circle.body.position, { 
      x: 0,
      y: -floatForce
    });

    Matter.Body.applyForce(circle.body, circle.body.position, { 
      x: (Math.random() - 0.5) * randomForce,
      y: 0
    });
  });
});

function createCircle(text) {
  const randomSize = Math.floor(Math.random() * (140 - 60 + 1)) + 60; // 
  const newCircle = {
    w: randomSize,
    h: randomSize,
    body: Matter.Bodies.circle(
      Math.random() * canvasWidth,
      Math.random() * canvasHeight,
      70,
      {frictionAir: .01, gravity: 0, restitution: 1}
    ),
    elem: document.createElement('div'),
    render() {
      const {x, y} = this.body.position;
      this.elem.style.top = `${y - this.h / 2}px`;
      this.elem.style.left = `${x - this.w / 2}px`;
      this.elem.style.transform = `rotate(${this.body.angle}rad)`;
      this.elem.style.width = `${this.w}px`;
      this.elem.style.height = `${this.h}px`;
    },
  };

  newCircle.elem.className = 'circle';
  newCircle.elem.textContent = text;
  document.body.appendChild(newCircle.elem);

  Matter.Composite.add(engine.world, newCircle.body);
  return newCircle;
}

const circles = [circle];

document.getElementById('circleForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const text = document.getElementById('circleText').value;
  if (text) {
    circles.push(createCircle(text));
    document.getElementById('circleText').value = '';
  }
});

(function rerender() {
  circles.forEach(circle => circle.render());
  Matter.Engine.update(engine);
  requestAnimationFrame(rerender);
})();
