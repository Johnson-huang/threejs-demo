export default [
    {
        path: '/map',
        meta: {title: '地图'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'threejs', component: () => import("@/views/map/Map.vue"), meta: {title: '地图1'}}
        ]
    }
]