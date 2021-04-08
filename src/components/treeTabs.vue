<template>
    <el-tabs class="el-tabs" v-model="editableTabsValue" type="border-card" editable @edit="handleTabsEdit">
        <el-tab-pane
            :key="item.name"
            v-for="(item, index) in editableTabs"
            :label="item.title"
            :name="item.name">
            <nwk-input v-if="!hasInput[index]" 
              @statusChange="statusChange(index)" 
              @loadTreeInfo="loadTreeInfo"
              :svgName="item.content"></nwk-input>
            <svg-area v-else :svgName="item.content" :treeInfo="treeInfo[index]"></svg-area>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import NwkInput from "./nwkInput.vue";
import SvgArea from './svgArea.vue';

export default {
    components: { NwkInput, SvgArea },
    name: "treeTabs",
    data() {
      return {
        hasInput: [false, false],
        treeInfo: ['', ''], //  每个进化树的 nwk 文件文本
        editableTabsValue: '2',
        editableTabs: [{
          title: 'Tab 1',
          name: '1',
          content: 'Tab 1 content'
        }, {
          title: 'Tab 2',
          name: '2',
          content: 'Tab 2 content'
        }],
        tabIndex: 2
      }
    },
    methods: {
      statusChange(index) {
        this.hasInput[index] = true;
        this.$forceUpdate();
      },
      loadTreeInfo(svgName, treeInfo) { //  设置对应的 nwk 文本
        this.editableTabs.forEach((tab, index) => {
          if (tab.content === svgName) {
            this.treeInfo[index] = treeInfo;
          }
        });
      },
      handleTabsEdit(targetName, action) {
        if (action === 'add') {
          let newTabName = ++this.tabIndex + '';
          this.editableTabs.push({
            title: 'Tab' + this.tabIndex,
            name: newTabName,
            content: 'Tab ' + this.tabIndex + ' content'
          });
          this.hasInput.push(false);
          this.editableTabsValue = newTabName;
        }
        if (action === 'remove') {
          let tabs = this.editableTabs;
          let activeName = this.editableTabsValue;
          let removeIdx = 0;
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab.name === targetName) {
                removeIdx = index;
                this.treeInfo.push('');
                var list = document.getElementById(tab.content);
                list.removeChild(list.childNodes[0]); //  删除对应的 svg 实例
                let nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                  activeName = nextTab.name;
                }
              }
            });
          }
          this.hasInput.splice(removeIdx, 1);
          this.treeInfo.splice(removeIdx, 1);
          this.editableTabsValue = activeName;
          this.editableTabs = tabs.filter(tab => tab.name !== targetName);
        }
      }
    }
}
</script>

<style  lang="scss" scoped>
/deep/ .el-tabs {
    /* margin-left: 0%; */
    /* padding: 0 10px; */
    height: 540px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    /* line-height: 40px; */
    /* display: inline-block; */
    list-style: none;
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    position: relative;
}
</style>