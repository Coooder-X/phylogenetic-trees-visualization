<template>
    <el-dialog :title="editModel?'修改当前节点':'添加子节点'" :visible.sync="dialogFormVisible" :modal="true" :before-close="onBeforeClose" :append-to-body="true">
        <el-row>
            <el-col :span="15">
                <!-- <el-switch
                    style="display: block"
                    v-model="model"
                    active-color="#13ce66"
                    inactive-color="#409EFF"
                    active-text="修改节点"
                    inactive-text="添加节点">
                </el-switch> -->
                <el-button-group>
                    <el-button :class="{active: editModel}" type="success" size="mini" icon="el-icon-edit" @click="editModel=1" plain>修改节点</el-button>
                    <el-button :class="{active: !editModel}" type="success" size="mini" icon="el-icon-plus" @click="editModel=0" plain>添加节点</el-button>
                </el-button-group>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
            <el-card shadow="never">
                <el-form>
                    <el-form-item label="节点名称" :label-width="formLabelWidth">
                        <el-input v-model="nodeName" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item v-if="editModel" label="节点颜色" :label-width="formLabelWidth">
                        <el-color-picker
                            v-model="nodeColor"
                            :predefine="predefineColors">
                        </el-color-picker>
                    </el-form-item>
                    <el-form-item v-if="!editModel" label="连边长度" :label-width="formLabelWidth">
                        <el-input v-model="edgeLen" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-row>
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
        newData: {},
        nodeColors: Array
    },
    data() {
        return {
            nodeColor: '#000000',
            formLabelWidth: '80px',
            nodeName: '',
            edgeLen: '',
            editModel: 1, // 修改=1，添加=0
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
        };
    },
    watch: {
        currentNodeId(newVal) { //  在鼠标点击一个 node 的时候，读取当前节点颜色，在编辑页面中显示
            if(this.nodeColors && this.nodeColors.length > newVal) {
                this.nodeColor = this.nodeColors[Number(newVal)];
            }
        }
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
            this.editModel = 1;
        },
        cancelChangeData() {   //  取消修改，通知父组件关闭 dialog
            this.$emit("setEmpty"); // this.newNode = this.newEdge = {};
            this.changeVisible();
        },
        ConfirmChangeData() {   //  this.newNode 没有用到，新增节点的初始化在 svgMain 中完成
            let inValid = false;
            if(this.editModel === 1) {
                ;
            } else {
                inValid = this.edgeLen === '' || !this.checkNumber(this.edgeLen) || this.edgeLen <= 0 || this.nodeName === '';
            }
            if(inValid) {
                    ElementUI.Notification({
                    title: 'Invalid',
                    message: '输入内容不合法',
                    type: 'error',
                    position: 'top-right',
                });
                return;
            }
            if(this.editModel === 0) {  //  添加节点模式
                this.newEdge.length = this.edgeLen;
                this.newData.name = this.nodeName, this.newData.E = getE(this.newEdge.length);
                this.newEdge.source = this.currentNodeId, this.newEdge.target = this.NodeCount, this.newEdge.length = getLen(this.newEdge.length);
            } else {    //  编辑节点模式可以修改 节点名称，以及改变颜色
                if(this.nodeName.length > 0) {
                    this.$emit('updateName', this.nodeName);
                }
                this.updateNodeColor();
            }
            this.changeVisible();
        },
        updateNodeColor() {
            this.$emit('updateNodeColor', this.currentNodeId, this.nodeColor);
        },
        checkNumber(num) {
            var reg = /^[0-9]+.?[0-9]*$/;
            if (reg.test(num)) {
                return true;
            }
            return false;
        }
    }
};
</script>

<style lang="scss" scoped>
    /deep/ .el-dialog {
        width: 370px;
    }
    .active {
        background-color: #67C23A;
        color: #FFFFFF;
    }
</style>
