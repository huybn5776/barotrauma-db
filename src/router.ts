import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: { name: 'items' } },
  {
    path: '/items',
    component: () => import('@views/ItemsPage/ItemsPage.vue'),
    name: 'items',
  },
  {
    path: '/data-import',
    component: () => import('@views/DataImportPage/DataImportPage.vue'),
    name: 'dataImport',
  },
];

const route = createRouter({
  history: createWebHistory(),
  routes,
});

export default route;
