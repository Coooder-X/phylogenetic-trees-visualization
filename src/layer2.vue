<template>
    <el-container>
        <el-header height="50px">
            <header-bar></header-bar>
        </el-header>
        <el-container>
            <aside-bar></aside-bar>
            <el-container>
                <el-main>
                    <tree-tabs></tree-tabs>
                </el-main>
                <el-footer height="30px">
                    <footer-bar></footer-bar>
                </el-footer>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
import asideBar from "./components/asideBar.vue";
import treeTabs from "./components/treeTabs.vue";
import headerBar from "./components/header.vue";
import footerBar from "./components/footer.vue";

export default {
  components: { treeTabs, asideBar, headerBar, footerBar },
}
</script>

<style>
.el-header{
    background-color: #336699;
    color: rgb(255, 255, 255);
    text-align: center;
    line-height: 50px;
  }
.el-footer {
    background-color: #d0dae7;
    color: #333;
    text-align: center;
    line-height: 20px;
  }
  
.el-aside {
    background-color: #36474e;
    color: rgb(255, 255, 255);
    text-align: center;
    line-height: 200px;
  }
  
.el-main {
    background-color: #f4f7fa;
    color: #333;
    text-align: center;
    /* line-height: 160px; */
}

.el-tabs {
    /* margin-left: 0%; */
    /* padding: 0 10px; */
    height: 540px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    /* line-height: 40px; */
    /* display: inline-block; */
    list-style: none;
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    position: relative;
}
  
body > .el-container {
    margin-bottom: 40px;
}
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>