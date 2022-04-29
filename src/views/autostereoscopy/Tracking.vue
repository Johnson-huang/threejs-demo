<template>
  <div class="page-box">
    <video id="myVideo" width="400" height="300" preload autoplay loop muted></video>
  </div>
</template>

<script>
import Tracking from 'tracking.js'
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  setup() {
    onMounted(() => {
      const colors = new Tracking.ColorTracker(['magenta', 'cyan', 'yellow']);

      colors.on('track', function(event) {
        if (event.data.length === 0) {
          // No colors were detected in this frame.
        } else {
          event.data.forEach(function(rect) {
            console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
          });
        }
      });

      Tracking.track('#myVideo', colors);
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
  .page-box {
    position: relative;
    width: 100%;
    height: 100vh;

    .canvas {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      z-index: 2;
    }

    .background {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 300px;
      background: black;
      z-index: 1;
    }
  }
</style>
