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

let markerControls = null
let arToolkitSource = null
let arToolkitContext = null

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
    function init() {
      // 实例化相机
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(0, 10, 50);

      // 实例化场景
      scene = new THREE.Scene();
      scene.visible = false; // markerControls 需要一个不可查看的 scene

      // 灯光
      const ambient = new THREE.AmbientLight(0x666666);
      scene.add(ambient);
      const directionalLight = new THREE.DirectionalLight(0x887766);
      directionalLight.position.set(-1, 1, 1).normalize();
      scene.add(directionalLight);

      // 辅助线网格，帮助调试
      gh = new THREE.GridHelper(60, 160, new THREE.Color(0x555555), new THREE.Color(0x333333))
      scene.add(gh)

      // 创建环境光
      const aLight = new THREE.AmbientLight(0xffffff);
      aLight.intensity = 0.3;
      scene.add(aLight);

      // AR.js 初始化
      let onRenderFcts = [] // 主渲染循环中使用的渲染函数
      arToolkitSource = new THREEX.ArToolkitSource({
        sourceType: 'webcam'
      })

      arToolkitSource.init(() => {
        arToolkitSource.domElement.addEventListener('canplay', () => {
          console.log(
              'canplay',
              'actual source dimensions',
              arToolkitSource.domElement.videoWidth,
              arToolkitSource.domElement.videoHeight
          );

          // 初始化 context
          arToolkitContext = new THREEX.ArToolkitContext({
            cameraParametersUrl: THREEX.ArToolkitContext.baseURL + '../data/data/camera_para.dat', // 使用 ar.js 自带的摄像机参数文件
            // 单摄像头
            detectionMode: 'mono'
          })

          arToolkitContext.init(() => {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());

            arToolkitContext.arController.orientation = getSourceOrientation();
            arToolkitContext.arController.options.orientation = getSourceOrientation();

            console.log('arToolkitContext', arToolkitContext);
          });

          // 初始化 ar.js 控制器
          // 绑定到 camera
          console.log(THREEX, 123)
          markerControls = new THREEX.ArMarkerControls(arToolkitContext, camera, {
            type: 'pattern', // 标记 类型
            patternUrl: THREEX.ArToolkitContext.baseURL + '../data/data/patt.hiro', // TODO
            changeMatrixMode: 'cameraTransformMatrix'
          })
        });
        handleResize();
      })

      // 将 ar context 捕获的真实相机数据渲染到 web
      onRenderFcts.push(() => {
        if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
          return;
        }

        arToolkitContext.update(arToolkitSource.domElement)
      })

      onRenderFcts.push(() => {
        renderer.render(scene, camera);
      })

      // 渲染器
      renderer = new THREE.WebGLRenderer({
        // antialias: true,
        alpha: true // 背景透明
      });
      renderer.setClearColor(new THREE.Color('lightgrey'), 0)
      // renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      renderer.shadowMap.enabled = true;
      document.querySelector('.page-box').appendChild(renderer.domElement);
      // FPS 性能面板
      document.querySelector('.page-box').appendChild(stats.domElement)

      // 绑定控制和摄像头
      new OrbitControls(camera, renderer.domElement);
    }

    // 循环
    function loop() {
      // mixer && mixer.update()
      stats.update()
      onRenderFcts.forEach((onRenderFct) => {
        onRenderFct()
      })
      requestAnimationFrame(loop);
    }

    function handleResize() {
      arToolkitSource.onResizeElement()
      arToolkitSource.copyElementSizeTo(renderer.domElement)
      if (arToolkitSource.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitSource.arController.canvas)
      }

      // camera.aspect = window.innerWidth / window.innerHeight;
      // camera.updateProjectionMatrix();
      // renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleClick() {
      // 替换动画 name
      const index = mixer.animations.findIndex(item => item.name === mixer.clip)
      let newIndex;
      if (index === mixer.animations.length - 1) {
        newIndex = 0
      } else {
        newIndex = index + 1
      }
      // 更新
      mixer.play(mixer.animations[newIndex].name)
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

    onMounted(() => {
      init()
      const geometry = new THREE.BoxGeometry(1,1,1)
      const material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = geometry.parameters.height / 2
      scene.add(mesh)
      loop()

      window.addEventListener('resize', handleResize);

      // // load
      // const loader = new FBXLoader()
      // loader.load('src/assets/web-ar/dancer_girl_fbx/source/Wave Hip Hop Dance.fbx', (object) => {
      //   console.log('fbx', object)
      //   object.traverse( function ( child ) {
      //     child.material = new THREE.MeshPhongMaterial({
      //       map: new THREE.TextureLoader().load('src/assets/web-ar/dancer_girl_fbx/textures/Sasha3_Coat_BaseColor.tga.png')
      //     })
      //
      //     if ( child.isMesh ) {
      //       child.castShadow = true;
      //       child.receiveShadow = true;
      //     }
      //   });
      //   object.position.set(0, 0, 0);
      //   object.scale.set(.1, .1, .1);
      //
      //   // 初始化
      //   init();
      //   loop();
      //
      //   // 动画
      //   mixer = new AnimationMixer(object, object.animations)
      //   mixer.play(object.animations[0].name)
      //
      //   window.addEventListener('resize', handleResize);
      //   window.addEventListener('click', handleClick);
      //
      //   scene.add( object );
      // })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('click', handleClick)
    })

    return {
      ...toRefs(state)
    }
  },
})
</script>

<style lang="less" scoped>
.page-box {
  //background: #000;
}
</style>
