export default [
    {
        path: '/map',
        meta: {title: '地图'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'threejs', component: () => import("@/views/map/ThreejsMap.vue"), meta: {title: '地图方案一：threejs'}}
        ]
    }
]