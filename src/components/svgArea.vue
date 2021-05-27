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
            :nodeColors="EditData.nodeData.nodeColors"
            :strokeColors="EditData.nodeData.strokeColors"
            :currentNodeId="EditData.nodeData.currentNodeId"
            :NodeCount="EditData.NodeCount"
            @updateName="updateName"
            @updateNodeColor="updateNodeColor"
            @updateStrokeColor="updateStrokeColor"
            @setEmpty="setEmpty"
            @closeEditNode="closeEditNode"/>
        <edit-edge
            :dialogFormVisible.sync="EditData.edgeData.editEdgeDialogOpen"
            :edgeColors="EditData.edgeData.lineColors"
            :newEdge="EditData.edgeData.newEdge"
            :currentEdgeId="EditData.edgeData.currentEdgeId"
            @updateEdgeLen="updateEdgeLen"
            @updateEdgeColor="updateEdgeColor"
            @closeEditEdge="closeEditEdge"
            @setEmpty="setEmpty"/>
    </div>
</template>

<!-- <script type="module" src="D:/MyGitKrakenFile/quadTree/svgMain.js"> -->
<script>
import initSvg from "../svgMain.js";
import EditText from './editText';
import EditTree from './editTree';
import EditEdge from './editEdge';
import bus from '../bus.js';
import { getLen, treeToJson, json2nwk } from '../algorithm/util.js';

export default {
    name: 'SvgArea',
    components: {EditText, EditTree, EditEdge},
    props: {
        svgName: String,
        treeInfo: String,
        animate: {
            animation: false
        },
    },
    data() {
        return {
            saveInfo: {},
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
                    editEdgeDialogOpen: false,
                    currentEdgeId: -1,
                    newEdge: {},    //  修改的边
                    isEditing: false,
                    lineWidth: 4,
                    lineColors: []
                }
            },
            NodeCount: 0    //  总节点数
        };
    },
    created: function() {
        let size = 10000;
        if(this.EditData.nodeData.nodeColors.length == 0) {
            for(let i = 0; i < size; ++i) {
                this.EditData.nodeData.nodeColors.push('#000000');
                this.EditData.nodeData.strokeColors.push('#000000');
                this.EditData.edgeData.lineColors.push('#DAB1D5');
            }
            this.EditData.nodeData.nodeColors[0] = 'red';
        }
        bus.$on('editNodeRadius', data => {
            this.EditData.nodeData.nodeRadius = data;
        });
        bus.$on('editLineWidth', data => {
            this.EditData.edgeData.lineWidth = data;
        });
        bus.$on('editAllNodeColor', data => {
            if(this.EditData.nodeData.nodeColors.length == 0) 
                for(let i = 0; i < size; ++i) {
                    this.EditData.nodeData.nodeColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.nodeData.nodeColors.length; ++i)
                    this.EditData.nodeData.nodeColors[i] = data;
            }
        });
        bus.$on('editAllStrokeColor', data => {
            if(this.EditData.nodeData.strokeColors.length == 0) {
                for(let i = 0; i < size; ++i)
                    this.EditData.nodeData.strokeColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.nodeData.strokeColors.length; ++i)
                    this.EditData.nodeData.strokeColors[i] = data;
            }
        });
        bus.$on('editBackgroundColor', data => {    //  svg 画布和视窗背景色都要改，svg 画布的颜色初始化在 svgMain 中
            document.getElementById(this.svgName).style.backgroundColor = data;
            document.getElementById(this.svgName).childNodes[0].style.backgroundColor = data;
        });
        bus.$on('editAllEdgeColor', data => {
            if(this.EditData.edgeData.lineColors.length == 0) {
                for(let i = 0; i < size; ++i)
                    this.EditData.edgeData.lineColors.push(data);
            } else {
                for(let i = 0; i < this.EditData.edgeData.lineColors.length; ++i)
                    this.EditData.edgeData.lineColors[i] = data;
            }
        });
        this.$nextTick(() => {
            //  每个 svg 实例都有一个唯一的名字（等于对应tab的content），以便根据 id 操作 DOM 树
            initSvg(this.svgName, this.EditData, this.treeInfo, this.saveInfo, this.animate);
        });
    },
    methods: {
        closeEditText() {
            this.EditData.textData.editTextDialogOpen = false;
        },
        closeEditNode() {
            this.EditData.nodeData.editNodeDialogOpen = false;
        },
        closeEditEdge() {
            this.EditData.edgeData.editEdgeDialogOpen = false;
        },
        updateName(name) {
            this.EditData.textData.dataObj.name = name;
        },
        updateNodeColor(idx, color) {
            this.EditData.nodeData.nodeColors[idx] = color;
        },
        updateStrokeColor(idx, color) {
            this.EditData.nodeData.strokeColors[idx] = color;
        },
        updateEdgeLen(len) {
            this.EditData.edgeData.newEdge.originLen = len;
            this.EditData.edgeData.newEdge.length = getLen(len);
            this.EditData.edgeData.isEditing = true;
        },
        updateEdgeColor(idx, color) {
            this.EditData.edgeData.lineColors[idx] = color;
        },
        setEmpty() {
            this.EditData.nodeData.newNode = this.EditData.nodeData.newEdge = 
                this.EditData.nodeData.newData = this.EditData.edgeData.newEdge = {};
        },
        getFileContent() {  //  返回当前树解析成的 nwk 格式文本内容
            return json2nwk(treeToJson(this.saveInfo.datas, this.saveInfo.notLeaf, this.saveInfo.G));
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
        background-color:rgba(252, 244, 233);
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