<template>
    <div>
        <div class="form-class">
            <img class="logo" src="../assets/logo.png">
            <el-card>
                <el-form :model="form" :rules="rules" ref="form" label-width="80px" >
                    <div v-if="!forgetPwd">
                        <div v-if="form.type=='1'">
                            <el-form-item label="账号" prop="username">
                                <el-input v-model="form.username"></el-input>
                            </el-form-item>
                            <el-form-item label="密码" prop="password">
                                <el-input type="password" v-model="form.password" ></el-input>
                            </el-form-item>
                        </div>
                        <div v-if="form.type=='2'">
                            <el-form-item label="手机号码" prop="phoneNumber">
                                <el-input v-model="form.phoneNumber"/>

                            </el-form-item>
                            <el-form-item label="验证码" prop="code">
                                <el-input v-model="form.code" >
                                    <el-button slot="append" @click="sendSms" :disabled="codeDisabled">{{codeText}}</el-button>
                                </el-input>
                            </el-form-item>
                        </div>
                        <el-form-item>
                            <el-button type="primary" @click="submit('ruleForm')">登录</el-button>
                            <el-button @click="reset">重置</el-button>
                            <el-button type="text" @click="forget" >忘记密码</el-button>
                            <el-button type="text" @click="clickPhone" >手机验证码登录</el-button>
                        </el-form-item>
                    </div>
                    <div v-if="forgetPwd">
                        <el-form-item label="邮箱" prop="email" key="email">
                            <el-input v-model="form.email" placeholder="请忘记密码的输入邮箱"></el-input>
                        </el-form-item>
                        <el-button type="primary" @click="findPassword" >找回密码</el-button>
                    </div>

                </el-form>
            </el-card>

        </div>
    </div>

</template>

<script>
export default {
    name: "login.vue",
    data(){
        return{
            //表单对象
            form:{
                username: null,
                password: null,
                type: '1',
                phoneNumber: null,
                code: null

            },
            //校验
            rules:{
                username:
                     [{ required: true, message: '请输入用户名', trigger: 'blur' },
                      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }],
                password:
                     [{ required: true, message: '请输入密码', trigger: 'blur' }],
                email:
                     [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
                phoneNumber:
                     [{ required: true, message: '请输入电话号码', trigger: 'blur' },
                      {message: '手机号码不正确',trigger:'blur',pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/}],
                code:
                     [{ required: true, message: '请输入验证码', trigger: 'blur' }],

            },
            forgetPwd:false,
            codeText:'发送验证码',
            codeDisabled:false
        }
    },
    created() {
    },
    methods:{
        submit(){
            this.$refs.form.validate((valid) =>{
                if(!valid)return this.$message.error('数据校验失败');
                this.$ajax.post('/user/login',this.form).then((res)=>{
                    const tokenBody=res.data.data;
                    let tokenHead=tokenBody.tokenHead;
                    let token=tokenBody.token;
                    this.$store.commit('setToken',tokenHead + token)
                    this.$router.push('/')
                })
            })
        },
        reset(){
            //重置
            this.$refs.form.resetFields()
        },
        forget(){
            this.forgetPwd=true;
        },
        findPassword(){
            this.$refs.form.validate((valid) =>{
                console.log(valid);
                if(!valid)return this.$message.error('数据校验失败！！！');
                this.$ajax.post('/tool/forget/password',{receivers:[this.form.email]}).then((res)=>{
                    if(res.data.flag){
                        this.$message.success(res.data.message)
                        this.forgetPwd=false
                    }
                })
            })

        },
        clickPhone(){
            if(this.form.type=='1'){
                this.form.type='2';
            }else {
                this.form.type='1';
            }
            this.$refs.form.clearValidate();
        },
        sendSms(){
            const pattern=/^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
            if(!this.form.phoneNumber) return this.$message.error("请输入手机号码")
            if(!pattern.test(this.form.phoneNumber))return this.$message.error("请输入正确的手机号码")
            this.$ajax.post(`/tool/sms?phoneNumber=${this.form.phoneNumber}`).then(res=>{
                if(res.data.flag){
                    let time=60;
                    const timer=setInterval(()=>{
                        this.codeDisabled=true;
                        time--;
                        if(time){
                            this.codeText='('+time+'秒）后重新发送';
                        }else {
                            clearInterval(timer);
                            this.codeText='重新发送验证码'
                            this.codeDisabled=false
                        }
                    },1000)
                }
            })
        }
    }
};
</script>

<style scoped>
.form-class{
    width: 30%;
    margin: 200px 500px auto;
}
.logo{
    width: 100px;
    height: 100px;
}
</style>