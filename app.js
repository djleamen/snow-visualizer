/*
Snow Depth Visualizer
Built with Three.js
*/

let scene, camera, renderer, controls;
let snowMesh, groundMesh, referenceMesh, gridHelper;
let currentSnowDepth = 10; // in cm
let currentUnit = 'cm';
let currentReferenceObject = 'soda-can';

// Reference object data (heights in cm)
const referenceObjects = {
    'soda-can': { height: 12, name: 'Soda Can' },
    'basketball': { height: 24, name: 'Basketball' },
    'traffic-cone': { height: 70, name: 'Traffic Cone' },
    'person': { height: 170, name: 'Average Person' },
    'door': { height: 200, name: 'Standard Door' },
    'car': { height: 150, name: 'Car' }
};

// Unit conversion to cm
function convertToCm(value, unit) {
    switch(unit) {
        case 'inches':
            return value * 2.54;
        case 'ft':
            return value * 30.48;
        case 'm':
            return value * 100;
        default: // cm
            return value;
    }
}

// Convert cm to specified unit
function convertFromCm(cm, unit) {
    switch(unit) {
        case 'inches':
            return (cm / 2.54).toFixed(2);
        case 'ft':
            return (cm / 30.48).toFixed(2);
        case 'm':
            return (cm / 100).toFixed(2);
        default: // cm
            return cm.toFixed(2);
    }
}

function init() {
    const canvas = document.getElementById('snowCanvas');
    const container = document.getElementById('canvas-container');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B7355,
        roughness: 0.8,
        metalness: 0.2
    });
    groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);
    
    gridHelper = new THREE.GridHelper(20, 20, 0x000000, 0x444444);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    
    setupControls();
    
    updateVisualization();
    
    animate();
    
    window.addEventListener('resize', onWindowResize);
}

function setupControls() {
    const canvas = document.getElementById('snowCanvas');
    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRotation = { theta: Math.PI / 4, phi: Math.PI / 6 };
    let cameraDistance = 8;
    let panOffset = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isDragging = true;
        } else if (e.button === 2) {
            isPanning = true;
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            cameraRotation.theta += deltaX * 0.01;
            cameraRotation.phi += deltaY * 0.01;
            cameraRotation.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraRotation.phi));
            
            updateCameraPosition();
        } else if (isPanning) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            panOffset.x += deltaX * 0.01;
            panOffset.y -= deltaY * 0.01;
            
            updateCameraPosition();
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        isPanning = false;
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        updateCameraPosition();
    });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    function updateCameraPosition() {
        const x = cameraDistance * Math.sin(cameraRotation.phi) * Math.cos(cameraRotation.theta);
        const y = cameraDistance * Math.cos(cameraRotation.phi);
        const z = cameraDistance * Math.sin(cameraRotation.phi) * Math.sin(cameraRotation.theta);
        
        camera.position.set(x + panOffset.x, y + panOffset.y, z);
        camera.lookAt(panOffset.x, panOffset.y, 0);
    }
}

function createSnow(depthCm) {
    if (snowMesh) {
        scene.remove(snowMesh);
    }
    
    const depthMeters = depthCm / 100;
    const geometry = new THREE.BoxGeometry(10, depthMeters, 10);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.9,
        metalness: 0.1
    });
    
    snowMesh = new THREE.Mesh(geometry, material);
    snowMesh.position.y = depthMeters / 2;
    snowMesh.castShadow = true;
    snowMesh.receiveShadow = true;
    scene.add(snowMesh);
}

function createReferenceObject(type) {
    if (referenceMesh) {
        scene.remove(referenceMesh);
    }
    
    const objData = referenceObjects[type];
    const heightMeters = objData.height / 100;
    
    referenceMesh = new THREE.Group();
    
    switch(type) {
        case 'soda-can':
            // Red soda can with silver top and bottom
            const canBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, heightMeters * 0.9, 16),
                new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.3, metalness: 0.7 })
            );
            const canTop = new THREE.Mesh(
                new THREE.CylinderGeometry(0.031, 0.031, heightMeters * 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 })
            );
            const canBottom = new THREE.Mesh(
                new THREE.CylinderGeometry(0.031, 0.031, heightMeters * 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 })
            );
            canTop.position.y = heightMeters * 0.475;
            canBottom.position.y = -heightMeters * 0.475;
            referenceMesh.add(canBody, canTop, canBottom);
            break;
            
        case 'basketball':
            // Orange basketball with black lines
            const ball = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.8, metalness: 0.1 })
            );
            referenceMesh.add(ball);
            referenceMesh.position.y = 0.12; // Radius from ground
            break;
            
        case 'traffic-cone':
            // Orange cone with white stripes
            const cone = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, heightMeters * 0.85, 16),
                new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.6, metalness: 0.1 })
            );
            cone.position.y = heightMeters * 0.425;
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, heightMeters * 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.2 })
            );
            base.position.y = heightMeters * 0.025;
            const stripe1 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.1, heightMeters * 0.08, 16),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.1 })
            );
            stripe1.position.y = heightMeters * 0.35;
            const stripe2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.065, heightMeters * 0.08, 16),
                new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.1 })
            );
            stripe2.position.y = heightMeters * 0.6;
            referenceMesh.add(base, cone, stripe1, stripe2);
            break;
            
        case 'person':
            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8, metalness: 0.1 })
            );
            head.position.y = heightMeters * 0.91;
            
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, heightMeters * 0.35, 0.15),
                new THREE.MeshStandardMaterial({ color: 0x4169E1, roughness: 0.7, metalness: 0.2 })
            );
            body.position.y = heightMeters * 0.65;
            
            const leftArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.035, heightMeters * 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0x4169E1, roughness: 0.7, metalness: 0.2 })
            );
            leftArm.position.set(-0.15, heightMeters * 0.65, 0);
            leftArm.rotation.z = Math.PI / 8;
            
            const rightArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.035, heightMeters * 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0x4169E1, roughness: 0.7, metalness: 0.2 })
            );
            rightArm.position.set(0.15, heightMeters * 0.65, 0);
            rightArm.rotation.z = -Math.PI / 8;
            
            const leftLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.045, heightMeters * 0.45, 8),
                new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7, metalness: 0.2 })
            );
            leftLeg.position.set(-0.07, heightMeters * 0.225, 0);
            
            const rightLeg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.045, heightMeters * 0.45, 8),
                new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7, metalness: 0.2 })
            );
            rightLeg.position.set(0.07, heightMeters * 0.225, 0);
            
            referenceMesh.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
            break;
            
        case 'door':
            // Door with frame and handle
            const doorFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.95, heightMeters * 1.02, 0.08),
                new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8, metalness: 0.1 })
            );
            const doorPanel = new THREE.Mesh(
                new THREE.BoxGeometry(0.85, heightMeters * 0.96, 0.04),
                new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.6, metalness: 0.2 })
            );
            doorPanel.position.z = 0.02;
            const doorHandle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.1, 8),
                new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.3, metalness: 0.8 })
            );
            doorHandle.position.set(-0.3, heightMeters * 0.5, 0.06);
            doorHandle.rotation.z = Math.PI / 2;
            referenceMesh.add(doorFrame, doorPanel, doorHandle);
            referenceMesh.position.y = heightMeters * 0.5;
            break;
            
        case 'car':
            // Car with body, roof, windows, and wheels
            const carLength = 4.5;
            const carWidth = 1.8;
            const carHeight = heightMeters;
            
            const carBody = new THREE.Mesh(
                new THREE.BoxGeometry(carWidth, carHeight * 0.4, carLength * 0.7),
                new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.4, metalness: 0.7 })
            );
            carBody.position.y = carHeight * 0.35;
            
            const carRoof = new THREE.Mesh(
                new THREE.BoxGeometry(carWidth * 0.9, carHeight * 0.35, carLength * 0.4),
                new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.4, metalness: 0.7 })
            );
            carRoof.position.y = carHeight * 0.65;
            
            const hood = new THREE.Mesh(
                new THREE.BoxGeometry(carWidth * 0.95, carHeight * 0.15, carLength * 0.25),
                new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.4, metalness: 0.7 })
            );
            hood.position.set(0, carHeight * 0.225, carLength * 0.475);
            
            const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
            const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.3 });
            
            const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel1.rotation.z = Math.PI / 2;
            wheel1.position.set(-carWidth * 0.55, carHeight * 0.12, carLength * 0.25);
            
            const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel2.rotation.z = Math.PI / 2;
            wheel2.position.set(carWidth * 0.55, carHeight * 0.12, carLength * 0.25);
            
            const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel3.rotation.z = Math.PI / 2;
            wheel3.position.set(-carWidth * 0.55, carHeight * 0.12, -carLength * 0.25);
            
            const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel4.rotation.z = Math.PI / 2;
            wheel4.position.set(carWidth * 0.55, carHeight * 0.12, -carLength * 0.25);
            
            const windowMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x444444, 
                roughness: 0.1, 
                metalness: 0.9,
                transparent: true,
                opacity: 0.6
            });
            
            const frontWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(carWidth * 0.85, carHeight * 0.25),
                windowMaterial
            );
            frontWindow.position.set(0, carHeight * 0.65, carLength * 0.201);
            
            const backWindow = new THREE.Mesh(
                new THREE.PlaneGeometry(carWidth * 0.85, carHeight * 0.25),
                windowMaterial
            );
            backWindow.position.set(0, carHeight * 0.65, -carLength * 0.201);
            backWindow.rotation.y = Math.PI;
            
            referenceMesh.add(carBody, carRoof, hood, wheel1, wheel2, wheel3, wheel4, frontWindow, backWindow);
            break;
            
        default:
            const defaultMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, heightMeters, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.3 })
            );
            referenceMesh.add(defaultMesh);
            referenceMesh.position.y = heightMeters * 0.5;
    }
    
    if (type !== 'basketball' && type !== 'door') {
        referenceMesh.position.set(2, 0, 0);
    } else if (type === 'basketball') {
        referenceMesh.position.set(2, 0, 0);
    }
    
    referenceMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
        }
    });
    
    scene.add(referenceMesh);
}

function updateVisualization() {
    const depthCm = convertToCm(currentSnowDepth, currentUnit);
    createSnow(depthCm);
    createReferenceObject(currentReferenceObject);
    updateDisplay();
}

function updateDisplay() {
    const depthCm = convertToCm(currentSnowDepth, currentUnit);
    const displayValue = convertFromCm(depthCm, currentUnit);
    const unitLabel = currentUnit === 'ft' ? 'ft' : currentUnit;
    
    document.getElementById('displayDepth').textContent = `${displayValue} ${unitLabel}`;
    
    const refData = referenceObjects[currentReferenceObject];
    const percentage = ((depthCm / refData.height) * 100).toFixed(1);
    
    if (depthCm < refData.height) {
        document.getElementById('comparison').textContent = 
            `That's ${percentage}% of a ${refData.name} (${refData.height} cm)`;
    } else {
        const times = (depthCm / refData.height).toFixed(2);
        document.getElementById('comparison').textContent = 
            `That's ${times}× the height of a ${refData.name} (${refData.height} cm)`;
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

document.getElementById('updateBtn').addEventListener('click', () => {
    currentSnowDepth = parseFloat(document.getElementById('snowDepth').value);
    currentUnit = document.getElementById('unit').value;
    updateVisualization();
});

document.getElementById('snowDepth').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentSnowDepth = parseFloat(document.getElementById('snowDepth').value);
        currentUnit = document.getElementById('unit').value;
        updateVisualization();
    }
});

document.getElementById('unit').addEventListener('change', () => {
    currentUnit = document.getElementById('unit').value;
    updateDisplay();
});

document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', (e) => {
        const value = parseFloat(e.target.dataset.value);
        const unit = e.target.dataset.unit;
        
        document.getElementById('snowDepth').value = value;
        document.getElementById('unit').value = unit;
        
        currentSnowDepth = value;
        currentUnit = unit;
        updateVisualization();
    });
});

document.getElementById('referenceSelect').addEventListener('change', (e) => {
    currentReferenceObject = e.target.value;
    updateVisualization();
});

document.getElementById('togglePanel').addEventListener('click', () => {
    const panel = document.querySelector('.controls-panel');
    panel.classList.toggle('collapsed');
});

window.addEventListener('load', init);
