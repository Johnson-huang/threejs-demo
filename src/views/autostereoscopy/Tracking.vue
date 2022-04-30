<template>
  <div class="page-box">
    <video ref="videoRef" id="myVideo" width="400" height="300" preload autoplay loop muted controls></video>
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
      if (checkGetUserMediaSupport()) {
        // 获取支持的音视频设备
        const devicesResult = await checkMediaDevices()
        // TODO 判断一下视频输入设备
        if (devicesResult.code !== 0) {
          console.log('devicesResult data:', devicesResult.data)
        } else {
          console.log('checkMediaDevices 错误：', devicesResult)
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
  .page-box {}
</style>
