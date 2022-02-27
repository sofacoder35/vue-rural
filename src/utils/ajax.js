import Vue from "vue";
import axios from "axios";
import {Message} from "element-ui";
import router from "../router";

const ajax=axios.create({
    baseURL:process.env.VUE_APP_BASE_URL,
    timeout:100000
})

ajax.interceptors.request.use((config)=>{
    const token=sessionStorage.getItem('token');
    if(token){
        config.headers['Authorization']=token;
    }
    console.log(config);
    return config;
},(err)=>{
    console.log("请求异常",err);
})


ajax.interceptors.response.use((res)=>{
    if(!res.data.flag){
        Message.error(res.data.message)
    }
    return res;
},(err)=>{
    console.log('异常',err.response);
    if(err.response.status === 400){
        Message.error(err.response.data.message)
    }else if(err.response.status === 401){
        sessionStorage.clear();
        router.replace('/login')
        Message.error("请登录")
    }else if(err.response.status === 403){
        Message.error(err.response.data.message)
    }else if(err.response.status === 404){
        Message.error("后端接口未找到")
    }else if(err.response.status === 405){
        Message.warning('请求方法错误-->需要"'+err.response.headers.allow+'"请求')
    } else if(err.response.status === 500){
        Message.error("后端异常-->"+err.response.data.message)
    }else {
        Message.error("未知错误")
    }
})

Vue.prototype.$ajax=ajax;

export default ajax;