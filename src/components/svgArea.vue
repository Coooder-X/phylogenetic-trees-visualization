<template>  
    <div>
        <div :id="svgName" class="svg"></div>
        <edit-text 
            :dialogFormVisible.sync="EditData.textData.editTextDialogOpen"
            :dataObj="EditData.textData.dataObj"
            @closeEditText="closeEditText"
            @updateName="updateName"/>
        <edit-tree 
            :dialogFormVisible.sync="EditData.nodeData.editNodeDialogOpen"
            :newNode="EditData.nodeData.newNode"
            :newEdge="EditData.nodeData.newEdge"
            :newData="EditData.nodeData.newData"
            :currentNodeId="EditData.nodeData.currentNodeId"
            :NodeCount="EditData.NodeCount"
            @setEmpty="setEmpty"
            @closeEditNode="closeEditNode"/>
    </div>
</template>

<!-- <script type="module" src="D:/MyGitKrakenFile/quadTree/svgMain.js"> -->
<script>
import initSvg from "../svgMain.js";
import EditText from './editText';
import EditTree from './editTree';
import bus from '../bus.js';

export default {
    name: 'SvgArea',
    components: {EditText, EditTree},
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
                    editNodeDialogOpen: false,
                    currentNodeId: -1,
                    newNode: {},    //  新增的节点
                    newEdge: {},    //  新增的边
                    newData: {},
                    nodeRadius: 5,
                    nodeColors: [],
                    strokeColors: []
                },
                edgeData: {
                    lineWidth: 4,
                    lineColors: []
                }
            },
            NodeCount: 0    //  总节点数
        };
    },
    created: function() {
        bus.$on('editNodeRadius', data => {
            this.EditData.nodeData.nodeRadius = data;
        });
        bus.$on('editLineWidth', data => {
            this.EditData.edgeData.lineWidth = data;
        });
        bus.$on('editAllNodeColor', data => {
            if(this.EditData.nodeData.nodeColors.length == 0) 
                for(let i = 0; i < 1000; ++i) {
                    this.EditData.nodeData.nodeColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.nodeData.nodeColors.length; ++i)
                    this.EditData.nodeData.nodeColors[i] = data;
            }
        });
        bus.$on('editAllStrokeColor', data => {
            if(this.EditData.nodeData.strokeColors.length == 0) {
                for(let i = 0; i < 1000; ++i)
                    this.EditData.nodeData.strokeColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.nodeData.strokeColors.length; ++i)
                    this.EditData.nodeData.strokeColors[i] = data;
            }
        });
        bus.$on('editBackgroundColor', data => {
            document.getElementById(this.svgName).style.backgroundColor = data;
        });
        bus.$on('editAllEdgeColor', data => {
            if(this.EditData.edgeData.lineColors.length == 0) {
                for(let i = 0; i < 1000; ++i)
                    this.EditData.edgeData.lineColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.edgeData.lineColors.length; ++i)
                    this.EditData.edgeData.lineColors[i] = data;
            }
        });
        this.$nextTick(() => {
            //  每个 svg 实例都有一个唯一的名字（等于对应tab的content），以便根据 id 操作 DOM 树
            initSvg(this.svgName, this.EditData, this.treeInfo);
        });
    },
    methods: {
        closeEditText() {
            this.EditData.textData.editTextDialogOpen = false;
        },
        closeEditNode() {
            this.EditData.nodeData.editNodeDialogOpen = false;
        },
        updateName(name) {
            this.EditData.textData.dataObj.name = name;
        },
        setEmpty() {
            this.EditData.nodeData.newNode = this.EditData.nodeData.newEdge = this.EditData.nodeData.newData = {};
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
        background-color:rgba(250, 235, 215, 0.56);
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