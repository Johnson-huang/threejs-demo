export default [
    {
        path: '/web-ar',
        meta: {title: 'WebAR'},
        component: () => import('@/Layout/Layout.vue'),
        children: [
            {path: 'marker', component: () => import("@/views/web-vr/Threejs.vue"), meta: {title: 'WebAR 标记'}}
        ]
    }
]