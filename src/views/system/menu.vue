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
                    <el-button @click="insert" type="primary"  v-hasPermi="['MENU_INSERT']" style="margin-left: 10px">添加信息</el-button>
                </el-col>
            </el-row>

            <el-table :data="tableList" stripe :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" >
                <el-table-column prop="path" label="前端路由" />
                <el-table-column prop="icon" label="图标" />
                <el-table-column prop="title" label="菜单标题" />
                <el-table-column prop="component" label="组件" />
                <el-table-column label="是否启用"  v-hasPermi="['MENU_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch
                            @change="updateStatus(scope.row)"
                            v-model="scope.row.status"/>
                    </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)"  v-hasPermi="['MENU_UPDATE']" size="small" icon="el-icon-edit" circle></el-button>
                        <el-button type="danger" @click="deleteById(scope.row.id)"  v-hasPermi="['MENU_DELETE']" size="small" icon="el-icon-delete" circle></el-button>
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
            <!--表单-->
        <el-dialog :title="title" :visible.sync="open" width="30%" @close="dialogClose">
            <el-form :model="form" ref="form" :rules="rules" label-width="120px" label-position="left">
                <el-form-item label="是否是父级菜单" v-if="isChildrenMenu">
                    <el-checkbox style="margin-left: -95%" v-model="isChildrenMenu" :disabled="disMenuSelect"/>
                </el-form-item>
                <el-form-item label="父级菜单" prop="parentId" v-if="isChildrenMenu">
                    <el-select v-model="form.parentId" placeholder="请选择" style="width: 100%">
                        <el-option
                            v-for="(item,index) in parentList"
                            :key="index.value"
                            :label="item.title"
                            :value="item.id"
                            :disabled="!item.status">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="前端路径" prop="path">
                    <el-input v-model="form.path"/>
                </el-form-item>
                <el-form-item label="图标" prop="icon">
                    <e-icon-picker v-model="form.icon"/>
                </el-form-item>
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title"/>
                </el-form-item>
                <el-form-item label="组件" prop="component">
                    <el-input v-model="form.component"/>
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
                parentId:[
                    {required: true ,message:'请选择父级菜单',trigger:'blur'}
                ],
                path:[
                    {required:true,message:'请输入菜单路径',trigger:'blur'},
                    {min:1,max:100,message: '菜单路径的长度为1~100之间',trigger:'blur'}
                ],
                icon:[
                    { required: true, message: '请输入图标', trigger: 'change' },
                ],
                title:[
                    {required:true,message:'请输入菜单标题',trigger:'blur'},
                    {min:1,max:50,message: '菜单标题的长度为1~50之间',trigger:'blur'}
                ],
                component:[
                    {required:true,message:'请输入菜单组件路径',trigger:'blur'},
                    {min:1,max:50,message: '菜单组件路径的长度为1~50之间',trigger:'blur'}
                ],
                status:[
                    {required:true,message:'请选择是否启用',trigger:'blur'},
                ]

            },
            parentList:[],
            isChildrenMenu:true,
            disMenuSelect:false
        }
    },
    created() {
        this.findPage();
        this.findParent();
    },
    methods:{
        findParent(){
            this.$ajax.get('/menu/findParent').then((res)=>{

                this.parentList=res.data.data;
            })

        },
        findPage(){
            this.$ajax.post('/menu/findPage',this.queryInfo).then((res)=>{
                console.log(res);
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
        updateStatus(row){
            this.$ajax.put('/menu/update',row).then((res)=>{
                this.$message.success('状态更新成功')
            })
        },
        deleteById(id){
            this.$confirm('你的操作将永久删除编号为{'+ id +'}的数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$ajax.delete(`/menu/delete/${id}`).then((res)=>{
                    this.$message.success(res.data.message)
                    this.queryInfo.pageNumber=1;
                    this.findPage()
                })
            }).catch(() => {

            });
        },
        insert(){
            this.title='新增菜单';
            this.open=true;

        },
        update(row){
            this.title='修改菜单';
            if(row.parentId===null){
                this.isChildrenMenu=false;
            }else{
                this.disMenuSelect=true;
            }
            this.form=row;
            this.open=true;

        },
        dialogClose(){
            this.isChildrenMenu=true;
            this.disMenuSelect=false;
            this.$refs.form.resetFields()

        },
        clickCancel(){
            this.form={};
            this.open=false;
            this.isChildrenMenu=true;
            this.disMenuSelect=false;
            this.findPage();
        },
        clickOk(){
            this.$refs.form.validate((valid)=>{

                if(!valid)return this.$message.error('表单校验不通过，检查输入')
                if(this.form.id===undefined ||this.form.id===null){
                    this.$ajax.post('/menu/insert',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }else {
                    this.$ajax.put('/menu/update',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }
            })
        },
    }
};
</script>

<style scoped>

</style>