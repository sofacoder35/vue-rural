import Vue from "vue";
import eIconPicker from 'e-icon-picker';
import "e-icon-picker/lib/symbol.js"; //基本彩色图标库
import 'e-icon-picker/lib/index.css'; // 基本样式，包含基本图标
import 'font-awesome/css/font-awesome.min.css'; //font-awesome 图标库
import 'element-ui/lib/theme-chalk/icon.css'; //element-ui 图标库

Vue.use(eIconPicker,{
    FontAwesome: true,
    ElementUI: true,
    eIcon: true,//自带的图标，来自阿里妈妈
    eIconSymbol: true,//是否开启彩色图标
})