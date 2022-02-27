import Vue from "vue";
import store from '@/store'
//自定义指令
/**
 * 指令，方法
 */
Vue.directive('hasRole',{
    inserted(el,binding){
        const {value}=binding;
        const roles=store.state.roles;

        const admin='SUPER_ADMIN';
        if(value && value instanceof Array && value.length>0){
            /**
             * 判断字符串是否包含某个指定的值
             * @type {boolean}
             */
            const hasRole = roles.some(item=>{
                /**
                 * includes判断字符串中是否有
                 */
                return item.code===admin ||value.includes(item.code);
            })

            if(!hasRole){
                el.parentNode.removeChild(el)
                console.log("888",el);
            }
        }else {
            throw new Error(`请设置${value}标签`)
        }
    }
})
/**
 * 自定义权限指令
 */
Vue.directive('hasPermi',{
    inserted(el,binding){
        const {value}=binding;
        const permissions=store.state.permissions
        const roles=store.state.roles;
        const admin='SUPER_ADMIN'
        if(value && value instanceof Array && value.length>0){
            const hasPermi=permissions.some(item=>{
                return value.includes(item.code)
            })
            const hasRole=roles.some(item=>{
                return item.code===admin ;
            })
            if(!hasPermi && !hasRole){
                el.parentNode.removeChild(el);
            }
        }else {
            throw new Error(`请设置${value}标签`)
        }
    }
})