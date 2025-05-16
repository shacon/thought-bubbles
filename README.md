# Thought Bubbles

An experimental web application using Matter.js physics engine to visualize and interact with thoughts as physical objects.

## Demo

Check out the live demo [here](https://shacon.github.io/thought-bubbles/)

## About

Thought Bubbles is an experimental project exploring Matter.js, a JavaScript 2D physics engine. The application allows users to:

- Enter thoughts as text
- Create physical "bubbles" containing these thoughts
- Interact with the bubbles through realistic physics (throwing, bouncing, spinning)
- Experiment with cognitive defusion techniques in a visual, interactive way

This project demonstrates Matter.js capabilities while creating a unique tool for mental perspective-taking.

## Development

To run the project locally:

1. Clone this repository
2. Navigate to the `docs` directory
3. Start a local server:

```
python -m http.server 8001
```

4. Open http://localhost:8001/ in your browser

## Technical Details

- **Physics Engine**: Matter.js for realistic 2D physics simulation
- **Networking**: PeerJS integration coming soon (not yet implemented)
- **No Build Process**: Deliberately using vanilla JS with CDN dependencies for simplicity

## Deployment

This project is designed to be served directly from a CDN without a build step.

## Future Ideas

- Implement PeerJS for real-time peer-to-peer interaction
- Add a build step to bundle everything for faster client downloads
- Add more interaction types beyond throwing, bouncing and spinning