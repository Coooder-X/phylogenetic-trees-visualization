<template>
    <el-dialog title="修改节点" :visible.sync="dialogFormVisible" :modal="true" :before-close="onBeforeClose">
        <el-form :model="form">
            <el-form-item label="节点名称" :label-width="formLabelWidth">
            <el-input v-model="dataObj.name" autocomplete="off" @focus="initOldName"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="cancelChangeData">取 消</el-button>
            <el-button type="primary" @click="ConfirmChangeData">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default {
    name: 'EditText',
    props: {
        dialogFormVisible: false,
        dataObj: {}
    },
    watch: {
        dialogFormVisible(val, oldVal) {
            if(val == false && oldVal == true) {
                this.$emit('closeEditText');
            }
        },
        oldName(val, oldVal) {
            if(val != null && oldVal == null) {
                return val;
            }   //  oldName 初始化为 dialog 刚打开时 el-input 内的值，之后不再改变
        }
    },
    data() {
        return {
            form: {
                name: 'name',
                oldName: null //  解决取消修改的情况，记录 dialog 刚打开时 el-input 内的值，若取消修改则用 oldName 更新（初始化为null是一个标记）
            },
            formLabelWidth: '80px'
        };
    },
    methods: {
        initOldName() { //  在 el-input 获取鼠标焦点时初始化 oldName
            this.form.oldName = this.dataObj.name;
        },
        onBeforeClose() {   //  esc、点击遮罩层、点击 x 关闭时，也要通过 $emit 向父组件通知来关闭弹窗，否则报子组件修改 porps 的错
            if(this.form.oldName == null) {
                this.changeVisible();
            } else {
                this.cancelChangeData();
            }
        },
        changeVisible() {
            this.$emit('closeEditText');
        },
        cancelChangeData() {   //  取消修改，通知父组件关闭 dialog
            if(this.form.oldName != null) {
                this.$emit('updateName', this.form.oldName);
                // console.log('old', this.form.oldName);
                this.form.oldName = null;   //  每次置空，否则会延用上一次的值
            }
            this.changeVisible();
        },
        ConfirmChangeData() {
            this.$emit('updateName', this.dataObj.name);
            this.changeVisible();
            this.form.oldName = null;   //  每次置空，否则会延用上一次的值
        }
    }
  };
</script>

<style lang="scss" scoped>
    /deep/ .el-dialog {
        width: 370px;
    }
</style>
