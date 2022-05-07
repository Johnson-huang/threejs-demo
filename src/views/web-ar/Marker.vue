<template>
  <div class="page-box"></div>
</template>

<script>
import * as THREE from 'three'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {reactive, onMounted, onUnmounted, toRefs, defineComponent} from 'vue'

let scene = null;
let camera = null;
let renderer = null;

export default defineComponent({
  setup() {
    const state = reactive({
      clock: new THREE.Clock(),
      oldTime: 0,
    })

    // 初始化
    function init() {
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

      // load
      const loader = new FBXLoader('src/assets/web-ar/dancer_girl_fbx/source/Wave Hip Hop Dance (1).fbx', (obj) => {
        // obj.traverse((child) => {})
        scene.add(obj)
      })

      // 渲染器
      renderer = new THREE.WebGLRenderer({
        alpha: true // 背景透明
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      document.querySelector('.page-box').appendChild(renderer.domElement);

      // 绑定控制和摄像头
      new OrbitControls(camera, renderer.domElement);
    }

    // 动画
    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMounted(() => {
      init();
      animate();

      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      ...toRefs(state)
    }
  },
})
</script>

<style lang="less" scoped>
.page-box {}
</style>
