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
      // init renderer
      var renderer = new THREE.WebGLRenderer({
        // antialias	: true,
        alpha: true
      });
      renderer.setClearColor(new THREE.Color('lightgrey'), 0)
      // renderer.setPixelRatio( 2 );
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute'
      renderer.domElement.style.top = '0px'
      renderer.domElement.style.left = '0px'
      document.querySelector('.page-box').appendChild(renderer.domElement);

      // array of functions for the rendering loop
      var onRenderFcts = [];
      var arToolkitContext, arMarkerControls, markerRoot;

      // init scene and camera
      var scene = new THREE.Scene();

      var ambient = new THREE.AmbientLight(0x666666);
      scene.add(ambient);

      var directionalLight = new THREE.DirectionalLight(0x887766);
      directionalLight.position.set(-1, 1, 1).normalize();
      scene.add(directionalLight);

      //////////////////////////////////////////////////////////////////////////////////
      //		Initialize a basic camera
      //////////////////////////////////////////////////////////////////////////////////

      // Create a camera
      var camera = new THREE.Camera();
      scene.add(camera);

      markerRoot = new THREE.Group
      scene.add(markerRoot)

      ////////////////////////////////////////////////////////////////////////////////
      //          handle arToolkitSource
      ////////////////////////////////////////////////////////////////////////////////

      var arToolkitSource = new THREEX.ArToolkitSource({
        // to read from the webcam
        sourceType: 'webcam',

        // // to read from an image
        //  sourceType : 'image',
        // sourceUrl : THREEX.ArToolkitContext.baseURL + '../data/images/img.jpg',
        // sourceUrl : THREEX.ArToolkitContext.baseURL + '../data/images/armchair.jpg',

        // to read from a video
        // sourceType : 'video',
        // sourceUrl : THREEX.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
      })

      arToolkitSource.init(() => {
        arToolkitSource.domElement.addEventListener('canplay', () => {
          console.log(
              'canplay',
              'actual source dimensions',
              arToolkitSource.domElement.videoWidth,
              arToolkitSource.domElement.videoHeight
          );

          initARContext();
        });
        onResize();
      });

      // handle resize
      window.addEventListener('resize', function () {
        onResize()
      })
      function onResize() {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
      }

      ////////////////////////////////////////////////////////////////////////////////
      //          initialize arToolkitContext
      ////////////////////////////////////////////////////////////////////////////////

      // create atToolkitContext
      function initARContext() {
        console.log('initARContext()');

        // CONTEXT
        arToolkitContext = new THREEX.ArToolkitContext({
          // cameraParametersUrl: THREEX.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
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



        // MARKER
        arMarkerControls = new THREEX.ArMarkerControls(arToolkitContext, markerRoot, {
          type: 'pattern',
          // patternUrl: THREEX.ArToolkitContext.baseURL + '../data/data/patt.hiro',
          patternUrl: 'src/data/patt.hiro',
        })

        console.log('ArMarkerControls', arMarkerControls);
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

      // update artoolkit on every frame
      onRenderFcts.push(function () {
        if (!arToolkitContext || !arToolkitSource || !arToolkitSource.ready) {
          return;
        }

        arToolkitContext.update(arToolkitSource.domElement)
      })


      // build a smoothedControls
      var smoothedRoot = new THREE.Group()
      scene.add(smoothedRoot)
      var smoothedControls = new THREEX.ArSmoothedControls(smoothedRoot, {
        lerpPosition: 0.4,
        lerpQuaternion: 0.3,
        lerpScale: 1,
        // minVisibleDelay: 1,
        // minUnvisibleDelay: 1,
      })
      onRenderFcts.push(function (delta) {
        smoothedControls.update(markerRoot)
      })

      // smoothedControls.addEventListener('becameVisible', function(){
      // 	console.log('becameVisible event notified')
      // })
      // smoothedControls.addEventListener('becameUnVisible', function(){
      // 	console.log('becameUnVisible event notified')
      // })

      //////////////////////////////////////////////////////////////////////////////////
      //		add an object in the scene
      //////////////////////////////////////////////////////////////////////////////////

      // var arWorldRoot = markerRoot
      var arWorldRoot = smoothedRoot

      var mesh = new THREE.AxesHelper()
      // markerRoot.add(mesh)
      arWorldRoot.add(mesh)

      // add a torus knot
      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      })
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = geometry.parameters.height / 2
      // markerRoot.add( mesh );
      arWorldRoot.add(mesh)

      var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
      var material = new THREE.MeshNormalMaterial();
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.5
      // markerRoot.add( mesh );
      arWorldRoot.add(mesh);

      onRenderFcts.push(function (delta) {
        mesh.rotation.x += delta * Math.PI
      })

      //////////////////////////////////////////////////////////////////////////////////
      //		render the whole thing on the page
      //////////////////////////////////////////////////////////////////////////////////
      var stats = new Stats();
      document.body.appendChild(stats.dom);
      // render the scene
      onRenderFcts.push(function () {
        renderer.render(scene, camera);
        stats.update();
      })

      // run the rendering loop
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

    onMounted(() => {
      init()

      // window.addEventListener('resize', handleResize);
    })

    onUnmounted(() => {
      // window.removeEventListener('resize', handleResize)
      // window.removeEventListener('click', handleClick)
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
