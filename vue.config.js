module.exports = {
  lintOnSave: false,
  //后端接口配置
  devServer:{
    port:8080,
    open:true,
    //设置代理
    proxy:{
      [process.env.VUE_APP_BASE_URL] : {
        //代理的后端路径
        target:'http://localhost:8000',
        //是否开启根路径转换
        changeOrigin:true,
        pathRewrite:{
          ['^'+ process.env.VUE_APP_BASE_URL]:'/'
        }
      }
    }
  },
  publicPath:'./',
  outputDir:'dist',
  assetsDir:'static',
  lintOnSave:false,
  productionSourceMap:false,
  configureWebpack:{
    performance:{
      hints:'warning',
      maxEntrypointSize:500000000,
      maxAssetSize:3000000,
    }
  }


};
