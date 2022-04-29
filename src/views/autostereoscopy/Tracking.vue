<template>
  <div class="page-box">
    <video id="myVideo" width="400" height="300" preload autoplay loop muted controls></video>
  </div>
</template>

<script>
import 'tracking'
import {defineComponent, onMounted} from 'vue'

export default defineComponent({
  setup() {
    // webRTC 打开摄像头
    // https://www.jianshu.com/p/9f4a0782cd61

    // 人脸识别 对应 裸眼3D 原理
    // https://xiaozhuanlan.com/topic/0241985376

    onMounted(() => {
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

    return {}
  },
})
</script>

<style lang="less" scoped>
  .page-box {}
</style>
