<template>  
    <div>
        <div :id="svgName" class="svg"></div>
        <edit-text 
            :dialogFormVisible.sync="EditData.textData.editTextDialogOpen"
            :dataObj="EditData.textData.dataObj"
            @closeEditText="closeEditText"
            @updateName="updateName"/>
    </div>
</template>

<!-- <script type="module" src="D:/MyGitKrakenFile/quadTree/svgMain.js"> -->
<script>
import initSvg from "../svgMain.js";
import EditText from './editText';

export default {
    name: 'SvgArea',
    components: {EditText},
    props: {
        svgName: String,
        treeInfo: String
    },
    data() {
        return {
            EditData: { //  专门传递编辑的数据的对象，用于传引用给 SDraw 对 svg 进行编辑
                textData: { //  修改节点名称的数据块
                    editTextDialogOpen: false,
                    dataObj: {}
                },
                nodeData: {

                },
                edgeData: {

                }
            }
        };
    },
    created: function() {
        this.$nextTick(() => {
            //  每个 svg 实例都有一个唯一的名字（等于对应tab的content），以便根据 id 操作 DOM 树
            initSvg(this.svgName, this.EditData, this.treeInfo);
        });
    },
    methods: {
        closeEditText() {
            this.EditData.textData.editTextDialogOpen = false;
        },
        updateName(name) {
            this.EditData.textData.dataObj.name = name;
        }
    }
}

</script>

<style scoped>
    .svg { 
        border-style:solid;
        border-color: black;
        border-width: 1px;
        width:100%; 
        height:540px;
        margin: 0%;
        /* margin:20px auto;   */
        background-color:rgba(250, 235, 215, 0.76);
        overflow:hidden; 
        /* margin-left:auto; 
        margin-right:auto; 
        display:block; */
    }
    body {
        margin: 0%;
        background:rgb(255, 255, 255); 
        width: 100%;
        height: 100%;
    }
</style>