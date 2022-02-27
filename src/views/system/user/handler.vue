<template>
        <el-card>
            <div slot="header" class="clearfix">
                <span>{{ title }}</span>
                <el-button style="float: right;" size="small" @click="$emit('cancel')">返回</el-button>
            </div>
            <div>
                <el-form :model="form" ref="form" :rules="rules" label-width="80px">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="用户名" prop="userName" >
                                <el-input v-model="form.userName" placeholder="请输入用户名" style="width: 80%"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="密码" prop="password" >
                                <el-input v-model="form.password" placeholder="请输入密码" type="password" style="width: 80%"/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="性别" prop="sex">
                                <el-select v-model="form.sex" placeholder="请选择性别" style="width: 80%">
                                    <el-option value="0" label="男"></el-option>
                                    <el-option value="1" label="女"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="昵称" prop="nickName" >
                                <el-input v-model="form.nickName"  placeholder="请输入昵称" style="width: 80%"/>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="电话号码" prop="phoneNumber">
                                <el-input v-model="form.phoneNumber" placeholder="请输入电话号码" style="width: 80%"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="邮箱" prop="email" >
                                <el-input v-model="form.email"  placeholder="请输入邮箱" style="width: 80%"/>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="用户角色" prop="roles">
                                <el-select v-model="roleIds" placeholder="请选择角色" style="width: 80%" multiple>
                                    <el-option
                                        v-for="(item,index) in roleList"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.id"/>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11">
                            <el-form-item label="是否启用" prop="status">
                                <el-radio-group v-model="form.status" >
                                    <el-radio :label="true">是</el-radio>
                                    <el-radio :label="false">否</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>


                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="地址" prop="address">
                                <el-input
                                    type="textarea"
                                    maxlength="100"
                                    show-word-limit
                                    :autosize="{minRows: 3,maxRows: 5}"
                                    placeholder="请输入地址"
                                    v-model="form.address"
                                    style="width: 80%">
                                </el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :span="11">
                            <el-form-item label="用户头像" prop="avatar">
                                <el-upload
                                    class="avatar-uploader"
                                    :action="action"
                                    :headers="header"
                                    :show-file-list="false"
                                    :on-success="handleSuccess"
                                    :before-upload="beforeUpload">
                                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                                </el-upload>
                            </el-form-item>

                        </el-col>

                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button  @click="$emit('cancel')">取 消</el-button>
                    <el-button type="primary" @click="clickOk">确 定</el-button>
                </div>
            </div>


        </el-card>
</template>

<script>
export default {
    props:['title','form'],
    watch:{
      'form':{
            handler(val,old){
                this.roleIds=[]
                this.form.userName=val.name
                this.imageUrl=val.avatar.startsWith('http')?val.avatar:this.$qiniu+val.avatar
                if(val.roles && val.roles.length>0){
                    val.roles.forEach(item=>{
                        this.roleIds.push(item.id)
                    })
                }
            }
      }
    },
    data(){
        return{
            rules:{
                userName:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    {min:2,max:20,message: '用户名的长度为2~20之间',trigger:'blur'}
                ],
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    {min:6,max:20,message: '密码的长度为6~20之间',trigger:'blur'}
                ],
                sex:[
                    { required: true, message: '请输入性别', trigger: 'change' },
                ],
                phoneNumber:[
                    { required: true, message: '请输入电话号码', trigger: 'blur' },
                    {message: '手机号码不正确',trigger:'blur',pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/}
                ],
                avatar:[
                    {   required: true,
                        validator:(rule,value,callback)=>{
                            if(this.form.avatar==='' || this.form.avatar===null || this.form.avatar===undefined ){
                                callback(new Error("请上传头像"))
                            }else{
                                callback()
                            }
                        },
                        trigger: 'change' },
                ],
                status:[
                    { required: true, message: '请选择状态', trigger: 'blur' },
                ]

            },
            imageUrl:null,
            action:process.env.VUE_APP_BASE_URL+'/tool/upload',
            header:{
                Authorization:sessionStorage.getItem('token')
            },
            roleList:[],
            roleIds:[]
        }
    },
    created() {
        this.$ajax.get('/role/findAll').then(res=>{
            this.roleList=res.data.data
        })
    },
    methods:{
        handleSuccess(res,file){
            this.imageUrl=this.$qiniu+res.data;
            this.form.avatar=res.data
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
        clickOk(){
            this.$refs.form.validate((valid)=>{
                if(!valid) return this.$message.error("表单校验不通过")
                let arr=[]
                this.roleIds.forEach(item=>{
                    arr.push({ id: item })
                })
                this.form.roles=arr;
                this.form.admin=0;
                if(!this.form.id){
                    this.$ajax.post('/user/insert',this.form).then(res=>{
                        this.$message.success(res.data.message)
                        return this.$emit('cancel')
                    })
                }else{
                    this.$ajax.put('/user/update',this.form).then(res=>{
                        this.$message.success(res.data.message)
                        return this.$emit('cancel')
                    })
                }
            })

        }
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