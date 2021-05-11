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
              :svgName="item.title"></nwk-input>
            <svg-area v-else :svgName="item.title" :treeInfo="treeInfo[index]" ref="svgFile"></svg-area>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import NwkInput from "./nwkInput.vue";
import SvgArea from './svgArea.vue';
import bus from "../bus.js";

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
	mounted() {
		bus.$on('getFile', data => {	//	asideBar 组件发来需要保存文件的请求，此处返回文件名和内容
			data.fileName = this.editableTabs[Number(this.editableTabsValue)-1].title;
			console.log(this.$refs);
			this.$nextTick(() => {
				let idx = -1;
				if(this.$refs && this.$refs.svgFile) {	//	找到对应的 svg，以便获取树信息，反解析成 nwk 格式
					for(let i = 0; i < this.$refs.svgFile.length; ++i) {
						if(this.$refs.svgFile[i].svgName == data.fileName) {
							idx = i;
							break;
						}
					}
				}
				if(idx != -1) {
					data.content = this.$refs.svgFile[idx].getFileContent();
				}
			});
		});
	},
    methods: {
      statusChange(index) {
        this.hasInput[index] = true;
        this.$forceUpdate();
      },
      loadTreeInfo(svgName, treeInfo) { //  设置对应的 nwk 文本
        this.editableTabs.forEach((tab, index) => {
          if (tab.title === svgName) {
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
                var list = document.getElementById(tab.title);	//	svg 的id 为 tab 的 title
				if(list) {
                	list.removeChild(list.childNodes[0]); //  删除对应的 svg 实例
				}
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