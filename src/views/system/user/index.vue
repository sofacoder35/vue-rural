<template>
    <div>
        <el-card>
            <div v-show="!open">
                <el-row>
                    <el-col :span="8">
                        <el-input placeholder="请输入内容" clearable v-model="queryInfo.queryString" @clear="findPage">
                            <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="2">
                        <el-button @click="insert" type="primary" style="margin-left: 10px" v-hasPermi="['USER_INSERT']">添加信息</el-button>
                    </el-col>
                </el-row>
                <el-table :data="tableList" stripe >
                    <el-table-column type="index" label="序号" />
                    <el-table-column prop="name" label="用户名" />
                    <el-table-column prop="sex" label="性别" :formatter="formatSex"/>
                    <el-table-column label="头像">
                        <template slot-scope="scope">
                            <el-image
                                style="width: 100px; height: 100px"
                                :src="scope.row.avatar.startsWith('http') ? scope.row.avatar : $qiniu +scope.row.avatar"
                                :preview-src-list="preview(scope.row.avatar)">
                            </el-image>
                        </template>
                    </el-table-column>
                    <el-table-column label="角色标签">
                        <template slot-scope="scope">
                            <el-tag size="mini" v-for="(item,index) in scope.row.roles" :key="index">{{item.label}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="email" label="邮箱" />
                    <el-table-column prop="phoneNumber" label="电话号码" />
                    <el-table-column prop="address" label="地址" show-overflow-tooltip/>
                    <el-table-column fixed="right" label="操作" width="150">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="update(scope.row)"  v-hasPermi="['USER_UPDATE']" size="small" icon="el-icon-edit" circle></el-button>
                            <el-button type="danger" @click="deleteById(scope.row)"  v-hasPermi="['USER_DELETE']" size="small" icon="el-icon-delete" circle></el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <el-pagination
                    v-if="total>0"
                    @size-change="handlePageSize"
                    @current-change="handlePageNumber"
                    :current-page="queryInfo.pageNumber"
                    :page-sizes="[7, 15, 50, 100]"
                    :page-size="queryInfo.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
            </div>

            <handler v-show="open" :title="title" @cancel="cancel" :form="form"></handler>
        </el-card>
    </div>
</template>

<script>
import handler from './handler.vue'
export default {
    components:{
        handler
    },
    data(){
        return{
            queryInfo:{
                pageNumber:1,
                pageSize:7,
                queryString: null
            },
            tableList:[],
            total:0,
            //表单添加修改
            title:null,
            open:false,
            form:{},
            rules:{
            },
            roles:[],

        }
    },
    created() {
        this.findPage()
    },
    methods:{
        findPage(){
            this.$ajax.post('/user/findPage',this.queryInfo).then(res=>{
                this.tableList=res.data.rows;
                this.total=res.data.total;
            })
        },
        insert(){
            this.open=true;
            this.title='添加用户'
        },
        preview(src){
            let arr=[];
            arr.push(src.startsWith('http')?src:this.$qiniu+src);
            return arr;
        },
        formatSex(row){
            // console.log("--",row)
            if(row.sex===0)
                return '男';
            else if(row.sex===1)
                return '女';
            else return '未知';
        },
        deleteById(row){
            if(row.admin) return this.$message.warning("不能删除管理员")
            this.$confirm('你的操作将永久删除编号为{'+ row.id +'}的数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.delete(`/user/delete/${row.id}`).then((res)=>{
                    this.$message.success(res.data.message)
                    this.queryInfo.pageNumber=1;
                    this.findPage()
                })
            }).catch(() => {

            });
        },
        cancel(){
            this.open=false
            this.findPage()
        },
        update(row){
            this.form=row;
            this.open=true;
            this.form.password=null;
            this.title='编辑表单'
        },
        handlePageNumber(newPageNumber){
            this.queryInfo.pageNumber=newPageNumber;
            this.findPage()
        },
        handlePageSize(newPageSize){
            this.queryInfo.pageSize=newPageSize;
            this.findPage();
        },
    }
};
</script>

<style scoped>

</style>