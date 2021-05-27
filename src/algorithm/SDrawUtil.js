import {LenToNum} from './util.js';
export function svgAddMousewheel(oParent, oSvg, svgControl) {    //  鼠标滚轮缩放 svg (实际上鼠标动作作用于 svg 的父亲标签 oParent)
    oParent.addEventListener("mousewheel", ZoomInOut, false);
    function ZoomInOut(e) {
        e = e || window.event;  
        let gap = 0.08;
        if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件               
            if (e.wheelDelta > 0) { //当滑轮向上滚动时  
                svgControl.scale -= gap;
            }  
            if (e.wheelDelta < 0) { //当滑轮向下滚动时  
                svgControl.scale += gap;
            }  
        } else if (e.detail) {  //Firefox滑轮事件  
            if (e.detail> 0) { //当滑轮向下滚动时  
                svgControl.scale += gap;
            }  
            if (e.detail< 0) { //当滑轮向上滚动时  
                svgControl.scale -= gap;
            }  
        } 
        oSvg.setAttribute('transform', 'translate(' + svgControl.viewBoxX  + ', ' + svgControl.viewBoxY + ') scale(' + svgControl.scale + ')');
    }
}

var isMove = false;
var inNodeSelect = false;
var inEdgeSelect = false;
var inTextSelect = false;

export function svgMove(oParent, oSvg, svgControl) { //  鼠标拖动 svg 画布 (实际上鼠标动作作用于 svg 的父亲标签 oParent)
    oParent.addEventListener('mousedown', function (e) {
        oParent.style.cursor = 'move';
        isMove = true;
        svgControl.startX = e.pageX;
        svgControl.startY = e.pageY;
    });
    oParent.addEventListener('mouseup', function (e) {
        isMove = false;
        oParent.style.cursor = 'default';
        svgControl.viewBoxX += svgControl.tmpx, svgControl.viewBoxY += svgControl.tmpy;
    });
    oParent.addEventListener('mousemove', function (e) {
        if (isMove) {
            // console.log(svgControl.viewBoxX, svgControl.viewBoxY);
            svgControl.tmpx = e.pageX - svgControl.startX;
            svgControl.tmpy = e.pageY - svgControl.startY;
            oSvg.setAttribute('transform', 'translate(' + (svgControl.viewBoxX + svgControl.tmpx) + ', ' + (svgControl.viewBoxY + svgControl.tmpy) + ') scale(' + svgControl.scale + ')');
        }
    });
}

//  绘制所有连接节点的边
export function paintAllLinks(nodes, edges, pad, EditData) {
    for(let i = 0; i < edges.length; ++i) {
        let src = nodes[edges[i].source], tar = nodes[edges[i].target];
        svgLine(src, tar, edges, pad, EditData.edgeData, EditData.edgeData.lineWidth, edges[i].originLen, i);
    }
}
//  绘制所有节点
export function paintAllNodes(nodes, datas, pad, EditData) {
    nodes.forEach((node, idx) => {
        svgPoint(node.x, node.y, pad, EditData.nodeData, idx, datas[idx], EditData.textData);
    });
}
//  绘制所有节点的文字
export function paintAllTexts(nodes, datas, G, notLeaf, filterSet, pad, EditData) {
    let fontSize = EditData.textData.fontSize;
    nodes.forEach((node, idx) => {
        if(!filterSet.has(idx)) {   //  若name不为null
            if(notLeaf.has(idx)) { //  若当前点不是叶节点，不打印
                svgText(node.x + 8, node.y - 8, pad, 0, fontSize, "Georgia", "black", {name:'',E:''}, idx, EditData.textData);
            }
            else { //  打印叶节点
                let father = nodes[G[idx][0].pos];
                let dx = node.x - father.x, dy = node.y - father.y;
                //  通过找到上一标签（circle标签），获得节点的半径 r
                let r = 0;
                if(Number(pad.oSvg.getElementsByTagName('circle')[idx] != undefined))
                    r = Number(pad.oSvg.getElementsByTagName('circle')[idx].getAttribute('r'));
                let dis = Math.sqrt(dx * dx + dy * dy), gap = 15 + r;    //  gap是节点到字的间距
                let sin = Math.abs(dy / dis), cos = Math.abs(dx / dis);
                let alpha = 360 * Math.asin(Math.abs(dy) / dis) / (2 * Math.PI);// alpha是边和x轴锐角绝对值
                if(dx > 0 && dy < 0) {  //  第一象限
                    alpha = 360 - alpha;
                } else if(dx < 0 && dy < 0) {  //  第二象限
                    alpha += 180;
                } else if(dx < 0 && dy > 0) {  //  第三象限
                    alpha = 180 - alpha;
                } else {  //  第四象限
                    alpha = alpha;
                }   //  计算出文字应旋转的角度alpha（x轴正向是0°，顺时针是正方向）
                dx = (gap * cos) * (dx < 0? -1 : 1), dy = (gap * sin) * (dy < 0? -1 : 1);
                // console.log(alpha);
                svgText(node.x + dx, node.y + dy, pad, alpha, fontSize, "Georgia", "black", datas[idx], idx, EditData.textData);
            }
        }
        else {  //  name为null
            svgText(node.x + 8, node.y - 8, pad, 0, fontSize, "Georgia", "black", {name:'',E:''}, idx, EditData.textData);
        }
    });
}

//  绘制节点、四叉树分割线、重心
// export function dfsPaint(Nodepad, linePad, textPad, centerPad, root) {
//     if(root.isLeaf()/* && root != this.root*/) {
//         canvasPoint(root.centerX, root.centerY, pad, "black", 3);
//         canvasText(root.dataX + 8, root.dataY - 8, ctx, 16, "Georgia", "black", root.data.name);
//     }
//     else {
//         canvasPoint(root.centerX, root.centerY, pad, "red", 3);
//         //  绘制四叉树的分割线
//         svgLine({x:root.areaX + root.width / 2, y: root.areaY}, 
//             {x:root.areaX + root.width / 2, y:root.areaY + root.height},
//                 linePad, "#E0E0E0", 2);
//         svgLine({x:root.areaX, y: root.areaY + root.height / 2}, 
//             {x:root.areaX + root.width, y:root.areaY + root.height / 2},
//                 linePad, "#E0E0E0", 2);
//     }
//     for(let i = 0; i < root.child.length; ++i) {
//         if(root.child[i] != null) {
//             dfsPaint(Nodepad, linePad, textPad, centerPad, root.child[i]);
//         }
//     }
// }

//  封装svg绘制直线
function svgLine(src, tar, edges, pad, edgeData, width, len, idx) {
    let color = edgeData.lineColors[idx];
    let line = pad.oG.getElementsByTagName('line')[idx];
    let tooltip = line == undefined? undefined : line.getElementsByTagName('title');
    if(line != undefined) {
        line.setAttribute('x1', src.x);
        line.setAttribute('y1', src.y);
        line.setAttribute('x2', tar.x);
        line.setAttribute('y2', tar.y);
        line.setAttribute('stroke', color == null? '#DAB1D5' : color);
        if(inEdgeSelect == false)
            line.setAttribute('stroke-width', edgeData.lineWidth);
        tooltip.innerHTML = len;    //  这里设置没反应，是 bug
    }
    else {
        line = createShape('line', {'x1':src.x, 'y1':src.y, 'x2':tar.x, 'y2':tar.y, 'stroke':'#DAB1D5', 'stroke-width':width});
        tooltip = createShape('title');
        tooltip.innerHTML = len;
        line.appendChild(tooltip);
        pad.oG.appendChild(line);  //添加到oG
        pad.oSvg.appendChild(pad.oG);  //添加到oSvg
        line.onmouseenter = function() {
            inEdgeSelect = true;
            startMoveLine(line, 1.0, 1.5, edgeData);  //  选中动画特效
        };
        line.onmouseleave = function() {
            startMoveLine(line, 1.5, 1.0, edgeData);  //  选中动画特效
            inEdgeSelect = false;
        };
        line.onclick = function() {   //  修改 edge 的颜色、长度
            edgeData.editEdgeDialogOpen = true;
            edgeData.newEdge = edges[idx];
            edgeData.currentEdgeId = idx;
        };
    }
}

/*
  封装svg绘制节点
  x,y 圆心坐标; pad为父标签集合; idx为该节点（节点或重心）索引（它们不在一个g标签内）
*/
function svgPoint(x, y, pad, nodeData, idx, datai, textData) {    //  pad {oG: , oSvg: }
    let color = nodeData.nodeColors[idx];
    let strokeColor = nodeData.strokeColors[idx];
    let radius = nodeData.nodeRadius;
    let circle = pad.oG.getElementsByTagName('circle')[idx];
    if(circle != undefined) {
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', strokeColor);
        if(inNodeSelect == false) {
            circle.setAttribute('r', radius);
            circle.setAttribute('stroke-width', radius*0.2);
        }
    }
    else {
        circle = createShape('circle', {'cx':x, 'cy':y, 'r':radius  ,'fill':color, 'stroke':strokeColor, 'stroke-width':radius*0.2});
        pad.oG.appendChild(circle);  //添加到oG
        pad.oSvg.appendChild(pad.oG);  //添加到oSvg
        circle.onmouseenter = function() {
            inNodeSelect = true;
            startMovePoint(circle, 1.0, 1.3, nodeData); //this是g标签 要找到圆 起始值为半径40 目标变成30
        };
        circle.onmouseleave = function() {
            startMovePoint(circle, 1.3, 1.0, nodeData);
            inNodeSelect = false;
        };
        circle.onclick = function() {  //  传递的 nodeData 是对象引用，引用了svgArea.vue中的data，绑定修改，控制弹窗打开
            nodeData.editNodeDialogOpen = true;
            nodeData.currentNodeId = idx;   //  被点击的节点的 ID
            textData.dataObj = datai;
        };
    }
}

//  封装svg绘制文字
function svgText(x, y, pad, alpha = 0, fontSize, font, color, datai, idx, textData) {
    let oText = pad.oG.getElementsByTagName('text')[idx];
    if(oText != undefined) {
        oText.setAttribute('x', x);
        oText.setAttribute('y', y);
        oText.innerHTML = datai.name;
        if(inTextSelect == false)
            oText.setAttribute('font-size', fontSize);
    }
    else {
        oText = createShape('text', {'x':x, 'y':y, 'fill':color, 'font-size':fontSize, 'text-anchor':'middle', 'font-family':font });
        oText.innerHTML = datai.name;  //添加文字
        let tooltip = createShape('title');
        tooltip.innerHTML = datai.name;
        oText.appendChild(tooltip);
        pad.oG.appendChild(oText);  //添加到oG
        pad.oSvg.appendChild(pad.oG);  //添加到oSvg
        oText.onmouseenter = function() {
            inTextSelect = true;
            startMoveText(oText, 1.2 * fontSize, fontSize);
        };
        oText.onmouseleave = function() {
            inTextSelect = false;
            startMoveText(oText, fontSize, 1.2 * fontSize);
        };
    }
    oText.setAttribute("text-anchor", "start"); //  text-anchor="start"时，(x,y)为<text>的起始坐标
    oText.setAttribute("transform", 'rotate(' + alpha + ' ' + x + ' ' + y + ')');   // 设置文字旋转角度和旋转中心
    oText.onclick = function() {  //  传递的 textData 是对象引用，引用了svgArea.vue中的data，绑定修改，控制弹窗打开
        textData.editTextDialogOpen = true;
        textData.dataObj = datai;  //  向弹窗传递了当前节点的 name
    };
}

//  绘制重心
export function paintCenter(pad, nodes, datas, idx) {
    let center = calAllCenter(nodes, datas);
    svgPoint(center.x, center.y, pad, 'green', 5, idx);
}
//  计算重心
function calAllCenter(nodes, datas) {
    let x = 0, y = 0, sumE = 0;
    for(let i = 0; i < nodes.length; ++i) {
        x += nodes[i].x * datas[i].E;
        y += nodes[i].y * datas[i].E;
        sumE += datas[i].E;
    }
    x /= sumE, y /= sumE;
    return {x: x, y: y};
}

export function createShape(tag, objAttr) {       //封装一个创建标签的函数 这里取名为createTag
    let svgNS = 'http://www.w3.org/2000/svg';   //命名空间
    let oTag = document.createElementNS(svgNS, tag);
    for(let attr in objAttr){
       oTag.setAttribute(attr, objAttr[attr]);    //设置属性
    }
    return oTag;
}

//鼠标移入移出时的弹性变化
function startMovePoint(obj, begin, end, nodeData) {
    var nowR = begin * nodeData.nodeRadius;
    var tarR = end * nodeData.nodeRadius;
    obj.speed = 0;
    obj.speed = 0.7 * (tarR > nowR? 1 : -1);
    clearInterval(obj.timer);
    obj.timer = setInterval(function(){
        obj.speed *= 1.3;
        if(obj.speed > 0) {
            if(nowR < tarR) {
                nowR += obj.speed;
                obj.setAttribute('r', nowR);
            }
        } else {
            if(nowR > tarR) {
                nowR += obj.speed;
                obj.setAttribute('r', nowR);
            }
        }
    }, 15);
}

//鼠标移入移出时的弹性变化
function startMoveLine(obj, begin, end, edgeData) {
    var nowR = begin * edgeData.lineWidth;
    var tarR = end * edgeData.lineWidth;
    obj.speed = 0;
    obj.speed = 0.7 * (tarR > nowR? 1 : -1);
    clearInterval(obj.timer);
    obj.timer = setInterval(function(){
        obj.speed *= 1.3;
        if(obj.speed > 0) {
            if(nowR < tarR) {
                nowR += obj.speed;
                obj.setAttribute('stroke-width', nowR);
            }
        } else {
            if(nowR > tarR) {
                nowR += obj.speed;
                obj.setAttribute('stroke-width', nowR);
            }
        }
    }, 15);
}

//鼠标移入移出text时的弹性变化
function startMoveText(obj, r1, r2) {
    var tarR = r1;
    var nowR = r2;
    obj.speed = 0.7 * (tarR > nowR? 1 : -1);
    clearInterval(obj.timer);
    obj.timer = setInterval(function(){
        obj.speed *= 1.3;
        if(obj.speed > 0) {
            if(nowR < tarR) {
                nowR += obj.speed;
                obj.setAttribute('font-size', nowR);
            }
        } else {
            if(nowR > tarR) {
                nowR += obj.speed;
                obj.setAttribute('font-size', nowR);
            }
        }
    }, 15);
}

export function positionShift(screenWidth, screenHeight, treeWidth, treeHeight, nodes) {
    let centerX = screenWidth / 2, centerY = screenHeight / 2;
    let centerX2 = treeWidth / 2, centerY2 = treeHeight / 2;
    let dx = centerX2 - centerX, dy = centerY2 - centerY;
    let shiftedNodes = [];
    for(let i = 0; i < nodes.length; ++i) {
        shiftedNodes.push({x: nodes[i].x - dx, y: nodes[i].y - dy});
    }
    return shiftedNodes;
}
