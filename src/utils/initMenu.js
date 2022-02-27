import Home from "@/views/Home";

export const formatMenu= (menus)=>{
    /**
     * filter创建一个新数组，新数组中的元素通过指定数组符合的条件进行返回
     */
    const route=menus.filter(item=>{
        item.component=(item.component==='home')?Home:loadView(item.component)
        // item.icon=item.icon
        item.meta={
            title:item.title
        }
        if(item.children && item.children.length>0){
            formatMenu(item.children);
        }
        return true
    })
    return route
}
/**
 * 路由懒加载
 * @param view {string} 组件路径
 * @returns {function(*): *} 返回组件
 */
const loadView=(view)=>{
    return (resolve)=> require([`@/views/${view}.vue`],resolve)
}