# 地图
基于 threejs 实现的地图

## 数据
- 数据来源：https://overpass-turbo.eu/

## PS
### overpass-turbo 数据导出问题
问题：overpass-turbo 中 export 报错  
解决：将 chrome 语音设置为<font color="#dd0000">**英文**</font>，再进行 export

### GPS 坐标转化
问题：overpass-turbo 导出的数据坐标为 wgs84，适用于球体。需要转换为平面类型的坐标 gcj02  
解决：使用 geolib 库来进行转换