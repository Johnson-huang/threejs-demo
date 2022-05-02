<template>
  <div class="page-box"></div>
</template>

<script>
/**
 * * 利用 css3d-engine 来实现
 * ! 目前已经不维护了，局限性较大
 * https://github.com/shrekshrek/css3d-engine
 */
import {onMounted, onUnmounted, defineComponent} from 'vue'

const hotPoints = [
  {
    position: {
      x: 0,
      y: 0,
      z: -476
    },
    detail: {
      "title": "信息点1"
    }
  },
  {
    position: {
      x: 100,
      y: 0,
      z: 476
    },
    detail: {
      "title": "信息点2"
    }
  }
];

let lastMouseX = 0;
let lastMouseY = 0;
let curMouseX = 0;
let curMouseY = 0;
let lastAngleX = 0;
let lastAngleY = 0;
let angleX = 0;
let angleY = 0;
let s = null

export default defineComponent({
  setup() {
    // 初始化
    function init() {
      s = new C3D.Stage();
      s.size(window.innerWidth, window.innerHeight).update();
      document.querySelector('.page-box').appendChild(s.el);

      const box = new C3D.Skybox();
      box.size(954).position(0, 0, 0).material({
        front: {image: "src/assets/web-vr/images/scene_front.jpeg"},
        back: {image: "src/assets/web-vr/images/scene_back.jpeg"},
        left: {image: "src/assets/web-vr/images/scene_right.jpeg"},
        right: {image: "src/assets/web-vr/images/scene_left.jpeg"},
        up: {image: "src/assets/web-vr/images/scene_top.jpeg"},
        down: {image: "src/assets/web-vr/images/scene_bottom.jpeg"},
      }).update();
      s.addChild(box);

      initPoints();

      loop();

      window.addEventListener("mousedown", mouseDownHandler);

      window.addEventListener("mouseup", mouseUpHandler);
    }

    function loop() {
      angleX += (curMouseX - lastMouseX + lastAngleX - angleX) * 0.3;
      angleY += (curMouseY - lastMouseY + lastAngleY - angleY) * 0.3;
      s.camera.rotation(angleY, -angleX, 0).updateT();
      requestAnimationFrame(loop);
    }

    function mouseDownHandler(evt) {
      lastMouseX = evt.pageX;
      lastMouseY = evt.pageY;
      lastAngleX = angleX;
      lastAngleY = angleY;
      curMouseX = evt.pageX;
      curMouseY = evt.pageY;

      window.addEventListener("mousemove", mouseMoveHandler);
    }

    function mouseMoveHandler(evt) {
      curMouseX = evt.pageX;
      curMouseY = evt.pageY;
    }

    function mouseUpHandler(evt) {
      curMouseX = evt.pageX;
      curMouseY = evt.pageY;
      window.removeEventListener("mousemove", mouseMoveHandler);
    }

    function initPoints() {
      for (let i = 0; i < hotPoints.length; i++) {
        const _p = new C3D.Plane();
        const r = Math.atan2(hotPoints[i].position.z - 0, 0 - 0) * 180 / Math.PI + 90;

        _p.size(207, 162).position(hotPoints[i].position.x, hotPoints[i].position.y, hotPoints[i].position.z).rotation(0, r, 0).material({
          image: "src/assets/web-vr/images/hot.png",
          repeat: 'no-repeat',
          bothsides: false,
        }).update();
        s.addChild(_p);

        _p.el.detail = hotPoints[i].detail;

        _p.on("click", function (e) {
          console.log(e.target.detail.title);
        })
      }
    }

    function handleResize() {
      s.size(window.innerWidth, window.innerHeight).update();
    }

    onMounted(() => {
      init();
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener('resize', handleResize)
    })

    return {}
  },
})
</script>

<style lang="less" scoped>
.page-box {
}
</style>
