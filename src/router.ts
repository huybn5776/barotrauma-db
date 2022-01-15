import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: { name: 'dataImport' } },
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
