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
let gh = null;
let mixer = null; // 动画混合

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
    const state = reactive({
      clock: new THREE.Clock(),
      oldTime: 0,
    })

    // 初始化
    function init() {
      // 实例化相机
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(0, 10, 50);
      // 实例化场景
      scene = new THREE.Scene();
      // 创建聚光灯光源
      const dirLight = new THREE.SpotLight(0xffffff);
      dirLight.position.set(0, 10, 50);
      dirLight.intensity = 2; // 光线强度
      dirLight.castShadow = true;
      scene.add(dirLight);

      // 辅助线网格，帮助调试
      gh = new THREE.GridHelper(60, 160, new THREE.Color(0x555555), new THREE.Color(0x333333))
      scene.add(gh)

      // 创建环境光
      const aLight = new THREE.AmbientLight(0xffffff);
      aLight.intensity = 0.3;
      scene.add(aLight);

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

    // 循环
    function loop() {
      mixer && mixer.update()
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMounted(() => {
      // load
      const loader = new FBXLoader()
      loader.load('src/assets/web-ar/dancer_girl_fbx/source/Wave Hip Hop Dance.fbx', (object) => {
        console.log(object, 123)
        object.traverse( function ( child ) {
          const material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('src/assets/web-ar/dancer_girl_fbx/textures/Sasha3_Coat_BaseColor.tga.png')
          })
          child.material = material

          if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        object.position.set(0, 0, 0);
        object.scale.set(.1, .1, .1);

        init();
        loop();
        window.addEventListener('resize', handleResize)

        // 动画
        mixer = new AnimationMixer(object, object.animations)
        mixer.play(object.animations[0].name)

        scene.add( object );
      })
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
.page-box {
  background: #000;
}
</style>
