<script type="text/javascript">
    function wrapOldContentByDiv() {
        var oldContentDiv = document.createElement("div");
        oldContentDiv.style.cssText = "float:right; width:72%; padding-left: 3%; padding-right:3%;border: 2px solid #CACACA;";
        oldContentDiv.innerHTML = document.body.innerHTML;
        document.body.style["max-width"] = "100%";
        document.body.style["margin"] = "20px";
        document.body.style["padding"] = "0";
        document.body.innerHTML = '';
        document.body.appendChild(oldContentDiv);
    };

    function addDirectorySwitch(directoryDiv) {
        var directorySwitchP = document.createElement("p");
        directorySwitchP.style.cssText = "text-align: left; margin: 0;";
        directoryDiv.appendChild(directorySwitchP);

        var ele_span = document.createElement("span");
        ele_span.style.cssText = "font-weight: 1000;";
        var ele_text = document.createTextNode("目录");
        ele_span.appendChild(ele_text);

        var ele_a = document.createElement("a");
        ele_a.appendChild(document.createTextNode("[-]"));
        ele_a.setAttribute("href", "#");
        ele_a.setAttribute("onclick", "javascript:return switchAllDirectory(this);");
        ele_a.setAttribute("title", "Click to Open TOC");

        ele_span.appendChild(ele_a);
        directorySwitchP.appendChild(ele_span);
    }

    function createTree(parentNode, tags, index, maxLevel) {
        if (index >= tags.length) {
            return -1;
        }

        var lastLevel = -1;
        for (var i = index; i < tags.length; i++) {
            var header = tags[i];
            var level = parseInt(header.tagName.substr(1), 10);

            var childNode = {'tag': header, 'childNodes': [], 'level': level};
            if (level > parentNode.level) {
                if (lastLevel > 0 && level > lastLevel) {
                    // 子子类
                    index = createTree(parentNode.childNodes[parentNode.childNodes.length - 1], tags, i);
                    if (index < 0) {
                        return -1;
                    } else {
                        i = index - 1;
                    }
                } else {
                    parentNode.childNodes.push(childNode);
                    lastLevel = level;
                }
            } else if (level <= maxLevel && parentNode.level > maxLevel) {
                parentNode.childNodes.push(childNode);
                lastLevel = level;
            } else {
                return i;
            }
        }
    }

    function createAElement(tag, index) {
        var a = document.createElement("a");
        a.style.cssText = "";
        a.setAttribute("href", "#" + tag.textContent);
        a.innerHTML = index.toString() + tag.textContent;
        return a;
    }

    function createOlElement() {
        var ol_el = document.createElement("ol");
        ol_el.style["line-height"] = "180%";
        ol_el.style["list-style-type"] = "none";
        ol_el.style["margin-left"] = "0";
        return ol_el
    }

    function createEmptyLiElement() {
        var emptyLiEle = document.createElement("li");
        return emptyLiEle
    }

    function getIndex(parentDirectory, directoryLevel, index) {
        if (directoryLevel === 0) {
            return parentDirectory + (index + 1).toString() + "."
        } else {
            return parentDirectory + (index + 1).toString() + ".";
        }
    }

    function createLeafElement(node, curDirectory) {
        var liEle = createEmptyLiElement();
        var aEle = createAElement(node.tag, curDirectory);
        liEle.appendChild(aEle);
        return liEle
    }

    function getArrowDownStyle() {
        return " width: 0;" +
            "    height: 0;" +
            "    position: relative;" +
            "    margin-right: 8px;" +
            "    top: 3px;" +
            "    display: inline-block;" +
            "    border: 6px outset;" +
            "    border-color: black transparent transparent transparent;"
    }

    function getArrowRightStyle() {
        return " width: 0;" +
            "    height: 0;" +
            "    left: 5px;" +
            "    position: relative;" +
            "    margin-right: 8px;" +
            "    display: inline-block;" +
            "    border: 6px solid;" +
            "    border-color: transparent transparent transparent black;"
    }

    /*
    <ol>
        <li><a>根节点1</a></li>
        <li><a>根节点2</a></li>
        <li>
            <div>
                <a><span>[-]</span>根节点3</a>
                <ol>
                    <li><a>子节点1</a></li>
                    <li><a>子节点2</a></li>
                    <li><a>子节点3</a></li>
                </ol>
            </div>
        </li>
        <li><a>根节点4</a></li>
     </ol>
    * */
    // node, 1.2.3 4 0
    function renderTree(node, parentDirectory, directoryLevel, index) {
        var childNodes = node.childNodes;
        var tagContent = node.tag.textContent;

        node.tag.setAttribute("id", tagContent);

        var curDirectory = getIndex(parentDirectory, directoryLevel, index);
        var directoryName = curDirectory + "&nbsp;" + tagContent;

        // 叶子节点
        if (childNodes.length === 0) {
            return "<li style='padding-left: 24px;'><a href='#" + tagContent + "'>" + directoryName + "</a></li>"
    //                return createLeafElement(node, curDirectory)
        }

        // 非叶子节点
        var childContent = "";
        for (var j = 0; j < node.childNodes.length; j++) {
            childContent += renderTree(node.childNodes[j], curDirectory, directoryLevel + 1, j);
        }

        return "<li>" +
            "   <div>" +
            "      <div>" +
            "         <div id='" + directoryName + "' class='open' style='" + getArrowDownStyle() + "' onclick='return switchDirectory(this);'></div>" +
            "         <a href='#" + tagContent + "' ondblclick='return switchByDbClick(this);'>" + directoryName + "</a>" +
            "      </div>" +
            "      <ol id='ol-" + directoryName + "' style='line-height: 180%;list-style-type: none; padding-left: 20px;'>" + childContent + "</ol>" +
            "   </div>" +
            "</li>";

        /*var liEle = createEmptyLiElement();
        var aEle = createAElement(node.tag, curDirectory);

        var parentElement = document.createElement("div");
        parentElement.appendChild(aEle);

        var olElement = createOlElement();

        var tempNode;
        for (var j = 0; j < node.childNodes.length; j++) {
            tempNode = node.childNodes[j];
            var element = renderTree(tempNode, curDirectory, directoryLevel + 1, j);
            olElement.appendChild(element);
        }
        parentElement.appendChild(olElement);

        liEle.appendChild(parentElement);
        return liEle;*/
    }

    function switchByDbClick(aEle) {
        switchDirectory(aEle.parentElement().firstChild)
    }

    // 开关目录
    function switchDirectory(ele) {
        var divEle = ele.parentNode.parentNode;
        var olEle = divEle.lastElementChild;
        if (ele.className === "open") {
            // 关闭
            olEle.style.cssText = "display:none;line-height: 180%;list-style-type: none; padding-left: 20px";
            ele.setAttribute("class", "close");
            ele.style.cssText = getArrowRightStyle();
        } else if (ele.className === "close") {
            // 打开
            olEle.style.cssText = "line-height: 180%;list-style-type: none; padding-left: 20px";
            ele.setAttribute("class", "open");
            ele.style.cssText = getArrowDownStyle();
        }
    }

    function switchAllDirectory(e) {
        var rootOlElement = document.getElementById("outline_ol");
        var ols = rootOlElement.getElementsByTagName("ol");
        var isOpen = false;

        if (e.innerHTML === '[+]') {
            e.setAttribute('title', 'collapse');
            e.innerHTML = '[-]';
            isOpen = true;
        } else {
            e.setAttribute('title', 'expand');
            e.innerHTML = '[+]';
        }


        for (var i = 0; i < ols.length; i++) {
            var olEle = ols[i];
            if (isOpen) {
                olEle.style.display = "block";
                olEle.parentNode.firstElementChild.firstElementChild.style.cssText = getArrowDownStyle();
            } else {
                olEle.style.display = "none";
                olEle.parentNode.firstElementChild.firstElementChild.style.cssText = getArrowRightStyle();
            }
        }

        e.blur();
        return false;
    }

    document.addEventListener("DOMContentLoaded", function () {
        // 1, 将body内容提取到div标签中
        wrapOldContentByDiv();

        // 2, 创建左边目录列表Div
        var directoryDiv = document.createElement("div");
        directoryDiv.setAttribute("id", "outline-list");
        directoryDiv.style.cssText = "width:20%;height:100%; float:left;font-size:16px,z-index:1;position: fixed;overflow: hidden;";

        // 3, 目录展开折叠开关
        addDirectorySwitch(directoryDiv);

        // 4, 创建目录列表
        var directoryOl = document.createElement("ol");
        directoryOl.style.cssText = "padding-left:14px;line-height:180%;list-style-type:none;height: 85%;padding-bottom: 30px; overflow: auto;";
        directoryOl.setAttribute("id", "outline_ol");
        directoryDiv.appendChild(directoryOl);
        var div1 = document.createElement("div");
        div1.style.cssText = "clear:both";

        // 插入目录
        document.body.insertBefore(directoryDiv, document.body.childNodes[0]);

        // 5, 获取所有的H标签
        var hTags = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
        if (hTags.length < 2)
            return;

        var rootNode = {'tag': directoryOl, 'childNodes': [], 'level': 0};
        var maxLevel = parseInt(hTags[0].tagName.substr(1), 10);
        // 6, 创建树形结构
        createTree(rootNode, hTags, 0, maxLevel);

        // 7, 绘制树结构
        var htmlContent = "";
        for (var j = 0; j < rootNode.childNodes.length; j++) {
    //                var element = renderTree(rootNode.childNodes[j], '', 1, j);
    //                directoryOl.appendChild(element);

            htmlContent += renderTree(rootNode.childNodes[j], '', 1, j);
        }
        directoryOl.innerHTML = htmlContent;
    });
</script>