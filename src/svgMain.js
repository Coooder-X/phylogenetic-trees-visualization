import ManyBody from "./algorithm/manyBody.js";
import {judge, choose, caldis, getNodePair, createGraph} from "./algorithm/stop.js" ;
import {getTree, nwk2json, initTreeShape, processNoneName, processLeaf, fatherEdgeAngle} from "./algorithm/util.js";
import {paintAllLinks, paintAllNodes, paintAllTexts, createShape, positionShift, svgAddMousewheel, svgMove} from "./algorithm/SDrawUtil.js";
import randomNewick from "./algorithm/AutoNwk.js";

export default function(svgName, EditData, treeInfo, saveInfo) {
    var svgNS = 'http://www.w3.org/2000/svg';   //命名空间
    var oParent = document.getElementById(svgName);   //获取父节点 才能添加到页面中
    // var centerX = oParent.offsetWidth/2;   //中心点横坐标
    // var centerY = oParent.offsetHeight/2;   //中心点纵坐标
    
    var oG_Node = createShape('g', {'style':'cursor:pointer', 'class':'circleStyle'});  //  鼠标悬浮在形状上时为手指icon
    var oG_Line = createShape('g', {'style':'cursor:pointer', 'class':'lineStyle'});
    var oG_Text = createShape('g', {'style':'cursor:pointer', 'class':'textStyle'});
    var oSvg = createShape('svg', {'xmlns':svgNS, 'width':oParent.offsetWidth, 'height':oParent.offsetHeight });
    oSvg.style.backgroundColor = 'rgba(250, 235, 215, 0.56)';   // 导出图片需要的背景色初始化

    //  控制 svg 缩放移动的变量，为使多个 tab 分离，不在 Draw.js 中使用全局变量，而是每个实例单独一份
    let svgOptionVariables = {   
        scale: 1.0,
        viewBoxX: 0, viewBoxY: 0,
        startX: 0, startY: 0,
        tmpx: 0, tmpy: 0 //  有关 svg 画布平移、缩放的全局参数
    }
    oSvg.setAttribute('overflow', 'visible');   //  svg 视窗大小不限
    svgAddMousewheel(oParent, oSvg, svgOptionVariables); //  给 svg 画布添加鼠标滚轮缩放事件
    svgMove(oParent, oSvg, svgOptionVariables);
    
    oParent.appendChild(oSvg);  //添加到oParent
    
    var pad_Node = {oG: oG_Node, oSvg: oSvg};
    var pad_Link = {oG: oG_Line, oSvg: oSvg};
    var pad_Text = {oG: oG_Text, oSvg: oSvg};
    
    let s = treeInfo == ''? randomNewick() : treeInfo;
    
    // let s = '(((((Pan_paniscus|NC_001644.1:0.01960746,Pan_troglodytes|NC_001643.1:0.02081902)1.0000:0.02915852,Homo_sapiens|NC_012920.1:0.04538179)1.0000:0.01754464,Gorilla_gorilla|NC_001645.1:0.06012159)1.0000:0.03537649,(Pongo_abelii|NC_002083.1:0.03395723,Pongo_pygmaeus|NC_001646.1:0.03458433)1.0000:0.06280597)0.0000:0.00591154,Hylobates_lar|NC_002082.1:0.10881021)';
    let info = nwk2json(s);
    // let info = nwk2json('(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F');
    // let info = nwk2json('(A:0.1,B:0.2,(C:0.3,D:0.4)E:0.5)F');
    // let info = nwk2json('((C:0.3,D:0.4)E:0.1)F');
    let tree = getTree(info);
    console.log(tree);
    var treeWidth = 4000 * 15, treeHeight = 2400 * 15;
    let screenWidth = oParent.offsetWidth, screenHeight = oParent.offsetHeight;
    var nodes = initTreeShape(info, treeWidth, treeHeight), edges = tree.edges, datas = tree.datas;
    
    let G = createGraph(edges); //  进化树的邻接表表示
    //  获得name为空的节点索引，并为这些节点分配随机name
    let noneNameNodeIdx = processNoneName(datas);
    //  获得非叶节点的索引，不打印它们的name
    let notLeaf = processLeaf(G);
    
    var manyBody = new ManyBody(null, treeWidth, treeHeight);
    manyBody.nodes = nodes, manyBody.datas = datas, manyBody.edges = edges;
    manyBody.buildTree();
    EditData.NodeCount = manyBody.nodes.length;
    //  导出编辑后的 nwk 文件时，需要的参数，通过引用传回给 svgArea.vue
    saveInfo.notLeaf = notLeaf;
    saveInfo.G = G;
    saveInfo.datas = manyBody.datas;
    
    var pairName = choose(edges, datas), pair = [];
    var record = 0;

    // iter();
    
    setInterval(function(){
        paintAmimation();
        //  由于quadTree的合法范围可能比视窗大很多，因此将nodes平移到视窗中心，存储在shiftedNodes中
        let shiftedNodes = positionShift(screenWidth, screenHeight, treeWidth, treeHeight, manyBody.nodes);
        paintAllLinks(shiftedNodes, manyBody.edges, pad_Link, EditData);
        paintAllNodes(shiftedNodes, manyBody.datas, pad_Node, EditData);
        paintAllTexts(shiftedNodes, manyBody.datas, G, notLeaf, noneNameNodeIdx, pad_Text, EditData);
        if(EditData.nodeData.newData.name != undefined) {
            let tmp = EditData.nodeData;
            let newData = {name: tmp.newData.name, E: tmp.newData.E};
            //  随机一个角度，初始化新增节点的位置
            let fatherNode = manyBody.nodes[tmp.newEdge.source];
            let randomAngle = fatherEdgeAngle(0);
            let newNode = {x: fatherNode.x + Math.cos(randomAngle) * tmp.newEdge.length, y: fatherNode.y + Math.sin(randomAngle) * tmp.newEdge.length};
            let newEdge = {source: tmp.newEdge.source, target: tmp.newEdge.target, length: tmp.newEdge.length, originLen: tmp.newEdge.originLen};
            manyBody.nodes.push(newNode);
            manyBody.edges.push(newEdge);
            manyBody.datas.push(newData);
            tmp.newNode = tmp.newEdge = tmp.newData = {};
            EditData.NodeCount = manyBody.nodes.length;
            G = createGraph(manyBody.edges);
            saveInfo.G = G, saveInfo.datas = manyBody.datas;

            pairName = choose(manyBody.edges, manyBody.datas), pair = []; //  添加节点后，重新迭代
            record = 0;
            // iter();
            paintAmimation();
        } else if(EditData.edgeData.isEditing == true) {    //  修改边
            EditData.edgeData.isEditing = false;
            G = createGraph(manyBody.edges);
            saveInfo.G = G, saveInfo.datas = manyBody.datas;
            pairName = choose(manyBody.edges, manyBody.datas), pair = []; //  修改边长后，重新迭代
            record = 0;
            // iter();
            paintAmimation();
        }
    }, 10);

    function iter() {
        while(1) {
            manyBody.buildTree();
            //  判断形状收敛，退出迭代
            pair = getNodePair(pairName, manyBody.quadTree);
            if(judge(pair, record))
                return;
            record = caldis(pair);
            manyBody.step();
        }
    }
    
    function paintAmimation() {
        manyBody.buildTree();
        //  判断形状收敛，退出迭代
        pair = getNodePair(pairName, manyBody.quadTree);
        if(judge(pair, record))
            return;
        record = caldis(pair);
        manyBody.step();
    }
    
}


