<template>
    <div>
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" clearable v-model="queryInfo.queryString" @clear="findPage">
                        <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button @click="insert" type="primary" style="margin-left: 10px" v-hasPermi="['PRE_INSERT']">添加信息</el-button>
                </el-col>
            </el-row>
            <el-table :data="tableList" stripe >
                <el-table-column type="index" label="序号" />
                <el-table-column prop="label" label="标签" />
                <el-table-column prop="code" label="代码"/>
                <el-table-column label="是否启用" v-hasPermi="['PRE_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch
                            @change="updateStatus(scope.row)"
                            v-model="scope.row.status"/>

                    </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)"  v-hasPermi="['PRE_UPDATE']" size="small" icon="el-icon-edit" circle></el-button>
                        <el-button type="danger" @click="deleteById(scope.row.id)"  v-hasPermi="['PRE_DELETE']" size="small" icon="el-icon-delete" circle></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                @size-change="handlePageSize"
                @current-change="handlePageNumber"
                :current-page="queryInfo.pageNumber"
                :page-sizes="[7, 15, 50, 100]"
                :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
<!--添加和修改的表单-->
        <el-dialog :title="title" :visible.sync="open" width="30%" @close="dialogClose">
            <el-form :model="form" ref="form" :rules="rules">
                <el-form-item label="标签" prop="label">
                    <el-input v-model="form.label"/>
                </el-form-item>
                <el-form-item label="代码" prop="code">
                    <el-input v-model="form.code"/>
                </el-form-item>
                <el-form-item label="是否启用" prop="status">
                    <el-radio-group v-model="form.status" >
                        <el-radio :label="true">是</el-radio>
                        <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="clickCancel">取 消</el-button>
                <el-button type="primary" @click="clickOk">确 定</el-button>
            </div>
        </el-dialog>


    </div>
</template>

<script>
export default {
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
                label:[
                    { required: true, message: '请输入标签', trigger: 'blur' },
                    {min:1,max:50,message: '权限标签的长度为1~50之间',trigger:'blur'}
                ],
                code:[
                    { required: true, message: '请输入代码', trigger: 'blur' },
                    {min:1,max:20,message: '权限标签的长度为1~20之间',trigger:'blur'}
                ],
                status:[
                    { required: true, message: '请选择状态', trigger: 'blur' },
                ]
            }
        }
    },
    created() {
        this.findPage()
    },
    methods:{
        insert(){
            this.title='新增权限'
            this.open=true
        },
        update(row){
            this.form=row;
            this.title='修改权限'
            this.open=true
        },
        findPage(){
            this.$ajax.post('/permission/findPage',this.queryInfo).then((res)=>{
                this.tableList=res.data.rows;
                this.total=res.data.total;
            })
        },
        handlePageNumber(newPageNumber){
            this.queryInfo.pageNumber=newPageNumber;
            this.findPage()
        },
        handlePageSize(newPageSize){
            this.queryInfo.pageSize=newPageSize;
            this.findPage();
        },
        deleteById(id){
            this.$confirm('你的操作将永久删除编号为{'+ id +'}的数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.delete(`/permission/delete/${id}`).then((res)=>{
                    this.$message.success(res.data.message)
                    this.queryInfo.pageNumber=1;
                    this.findPage()
                })
            }).catch(() => {

            });
        },
        dialogClose(){
            this.$refs.form.resetFields()
        },
        clickCancel(){
            this.form={};
            this.open=false;
            this.findPage();
        },
        clickOk(){
            this.$refs.form.validate((valid)=>{
                if(!valid)return this.$message.error('表单校验不通过，检查输入')
                if(this.form.id===undefined ||this.form.id===null){
                    this.$ajax.post('/permission/insert',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }else {
                    this.$ajax.put('/permission/update',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }
            })
        },
        updateStatus(row){
            this.$ajax.put('/permission/update',row).then((res)=>{
                this.$message.success('状态更新成功')
            })
        }
    }
};
</script>

<style scoped>

</style>