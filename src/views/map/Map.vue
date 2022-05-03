<template>
  <div class="page-box">
    <div id="cont" ref="cont"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import {MapControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as GEOLIB from 'geolib';
import {defineComponent, onMounted, onUnmounted, reactive, ref} from 'vue'
import {getRhumbLineBearing} from "geolib";

let scene, camera, renderer, controls, light0, light1, light2, gh
let centerPosi = [12.5132783, 41.9042869]
let MAT_BUILDING = new THREE.MeshPhongMaterial() // 全局材质

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
      // 渲染器
      renderer = new THREE.WebGL1Renderer({antialias: true})
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      cont.value.appendChild(renderer.domElement)
      // 控制器
      controls = new MapControls(camera, renderer.domElement);
      controls.enableDamping = true
      controls.dampingFactor = 0.25
      controls.screenSpacePanning = false
      controls.maxDistance = 800
      controls.update()
      update()
      // 数据加载
      getGeoJson()
    }

    function update() {
      renderer.render(scene, camera);
      controls.update()
      requestAnimationFrame(update)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // 获取数据
    function getGeoJson() {
      fetch('src/data/map.geojson')
        .then((res) => res.json())
        .then((res) => {
          console.log(res, 123)
          loadBuilding(res)
        })
    }

    // 创建建筑
    function loadBuilding(data) {
      let features = data.features

      for (let i = 0; i < features.length; i++) {
        let fel = features[i]
        // 有问题的数据
        // console.log(fel['properties'])
        if (!fel['properties']) return
        // if (fel.properties['building']) {
          addBuilding(fel.geometry.coordinates, fel.properties)
          // addBuilding(fel.geometry.coordinates, fel.properties, fel.properties['building:levels'])
        // }
      }
    }

    // 添加建筑
    function addBuilding(data, info, height = 1) {
      for (let i = 0; i < data.length; i++) {
        let el = data[i]
        let shape = genShape(el, centerPosi)
        let geometry = genGeometry(shape, {
          // steps: 2,
          curveSegments: 1,
          depth: 0.05 * height,
          bevelEnabled: false, // 是否需要棱角
          // bevelThickness: 1,
          // bevelSize: 1,
          // bevelOffset: 0,
          // bevelSegments: 1
        })
        geometry.rotateX(Math.PI / 2)
        geometry.rotateZ(Math.PI)
        let mesh = new THREE.Mesh(geometry, MAT_BUILDING)
        scene.add(mesh)
      }
    }

    // 创建建筑平面图形
    function genShape(points, center) {
      let shape = new THREE.Shape()
      for (let i = 0; i< points.length; i++) {
        let elp = points[i]
        elp = GPSRelativePosition(elp, center)
        if (i === 0) {
          shape.moveTo(elp[0], elp[1])
        } else {
          shape.lineTo(elp[0], elp[1])
        }
      }
      return shape
    }

    // 创建建筑几何体
    function genGeometry(shape, config) {
      let geometry = new THREE.ExtrudeBufferGeometry(shape, config)
      geometry.computeBoundingBox() // 赋予外边框
      return geometry
    }

    function GPSRelativePosition(objPosi, centerPosi) {
      // 计算球体 GPS 和 中心位置的距离
      let dis = GEOLIB.getDistance(objPosi, centerPosi)
      // 计算 GPS 和 中心位置的夹角
      let bearing = GEOLIB.getRhumbLineBearing(objPosi, centerPosi)
      // 计算 x y
      let x = centerPosi[0] + (dis * Math.cos(bearing * Math.PI / 180))
      let y = centerPosi[1] + (dis * Math.sin(bearing * Math.PI / 180))
      // 做一个简单的比例缩放
      return [-x / 100, -y / 100]
    }

    onMounted(() => {
      Awake()
      onWindowResize()
      window.addEventListener('resize', onWindowResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onWindowResize)
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
