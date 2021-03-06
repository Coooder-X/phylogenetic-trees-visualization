//生成从minNum到maxNum的随机数
export function randomNum(minNum, maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        default: 
            return 0; 
    } 
} 

export function getNodePos(width = 1000, height = 600) {
    return {x: randomNum(0, width), y: randomNum(0, height)};
}

export function nwk2json(s) {
	var ancestors = [];
	var tree = {};
	var tokens = s.split(/\s*(; |\(|\)|,|:)\s*/);
	for (var i=0; i<tokens.length; i++) {
		var token = tokens[i];
		switch (token) {
			case '(': // new children
				var subtree = {};
				tree.children = [subtree];
				ancestors.push(tree);
				tree = subtree;
				break;
			case ',': // another branch
				var subtree = {};
				ancestors[ancestors.length-1].children.push(subtree);
				tree = subtree;
				break;
			case ')': // optional name next
				tree = ancestors.pop();
				break;
			case ':': // optional length next
				break;
			default:
				var x = tokens[i-1];
				if(x == ')' || x == '(' || x == ',') {
					tree.name = token;
				}
                else if (x == ':') {
					tree.branch_length = parseFloat(token);
				}
		}
	}
	return tree;
};

export function json2nwk(json) {
	function nested(nest) {
		var subtree = "";

		if(nest.hasOwnProperty('children')) {
			var children = [];
			nest.children.forEach(function(child) {
				var subsubtree = nested(child);
				children.push(subsubtree);
			});
			var substring = children.join();
			if(nest.hasOwnProperty('name')) {
				if(substring != '') {
					subtree = "("+substring+")" + nest.name;
				}
				else {
					subtree = nest.name;
				}
			}
			if(nest.hasOwnProperty('branch_length')) {
				subtree = subtree + ":"+nest.branch_length;
			}
		}
        else {
			var leaf = "";
			if(nest.hasOwnProperty('name')) {
				leaf = nest.name;
			}
			if(nest.hasOwnProperty('branch_length')) {
				leaf = leaf + ":"+nest.branch_length;
			}
			subtree = subtree + leaf;
		}
		return subtree;
	}
	return nested(json) +";";
};

export function getTree(tree) {
    let nodes = [], edges = [], datas = [], idx = 0;
    let que = new Array(), now = {node: tree, idx: 0};
	let avgE = 0;
	//  根节点的E设为100? (设为0会导致计算force时出现力为0，nodes变为NaN，若设置过小会导致该节点剧烈摆动而不收敛)
    datas.push({name: now.node.name, E: 0});  //	取根节点的 E 为所有 E 的平均值
    que.push(now);
    while(que.length) {
        now = que[0];
        que.shift();
        if(now.node.children != undefined) { //  是非叶子节点
            for(let i = 0; i < now.node.children.length; ++i) {  //  孩子是非叶子节点
                let child = now.node.children[i];
                if(child.children != undefined) {
                    idx++;
                    edges.push({source: now.idx, target: idx, length: getLen(child.branch_length), originLen: child.branch_length});
                    datas.push({name: child.name, E: getE(child.branch_length)});
                    que.push({node: child, idx: idx});
                }
                else {  //  孩子是叶子节点
                    idx++;
					//	edge 增加一个属性，originLen，值为文件中的原有边长，length 作为转换成像素单位的长度
                    edges.push({source: now.idx, target: idx, length: getLen(child.branch_length), originLen: child.branch_length});
                    datas.push({name: child.name, E: getE(child.branch_length)});
                }
				avgE += datas[datas.length-1].E;
            }
        }
    }
	datas[0].E = avgE / (datas.length - 1);
    return {edges: edges, datas: datas};
}

export function treeToJson(datas, notLeaf, G) {	//	根据当前树的信息，转换为 json 对象
	let rootName = datas[0].name;
	if(notLeaf.has(0)) {	//	根节点不是叶子，则忽略名字
		rootName = '';
	}
	let vis = [];
	for(let i = 0; i < datas.length; ++i)
		vis.push(0);
	let que = new Array(), IdQue = new Array(), now = {name: rootName, children: []}, curId = 0;
	que.push(now);
	IdQue.push(0);
	let treeJson = now;
	while(que.length) {
		now = que[0], curId = IdQue[0];
		que.shift(), IdQue.shift();
		vis[curId] = 1;
		if(G[curId].length > 0) {
			for(let i = 0; i < G[curId].length; ++i) {
				if(vis[G[curId][i].pos] == 1)
					continue;
				let name = notLeaf.has(G[curId][i].pos) ? '' : datas[G[curId][i].pos].name;	//	不是叶子，则忽略名字
				let child = {name: name, branch_length: G[curId][i].originLen, children: []};
				now.children.push(child);
				que.push(child);
				IdQue.push(G[curId][i].pos);
			}
		}
	}
	return treeJson;
}

export function getLen(num) {//	80*5/1300*5 是老师文件的合适参数
    return num * 80 * 5;	//	680		num * 460 * 0.3		num * 80 * 0.3
}

export function getE(len) {
    return len * 1300 * 5;	//	100000		len * 700 * 0.3		len * 1300 * 0.3
}

export function LenToNum(len) {
	return len / 80 / 5;
}

export function initTreeShape(tree, width=1000, height=600) {
	let nodes = [];
	let que = new Array(), now = {node: tree, pos: {x: width/2, y: height/2}, alpha: 0};
    que.push(now);
    while(que.length) {
        now = que[0];
		nodes.push(now.pos);
        que.shift();
        if(now.node.children != undefined && now.node.children.length > 0) { //  是非叶子节点
			let childrenList = [];
			now.node.children.forEach(child => {
				if(child != undefined)
					childrenList.push(child);
			});
			let nowAlpha = fatherEdgeAngle(now.alpha), subAlpha = 2 * Math.PI / (childrenList.length + 1);
			if(now.node == tree) {
				subAlpha = 2 * Math.PI / (childrenList.length + 0);
			}
			childrenList.forEach(child => {
				nowAlpha += subAlpha;
				let dx = Math.cos(nowAlpha) * getLen(child.branch_length), dy = Math.sin(nowAlpha) * getLen(child.branch_length);
				/*	下面对 dx dy 扩大 10 倍是因为，实际稳定的系统，边经过拉伸才显示到视觉正常范围，初始化未拉伸前，边过短，导致电荷力
					影响过大，以至节点爆炸式飞散，出现一系列问题（或许之后可以改从电荷力作用方式解决这个问题）	*/
				let tmpPos = {x: now.pos.x + dx * 10, y: now.pos.y + dy * 10};
				que.push({node: child, pos: tmpPos, alpha: nowAlpha});
			});
        }
    }
	return nodes;
}

//	初始化子节点的边的角度时，将角度基准转换为父边的角度, alpha 是父边角度，beta 是返回的子边基准角
export function fatherEdgeAngle(alpha) {
	let PI = Math.PI;
	//	先将 alpha 转换成 [0, 2pi] 的区间
	let k = Math.floor(alpha / (2 * PI));
	alpha -= k * (2 * PI);
	//	分情况计算 beta
	let beta = 0;
	if(alpha < PI) {
		beta = PI + alpha;	//	2pi - (pi - alpha)
	} else {
		beta = alpha - PI;	//	pi - (2pi - alpha)
	}
	return beta;
}

//	返回长度为len的随机字符串
export function randomString(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
　　var maxPos = chars.length;
　　var pwd = '';
　　for (let i = 0; i < len; i++) {
　　　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

//	对name为空串的节点进行处理，为其设置随机字符串作为name，并返回name为空的node的idx数组
export function processNoneName(datas) {
	let noneNameNodeIdx = new Set();
	datas.forEach((data, idx) => {
		if(data.name == '') {
			noneNameNodeIdx.add(idx);
			data.name = randomString(30);
		}
	});
	return noneNameNodeIdx;
}


export function processLeaf(G) {
	let notLeaf = new Set();
	G.forEach((edge, idx) => {
		if(edge.length != 1) {
			notLeaf.add(idx);
		}
	});
	return notLeaf;
}

export function deleteSubTree(idx, nodes, edges, datas) {
	let DirectG = createDirectGraph(edges);	//	获得树的有向图，孩子往父亲方向不连通
	let que = new Array(), now = idx;
	let deleteList = new Set();
    que.push(now);
    while(que.length) {
		now = que[0];
        que.shift();
		deleteList.add(now);
		for(let i = 0; i < G[now].length; ++i) {
			que.push(G[now][i].pos);
		}
	}
	let i = nodes.length - 1;
	while(i >= 0) {
		if(deleteList.has(i)) {
			nodes.splice(i, 1);
			datas.splice(i, 1);
			let toSet = new Set();
			for(let j = 0; j < G[i].length; ++j) {
				toSet.add(G[i][j].pos);	//	记录符合条件的要删的孩子子节点
			}
			let j = edges.length - 1;
			while(j >= 0) {
				if(j == i && toSet.has(edges[j].target)) {
					edges.splice(j, 1);
				}
			}
		}
		i--;
	}
}

export function createDirectGraph(edges) {   //  根据edges建立图邻接表
    let G = new Array();
    for(let i = 0; i < edges.length + 1; ++i)
        G.push(new Array());
    for(let i = 0; i < edges.length; ++i) {
        G[edges[i].source].push({pos: edges[i].target, originLen: edges[i].originLen, len: edges[i].length});
    }
    return G;
}
