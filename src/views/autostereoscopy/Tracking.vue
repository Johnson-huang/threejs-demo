<template>
  <div class="page-box">
    <div class="video-box">
      <video ref="videoRef" id="myVideo" preload autoplay loop muted controls></video>
      <canvas ref="canvasRef" class="canvas"></canvas>
    </div>
    <div class="box"></div>
  </div>
</template>

<script>
import 'tracking'
import 'tracking/build/data/face.js'
import * as THREE from 'three'
import {defineComponent, onMounted, onUnmounted, ref} from 'vue'
import {checkGetUserMediaSupport, checkMediaDevices, getUserMedia} from '@/utils/media-devices'

let trackerTask = null
let nextRX = 0
let nextRY = 0
let scene, camera, renderer, cube;

export default defineComponent({
  setup() {
    // 人脸识别
    // https://blog.csdn.net/qq_42000039/article/details/111768719

    // 人脸识别 对应 裸眼3D 原理
    // https://xiaozhuanlan.com/topic/0241985376

    const videoRef = ref(null)
    const canvasRef = ref(null)

    // 打开视频
    async function openMedia() {
      // 是否支持访问用户媒体设备
      if (!checkGetUserMediaSupport()) {
        return Promise.reject()
      }

      // 获取支持的音视频设备
      // 判断是否有视频输入设备
      const devicesResult = await checkMediaDevices()
      if (devicesResult.code === 0 || !devicesResult.data.find(item => item.kind === 'videoinput')) {
        console.log('checkMediaDevices 错误：', devicesResult)
        return Promise.reject()
      }

      // 访问用户媒体设备
      getUserMedia(
          {audio: false, video: true},
          (stream) => {
            // 设置视频流
            videoRef.value.srcObject = stream;

            // 设置 canvas 宽高
            const context = canvasRef.value.getContext('2d')
            canvasRef.value.width = window.innerWidth / 2
            canvasRef.value.height = window.innerHeight

            // 设置人脸识别跟踪
            const tracker = new tracking.ObjectTracker(['face'])
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);
            trackerTask = tracking.track('#myVideo', tracker, {camera: true})

            tracker.on('track', (event) => {
              // 清除之前的图形
              context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
              event.data.forEach((rect) => {
                context.strokeStyle = '#a64ceb';
                context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                context.font = '11px Helvetica';
                context.fillStyle = "#fff";
                context.fillText(`x：${rect.x}px`, rect.x + rect.width + 5, rect.y + 11)
                context.fillText(`y：${rect.y}px`, rect.x + rect.width + 5, rect.y + 22)

                nextRY = 0.7 + rect.x / 320;
                nextRX = 0.4 - rect.y / 240;
              })
            })
          },
          (error) => {
            console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
          }
      )
    }

    // 初始化 three
    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / 2 / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 3);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setSize(window.innerWidth / 2, window.innerHeight);
      document.querySelector(".box").appendChild(renderer.domElement);

      // var controls = new THREE.OrbitControls(camera, renderer.domElement);

      const geometry = new THREE.BoxGeometry(.6, .6, .6);
      const material = new THREE.MeshStandardMaterial({color: 0x6698CB});
      material.metalness = .44;
      material.roughness = 0.4;
      cube = new THREE.Mesh(geometry, material);
      cube.rotation.set(.4, .7, 0);
      scene.add(cube);

      addLight();

      loop();
    }

    function addLight() {
      const ambientLight = new THREE.AmbientLight(0xd5d5d5);
      ambientLight.intensity = 1.1;
      scene.add(ambientLight);

      const bottomRightDirLight = new THREE.DirectionalLight();
      bottomRightDirLight.position.x = 5;
      bottomRightDirLight.position.y = 3;
      bottomRightDirLight.position.z = -5;
      bottomRightDirLight.intensity = 1.3;
      scene.add(bottomRightDirLight);

      const frontDirLight = new THREE.DirectionalLight(0xffffff);
      frontDirLight.position.x = -5;
      frontDirLight.position.y = 5;
      frontDirLight.position.z = 5;
      frontDirLight.intensity = 1.3;
      scene.add(frontDirLight);
    }

    function loop() {
      requestAnimationFrame(loop);

      cube.rotation.x += (nextRX - cube.rotation.x) / 5;
      cube.rotation.y += (nextRY - cube.rotation.y) / 5;

      renderer.render(scene, camera);
    }

    onMounted(async () => {
      // 打开视频
      await openMedia()
      // 初始化 three
      init()
    })

    onUnmounted(() => {
      if (trackerTask) {
        // 停止跟踪
        trackerTask.stop()
      }
    })

    return {
      videoRef,
      canvasRef
    }
  },
})
</script>

<style lang="less" scoped>
.page-box {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  height: 100vh;

  .video-box {
    width: 50%;
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    position: relative;

    #myVideo {
      width: 100%;
    }

    .canvas {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }

  .box {
    width: 50%;
  }
}
</style>
