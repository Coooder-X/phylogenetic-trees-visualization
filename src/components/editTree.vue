<template>
    <el-dialog title="添加子节点" :visible.sync="dialogFormVisible" :modal="true" :before-close="onBeforeClose">
        <el-form>
            <el-form-item label="节点名称" :label-width="formLabelWidth">
            <el-input v-model="nodeName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="连边长度" :label-width="formLabelWidth">
            <el-input v-model="edgeLen" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancelChangeData">取 消</el-button>
            <el-button type="primary" @click="ConfirmChangeData">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import ElementUI from 'element-ui';
import {getE, getLen} from "../algorithm/util.js";

export default {
    name: 'EditTree',
    props: {
        dialogFormVisible: false,
        currentNodeId: Number,
        NodeCount: Number,
        newNode: {},
        newEdge: {},
        newData: {}
    },
    data() {
        return {
            formLabelWidth: '80px',
            nodeName: '',
            edgeLen: '',
        };
    },
    methods: {
        onBeforeClose() {   //  esc、点击遮罩层、点击 x 关闭时，也要通过 $emit 向父组件通知来关闭弹窗，否则报子组件修改 porps 的错
            if(JSON.stringify(this.newNode) === "{}" && JSON.stringify(this.newEdge) === "{}") {
                this.changeVisible();
            } else {
                this.cancelChangeData();
            }
        },
        changeVisible() {
            this.$emit('closeEditNode');
            this.nodeName = this.edgeLen = '';
        },
        cancelChangeData() {   //  取消修改，通知父组件关闭 dialog
            this.$emit("setEmpty"); // this.newNode = this.newEdge = {};
            this.changeVisible();
        },
        ConfirmChangeData() {   //  this.newNode 没有用到，新增节点的初始化在 svgMain 中完成
            if(this.edgeLen === '' || this.edgeLen <= 0 || this.nodeName === '') {
                    ElementUI.Notification({
                    title: 'Invalid',
                    message: '输入内容不合法',
                    type: 'error',
                    position: 'top-right',
                });
                return;
            }
            this.newEdge.length = this.edgeLen;
            this.newData.name = this.nodeName, this.newData.E = getE(this.newEdge.length);
            this.newEdge.source = this.currentNodeId, this.newEdge.target = this.NodeCount, this.newEdge.length = getLen(this.newEdge.length);
            this.changeVisible();
        }
    }
};
</script>

<style lang="scss" scoped>
    /deep/ .el-dialog {
        width: 370px;
    }
</style>
