<template>
    <el-container>
        <el-header height="50px">
            <header-bar></header-bar>
        </el-header>
        <el-container>
            <aside-bar></aside-bar>
            <el-container>
                <div @mousewheel.stop.prevent>
                    <el-main>
                        <tree-tabs></tree-tabs>
                    </el-main>
                </div>
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

<style lang="scss" scoped>
/deep/ .el-header{
    padding: 0%;
    background-color: #336699;
    color: rgb(255, 255, 255);
    text-align: center;
    line-height: 50px;
  }
/deep/ .el-footer {
    background-color: #d0dae7;
    color: #333;
    text-align: center;
    line-height: 20px;
  }
  
/deep/ .el-aside {
    padding: 0%;
    background-color: #36474e;
    color: rgb(255, 255, 255);
    text-align: center;
    line-height: 200px;
  }
  
/deep/ .el-main {
    padding: 0%;
    height: 610px;  // main 占满屏幕高度
    background-color: #f4f7fa;
    color: #333;
    text-align: center;
    /* line-height: 160px; */
}

/deep/ .el-tabs {
    padding: 0%;
    height: 100%;
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
  
// body > .el-container {
//     margin-bottom: 40px;
// }
  
//   .el-container:nth-child(5) .el-aside,
//   .el-container:nth-child(6) .el-aside {
//     line-height: 260px;
//   }
  
//   .el-container:nth-child(7) .el-aside {
//     line-height: 320px;
//   }
</style>