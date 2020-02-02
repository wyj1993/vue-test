// new Compiler(el, vm)
class Compile{
  constructor(el, vm){
    // 宿主节点  #app
    this.$el = document.querySelector(el);
    this.$vm = vm;

    // 先判断el的存在性 编译
    if(this.$el){
      // 转换内部内容为片段fragment
      this.$fragment = this.node2Fragment(this.$el);
      this.compile(this.$fragment);
      // 编译完的html结果追加至$el
      this.$el.appendChild(this.$fragment);
    }

  }
  node2Fragment(el){
    const frag = document.createDocumentFragment();
    // el中所有子元素搬家至frag中
    let child;
    while(child = el.firstChild){
      frag.appendChild(child);
    }
    return frag;
  }
  compile(el){
    // 遍历元素
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node=>{
      // 类型判断
      if(this.isElement(node)){
        const nodeAttrs = node.attrbutes;
        Array.from(nodeAttrs).forEach(attr=>{
          const attrName = attr.name;
          const exp = attr.value;
          if(this.isDirective(attrName)){
            const dir = attrName.substring(2);
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if(this.isEvent(attrName)){
            const dir = attrName.substring(1);
            this.eventHandler(node, this.$vm,exp,dir);
          }
        })
        // 元素
        console.log('编译元素'+node.nodeName)
      }else if(this.isText(node)){
        // 文本
        this.compileText(node);
      }
      // 递归子节点
      if(node.childNodes && node.childNodes.length){
        this.compile(node);
      }
    })
  };
  isDirective(attr){
    return attr.indexOf('k-') == 0;
  }
  isEvent(attr){
    return attr.indexOf('@') == 0;
  }
  isElement(node){
    return node.nodeType === 1;
  }
  isText(node){
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
  eventHandler(node,vm,exp,dir){
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if(dir && fn){
      node.addEventListener(dir,fn.bind(vm))
    }
  }
  model(node,vm,exp){
    this.update(node,vm,exp,'model');
    node.addEventListener('input',e=>{
      vm[exp] = e.target.value;
    })
  }
  modelUpdater(node,value){
    node.value = value
  }
  text(node,vm,exp){
    this.update(node,vm,exp,'text')
  }
  compileText(node){
    this.update(node,this.$vm,RegExp.$1,'text');
  }
  // 更新函数
  update(node, vm, exp, dir){
    const updaterFn = this[dir+'Updater'];
    updaterFn && updaterFn(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp,function(val){
      updaterFn && updaterFn(node, val);
    })
  }
  textUpdater(node,value){
    node.textContent = value;
  }

}