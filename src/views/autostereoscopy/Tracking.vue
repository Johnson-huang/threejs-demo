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
import {defineComponent, onMounted, ref} from 'vue'
import {checkGetUserMediaSupport, checkMediaDevices, getUserMedia} from '@/utils/media-devices'

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
            videoRef.value.srcObject = stream;

            // 设置 canvas 宽高
            // TODO 宽高比例问题待解决
            const context = canvasRef.value.getContext('2d')
            canvasRef.value.width = window.innerWidth / 2
            canvasRef.value.height = window.innerHeight

            // 设置人脸识别跟踪
            const tracker = new tracking.ObjectTracker(['face'])
            tracker.setInitialScale(4)
            tracker.setStepSize(2)
            tracker.setEdgesDensity(0.1)
            tracking.track('#myVideo', tracker, {camera: true})

            tracker.on('track', (event) => {
              // 清除之前的图形
              context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

              event.data.forEach((rect) => {
                context.strokeStyle = '#a64ceb'
                context.strokeRect(rect.x, rect.y, rect.width, rect.height)
                context.font = '22px Helvetica'
                context.fillStyle = '#fff'
                context.fillText(`x：${rect.x}px`, rect.x + rect.width + 5, rect.y + 22)
                context.fillText(`y：${rect.y}px`, rect.x + rect.width + 5, rect.y + 44)
              })
            })
          },
          (error) => {
            console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
          }
      )
    }

    onMounted(async () => {
      // 打开视频
      await openMedia()
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
