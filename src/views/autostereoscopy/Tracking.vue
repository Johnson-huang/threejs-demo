<template>
  <div class="page-box">
    <video ref="videoRef" id="myVideo" preload autoplay loop muted controls></video>
    <div class="box"></div>
  </div>
</template>

<script>
import 'tracking'
import {defineComponent, onMounted, ref} from 'vue'
import {checkGetUserMediaSupport, checkMediaDevices, getUserMedia} from '@/utils/media-devices'

export default defineComponent({
  setup() {
    // webRTC 打开摄像头
    // https://www.jianshu.com/p/9f4a0782cd61

    // 人脸识别 对应 裸眼3D 原理
    // https://xiaozhuanlan.com/topic/0241985376

    const videoRef = ref(null)

    onMounted(async () => {
      // 是否支持访问用户媒体设备
      if (!checkGetUserMediaSupport()) {
        return
      }

      // 获取支持的音视频设备
      // 判断是否有视频输入设备
      const devicesResult = await checkMediaDevices()
      if (devicesResult.code === 0 || !devicesResult.data.find(item => item.kind === 'videoinput')) {
        console.log('checkMediaDevices 错误：', devicesResult)
        return
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

      // console.log(window.tracking, 123)
      // const colors = new window.tracking.ColorTracker(['magenta', 'cyan', 'yellow']);
      //
      // colors.on('track', function (event) {
      //   if (event.data.length === 0) {
      //     // No colors were detected in this frame.
      //   } else {
      //     event.data.forEach(function (rect) {
      //       console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
      //     });
      //   }
      // });
      //
      // window.tracking.track('#myVideo', colors);
    })

    return {
      videoRef
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

    #myVideo, .box {
      width: 50%;
    }
  }
</style>
