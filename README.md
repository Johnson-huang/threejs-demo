# 3D Demo
一些尝试性的前端 3D demo  
部分效果需要使用 iphoneX 以上手机查看

## 技术栈

### 3D 相关技术栈
- 3D场景：threejs
- 人脸识别：tracking
- 经纬度坐标处理：geolib

### 其他技术栈
- Vue 3.x
- Vue-route 4.x
- Vite 2.x
- less

## 场景
- [x] 汽车 3D 展厅
  - [x] 点击更换颜色
  - [ ] 开关门
- [x] 裸眼 3D
  - [x] 人脸识别方案
  - [x] 陀螺仪方案
- [x] WebVR 全景看房
  - [x] 球体方案
  - [x] 正方体方案
  - [x] 信息点点击事件
- [x] 地图
  - [x] 建筑点击事件
  - [x] 道路动画
  - [x] 水域动画
  - [ ] 地形模拟

## 地图
- 城市道路水域数据来源：https://overpass-turbo.eu/
- 地形高程数据来源：NASA SRTM https://www.cnsageo.com
- 道路动画方案：LineDashedMaterial 动态改变 dashSize
- 性能优化：BufferGeometryUtils.mergeBufferGeometries + Box3Helper

## 问题解决
### overpass-turbo 数据导出报错
问题：overpass-turbo 中 export 报错  
解决：将 chrome 语音设置为<font color="#dd0000">**英文**</font>，再进行 export

### GPS 坐标转化
问题：overpass-turbo 导出的数据坐标为 wgs84，适用于球体。需要转换为平面类型的坐标 gcj02  

解决：  
- 使用<font color="#dd0000">**墨卡托投影算法**</font>，很准，但是极耗性能
- 使用 geolib 库来进行简易转换，准确度降低，性能消耗也减低