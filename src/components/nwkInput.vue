<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="10" :offset="7">
                <div class="empty">{{"请上传或输入nwk文件"}}</div>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="10" :offset="7">
                <div class="choose">
                    <el-radio-group v-model="radio">
                        <el-radio :label="1">上传文件</el-radio>
                        <el-radio :label="2">输入文本</el-radio>
                    </el-radio-group>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="18" v-show="radio==1">
            <el-col :span="10" :offset="7">
                <div>
                    <el-upload
                        class="upload"
                        drag
                        accept=".nwk"
                        :on-change="loadFile"
                        :on-success="successLoadFile"
                        action="https://jsonplaceholder.typicode.com/posts/"
                        :limit="1"
                        multiple>
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="20" v-show="radio==2">
            <el-col :span="10" :offset="7">
                <el-input class="input"
                    type="textarea"
                    spellcheck="false"
                    :autosize="{ minRows: 7, maxRows: 10}"
                    placeholder="请输入nwk文本"
                    v-model="textarea">
                </el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="10" :offset="7">
                <div class="process">
                    <el-button type="primary" @click="loadFileConfirmed"> {{ "生成" }} </el-button>
                </div>
            </el-col>
        </el-row>
    </div>
        
</template>

<script>
import ElementUI from 'element-ui';
import {nwk2json, getTree} from '../algorithm/util';
import bus from '../bus.js';

export default {
    name: "nwkInput",
    props: {
        svgName: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            textarea: '',
            radio: 1,
            uploadFilename: null,
            uploadFiles: [],
        }
    },
    methods: {
        openFolder() {
            alert("upload");
        },
        fileExceed(files, fileList) {
            alert("文件个数超出限制");
        },
        fileError(err, file, fileList) {
            alert("文件格式错误！");
        },
        successLoadFile() {
            ElementUI.Notification({
                title: 'Accept',
                message: '上传成功！',
                type: 'success',
                position: 'top-right',
            });
        },
        loadFile (file, fileList) {
            this.uploadFilename = file.name
            this.uploadFiles = fileList
        },
        loadFileConfirmed () {
            if(this.radio == 1) {
                if (this.uploadFiles) {
                    let file = this.uploadFiles[0];
                    if (!file) {
                        ElementUI.Notification({
                            title: '警告',
                            message: '请上传文件！',
                            type: 'warning',
                            position: 'top-right',
                        });
                        return null;
                    }
                    console.log(file.raw)
                    let reader = new FileReader()
                    reader.onload = async (e) => {
                        this.textarea = e.target.result;
                        if(this.judgeIsTree(this.textarea) == false) {  //  判断 nwk 格式是否合法，不合法则中断并提示
                            ElementUI.Notification({
                                title: 'Error',
                                message: '不合法的 newick 格式',
                                type: 'error',
                                position: 'top-right',
                            });
                            return;
                        }
                        if(document.getElementById(file.raw.name) != null) {
                            ElementUI.Notification({
                                title: 'Error',
                                message: '当前项目已存在当前文件！',
                                type: 'error',
                                position: 'top-right',
                            });
                            return;
                        }
                        this.$emit('loadTreeInfo', this.svgName, this.textarea, file.raw.name);
                        this.$emit('statusChange');
                        bus.$emit('sliderDisabled', false);
                    }
                    reader.readAsText(file.raw)
                }
            }
            else {
                if(this.judgeIsTree(this.textarea) == false) {  //  判断 nwk 格式是否合法，不合法则中断并提示
                    ElementUI.Notification({
                        title: 'Error',
                        message: '不合法的 newick 格式',
                        type: 'error',
                        position: 'top-right',
                    });
                    return;
                }
                this.$emit('loadTreeInfo', this.svgName, this.textarea);
                this.$emit('statusChange');
                bus.$emit('sliderDisabled', false);
            }
        },
        judgeIsTree(nwkText) {
            if(nwkText == null) {
                return false;
            }
            if(nwkText.length == 0) {
                return true;
            }   //  为调试方便，空字符串点击生成是随机生成的树，正式提交毕设时该句可删或改成其它形式
            let tree = nwk2json(nwkText);
            let res = getTree(tree);
            if(res.edges == null || res.datas == null || res.datas.length == 0 || res.edges.length == 0 || res.datas.length-1 != res.edges.length) {
                return false;
            }
            return true;
        }
    },
}
</script>

<style scoped>
.empty {
  margin-top: 17%;
  font-family: Microsoft YaHei;
  font-size: 20px;
  font-weight: bold;
  color: rgb(27, 27, 27);
}

.input {
    margin-top: 15px;
    font-size: 17px;
    font-family: Tahoma;
    font-weight: bold;
    background-size: auto 18px;
}

.folder {
    margin-top: 10px;
    font-size: 13px;
    font-family: Tahoma;
}

.process {
    margin-top: 15px;
}

.upload {
    margin-top: 15px;
}

.choose {
    margin-top: 10px;
}
</style>