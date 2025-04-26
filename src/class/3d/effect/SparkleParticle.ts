import * as THREE from "three";

export class SparkleParticle {
  scene: any;
  position: any;
  texture: any;
  duration: number;
  particleCount: number;
  timeElapsed: number;
  geometry!: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
  material!: THREE.PointsMaterial;
  particles!: THREE.Points<any, any, THREE.Object3DEventMap>;
  constructor(
    scene: any,
    position: any,
    texture: any,
    duration = 0.2,
    particleCount = 6
  ) {
    this.scene = scene;
    this.position = position;
    this.texture = texture;
    this.duration = duration;
    this.particleCount = particleCount;

    this.timeElapsed = 0;

    this.initParticles();
  }

  initParticles() {
    // Create the geometry and material for the particles
    this.geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    const minDistance = 1.0; // Adjust this value as needed to control minimum distance

    // Set random positions for each particle around the given position
    for (let i = 0; i < this.particleCount; i++) {
      let validPosition = false;
      let x, y, z;

      while (!validPosition) {
        x = this.position.x + Math.random() * 5 - 2.5;
        y = this.position.y + Math.random() * 6.5 - 2.5;
        z = this.position.z + Math.random() * 5 - 2.5;

        validPosition = true;

        // Check distance from the new particle to all previously placed particles
        for (let j = 0; j < i; j++) {
          const dx = x - positions[j * 3]!;
          const dy = y - positions[j * 3 + 1]!;
          const dz = z - positions[j * 3 + 2]!;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
      }

      positions.push(x, y, z);
      sizes.push(Math.random() * 5 + 0.1); // Random size for the sparkle
    }

    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions as any, 3)
    );
    this.geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );

    // Create the material for particles
    this.material = new THREE.PointsMaterial({
      size: 4,
      map: this.texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create the particle system
    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  update(deltaTime: any) {
    this.timeElapsed += deltaTime;

    // Fade out particles based on elapsed time
    this.material.opacity = 1 - this.timeElapsed / this.duration;

    // Remove particles after duration is reached
    if (this.timeElapsed >= this.duration) {
      this.dispose();
    }
    return true; // Sparkle effect is still active
  }

  dispose() {
    this.scene.remove(this.particles);
    this.particles.geometry.dispose();
    this.particles.material.dispose();
    return false; // Indicate that the sparkle effect is finished
  }
}
