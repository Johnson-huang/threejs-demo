<template>
  <div class="page-box">
    <div class="canvas"></div>
    <div class="background"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { defineComponent, onMounted } from 'vue'

let scene = null;
let camera = null;
let renderer = null;
let cube = null;

export default defineComponent({
  setup() {

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.querySelector('.canvas').appendChild( renderer.domElement );
      // 几何体
      const geometry = new THREE.BoxGeometry(1, 2, 3);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        specular: 0x444444,
        shininess: 20
      });
      cube = new THREE.Mesh( geometry, material );
      cube.position.x = -0.5;
      cube.rotation.x = 7.5;
      cube.rotation.y = 7.5;
      scene.add( cube );

      camera.position.z = 5;
    }

    function animate() {
      requestAnimationFrame( animate );

      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      renderer.render( scene, camera );
    }

    // 添加灯光
    function addLight() {
      const ambientLight = new THREE.AmbientLight(0xd5d5d5);
      ambientLight.intensity = 1.2;
      scene.add(ambientLight);

      const frontDirLight = new THREE.DirectionalLight(0xffffff);
      frontDirLight.position.x = -0.55;
      frontDirLight.position.y = 3;
      frontDirLight.position.z = 5;
      frontDirLight.intensity = .8;
      scene.add(frontDirLight);
    }

    onMounted(() => {
      init();
      animate();
      addLight();

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      })
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
  .page-box {
    position: relative;
    width: 100%;
    height: 100vh;

    .canvas {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      z-index: 2;
    }

    .background {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 300px;
      background: black;
      z-index: 1;
    }
  }
</style>
