<template>
    <el-aside width="240px">
        <!-- Aside -->
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#36474e"
            text-color="#fff"
            active-text-color="#ffd04b">

            <el-submenu index="1">
                <template slot="title">
                    <i class="el-icon-menu"></i>
                    <span>导航一</span>
                </template>
                <el-menu-item-group>
                    <template slot="title">分组一</template>
                    <el-menu-item index="1-1">
                        <a>选项1</a>  
                    </el-menu-item>
                    <el-menu-item index="1-2">选项2</el-menu-item>
                    <div class="slider">
                        <el-slider v-model="value1"></el-slider>
                    </div>  
                </el-menu-item-group>
                <el-menu-item-group title="分组2">
                    <el-menu-item index="1-3">选项3</el-menu-item>
                </el-menu-item-group>
                <el-submenu index="1-4">
                    <template slot="title">选项4</template>
                    <el-menu-item index="1-4-1">
                        <div>
                            <el-slider v-model="value1"></el-slider>
                        </div>  
                    </el-menu-item>
                </el-submenu>
            </el-submenu>
            <el-menu-item index="2">
                <i class="el-icon-menu"></i>
                <span slot="title">导航二</span>
            </el-menu-item>
        </el-menu>
        <!-- <el-menu 
        default-active="2"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        background-color="#36474e"
        text-color="#fff"
        active-text-color="#ffd04b">
            <el-submenu index="1">
            <template slot="title"><i class="el-icon-setting"></i>导航一</template>
            <el-menu-item-group style="background-color: #36474e;">
            <el-menu-item index="1-1" style="color: rgb(255, 255, 255);">选项1</el-menu-item>
            <el-menu-item index="1-2" style="color: rgb(255, 255, 255);">选项2</el-menu-item>
            </el-menu-item-group>
            </el-submenu>
        </el-menu> -->
    </el-aside>
</template>

<script>
export default {
    name: "asideBar",
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
}
</script>

<style scoped>
.slider {
    margin-left: 13%;
    margin-right: 13%;
}
</style>