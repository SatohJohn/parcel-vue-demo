import Vue from 'vue';
import VueTouch from 'vue-touch';
import index from './index.vue';

Vue.use(VueTouch);

new Vue(index).$mount('#app');
