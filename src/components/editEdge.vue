<template>
    <el-dialog title="修改树边" :visible.sync="dialogFormVisible" :modal="true" :before-close="onBeforeClose" width="400px">
        <el-card shadow="never">
            <el-form>
                <el-form-item label="连边长度" :label-width="formLabelWidth">
                    <el-input v-model="obj.originLen" autocomplete="off"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="9">
                    <el-form-item label="节点颜色" :label-width="formLabelWidth">
                        <el-color-picker
                            v-model="edgeColor"
                            :predefine="predefineColors">
                        </el-color-picker>
                    </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-card>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancelChangeData">取 消</el-button>
            <el-button type="primary" @click="ConfirmChangeData">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import ElementUI from 'element-ui';
import {LenToNum, getLen} from '../algorithm/util.js';

export default {
    name: 'EditTree',
    props: {
        dialogFormVisible: false,
        edgeColors: Array,
        newEdge: {},
        currentEdgeId: Number
    },
    watch: {
        newEdge(val, oldVal) {
            if(JSON.stringify(val) !== "{}" && JSON.stringify(oldVal) === "{}") {
                this.obj = JSON.parse(JSON.stringify(val));
            } else {
                this.obj.originLen = '';
            }
        },
        currentEdgeId(newVal) { //  在鼠标点击一个 edge 的时候，读取当前颜色，在编辑页面中显示
            if(this.edgeColors && this.edgeColors.length > newVal) {
                this.edgeColor = this.edgeColors[Number(newVal)];
            }
        }
     },
    data() {
        return {
            obj: {},    //  父组件 newEdge 对象的拷贝，为防止修改到父组件的副本
            edgeColor: '#DAB1D5',
            formLabelWidth: '80px',
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
    methods: {
        onBeforeClose() {   //  esc、点击遮罩层、点击 x 关闭时，也要通过 $emit 向父组件通知来关闭弹窗，否则报子组件修改 porps 的错
            if(JSON.stringify(this.obj) === "{}") {
                this.changeVisible();
            } else {
                this.cancelChangeData();
            }
        },
        changeVisible() {
            this.$emit('closeEditEdge');
            this.obj = {};
        },
        cancelChangeData() {   //  取消修改，通知父组件关闭 dialog
            this.$emit("setEmpty"); // this.newNode = this.newEdge = {};
            this.changeVisible();
        },
        ConfirmChangeData() {   //  this.newNode 没有用到，新增节点的初始化在 svgMain 中完成
            if(this.obj.originLen === '' || !this.checkNumber(this.obj.originLen) || this.obj.originLen <= 0) {
                ElementUI.Notification({
                    title: 'Invalid',
                    message: '边长不合法',
                    type: 'error',
                    position: 'top-right',
                });
                return;
            }
            if(this.obj.originLen != this.newEdge.originLen) {
                this.updateEdgeLen();
            }   //  updateEdgeLen 中更改了 isEditing 的布尔变量，只有在 isEditing 为真时才重新迭代，只更改颜色则不迭代
            this.updateEdgeColor();
            this.changeVisible();
            this.$emit("setEmpty");
        },
        updateEdgeLen() {
            this.$emit('updateEdgeLen', getLen(this.obj.originLen));
        },
        updateEdgeColor() {
            this.$emit('updateEdgeColor', this.currentEdgeId, this.edgeColor);
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
