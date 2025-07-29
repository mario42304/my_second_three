import * as THREE from "three";

function main() {
  const canvas = document.getElementById("c") as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  function makeCamera(fov: number = 45) {
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  const camera = makeCamera();
  camera.position.set(8, 4, 10).multiplyScalar(3);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);

    light.position.set(0, 20, 0);
    scene.add(light);

    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.top = d;
    light.shadow.camera.right = d;
    light.shadow.camera.bottom = d;
    light.shadow.camera.left = d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.bias = 0.001;
  }
  {
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    scene.add(light);
  }

  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const GroundMaterial = new THREE.MeshPhongMaterial({ color: 0xcc8866 });
  const groundMesh = new THREE.Mesh(groundGeometry, GroundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const tank = new THREE.Object3D();
  scene.add(tank);

  const carWidth = 4;
  const carHeight = 1;
  const carLength = 8;

  const bodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x6688aa });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  tank.add(bodyMesh);

  const tankCameraFov = 75;
  const tankCamera = makeCamera(tankCameraFov);
  tankCamera.position.y = 3;
  tankCamera.position.z = -6;
  tankCamera.rotation.y = Math.PI;
  bodyMesh.add(tankCamera);

  const wheelRadius = 1;
  const wheelThickness = 0.5;
  const wheelSegments = 6;
  const wheelGeometry = new THREE.CylinderGeometry(
    wheelRadius,
    wheelRadius,
    wheelThickness,
    wheelSegments
  );
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const wheelPositions: [number, number, number][] = [
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
  ];
  const wheelMeshs = wheelPositions.map((p) => {
    const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    mesh.position.set(...p);
    mesh.rotation.z = Math.PI * 0.5;
    mesh.castShadow = true;
    bodyMesh.add(mesh);

    return mesh;
  });

  const domeRadius = 2;
  const domeWidthSubdivisions = 12;
  const domeHeightSubdivisions = 12;
  const domePhiStart = 0;
  const domePhiend = 2 * Math.PI;
  const domeThetaStart = 0;
  const domeThetaEnd = 0.5 * Math.PI;
  const domeGeometry = new THREE.SphereGeometry(
    domeRadius,
    domeWidthSubdivisions,
    domeHeightSubdivisions,
    domePhiStart,
    domePhiend,
    domeThetaStart,
    domeThetaEnd
  );
  const domeMesh = new THREE.Mesh(domeGeometry, bodyMaterial);
  domeMesh.castShadow = true;
  bodyMesh.add(domeMesh);
  domeMesh.position.y = carHeight / 2;

  const turretWidth = 0.1;
  const turretHeight = 0.1;
  const turretLength = carLength * 0.15;
  const turretGeometry = new THREE.BoxGeometry(
    turretWidth,
    turretHeight,
    turretLength
  );
  const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial);
  turretMesh.position.z = turretLength / 2;
  turretMesh.castShadow = true;
  const turretPivot = new THREE.Object3D();
  turretPivot.position.y = domeRadius / 4;
  turretPivot.scale.set(5, 5, 5);
  turretPivot.add(turretMesh);
  bodyMesh.add(turretPivot);

  const turretCamera = makeCamera();
  turretCamera.position.y = 0.15;
  turretMesh.add(turretCamera);

  const targetGeometry = new THREE.SphereGeometry(0.5, 6, 3);
  const targetMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    flatShading: true,
  });
  const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
  const targetOrbit = new THREE.Object3D();
  const targetElevation = new THREE.Object3D();
  const targetBob = new THREE.Object3D();

  targetMesh.castShadow = true;
  scene.add(targetOrbit);
  targetOrbit.add(targetElevation);
  targetElevation.position.y = 8;
  targetElevation.position.z = carLength * 2;
  targetElevation.add(targetBob);
  targetBob.add(targetMesh);

  const targetCamera = makeCamera();
  const targetCameraPivot = new THREE.Object3D();

  targetCamera.position.y = 1;
  targetCamera.position.z = -2;
  targetCamera.rotation.y = Math.PI;
  targetBob.add(targetCameraPivot);
  targetCameraPivot.add(targetCamera);

  function testRender() {
    renderer.render(scene, camera);
  }
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  renderer.setAnimationLoop(testRender);
}

main();
