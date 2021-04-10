<template>
    <el-dialog title="修改节点" :visible.sync="dialogFormVisible" :modal="true">
        <el-form :model="form">
            <el-form-item label="节点名称" :label-width="formLabelWidth">
            <el-input v-model="pointName" autocomplete="off" @blur="$emit('updateName', pointName)"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="changeVisible">取 消</el-button>
            <el-button type="primary" @click="changeVisible">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
  export default {
    name: 'EditText',
    props: {
        dialogFormVisible: false,
        pointName: {
            type: String
        }
    },
    watch: {
        dialogFormVisible(val, oldVal) {
            if(val == false && oldVal == true) {
                this.$emit('closeEditText');
            }
        }
    },
    data() {
        return {
            form: {
                name: 'name',
                delivery: false
            },
            formLabelWidth: '80px'
        };
    },
    methods: {
        changeVisible() {   //  通知父组件关闭 dialog
            this.$emit('closeEditText');
        }
    }
  };
</script>

<style lang="scss" scoped>
    /deep/ .el-dialog {
        width: 370px;
    }
</style>
