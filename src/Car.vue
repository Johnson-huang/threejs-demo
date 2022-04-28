<template>
  <div id="car-box"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { reactive, onMounted, toRefs, defineComponent } from 'vue'

let scene = null;
let camera = null;
let renderer = null;
let allTexture; // 全贴图对象
const textureLoader = new THREE.TextureLoader(); // 纹理

export default defineComponent({
  setup() {
      const state = reactive({})

      // 初始化
      function init() {
        // 场景
        scene = new THREE.Scene();
        // 相机
        camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 3);
        // 渲染器
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // 插入
        document.querySelector('#car-box').appendChild(renderer.domElement);
        // 控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        // 加载全部贴图
        loadAllTexture(loadCarModel);
        // 添加灯光
        addLight();
      }

      // 动画
      function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }

      // 加载全部贴图
      function loadAllTexture(cb){
        allTexture = {};

        var loadIndex = 0;
        var textures = [
            "skymap2",
            "skymap",
            "shache_occ",
            "shache_nor",
            "shache_col",
            "neishi_occ",
            "neishi_nor",
            "mennei_col",
            "luntai_nor",
            "luntai_col",
            "lungu_occ",
            "lungu_nor",
            "lungu_col",
            "linjian_occ",
            "linjian_nor",
            "linjian_col",
            "floor",
            "deng_occ",
            "deng_nor",
            "deng_col",
            "cheshen_occ",
            "cheshen_nor",
            "chejia_occ",
            "chejia_nor",
            "chedengzhao_nor"
        ];

        function loadNextTexture(){
          var textureName = textures[loadIndex];

          const textureLoader = new THREE.TextureLoader();
          textureLoader.load("src/assets/car/textures/" + textureName + ".jpg", (texture) => {
            allTexture[textureName] = {
                texture: texture
            };
            if(loadIndex<textures.length-1){
                loadIndex++;
                loadNextTexture();
            }else{
                if(cb)cb();
            }
          });
        }
        loadNextTexture();
      }

      // 加载汽车模型
      var smart_cheshen;
      function loadCarModel(){
          const loader = new GLTFLoader();

          loader.load(
              'src/assets/car/model.gltf',
              function ( gltf ) {
                  scene.add( gltf.scene );

                  setupInfoPoint();

                  for(var i=0;i<gltf.scene.children[0].children.length;i++){
                      var child = gltf.scene.children[0].children[i];

                      if(child.name=="smart_lungu0"||child.name=="smart_lungu1"||child.name=="smart_lungu2"||child.name=="smart_lungu3"){
                          child.material = new THREE.MeshStandardMaterial();
                          child.material.map = allTexture["lungu_col"].texture;
                          child.material.normalMap = allTexture["lungu_nor"].texture;
                          child.material.aoMap = allTexture["lungu_occ"].texture;
                      }else if(child.name=="smart_chelun0"||child.name=="smart_chelun1"||child.name=="smart_chelun2"||child.name=="smart_chelun3"){
                          child.material = new THREE.MeshStandardMaterial();
                          child.material.map = allTexture["luntai_col"].texture;
                          child.material.normalMap = allTexture["luntai_nor"].texture;
                      }else if(child.name=="smart_cheshen"){
                          smart_cheshen = child;
                          child.material = new THREE.MeshStandardMaterial();
                          
                          child.material.color=new THREE.Color(0x70631B);
                          child.material.metalness = 0.44;
                          child.material.roughness = 0;

                          child.material.normalMap = allTexture["cheshen_nor"].texture;
                          child.material.aoMap = allTexture["cheshen_occ"].texture;
                      
                          child.material.envMap=allTexture["skymap2"].texture;
                          child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                          child.material.envMapIntensity=1;
                      }else if ( child.name=="smart_chejia") {
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color=new THREE.Color(0x252929);
                          child.material.metalness = .44;
                          child.material.roughness = 0.4;
                          child.material.normalMap = allTexture["chejia_nor"].texture;
                          child.material.aoMap = allTexture["chejia_occ"].texture;
                      }else if(child.name=="smart_boli"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color( 0x333333 );
                          child.material.transparent=true;
                          child.material.opacity=.2;

                          child.material.envMap=allTexture["skymap2"].texture;
                          child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                          child.material.envMapIntensity=1;
                      }else if(child.name=="smart_tianchuang"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color( 0x000000 );
                          child.material.transparent=true;
                          child.material.opacity=.5;

                          child.material.envMap=allTexture["skymap2"].texture;
                          child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                          child.material.envMapIntensity=1;

                      }else if ( child.name=="smart_shachepan") {
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color=new THREE.Color(0xf2f2f2);
                          child.material.emissive=new THREE.Color(0x000000);
                          child.material.metalness = .5;
                          child.material.roughness = .62;
                          child.material.map = allTexture["shache_col"].texture;
                          child.material.normalMap = allTexture["shache_nor"].texture;
                          child.material.aoMap = allTexture["shache_occ"].texture;
                      }else if (child.name=="smart_neishi"||child.name=="smart_neishi2"){//
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color=new THREE.Color(0x333333);
                          child.material.emissive=new THREE.Color(0x000000);
                          child.material.normalMap = allTexture["neishi_nor"].texture;
                          child.material.aoMap = allTexture["neishi_occ"].texture;
                      }else if ( child.name=="smart_neibao") {
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color=new THREE.Color(0x2e2e2e);
                          child.material.map = allTexture["mennei_col"].texture;
                      }else if ( child.name=="smart_linjian") {
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color=new THREE.Color(0x2e2e2e);
                          child.material.metalness = .5;
                          child.material.roughness = .62;
                          child.material.map = allTexture["linjian_col"].texture;
                          child.material.normalMap = allTexture["linjian_nor"].texture;
                          child.material.aoMap = allTexture["linjian_occ"].texture;
                      }else if(child.name=="smart_daochejing"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color( 0xffffff );
                      }else if(child.name=="smart_bolinei"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color=new THREE.Color(0x333333);
                      }else if(child.name=="smart_chedeng"||child.name=="smart_shachedeng"||child.name=="smart_wudeng"){
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color = new THREE.Color( 0xffffff );
                          child.material.emissive = new THREE.Color( 0x333333 );
                          child.material.metalness = 1.0;
                          child.material.roughness = 0.4;

                          child.material.normalMap=allTexture["deng_nor"].texture;
                      }else if(child.name=="smart_chedengzhao"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color( 0xffffff );
                          child.material.emissive = new THREE.Color( 0x000000 );
                          child.material.transparent=true;
                          child.material.opacity=.3;

                          child.material.normalMap=allTexture["chedengzhao_nor"].texture;
                      
                          child.material.envMap=allTexture["skymap2"].texture;
                          child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                          child.material.envMapIntensity=1;
                      }else if(child.name=="smart_shachedengzhao"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color( 0xca0816);
                          child.material.transparent=true;
                          child.material.opacity=.4;

                          child.material.normalMap=allTexture["chedengzhao_nor"].texture;
                      }else if(child.name=="smart_shangeshang"){
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color = new THREE.Color( 0xf0f0f );
                          child.material.emissive = new THREE.Color( 0x000000 );
                          child.material.metalness = 1;
                          child.material.roughness = 0;
                      }else if(child.name=="smart_shangexia"){
                          child.material=new THREE.MeshPhongMaterial();
                          child.material.color = new THREE.Color(0);
                          child.material.metalness = 1;
                          child.material.roughness = 0;
                      }else if(child.name=="smart_LOGO" || child.name=="smart_paiqiguan"){
                          child.material=new THREE.MeshStandardMaterial();
                          child.material.color = new THREE.Color( 0x6c6c6c );
                          child.material.emissive = new THREE.Color( 0x444444 );
                          child.material.metalness = 1;
                          child.material.roughness = 0.32;
                      }
                  }
              },
              function ( xhr ) {
                  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
              },
              function ( error ) {
                  console.log( 'An error happened' );
              }
          );
      }

      // 添加灯光
      function addLight(){
        const ambientLight = new THREE.AmbientLight( 0xd5d5d5 );
        ambientLight.intensity=1.2;
        scene.add( ambientLight );

        const bottomRightDirLight = new THREE.DirectionalLight();
        bottomRightDirLight.position.x=5;
        bottomRightDirLight.position.y=3;
        bottomRightDirLight.position.z=-5;
        bottomRightDirLight.intensity=.8;
        scene.add( bottomRightDirLight );

        const frontDirLight = new THREE.DirectionalLight(0xffffff);
        frontDirLight.position.x=-5;
        frontDirLight.position.y=3;
        frontDirLight.position.z=5;
        frontDirLight.intensity=.8;
        scene.add( frontDirLight );
      }

      // 添加 ＋ 号
      let poiPosArray=[
          {x:-1.47,y:0.87,z:-0.36,frame:1},
          {x:-1.46,y:0.49,z:-0.69,frame:2},
          {x:1.5,y:.7,z:0,frame:8},
          {x:0.33,y:1.79,z:0,frame:3},
          
          {x:0.73,y:1.38,z:-0.8,frame:5},
          {x:-.1,y:1.17,z:0.88,frame:6},
          {x:-1.16,y:0.16,z:0.89,frame:7}
      ]
      let poiObjects=[];
      function setupInfoPoint(){
          const pointTexture = new THREE.TextureLoader().load("src/assets/car/point.png");

          var group = new THREE.Group();
          var materialC = new THREE.SpriteMaterial( { map: pointTexture, color: 0xffffff, fog: false } );
          for ( var a = 0; a < poiPosArray.length; a ++ ) {
              var x = poiPosArray[a].x;
              var y = poiPosArray[a].y-.5;
              var z = poiPosArray[a].z;

              var sprite = new THREE.Sprite( materialC );
              sprite.scale.set( .15, .15, 1 );
              sprite.position.set( x, y, z );
              sprite.idstr="popup_"+poiPosArray[a].frame;
              group.add( sprite );

              poiObjects.push(sprite);
          }
          scene.add( group );

          document.body.addEventListener("click",function (event) {
              event.preventDefault();

              var raycaster = new THREE.Raycaster();
              var mouse = new THREE.Vector2();
              mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
              mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

              raycaster.setFromCamera( mouse, camera );

              var intersects = raycaster.intersectObjects( poiObjects );
              if(intersects.length>0){
                  var popIndex=parseInt(intersects[ 0 ].object.idstr.substr(6,1));
                  console.log(popIndex);
              }
          });
      }

      // 点击修改车身颜色
      function changeCheshen(cIndex){
        var colors = [0xffff00,0xff0000,0xffffff];
        smart_cheshen.material.color = new THREE.Color(colors[cIndex]);
      }

      // 没有调用？
      function addBox(){
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
      }

      onMounted(() => {
        init();
        animate();

        window.addEventListener('resize', function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        })
      })

      return {
        ...state
      }
  },
})  
</script>

<style scope>
  #car-box {
    width: 100%;
    height: 100%;
  }
</style>
