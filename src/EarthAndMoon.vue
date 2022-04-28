<template>
  <div id="earth-moon-box"></div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {reactive, onMounted, toRefs, defineComponent} from 'vue'
import moon_1024 from '@/assets/earth-and-moon/textures/planets/moon_1024.jpeg'
import earth_1024 from '@/assets/earth-and-moon/textures/planets/earth_1024.jpeg'

let scene = null;
let camera = null;
let renderer = null;
let labelRenderer = null;
let moon = null;
let earth = null;
const textureLoader = new THREE.TextureLoader(); // 纹理

export default defineComponent({
  setup() {
    const state = reactive({
      clock: new THREE.Clock(),
      oldTime: 0,
    })

    // 初始化
    function init() {
      // 地球月球半径大小
      const EARTH_RADIUS = 2.5;
      const MOON_RADIUS = 0.5;
      // 实例化相机
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(10, 5, 20);
      // 实例化场景
      scene = new THREE.Scene();
      // 创建聚光灯光源
      const dirLight = new THREE.SpotLight(0xffffff);
      dirLight.position.set(0, 0, 10);
      dirLight.intensity = 2; // 光线强度
      dirLight.castShadow = true;
      scene.add(dirLight);

      // 创建环境光
      const aLight = new THREE.AmbientLight(0xffffff);
      aLight.intensity = 0.3;
      scene.add(aLight);

      // 创建月球
      const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
      const moonMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load(moon_1024)
      });
      moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.receiveShadow = true;
      moon.castShadow = true;
      scene.add(moon);

      // 月球标签
      const moonDiv = document.createElement('div');
      moonDiv.className = 'label';
      moonDiv.textContent = 'Moon';
      const moonLabel = new CSS2DObject(moonDiv);
      moonLabel.position.set(0, MOON_RADIUS + 0.5, 0);
      moon.add(moonLabel);

      // 创建地球
      const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
      const earthMaterial = new THREE.MeshPhongMaterial({
        shininess: 5, // 镜面反射
        map: textureLoader.load(earth_1024)
      });
      earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.receiveShadow = true;
      earth.castShadow = true;
      scene.add(earth);

      // 地球标签
      const earthDiv = document.createElement('div');
      earthDiv.className = 'label';
      earthDiv.textContent = 'Earth';
      const earthLabel = new CSS2DObject(earthDiv);
      earthLabel.position.set(0, EARTH_RADIUS + 0.5, 0);
      earth.add(earthLabel);

      // 渲染器
      renderer = new THREE.WebGLRenderer({
        alpha: true // 背景透明
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      document.querySelector('#earth-moon-box').appendChild(renderer.domElement);

      // 标签渲染器
      labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
      labelRenderer.domElement.style.position = 'absolute';
      labelRenderer.domElement.style.top = '0px';
      document.querySelector('#earth-moon-box').appendChild(labelRenderer.domElement);

      // 绑定控制和摄像头
      // CSS2DRenderer 在 WebGLRenderer 的上方
      const controls = new OrbitControls(camera, labelRenderer.domElement);
    }

    // 动画
    function animate() {
      // 月球公转
      const elapsed = state.clock.getElapsedTime();
      moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

      // 地球自转
      const axis = new THREE.Vector3(0, 1, 0); // 地球自转轴
      earth.rotateOnAxis(axis, (elapsed - state.oldTime) * Math.PI / 10);
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      state.oldTime = elapsed;
      requestAnimationFrame(animate);
    }

    onMounted(() => {
      init();
      animate();

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
      })
    })

    return {
      ...toRefs(state),
      moon_1024,
      earth_1024
    }
  },
})
</script>

<style lang="less" scoped>
#earth-moon-box {
  background: url('./assets/earth-and-moon/imgs/background.jpeg') no-repeat center center;
  background-size: 100% 100%;
}

.label {
  color: #fff;
  font-size: 16px;
}
</style>
