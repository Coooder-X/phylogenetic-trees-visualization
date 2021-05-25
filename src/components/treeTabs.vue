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
            <svg-area v-else :svgName="item.title" :treeInfo="treeInfo[index]" :animate="animate" ref="svgFile"></svg-area>
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
        animate: {
            animation: false
        },
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
    bus.$on('changeAnimate', data => {
        this.animate.animation = data.animation;  //  这里只能复制变量而不是对象，否则影响到传值给子组件
    });
		bus.$on('getFile', data => {	//	asideBar 组件发来需要保存文件的请求，此处返回文件名和内容
			let tab = this.getNowTab();
			data.fileName = tab.title;
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
		/*
         * 将svg导出成图片
         */
        bus.$on('getSvgImage', () => {
			this.$nextTick(() => {
				let tab = this.getNowTab();
				let name = tab.title;
				let node0 = document.getElementById(name).childNodes[0];
				let node = node0.cloneNode(true);	//	复制一份 dom 节点，以便修改使得 svg 处于视窗中心
				node.setAttribute('transform', 'translate(' + 0 + ',' + 0 + '), scale(1.2)');
				let svgXml = new XMLSerializer().serializeToString(node);	//	svg 的 xml 格式字符串
				let image = new Image();
				image.src = 'data:image/svg+xml;base64,' + window.btoa(svgXml);	//	base64 编码
				image.onload = function() {
					var canvas = document.createElement('canvas');  //准备空画布
					canvas.width = node.getAttribute('width');
					canvas.height = node.getAttribute('height');

					var context = canvas.getContext('2d');  //取得画布的2d绘图上下文
					context.drawImage(image, 0, 0);
					
					var a = document.createElement('a');
					a.href = canvas.toDataURL('image/png', 1.0);  //将画布内的信息导出为png图片数据
          if(name.indexOf('.') != -1) {   //  去掉原有的文件后缀名
            name = name.substring(0, name.indexOf('.'));
          }
					a.download = name;  //设定下载名称
					a.click(); //点击触发下载
				}
			});
            
        });
	},
    methods: {
		getNowTab() {	//	获取当前正在编辑的 tab 对象
			for(let i = 0; i < this.editableTabs.length; ++i) {
				if(this.editableTabs[i].name == this.editableTabsValue) {
					return this.editableTabs[i];
				}
			}
		},
      statusChange(index) {
        this.hasInput[index] = true;
        this.$forceUpdate();
      },
      loadTreeInfo(svgName, treeInfo, fileName) { //  设置对应的 nwk 文本
        this.editableTabs.forEach((tab, index) => {
          if (tab.title === svgName) {
            this.treeInfo[index] = treeInfo;
			if(fileName != undefined) {
				tab.title = fileName;	//	若是文件导入，则把 tab.title 改为文件名
			}
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