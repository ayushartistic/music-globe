import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const SPHERE_RADIUS = 2
const SURFACE_OFFSET = 0.015

// Convert latitude/longitude to a point on the sphere
function latLonToVector3(lat, lon, radius = SPHERE_RADIUS + SURFACE_OFFSET) {
  const phi = (lat * Math.PI) / 180
  const theta = (lon * Math.PI) / 180

  const x = radius * Math.cos(phi) * Math.sin(theta)
  const y = radius * Math.sin(phi)
  const z = radius * Math.cos(phi) * Math.cos(theta)

  return new THREE.Vector3(x, y, z)
}

// Our temporary fictional continent.
// This function determines whether a latitude/longitude
// point belongs to the continent.
const continentBoundary = [
  [-12, -25],
  [8, -30],
  [28, -18],
  [38, -5],
  [30, 12],
  [35, 25],
  [15, 30],
  [-2, 22],
  [-18, 10],
  [-22, -5],
  [-15, -18]
]

function createBoundaryPoints() {
  return continentBoundary.map(([lat, lon]) =>
    latLonToVector3(lat, lon, SPHERE_RADIUS + 0.025)
  )
}

function isInsideContinent(lat, lon) {
  let inside = false

  for (
    let i = 0, j = continentBoundary.length - 1;
    i < continentBoundary.length;
    j = i++
  ) {
    const [latI, lonI] = continentBoundary[i]
    const [latJ, lonJ] = continentBoundary[j]

    const intersects =
      lonI > lon !== lonJ > lon &&
      lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

function Continent() {
  const geometry = new THREE.BufferGeometry()

  const vertices = []

  const latStep = 1
  const lonStep = 1

  for (let lat = -25; lat < 40; lat += latStep) {
    for (let lon = -35; lon < 35; lon += lonStep) {

      const inside1 = isInsideContinent(lat, lon)
      const inside2 = isInsideContinent(lat + latStep, lon)
      const inside3 = isInsideContinent(
        lat + latStep,
        lon + lonStep
      )
      const inside4 = isInsideContinent(
        lat,
        lon + lonStep
      )

      if (inside1 && inside2 && inside3 && inside4) {
        const p1 = latLonToVector3(lat, lon)
        const p2 = latLonToVector3(
          lat + latStep,
          lon
        )
        const p3 = latLonToVector3(
          lat + latStep,
          lon + lonStep
        )
        const p4 = latLonToVector3(
          lat,
          lon + lonStep
        )

        vertices.push(
          p1.x, p1.y, p1.z,
          p2.x, p2.y, p2.z,
          p3.x, p3.y, p3.z,

          p1.x, p1.y, p1.z,
          p3.x, p3.y, p3.z,
          p4.x, p4.y, p4.z
        )
      }
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  )

  geometry.computeVertexNormals()

  const boundaryPoints = createBoundaryPoints()

  const boundaryGeometry = new THREE.BufferGeometry().setFromPoints(
    boundaryPoints
  )

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="hotpink"
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineLoop geometry={boundaryGeometry}>
        <lineBasicMaterial color="white" />
      </lineLoop>
    </group>
  )
}

function Globe() {
  return (
    <group>

      {/* Main sphere */}
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
        <meshStandardMaterial />
      </mesh>

      {/* Continent */}
      <Continent />

    </group>
  )
}

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }}>

      <ambientLight intensity={1} />

      <Globe />

      <OrbitControls />

    </Canvas>
  )
}

export default App