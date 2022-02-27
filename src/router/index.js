import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/login.vue";
import Home from "@/views/Home";
import  store  from "@/store";
import ajax from "@/utils/ajax"
import {formatMenu} from "@/utils/initMenu";

Vue.use(VueRouter);

const routes = [
    {
        path: "/login",
        name: "Login",
        component:Login,
    },
    {
        path: '/',
        component: Home,
    }
];

const router = new VueRouter({
    routes,
});
/**
 * to:gowhere
 * from:fromwhere
 * next:放行到哪个页面
 */
router.beforeEach((to,from,next)=>{
    const token=sessionStorage.getItem('token');
    if(!token){
        if(to.path ==='/login'){
            next();
        }else{
            next(`/login?redirect=${to.fullPath}`)
        }
    }else {
        // if(!store.state.roles || store.state.roles.length<1){
            ajax.get('/user/getInfo').then((res)=>{
                const user=res.data.data;
                store.commit('setName',user.name);
                store.commit('setAvatar',user.avatar);
                if(user.roles.length>0){
                    //添加角色权限信息
                    store.commit('setRoles',user.roles)
                    //格式化菜单
                    const menuList=formatMenu(user.menus)
                    router.addRoutes(menuList)
                    store.commit('setMenus',menuList)
                    store.commit('setPermissions',user.permissions)
                    // console.log("***",user.roles);
                }

            })

        //已经登录
        if(to.path==='/login'){
            next('/');
        }else{
            next();
        }

    }
})
export default router;
