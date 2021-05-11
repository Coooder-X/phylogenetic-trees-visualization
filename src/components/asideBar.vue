<template>
    <el-aside width="240px">
        <!-- Aside -->
        <el-menu
            default-active="1"
            :default-openeds='["1","1-3","1-4"]'
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
                        <el-button type="primary" 
                            size="small" 
                            :disabled="treeStyle.sliderDisabled"
                            @click="saveFile">
                            保存为文件 
                        </el-button>
                    </el-menu-item>
                    <el-menu-item index="1-2">
                        <el-button type="warning" size="small" :disabled="treeStyle.sliderDisabled">
                            保存为图片
                        </el-button>
                    </el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="分组2">
                    <el-submenu index="1-3">
                    <template slot="title">调整树枝宽度: {{treeStyle.lineWidth}}</template>
                    <el-menu-item index="1-3-1">
                        <div class="slider2">
                            <el-slider 
                                :show-tooltip="true" 
                                v-model="treeStyle.lineWidth" 
                                :step="0.1"
                                :max="20"
                                :disabled="treeStyle.sliderDisabled"
                                @input="editLineWidth"/>
                        </div>  
                    </el-menu-item>
                </el-submenu>
                </el-menu-item-group>
                <el-submenu index="1-4">
                    <template slot="title">调整节点直径: {{treeStyle.nodeRadius}}</template>
                    <el-menu-item index="1-4-1">
                        <div class="slider2">
                            <el-slider 
                                :show-tooltip="true" 
                                v-model="treeStyle.nodeRadius" 
                                :step="0.1"
                                :max="20"
                                :disabled="treeStyle.sliderDisabled"
                                @input="editNodeRadius"/>
                        </div>  
                    </el-menu-item>
                </el-submenu>
                <el-menu-item index="1-5">
                    <template slot="title"> {{ "节点颜色：  " }}
                        <el-color-picker
                            v-model="treeStyle.nodesColor"
                            @change="editAllNodeColor"
                            :predefine="treeStyle.predefineColors">
                        </el-color-picker>
                    </template>
                </el-menu-item>
                <el-menu-item index="1-6">
                    <template slot="title"> {{ "描边颜色：  " }}
                        <el-color-picker
                            v-model="treeStyle.strokeColor"
                            @change="editAllStrokeColor"
                            :predefine="treeStyle.predefineColors">
                        </el-color-picker>
                    </template>
                </el-menu-item>
                <el-menu-item index="1-6">
                    <template slot="title"> {{ "树枝颜色：  " }}
                        <el-color-picker
                            v-model="treeStyle.edgesColor"
                            @change="editAllEdgeColor"
                            :predefine="treeStyle.predefineColors">
                        </el-color-picker>
                    </template>
                </el-menu-item>
                <el-menu-item index="1-7">
                    <template slot="title"> {{ "背景颜色：  " }}
                        <el-color-picker
                            v-model="treeStyle.backgroundColor"
                            @change="editBackgroundColor"
                            :predefine="treeStyle.predefineColors">
                        </el-color-picker>
                    </template>
                </el-menu-item>
            </el-submenu>
            <!-- <el-menu-item index="2">
                <i class="el-icon-menu"></i>
                <span slot="title">导航二</span>
            </el-menu-item> -->
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
import bus from "../bus.js";

export default {
    name: "asideBar",
    data() {
        return {
            treeStyle: {
                nodeRadius: 5.0,
                lineWidth: 4.0,
                fontSize: 20,
                nodesColor: '#000000',
                strokeColor: '#000000',
                edgesColor: '#DAB1D5',
                backgroundColor: 'rgba(250, 235, 215, 0.56)',
                predefineColors: [
                    '#ff4500',
                    '#ff8c00',
                    '#ffd700',
                    '#90ee90',
                    '#00ced1',
                    '#1e90ff',
                    '#DAB1D5',
                    '#c71585',
                    '#000000'
                ],
                sliderDisabled: true
            },
            
        };
    },
    methods: {
        saveFile() {
            let file = {fileName: '', content: ''};
            bus.$emit('getFile', file); 
            this.$nextTick(() => {
                this.downLoadFile(file.fileName, file.content);
            });
        },
        downLoadFile(fileName, content) {
            var aTag = document.createElement('a'); //  a 标签的下载文件功能
            var blob = new Blob([content]);
            if(fileName.indexOf('.') != -1) {   //  去掉原有的文件后缀名
                fileName = fileName.substring(0, fileName.indexOf('.'));
            }
            aTag.download = fileName + '.nwk';  //  保存为 nwk 格式
            aTag.href = URL.createObjectURL(blob);
            aTag.click();   //  模拟点击 a 标签
            URL.revokeObjectURL(blob);
        },
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        editNodeRadius() {
            bus.$emit('editNodeRadius', this.treeStyle.nodeRadius);
        },
        editLineWidth() {
            bus.$emit('editLineWidth', this.treeStyle.lineWidth);
        },
        editAllNodeColor() {
            bus.$emit('editAllNodeColor', this.treeStyle.nodesColor);
        },
        editAllStrokeColor() {
            bus.$emit('editAllStrokeColor', this.treeStyle.strokeColor);
        },
        editAllEdgeColor() {
            bus.$emit('editAllEdgeColor', this.treeStyle.edgesColor);
        },
        editBackgroundColor() {
            bus.$emit('editBackgroundColor', this.treeStyle.backgroundColor);
        }
    },
    mounted() {
        bus.$on('sliderDisabled', data => {
            this.treeStyle.sliderDisabled = data;
        });
    }
}
</script>

<style lang='scss' scoped>
.slider {
    margin-left: 13%;
    margin-right: 13%;
}
.slider2 {
    margin-left: -13%;
    margin-right: -13%;
}
</style>