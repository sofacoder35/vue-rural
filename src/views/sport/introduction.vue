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
                    <el-button @click="insert" type="primary" style="margin-left: 10px">添加信息</el-button>
                </el-col>
            </el-row>

            <el-table :data="tableList" stripe :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" >
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <div v-html="scope.row.content"/>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="序号"/>
                <el-table-column prop="title" label="标题" show-overflow-tooltip/>

                <el-table-column label="图片">
                    <template slot-scope="scope">
                        <el-image
                            style="width: 100px; height: 100px"
                            :src="scope.row.imageUrl.startsWith('http') ? scope.row.imageUrl : $qiniu +scope.row.imageUrl"
                            :preview-src-list="preview(scope.row.imageUrl)">
                        </el-image>
                    </template>
                </el-table-column>

                <el-table-column prop="createTime" label="创建时间" />
                <el-table-column prop="createName" label="创建者" />
                <el-table-column prop="updateTime" label="更新时间" />
                <el-table-column prop="updateName" label="更新者" />
                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)"  size="small" icon="el-icon-edit" circle></el-button>
                        <el-button type="danger" @click="deleteById(scope.row.id)"  size="small" icon="el-icon-delete" circle></el-button>
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
        <el-dialog :title="title" :visible.sync="open" width="60%" @close="dialogClose">
            <el-form :model="form" ref="form" :rules="rules" label-width="120px" label-position="left">
                <el-form-item prop="title" label="标题">
                    <el-input v-model="form.title" placeholder="请输入标题" style="width: 100%"></el-input>
                </el-form-item>

                <el-form-item label="图片" prop="imageUrl">
                    <el-upload
                        class="avatar-uploader"
                        :action="action"
                        :headers="header"
                        :show-file-list="false"
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload" v-model="form.imageUrl">
                        <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>

                <el-form-item prop="content" label="内容">
                    <mavon-editor ref="md" v-model="form.content" @imgAdd="uploadImage"/>
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
import { marked } from 'marked'
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
                title:[
                    {required: true ,message:'请输入标题',trigger:'change'}
                ],
                content:[
                    {required: true ,message:'请输入内容',trigger:'blur'}
                ],
                imageUrl:[
                    {   required: true,
                        validator:(rule,value,callback)=>{
                            // console.log(this.imageUrl);
                            if(this.form.imageUrl==='' || this.form.imageUrl===null || this.form.imageUrl===undefined ){
                                callback(new Error("请上传头像"))
                            }else{
                                callback()
                            }
                        },
                        trigger: 'change' },
                ]
            },
            action:process.env.VUE_APP_BASE_URL+'/tool/upload',
            header:{
                Authorization:sessionStorage.getItem('token')
            },
            imageUrl:null,
        }
    },
    created() {
        this.findPage();
    },
    methods:{
        findPage(){

            this.$ajax.post('/news/findPage',this.queryInfo).then((res)=>{
                console.log("ress",res);
                this.tableList=res.data.rows.filter(item=>{
                    if (item.content && item.content!=='')
                    item.content=marked(item.content)
                    return true
                });
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
                this.$ajax.delete(`/news/delete/${id}`).then((res)=>{
                    this.$message.success(res.data.message)
                    this.queryInfo.pageNumber=1;
                    this.findPage()
                })
            }).catch(() => {

            });
        },
        insert(){
            this.title="新增"
            this.form={}
            this.open=true;
        },
        update(row){
            this.imageUrl=row.imageUrl
            this.title="修改"
            this.form=row;
            this.open=true

        },
        clickCancel(){
            this.form={};
            this.open=false;
            this.findPage();
        },
        dialogClose(){
            this.$refs.form.resetFields()

        },
        clickOk(){
            this.$refs.form.validate((valid)=>{
                if(!valid)return this.$message.error('表单校验不通过，检查输入')
                if(this.form.id===undefined ||this.form.id===null){
                    this.$ajax.post('/news/insert',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }else {

                    this.$ajax.put('/news/update',this.form).then((res)=>{
                        this.$message.success(res.data.message)
                        this.open=false;
                        this.findPage();
                    })
                }
            })
        },
        uploadImage(pos,$e){
            let formData=new FormData;
            formData.append('file',$e);
            this.$ajax.post('/tool/upload',formData).then(res=>{
                this.$refs.md.$img2Url(pos,this.$qiniu+res.data.data)
            })
        },
        preview(src){
            let arr=[];
            arr.push(src.startsWith('http')?src:this.$qiniu+src);
            return arr;
        },
        handleSuccess(res,file){
            this.imageUrl=this.$qiniu+res.data;
            this.form.imageUrl=this.$qiniu+res.data

        },
        beforeUpload(file){
            if(file.size>10*1024*1024){
                this.$message.warning("文件过大")
                return false;
            }
            let index=file.name.indexOf('.');
            let suffix=file.name.substring(index+1)
            if(suffix!=='jpg' && suffix!=='png' && suffix!=='jpeg'){
                this.$message.warning("文件格式错误")
                return false;
            }

        },
    }
};
</script>

<style scoped>

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 130px;
    height: 130px;
    line-height: 130px;
    text-align: center;
}
.avatar {
    width: 130px;
    height: 130px;
    display: block;
}
</style>