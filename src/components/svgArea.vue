<template>
    <div id="svg"></div>
</template>

<!-- <script type="module" src="D:/MyGitKrakenFile/quadTree/svgMain.js"> -->
<script>
import initSvg from "../svgMain.js";

export default {
    name: 'SvgArea',
    mounted: function() {
        this.$nextTick(() => {
            initSvg();
        });
    }
}

</script>

<style scoped>
    #svg { 
        width:100%; 
        height:470px;
        /* margin:20px auto;   */
        background-color:rgba(250, 235, 215, 0.76);
        overflow:hidden; 
        /* margin-left:auto; 
        margin-right:auto; 
        display:block; */
    }
    body {
        background:rgb(255, 255, 255); 
        width: 100%;
        height: 100%;
    }
</style>