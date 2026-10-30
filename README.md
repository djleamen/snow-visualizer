# 3D Snow Depth Visualizer ❄️

An interactive web application that visualizes snow depth in 3D perspective by comparing it with real-world objects.

## Features

- **Interactive 3D Visualization**: Fully interactive 3D scene with orbit controls
- **Multiple Units**: Support for cm, inches, feet, and meters
- **Reference Objects**: Compare snow depth with familiar objects:
  - Soda Can (12 cm)
  - Basketball (24 cm)
  - Traffic Cone (70 cm)
  - Average Person (170 cm)
  - Standard Door (200 cm)
  - Car (150 cm)
- **Quick Presets**: One-click buttons for common snow depths
- **Historical Snow Data**: Look up the recorded snow depth for any place and date
- **Touch Support**: One-finger rotate and pinch-to-zoom on phones and tablets
- **Custom Input**: Enter any snow depth value
- **Real-time Comparison**: See percentage or multiple comparisons with reference objects

## How to Use

1. Open `index.html` in a modern web browser
2. Enter a snow depth value or click a preset button
3. Select your preferred unit (cm, inches, ft, m)
4. Choose a reference object for comparison
5. Or look up a real day: enter a location and date under **Historical Data** (powered by the free [Open-Meteo](https://open-meteo.com/) archive, no API key needed)
6. Interact with the 3D scene:
   - **Drag** (mouse or one finger): Rotate camera
   - **Scroll wheel / pinch**: Zoom in/out
   - **Right click + drag**: Pan camera

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Three.js (r128) for 3D rendering

## Browser Support

Works in all modern browsers that support WebGL:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

MIT License - feel free to use and modify!
