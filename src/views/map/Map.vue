<template>
  <div class="page-box">
    <div id="cont" ref="cont"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {defineComponent, onMounted, reactive, ref} from 'vue'

let scene, camera, renderer, controls, light0, light1, light2, gh

export default defineComponent({
  setup() {
    const state = reactive({})
    const cont = ref(null)

    function Awake() {
      // 场景
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x222222) // 背景设为白色
      // 相机
      camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100)
      camera.position.set(8, 4, 0)
      scene.add(camera)
      // 灯光
      light0 = new THREE.AmbientLight(0xfafafa, 0.25)
      light1 = new THREE.PointLight(0xfafafa, 0.4)
      light1.position.set(200, 90, 40)
      light2 = new THREE.PointLight(0xfafafa, 0.4)
      light2.position.set(200, 90, -40)
      scene.add(light0)
      scene.add(light1)
      scene.add(light2)
      // 辅助线网格，帮助调试
      gh = new THREE.GridHelper(60, 160, new THREE.Color(0x555555), new THREE.Color(0x333333))
      scene.add(gh)
      // 几何体网格
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
      const cube = new THREE.Mesh(geometry, material)
      scene.add(cube)
      // 渲染器
      renderer = new THREE.WebGL1Renderer({antialias: true})
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      cont.value.appendChild(renderer.domElement)
      // 控制器
      controls = new OrbitControls(camera, renderer.domElement);
    }

    onMounted(() => {
      Awake()
    })

    return {
      ...state,
      cont
    }
  }
})
</script>

<style lang="less" scoped>
.page-box {

}
</style>
