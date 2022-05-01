<template>
  <div class="page-box"></div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {onMounted, onUnmounted, defineComponent} from 'vue'

let scene = null;
let camera = null;
let renderer = null;
const hotPoints=[
  {
    position:{
      x:0,
      y:0,
      z:-0.2
    },
    detail:{
      "title":"信息点1"
    }
  },
  {
    position:{
      x:-0.2,
      y:-0.05,
      z:0.2
    },
    detail:{
      "title":"信息点2"
    }
  }
];

export default defineComponent({
  setup() {
    // 初始化
    function init() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(90, document.body.clientWidth / document.body.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 0.01);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(document.body.clientWidth, document.body.clientHeight);

      document.querySelector(".page-box").appendChild(renderer.domElement);

      useBox();
      initPoints();
      animate();

      // 绑定控制和摄像头
      new OrbitControls(camera, renderer.domElement);
    }

    function useBox(){
      const materials = [];

      const texture_left = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_left.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_left} ) );

      const texture_right = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_right.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_right} ) );

      const texture_top = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_top.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_top} ) );

      const texture_bottom = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_bottom.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_bottom} ) );

      const texture_front = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_front.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_front} ) );

      const texture_back = new THREE.TextureLoader().load( 'src/assets/web-vr/images/scene_back.jpeg' );
      materials.push( new THREE.MeshBasicMaterial( { map: texture_back} ) );

      const box = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), materials );
      box.geometry.scale( 1, 1, -1 );
      scene.add(box);
    }

    function initPoints() {
      const pointTexture = new THREE.TextureLoader().load('src/assets/web-vr/images/hot.png');
      const material = new THREE.SpriteMaterial( { map: pointTexture} );

      const poiObjects = [];
      for(let i = 0; i < hotPoints.length; i++){
        const sprite = new THREE.Sprite( material );
        sprite.scale.set( 0.1, 0.1, 0.1 );
        sprite.position.set( hotPoints[i].position.x, hotPoints[i].position.y, hotPoints[i].position.z );

        scene.add( sprite );

        sprite.detail = hotPoints[i].detail;
        poiObjects.push(sprite);
      }

      document.querySelector(".page-box").addEventListener("click",function(event){
        event.preventDefault();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        const intersects = raycaster.intersectObjects( poiObjects );
        if(intersects.length>0){
          alert("点击了热点"+intersects[0].object.detail.title);
        }
      });
    }

    // 动画
    function animate() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    onMounted(() => {
      init();
      animate();
    })

    onUnmounted(() => {})

    return {}
  },
})
</script>

<style lang="less" scoped>
.page-box {}
</style>
