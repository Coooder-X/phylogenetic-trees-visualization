<template>
    <el-tabs v-model="editableTabsValue" type="border-card" editable @edit="handleTabsEdit" @tab-click="checkAdd">
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
        <el-tab-pane key="add" name="add" :closable="false">
          <span slot="label" style="font-size:18px;font-weight:bold;">
            {{ "+" }}
          </span>
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
				
			//-------------------------------------------------------------------------------------------------------------
			/*下部分为预处理 svg 画布位置，截取刚好包括图形的部分。
				·tips: 用canvas作为svg图形载体时，是将处于屏幕坐标系(0, 0)处开始的 svg 画布，以自定义的长宽进行截取。
				而我们的 svg 画布是以根节点固定在屏幕中心的，即屏幕坐标系(screenW/2, screenH/2)，图形可能超出可视范围，
				而svg画布长宽是屏幕的12倍，因此svg的初始坐标在屏幕坐标系原点的左上方，具体数值通过下面的transformX取得。
				·因此导出图像时，我们要移动svg画布，将包裹进化树的最小矩形的左上角顶点，移动至屏幕坐标系(0, 0)处并添加一个padding。
				计算中，需要注意的是 getImageCorner() 获取的进化树的最小矩形顶点坐标最值是相对于 svg 画布的坐标；
				transform 的两个参数是svg画布左上角是在屏幕坐标系中的绝对位置；
			*/
				let area = this.getImageCorner();
				node.setAttribute('overflow', 'visible');
				let paddingX = (area.MaxX - area.MinX) * 0.2, paddingY = (area.MaxY - area.MinY) * 0.2;
				let svgW = (Number)(node.getAttribute('width')), svgH = (Number)(node.getAttribute('height'));
				let screenW = svgW / 12, screenH = svgH / 12;	//	12 是 svg 画布的宽度在 main 中定义为可视区域的 12 倍
				let transformX = node.transform.animVal[0].matrix.e, transformY = node.transform.animVal[0].matrix.f;	//	获取 transform 的值
				let tx = 0, ty = 0;
				tx = transformX - (area.MinX - (svgW / 2 - screenW / 2 + paddingX / 2));
				ty = transformY - (area.MinY - (svgH / 2 - screenH / 2 + paddingY / 2));
				node.setAttribute('transform', 'translate(' + tx + ',' + ty + '), scale(1.0)');
			//-------------------------------------------------------------------------------------------------------------

				let svgXml = new XMLSerializer().serializeToString(node);	//	svg 的 xml 格式字符串
				let image = new Image();
				image.src = 'data:image/svg+xml;base64,' + window.btoa(svgXml);	//	base64 编码
				image.onload = function() {
					var canvas = document.createElement('canvas');  //准备空画布
					canvas.width = (String)(area.MaxX - area.MinX + paddingX);	//	以合适的长宽截取svg画布图像
					canvas.height = (String)(area.MaxY - area.MinY + paddingY);

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
		checkAdd(tab) {
			if(tab.name === 'add')
				this.handleTabsEdit(null, 'add');
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
      	},
		getImageCorner() {	//	根据text标签，获取整个 svg 的边界坐标（相对于 svg 画布的）
			let textList = document.getElementsByTagName('text');
			let MaxX = -Infinity, MinX = Infinity, MaxY = -Infinity, MinY = Infinity;
			for(let i = 0; i < textList.length; ++i) {
				let x = textList[i].getBBox().x, y = textList[i].getBBox().y;	//	getBBox 返回包裹元素的最小矩形长宽，以及元素坐标
				let dx = textList[i].getBBox().width;	//	dx 是文字的宽度
				if(x == 0 && y == 0 && dx == 0 && dy == 0)
					continue;
				MaxX = Math.max(x + dx, MaxX);	//	都根据文字宽度计算
				MaxY = Math.max(y + dx, MaxY);
				MinX = Math.min(x - dx, MinX);
				MinY = Math.min(y - dx, MinY);
			}
			console.log(MaxX, MinX, MaxY, MinY);
			return {MaxX: MaxX, MinX: MinX, MaxY: MaxY, MinY: MinY};
		}
    }
}
</script>

<style lang="scss" scoped>
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
 <style lang="scss" scoped>
    /deep/ .el-tabs__item:nth-last-child(1) {
        width: 35px;
        height: 100%;
        padding-left: 10px;
        background-color:#dfdfdf;
        border-radius: 20%;
        text-align: center;
        background-color:#409EFF60;
        color: white;
    }
    /deep/ .el-icon-close:nth-child(2) {
        display: none;
    }
    /deep/ .el-tabs__new-tab {
        display: none;
    }
</style>