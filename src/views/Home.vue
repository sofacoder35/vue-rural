<template>
    <!--主容器-->
    <el-container class="main-class">
        <!--头部信息-->
        <el-header>
            <el-row style="height: 100%">
                <el-col :span="2" style="height: 100%">
                    <el-avatar :size="60" :src="avatar.startsWith('http')?avatar:this.$qiniu+avatar"></el-avatar>
                </el-col>
                <el-col :span="15" class="title">
                    乡旅助手后台管理平台<span>——({{name}})</span>
                </el-col>
                <el-col :span="7" class="logout">
                    <el-button type="info" @click="logout">退出登录</el-button>
                </el-col>
            </el-row>
        </el-header>
        <!--主体容器-->
        <el-container>
        <!-- 侧边栏-->
            <el-aside :width="menuActive ? '200px':'60px'" >
                <div class="menuButton" @click="menuActive=!menuActive">
                    <i class="el-icon-s-fold"></i>
                </div>
                <el-menu
                    :default-active="activePath"
                    class="el-menu-vertical-demo"
                    background-color="#545c64"
                    text-color="#fff"
                    active-text-color="#ffd04b"
                    router
                    :collapse="!menuActive"
                    :unique-opened="true">
                    <el-submenu :index="index+''" v-for="(parentMenu,index) in menus" :key="index">
                        <template slot="title">
                    <!--一级菜单-->
                            <i :class="parentMenu.icon" style="margin-right: 5px;"></i>
                            <span>{{ parentMenu.title }}</span>
                        </template>
                    <!--二级菜单-->
                            <el-menu-item :index="childrenMenu.path" v-for="(childrenMenu,i) in parentMenu.children" :key="i" @click="savePath(childrenMenu.path)">
                                <template slot="title">
                                    <i :class="childrenMenu.icon" style="margin-right: 5px;"></i>
                                    <span>{{ childrenMenu.title }}</span>
                                </template>
                            </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
        <!-- 主体-->
            <el-main>
                <el-breadcrumb separator-class="el-icon-arrow-right">
                    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-for="(item,index) in $router.currentRoute.matched" :key="index">{{ item.meta.title }}</el-breadcrumb-item>
                </el-breadcrumb>
                <span v-show="$router.currentRoute==='/'" class="main-title">欢迎来到个人运动平台</span>
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import {mapState} from 'vuex'
export default {
    computed:{
        ...mapState(['name','avatar','menus'])
    },
    created() {
        // console.log('菜单',this.menus);
    },
    data(){
        return {
            //是否展开菜单
            menuActive:true,
            //激活的菜单
            activePath:sessionStorage.getItem('activePath')
        }
    },
    methods:{
        logout(){
            this.$confirm('你将退出, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.get('user/logout').then((res)=>{
                    sessionStorage.clear();
                    this.$router.replace('/login')
                    this.$message.success(res.data.message)
                })
            }).catch(() => {

            });
        },
        savePath(path){
            sessionStorage.setItem('activePath',path);
            this.activePath=path;
        }
    }
};
</script>

<style scoped>
.el-header{
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
}

.el-aside {
    background-color: #545c64;
    color: #333;

}

.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;

}
.main-class{
    height: 100%;
}
.title{
    text-align: left;
    font-size: 25px;
    font-family: 华文行楷;
}
.logout{
    text-align: right;
}
.menuButton{
    font-size:20px;
    background-color: #2b2c2d;
    color:#fff;
    cursor:pointer;
}
.main-title{
    font-size: 50px;
    font-family: 华文行楷;

}
.el-submenu .el-menu-item{
    /*padding: 0;*/
    font-size: 10px;
}

</style>