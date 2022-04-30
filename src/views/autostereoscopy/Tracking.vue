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
      // getUserMedia(
      //     {audio: false, video: true},
      //     (stream) => {
      //       videoRef.value.srcObject = stream;
      //     },
      //     (error) => {
      //       console.log(`访问用户媒体设备失败${error.name}, ${error.message}`);
      //     }
      // )
    }

    onMounted(async () => {
      // 打开视频
      await openMedia()

      // const context = canvasRef.value.getContext('2d')
      // const tracker = window.tracking.ObjectTracker(['face'])
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
