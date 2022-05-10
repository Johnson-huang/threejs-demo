<template>
  <div class="page-box"></div>
</template>

<script>
import * as THREEX from '@ar-js-org/ar.js/three.js/build/ar-threex'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {reactive, onMounted, onUnmounted, toRefs, defineComponent} from 'vue'

let scene = null;
let camera = null;
let renderer = null;
let gh = null;
let mixer = null; // 动画混合
let stats = new Stats()

let markerRoot;
let onRenderFcts = [];
let arMarkerControls = null
let arToolkitSource = null
let arToolkitContext = null
let smoothedRoot = null
let smoothedControls = null
let arWorldRoot = null

// 模型动画
class AnimationMixer {
  constructor(model, animations) {
    this.clock = new THREE.Clock();
    this.mixer = new THREE.AnimationMixer(model);
    this.animations = animations; // 全动画数组
    this.clip = null; // 当前播放的动画名称
  }

  play(clip) {
    let animation = this.animations.find(item => item.name === clip)
    if (animation) {
      this.mixer.stopAllAction(); // 停止正常播放的动画
      this.mixer.clipAction(animation).play() // 播放最新的动画
      this.clip = clip;
    }
  }

  update() {
    let delta = this.clock.getDelta();
    this.mixer.update(delta);
  }
}

export default defineComponent({
  setup() {
    const state = reactive({})

    // 初始化
    async function init() {
      // 渲染器
      initRenderer()
      // 场景
      initScene()
      // 灯光
      initLight()
      // 相机
      initCamera()
      // FPS 监控
      initStats()

      markerRoot = new THREE.Group
      scene.add(markerRoot)

      // 实时反求摄像机
      await initARSource()
      // 通过 Canvas 来联系摄像头与 three.js
      // 校准摄像机参数，用于寻找标记位置
      initARContext();
      // 根据训练出来的数据，告诉摄像机需要识别的标记样子
      // 最终实现在摄像界面上作图
      initARControls()

      // handle resize
      window.addEventListener('resize', onResize)

      // 更新反求摄像机
      onRenderFcts.push(function () {
        if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
          return;
        }

        arToolkitContext.update(arToolkitSource.domElement)
      })

      // build a smoothedControls
      smoothedRoot = new THREE.Group()
      scene.add(smoothedRoot)
      smoothedControls = new THREEX.ArSmoothedControls(smoothedRoot, {
        lerpPosition: 0.4,
        lerpQuaternion: 0.3,
        lerpScale: 1,
        // minVisibleDelay: 1,
        // minUnvisibleDelay: 1,
      })
      onRenderFcts.push(function (delta) {
        smoothedControls.update(markerRoot)
      })

      //////////////////////////////////////////////////////////////////////////////////
      //		add an object in the scene
      //////////////////////////////////////////////////////////////////////////////////

      arWorldRoot = smoothedRoot

      // 增加辅助线
      addAxesHelper()

      // 增加外部立方体
      addGeometry()
      // 增加三维环面扭结
      const mesh = addTorusKnotGeometry()

      // 三维环面扭结 旋转效果
      onRenderFcts.push(function (delta) {
        mesh.rotation.x += delta * Math.PI
      })

      // 渲染场景 scene
      onRenderFcts.push(function () {
        renderer.render(scene, camera);
        stats.update();
      })

      // run the rendering loop
      // loop()
      // function loop() {
      //   requestAnimationFrame(loop)
      // }
      var lastTimeMsec = null
      requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        // call each update function
        onRenderFcts.forEach(function (onRenderFct) {
          onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        })
      })
    }

    // 渲染器
    function initRenderer() {
      renderer = new THREE.WebGLRenderer({
        alpha: true
      });
      renderer.setClearColor(new THREE.Color('lightgrey'), 0)
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      document.querySelector('.page-box').appendChild(renderer.domElement);
    }

    // 场景
    function initScene() {
      scene = new THREE.Scene();
    }

    // 灯光
    function initLight() {
      const ambient = new THREE.AmbientLight(0x666666);
      scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight(0x887766);
      directionalLight.position.set(-1, 1, 1).normalize();
      scene.add(directionalLight);
    }

    // 相机
    function initCamera() {
      camera = new THREE.Camera();
      scene.add(camera);
    }

    // 增加辅助线
    function addAxesHelper() {
      const mesh = new THREE.AxesHelper()
      arWorldRoot.add(mesh)
    }

    // 增加外部立方体
    function addGeometry() {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = geometry.parameters.height / 2
      arWorldRoot.add(mesh)
      return mesh
    }

    // 增加三维环面扭结
    function addTorusKnotGeometry() {
      const geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
      const material = new THREE.MeshNormalMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.5
      arWorldRoot.add(mesh);
      return mesh
    }

    // FPS 监控
    function initStats() {
      stats = new Stats();
      document.querySelector('.page-box').appendChild(stats.dom);
    }

    // 实时反求摄像机
    function initARSource() {
      return new Promise((resolve) => {
        arToolkitSource = new THREEX.ArToolkitSource({
          // to read from the webcam
          sourceType: 'webcam',
        })
        arToolkitSource.init(() => {
          arToolkitSource.domElement.addEventListener('canplay', () => {
            resolve()
          });
          onResize();
        });
      })
    }

    // 通过 Canvas 来联系摄像头与 three.js
    // 校准摄像机参数，用于寻找标记位置
    function initARContext() {
      // CONTEXT
      arToolkitContext = new THREEX.ArToolkitContext({
        cameraParametersUrl: 'src/data/camera_para.dat',
        // debug: true,
        // detectionMode: 'mono_and_matrix',
        detectionMode: 'mono',
        // detectionMode: 'color_and_matrix',
        // matrixCodeType: '3x3',
        canvasWidth: 80 * 3,
        canvasHeight: 60 * 3,
        maxDetectionRate: 30,
      })

      arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

        arToolkitContext.arController.orientation = getSourceOrientation();
        arToolkitContext.arController.options.orientation = getSourceOrientation();

        console.log('arToolkitContext', arToolkitContext);
      });
    }

    // 根据训练出来的数据，告诉摄像机需要识别的标记样子
    // 最终实现在摄像界面上作图
    function initARControls() {
      arMarkerControls = new THREEX.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'src/data/patt.hiro',
      })
    }

    function getSourceOrientation() {
      if (!arToolkitSource) {
        return null;
      }

      console.log(
          'actual source dimensions',
          arToolkitSource.domElement.videoWidth,
          arToolkitSource.domElement.videoHeight
      );

      if (arToolkitSource.domElement.videoWidth > arToolkitSource.domElement.videoHeight) {
        console.log('source orientation', 'landscape');
        return 'landscape';
      } else {
        console.log('source orientation', 'portrait');
        return 'portrait';
      }
    }

    function onResize() {
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
      }
    }

    onMounted(async () => {
      await init()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
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
