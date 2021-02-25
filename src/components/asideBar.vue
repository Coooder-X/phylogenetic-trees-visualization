<template>
    <el-aside width="240px">
        <!-- Aside -->
        <el-menu :default-openeds="['1', '3']">
        <el-submenu index="1">
        <template slot="title"><i class="el-icon-message"></i>导航一</template>
        <el-menu-item-group style="background-color: #36474e;">
        <!-- <template slot="title">分组一</template> -->
        <el-menu-item index="1-1" style="color: rgb(255, 255, 255);">选项1</el-menu-item>
        <el-menu-item index="1-2" style="color: rgb(255, 255, 255);">选项2</el-menu-item>
        </el-menu-item-group>
        </el-submenu>
        </el-menu>
    </el-aside>
</template>

<script>
export default {
    name: "asideBar",
}
</script>