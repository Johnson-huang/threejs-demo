<template>
  <div class="page-box">
    <div id="cont" ref="cont"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import {MapControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import {Water} from 'three/examples/jsm/objects/Water.js'
import * as GEOLIB from 'geolib';
import {defineComponent, nextTick, onMounted, onUnmounted, reactive, ref} from 'vue'

let scene, camera, renderer, controls, light0, light1, light2, gh, iR, iR_Line, iR_Water;
let raycaster = new THREE.Raycaster()
let stats = new Stats()
let centerPosi = [121.5060129, 31.2388183]
// 材质
let MAT_BUILDING = new THREE.MeshPhongMaterial() // 全局建筑材质
let MAT_ROAD = new THREE.LineBasicMaterial({color: 0x254360}) // 全局道路材质
let MAT_WATER_NORMAL = new THREE.TextureLoader().load('src/assets/map/textures/water.jpeg', (texture) => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
}) // 全局水域材质
let MAT_WATER = {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: MAT_WATER_NORMAL,
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0xA6C8FA,
  distortionScale: 3.7,
  fog: false
}
// 几何体
let geos_building = [] // 建筑几何体数组
let collider_building = [] // 建筑几何体的外壳数组
let FLAG_ROAD_ANI = true // 是否打开道路动画
let Animated_Line_Distances = [] // 所有道路的长度

export default defineComponent({
  setup() {
    const state = reactive({})
    const cont = ref(null)

    function awake() {
      // 组
      iR = new THREE.Group()
      iR_Line = new THREE.Group()
      iR_Water = new THREE.Group()
      iR.name = 'Interactive Root'
      // 场景
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x222222) // 背景设为白色
      scene.add(iR)
      scene.add(iR_Line)
      scene.add(iR_Water)
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
      // FPS 性能面板
      cont.value.appendChild(stats.domElement)
      // 动画
      update()
      // 数据加载
      getGeoJson()
    }

    function update() {
      renderer.render(scene, camera);
      controls.update()
      stats.update()
      updateAnimatedLine()
      // 水域动画
      // updateWater()
      requestAnimationFrame(update)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // 获取数据
    function getGeoJson() {
      fetch('src/assets/map/data/shanghai.geojson')
        .then((res) => res.json())
        .then((res) => {
          loadBuilding(res)
        })
    }

    // 创建建筑
    function loadBuilding(data) {
      let features = data.features

      for (let i = 0; i < features.length; i++) {
        let fel = features[i]
        // 有问题的数据
        if (!fel['properties']) return

        let info = fel.properties

        if (info['building']) { // 建筑
          addBuilding(fel.geometry.coordinates, info, info['building:levels'])
        } else if (info['highway']) { // 道路
          if (
              fel.geometry.type === 'LineString' &&
              info['highway'] !== 'pedestrian' &&
              info['highway'] !== 'footway' &&
              info['highway'] !== 'path'
          ) {
            addRoad(fel.geometry.coordinates, info)
          }
        }
      }

      nextTick(() => {
        // 所有建筑几何体合成一个网格，实现性能优化
        let mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(geos_building)
        let mesh = new THREE.Mesh(mergeGeometry, MAT_BUILDING)
        iR.add(mesh)
        // 加载水域
        // loadWaters()
      })
    }

    // 创建水域
    function loadWaters() {
      fetch('src/assets/map/data/shanghai_water.geojson')
          .then((res) => res.json())
          .then((res) => {
            let features = res.features
            for (let i = 0; i < features.length; i++) {
              let fel = features[i]
              if (fel.properties['natural'] === 'water' && fel.geometry.type === 'Polygon') {
                addWater(fel.geometry.coordinates, fel.properties)
              }
            }
          })
    }

    // 添加水域
    function addWater(data, info) {
      let shape, geometry
      let holes = []

      for (let i = 0; i < data.length; i++) {
        let el = data[i]

        if (i === 0) {
          shape = genShape(el, centerPosi)
        } else {
          holes.push(genShape(el, centerPosi))
        }
      }

      // 这里 shape.holes = holes 似乎没有效果
      for (let i = 0; i < holes.length; i++) {
        shape.holes.push(holes[i])
      }

      geometry = genGeometry(shape, {
        curveSegments: 1,
        depth: 0.1,
        bevelEnabled: false, // 是否需要棱角
      })
      geometry.rotateX(Math.PI / 2)
      geometry.rotateZ(Math.PI)

      let water = new Water(geometry, MAT_WATER)
      iR_Water.add(water)
    }

    // 水域动画
    function updateWater() {
      for (let i = 0; i < iR_Water.children.length; i++) {
        iR_Water.children[i].material.uniforms[ 'time' ].value += 1.0 / 700.0;
      }
    }

    // 添加建筑
    function addBuilding(data, info, height = 1) {
      let shape, geometry
      let holes = []

      for (let i = 0; i < data.length; i++) {
        let el = data[i]

        if (i === 0) {
          shape = genShape(el, centerPosi)
        } else {
          holes.push(genShape(el, centerPosi))
        }
      }

      // 这里 shape.holes = holes 似乎没有效果
      for (let i = 0; i < holes.length; i++) {
        shape.holes.push(holes[i])
      }

      geometry = genGeometry(shape, {
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
      geos_building.push(geometry)

      let helper = genHelper(geometry)
      if (helper) {
        helper.name = info['name'] ? info['name'] : 'Building'
        helper.info = info
        collider_building.push(helper)
      }
    }

    // 避免多个几何体合成一个网格之后，无法交互区分（例如点击）
    function genHelper(geometry) {
      if (!geometry.boundingBox) {
        geometry.computeBoundingBox()
      }
      let box3 = geometry.boundingBox

      // 错误数据处理
      if (!isFinite(box3.max.x)) {
        return false
      }

      let helper = new THREE.Box3Helper(box3, 0xffff00)
      helper.updateMatrixWorld()
      return helper
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

    // 添加道路
    function addRoad(data, info) {
      let points = []
      for (let i = 0; i < data.length; i++) {
        // 错误数据兼容
        if (!data[0][1]) return
        let el = data[i]
        if (!el[0] || !el[i]) return

        let elp = [el[0], el[1]]
        elp = GPSRelativePosition([elp[0], elp[1]], centerPosi)

        points.push(new THREE.Vector3(elp[0], 0.5, elp[1]))
      }
      let geometry = new THREE.BufferGeometry().setFromPoints(points)
      geometry.rotateZ(Math.PI)
      let line = new THREE.Line(geometry, MAT_ROAD)
      line.computeLineDistances() // 计算长度
      line.position.y = 0.5
      iR.add(line)

      // 动画
      if (FLAG_ROAD_ANI) {
        let lineLength = geometry.attributes.lineDistance.array[geometry.attributes.lineDistance.count - 1]
        // 如果太短就不生成动画了
        if (lineLength > 0.8) {
          let aniLine = addAnimatedLine(geometry, lineLength)
          iR_Line.add(aniLine)
        }
      }
    }

    // 添加道路动画
    function addAnimatedLine(geometry, length) {
      let animatedLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({color: 0x00FFFF}))
      animatedLine.material.dashSize = 0
      animatedLine.material.gapSize = 1000
      animatedLine.position.y = 0.5
      animatedLine.material.transparent = true
      Animated_Line_Distances.push(length)
      return animatedLine
    }

    // 更新道路动画
    function updateAnimatedLine() {
      if (iR_Line.children <= 0) return
      for (let i = 0; i < iR_Line.children.length; i++) {
        let line = iR_Line.children[i]
        let dash = parseInt(line.material.dashSize) // 当前状态
        let length = parseInt(Animated_Line_Distances[i])
        if (dash > length) {
          line.material.dashSize = 0
          line.material.opacity = 1
        } else {
          line.material.dashSize += 0.004
          line.material.opacity = line.material.opacity > 0 ? line.material.opacity - 0.002 : 1
        }
      }
    }

    // 点击选择
    function fire(mouse) {
      raycaster.setFromCamera(mouse, camera)
      let intersects = raycaster.intersectObjects(collider_building, true)
      if (intersects.length > 0) {
        return intersects[0].object
      } else {
        return false
      }
    }

    function onMouseDown(evt) {
      let mouse = {
        x: (evt.clientX / window.innerWidth) * 2 - 1,
        y: -(evt.clientY / window.innerHeight) * 2 - 1,
      }
      let hitted = fire(mouse)
      console.log('点击的建筑：', hitted)
    }

    onMounted(() => {
      awake()
      onWindowResize()
      window.addEventListener('resize', onWindowResize)
      window.addEventListener('mousedown', onMouseDown)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousedown', onMouseDown)
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
