import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: { name: 'items' } },
  {
    path: '/items',
    component: () => import('@modules/items/ItemsPage.vue'),
    name: 'items',
  },
  {
    path: '/data-import',
    component: () => import('@modules/data-importer/DataImportPage.vue'),
    name: 'dataImport',
  },
  { path: '/:catchAll(.*)', redirect: { name: 'items' } },
];

const route = createRouter({
  history: createWebHistory(),
  routes,
});

export default route;
