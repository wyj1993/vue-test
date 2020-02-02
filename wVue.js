// new KVue({data:{...}})
class KVue{
  constructor(options){
    this.$options = options;
    this.$data = options.data;
    this.observe(this.$data);
    new Compile(options.el, this);
    if(options.created){
      options.created.call(this);
    }
  }
  // 监听
  observe(value){
    if(!value || typeof value !== 'object'){
      return;
    }
    Object.keys(value).forEach(key=>{
      this.proxyData(key)
      this.defineReactive(value,key,value[key])
    })
  }
  // 数据响应式
  defineReactive(obj,key,val){
    this.observe(val);
    const dep = new Dep();
    Object.defineProperty(obj,key,{
      get:function(){
        Dep.target && dep.addDep(Dep.target);
        return val
      },
      set:function(newVal){
        if(newVal === val){
          return
        }
        val = newVal;
        dep.notify();
      }
    })
  }
  proxyData(key){
    Object.defineProperty(this,key,{
      get(){
        return this.$data[key];
      },
      set(newVal){
        this.$data[key]=newVal;
      }
    })
  }
}

// dep 用来管理watcher
class Dep{
  constructor(){
    // 存放若干依赖，一个watcher对应一个属性
    this.deps=[];
  }
  addDep(dep){
    this.deps.push(dep);
  }
  notify(){
    this.deps.forEach(dep=> dep.update())
  }
}

class Watcher{
  constructor(vm,key,cb){
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    // 将当前watcher实例指定dep静态属性target
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
  update(){
    this.cb.call(this.vm, this.vm[this.key]);
  }
}