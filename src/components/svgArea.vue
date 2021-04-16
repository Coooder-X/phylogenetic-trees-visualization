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
import bus from '../bus.js';

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
                    nodeRadius: 5,
                    nodeColors: [],
                    strokeColors: []
                },
                edgeData: {
                    lineWidth: 4,
                    lineColors: []
                }
            }
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