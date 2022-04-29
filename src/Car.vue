<template>
  <div id="car-box"></div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {reactive, onMounted, defineComponent, onUnmounted} from 'vue'

let scene = null;
let camera = null;
let renderer = null;
let allTexture; // 全贴图对象

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
    function loadAllTexture(cb) {
      allTexture = {};

      let loadIndex = 0;
      const textures = [
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

      function loadNextTexture() {
        const textureName = textures[loadIndex];

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load("src/assets/car/textures/" + textureName + ".jpg", (texture) => {
          allTexture[textureName] = {
            texture: texture
          };
          if (loadIndex < textures.length - 1) {
            loadIndex++;
            loadNextTexture();
          } else {
            if (cb) cb();
          }
        });
      }

      loadNextTexture();
    }

    // 加载汽车模型
    let smart_cheshen;

    function loadCarModel() {
      const loader = new GLTFLoader();

      loader.load(
          'src/assets/car/model.gltf',
          function (gltf) {
            scene.add(gltf.scene);

            setupInfoPoint();

            for (let i = 0; i < gltf.scene.children[0].children.length; i++) {
              const child = gltf.scene.children[0].children[i];

              switch (child.name) {
                case "smart_lungu0":
                case "smart_lungu1":
                case "smart_lungu2":
                case "smart_lungu3":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.map = allTexture["lungu_col"].texture;
                  child.material.normalMap = allTexture["lungu_nor"].texture;
                  child.material.aoMap = allTexture["lungu_occ"].texture;
                  break;
                case "smart_chelun0":
                case "smart_chelun1":
                case "smart_chelun2":
                case "smart_chelun3":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.map = allTexture["luntai_col"].texture;
                  child.material.normalMap = allTexture["luntai_nor"].texture;
                  break;
                case "smart_cheshen":
                  smart_cheshen = child;
                  child.material = new THREE.MeshStandardMaterial();

                  child.material.color = new THREE.Color(0x70631B);
                  child.material.metalness = 0.44;
                  child.material.roughness = 0;

                  child.material.normalMap = allTexture["cheshen_nor"].texture;
                  child.material.aoMap = allTexture["cheshen_occ"].texture;

                  child.material.envMap = allTexture["skymap2"].texture;
                  child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                  child.material.envMapIntensity = 1;
                  break;
                case "smart_chejia":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0x252929);
                  child.material.metalness = .44;
                  child.material.roughness = 0.4;
                  child.material.normalMap = allTexture["chejia_nor"].texture;
                  child.material.aoMap = allTexture["chejia_occ"].texture;
                  break;
                case "smart_boli":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0x333333);
                  child.material.transparent = true;
                  child.material.opacity = .2;

                  child.material.envMap = allTexture["skymap2"].texture;
                  child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                  child.material.envMapIntensity = 1;
                  break;
                case "smart_tianchuang":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0x000000);
                  child.material.transparent = true;
                  child.material.opacity = .5;

                  child.material.envMap = allTexture["skymap2"].texture;
                  child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                  child.material.envMapIntensity = 1;
                  break;
                case "smart_shachepan":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0xf2f2f2);
                  child.material.emissive = new THREE.Color(0x000000);
                  child.material.metalness = .5;
                  child.material.roughness = .62;
                  child.material.map = allTexture["shache_col"].texture;
                  child.material.normalMap = allTexture["shache_nor"].texture;
                  child.material.aoMap = allTexture["shache_occ"].texture;
                  break;
                case "smart_neishi":
                case "smart_neishi2": //
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0x333333);
                  child.material.emissive = new THREE.Color(0x000000);
                  child.material.normalMap = allTexture["neishi_nor"].texture;
                  child.material.aoMap = allTexture["neishi_occ"].texture;
                  break;
                case "smart_neibao":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0x2e2e2e);
                  child.material.map = allTexture["mennei_col"].texture;
                  break;
                case "smart_linjian":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0x2e2e2e);
                  child.material.metalness = .5;
                  child.material.roughness = .62;
                  child.material.map = allTexture["linjian_col"].texture;
                  child.material.normalMap = allTexture["linjian_nor"].texture;
                  child.material.aoMap = allTexture["linjian_occ"].texture;
                  break;
                case "smart_daochejing":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0xffffff);
                  break;
                case "smart_bolinei":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0x333333);
                  break;
                case "smart_chedeng":
                case "smart_shachedeng":
                case "smart_wudeng":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0xffffff);
                  child.material.emissive = new THREE.Color(0x333333);
                  child.material.metalness = 1.0;
                  child.material.roughness = 0.4;

                  child.material.normalMap = allTexture["deng_nor"].texture;
                  break;
                case "smart_chedengzhao":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0xffffff);
                  child.material.emissive = new THREE.Color(0x000000);
                  child.material.transparent = true;
                  child.material.opacity = .3;

                  child.material.normalMap = allTexture["chedengzhao_nor"].texture;

                  child.material.envMap = allTexture["skymap2"].texture;
                  child.material.envMap.mapping = THREE.EquirectangularReflectionMapping;
                  child.material.envMapIntensity = 1;
                  break;
                case "smart_shachedengzhao":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0xca0816);
                  child.material.transparent = true;
                  child.material.opacity = .4;

                  child.material.normalMap = allTexture["chedengzhao_nor"].texture;
                  break;
                case "smart_shangeshang":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0xf0f0f);
                  child.material.emissive = new THREE.Color(0x000000);
                  child.material.metalness = 1;
                  child.material.roughness = 0;
                  break;
                case "smart_shangexia":
                  child.material = new THREE.MeshPhongMaterial();
                  child.material.color = new THREE.Color(0);
                  child.material.metalness = 1;
                  child.material.roughness = 0;
                  break;
                case "smart_LOGO":
                case "smart_paiqiguan":
                  child.material = new THREE.MeshStandardMaterial();
                  child.material.color = new THREE.Color(0x6c6c6c);
                  child.material.emissive = new THREE.Color(0x444444);
                  child.material.metalness = 1;
                  child.material.roughness = 0.32;
                  break;
              }
            }
          },
          function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          function (error) {
            console.log('An error happened');
          }
      );
    }

    // 添加灯光
    function addLight() {
      const ambientLight = new THREE.AmbientLight(0xd5d5d5);
      ambientLight.intensity = 1.2;
      scene.add(ambientLight);

      const bottomRightDirLight = new THREE.DirectionalLight();
      bottomRightDirLight.position.x = 5;
      bottomRightDirLight.position.y = 3;
      bottomRightDirLight.position.z = -5;
      bottomRightDirLight.intensity = .8;
      scene.add(bottomRightDirLight);

      const frontDirLight = new THREE.DirectionalLight(0xffffff);
      frontDirLight.position.x = -5;
      frontDirLight.position.y = 3;
      frontDirLight.position.z = 5;
      frontDirLight.intensity = .8;
      scene.add(frontDirLight);
    }

    // 添加 ＋ 号
    let poiPosArray = [
      {x: -1.47, y: 0.87, z: -0.36, frame: 1},
      {x: -1.46, y: 0.49, z: -0.69, frame: 2},
      {x: 1.5, y: .7, z: 0, frame: 8},
      {x: 0.33, y: 1.79, z: 0, frame: 3},

      {x: 0.73, y: 1.38, z: -0.8, frame: 5},
      {x: -.1, y: 1.17, z: 0.88, frame: 6},
      {x: -1.16, y: 0.16, z: 0.89, frame: 7}
    ]
    let poiObjects = [];

    function setupInfoPoint() {
      const pointTexture = new THREE.TextureLoader().load("src/assets/car/point.png");

      const group = new THREE.Group();
      const materialC = new THREE.SpriteMaterial({map: pointTexture, color: 0xffffff, fog: false});
      for (let a = 0; a < poiPosArray.length; a++) {
        const x = poiPosArray[a].x;
        const y = poiPosArray[a].y - .5;
        const z = poiPosArray[a].z;

        const sprite = new THREE.Sprite(materialC);
        sprite.scale.set(.15, .15, 1);
        sprite.position.set(x, y, z);
        sprite.idstr = "popup_" + poiPosArray[a].frame;
        group.add(sprite);

        poiObjects.push(sprite);
      }
      scene.add(group);

      document.body.addEventListener("click", function (event) {
        event.preventDefault();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(poiObjects);
        if (intersects.length > 0) {
          const popIndex = parseInt(intersects[0].object.idstr.substr(6, 1));
          console.log(popIndex);
        }
      });
    }

    // 点击修改车身颜色
    function changeCheshen(cIndex) {
      const colors = [0xffff00, 0xff0000, 0xffffff];
      smart_cheshen.material.color = new THREE.Color(colors[cIndex]);
    }

    // 没有调用？
    function addBox() {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMounted(() => {
      init();
      animate();

      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      ...state
    }
  },
})
</script>

<style lang="less" scoped>
#car-box {
  width: 100%;
  height: 100%;
}
</style>
