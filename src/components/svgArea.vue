<template>  
    <div :id="svgName" class="svg"></div>
</template>

<!-- <script type="module" src="D:/MyGitKrakenFile/quadTree/svgMain.js"> -->
<script>
import initSvg from "../svgMain.js";

export default {
    name: 'SvgArea',
    props: {
        svgName: String
    },
    mounted: function() {
        this.$nextTick(() => {
            //  每个 svg 实例都有一个唯一的名字（等于对应tab的content），以便根据 id 操作 DOM 树
            initSvg(this.svgName);
        });
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