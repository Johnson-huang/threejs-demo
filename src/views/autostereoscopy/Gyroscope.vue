<template>
  <div class="page-box"></div>
</template>

<script>
import * as THREE from 'three'
import {defineComponent, onMounted, onUnmounted, ref} from 'vue'

let scene, camera, renderer, cube;

export default defineComponent({
  setup() {
    // 初始化 three
    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 3);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        // alpha: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.querySelector(".page-box").appendChild(renderer.domElement);

      const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const material = new THREE.MeshStandardMaterial({color: 0x6698CB});
      material.metalness = .44;
      material.roughness = 0.4;
      cube = new THREE.Mesh(geometry, material);
      cube.rotation.set(.4, .7, 0);
      scene.add(cube);

      addLight();

      loop();

      document.querySelector(".page-box").addEventListener('click', handleClick)
    }

    function handleClick() {
      window.DeviceOrientationEvent.requestPermission()
          .then(state => {
            switch (state) {
              case "granted":
                // you can do something
                window.addEventListener('deviceorientation', capture_orientation, false);
                break;
              case "denied":
                alert("你拒绝了使用陀螺仪");
                break;
              case "prompt":
                alert("其他行为");
                break;
            }
          });
    }

    function addLight() {
      const ambientLight = new THREE.AmbientLight(0xd5d5d5);
      ambientLight.intensity = 1.1;
      scene.add(ambientLight);

      const bottomRightDirLight = new THREE.DirectionalLight();
      bottomRightDirLight.position.x = 5;
      bottomRightDirLight.position.y = 3;
      bottomRightDirLight.position.z = -5;
      bottomRightDirLight.intensity = 1.3;
      scene.add(bottomRightDirLight);

      const frontDirLight = new THREE.DirectionalLight(0xffffff);
      frontDirLight.position.x = -5;
      frontDirLight.position.y = 5;
      frontDirLight.position.z = 5;
      frontDirLight.intensity = 1.3;
      scene.add(frontDirLight);
    }

    function loop() {
      requestAnimationFrame(loop);
      cube.rotation.y += 0.01
      renderer.render(scene, camera);
    }

    function capture_orientation(event) {
      const alpha = event.alpha;
      const beta = event.beta;
      const gamma = event.gamma;
      console.log('Orientation - Alpha: ' + alpha + ', Beta: ' + beta + ', Gamma: ' + gamma);

      cube.rotation.y = gamma / 100;
      cube.rotation.x = beta / 100;
    }

    onMounted(() => {
      // 初始化 three
      init()
    })

    onUnmounted(() => {
      document.querySelector(".page-box").removeEventListener('click', handleClick)
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.page-box {
}
</style>
