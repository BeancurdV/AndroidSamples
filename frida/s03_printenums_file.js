function EnumerateAllExports() {
    // Get all modules
    var modules = Process.enumerateModules();
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        var module_name = module.name;
        var exports = module.enumerateExports();
        // 打印信息
        console.log("module_name=>",module_name," module.enumerateExports=>",JSON.stringify(exports)
    }
}

// 当你想要执行一段异步代码，调用setImmediate()，它会在当前的事件循环结束后执行你的代码。
// setImmediate()是将事件插入到事件队列尾部，主线程和事件队列函数执行完之后立即执行setImmediate指定的回调函数，和setTimeout(fn,0)效果差不多
setImmediate(EnumerateAllExports);


/********************************华丽分割线********************************************/

// 插桩到libhwui.so中，Java_example_decrypt方法
Module.enumerateExportsSync("libhwui.so",{
    onMatch:function(e){
        // TODO beancurdv 打印一下变量类型
        if(e.type == 'function'){
            console.log("name of function =>" + e.name);
            if(e.name == "Java_example_decrypt"){
                // 基于地址进行插入
                Interceptor.attach(e.address,{
                     onEnter:function(args){
                        console.log("Interceptor attched onEnter");
                     }

                     onLeave:function(retval){
                        console.log("Interceptor attched onLeave");
                     }
                }
            }
        }
    }

    onComplete:function(){}
});


/********************************Hook JNIEnv的GetStringUTFChars方法********************************************/
// 1. 先确定GetStringUTFChars方法所在的so库名称
// 2. 找到GetStringUTFChars方法的名称和地址
// 3. 干你想干的事情

// 1. 先确定GetStringUTFChars方法所在的so库名称   根据AOSP源码发现，GetStringUTFChars方法在libart.so中

function hook_env_getstringutfchars(){
    var GetStringUTFChars_addr = null;
    // 枚举libart.so中的所有符号
    var symbols = Process.findModuleByName("libart.so").enumerateSymbols();
    console.log(JSON.stringify(symbols));
    // 此时可以打印，并且定位到 GetStringUTFChars方法的符号名称
    for(var i = 0 ; i < symbols.length ; i++) {
        var symbolName = symbols[i].name;
        // 定位到GetStringUTFChars方法的符号名称
        if((symbolName.indexOf("CheckJNI") == -1) &&
            (symbolName.indexOf("JNI") >=0)) {
               if(symbolName.indexOf("GetStringUTFChars") >=0) {
                   console.log("finally found GetStringUTFChars name :",symbolName);
                   GetStringUTFChars_addr = symbols[i].address;
                   console.log("finally found GetStringUTFChars address :",GetStringUTFChars_addr);
               }
            }
    }
    Interceptor.attach(GetStringUTFChars_addr,{
        onEnter:function(args){
            // 打印参数
            console.log("art::JNI::GetStringUTFChars :",args[0],args[1],args[2]);

            // 打印jstring的值
            // console.log("args2 jstring is ", Java.vm.getEnv().getStringUtfChars(args[2],null).readCString());
            // 还可以打印一下调用栈
            console.log('art::JNI::GetStringUTFChars Backtrace:\n' +
            Thread.backtrace(this.context,Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress).join("\n") + '\n');
        }
        onLeave:function(retval){
            console.log("retval is => ",retval)
        }
    })

}

setImmediate(hook_env_getstringutfchars)


// 替换JNI
function replace_JNI() {
    var   = null;
        // 枚举libart.so中的所有符号
        var symbols = Process.findModuleByName("libart.so").enumerateSymbols();
        console.log(JSON.stringify(symbols));
        // 此时可以打印，并且定位到 GetStringUTFChars方法的符号名称
        for(var i = 0 ; i < symbols.length ; i++) {
            var symbolName = symbols[i].name;
            // 定位到GetStringUTFChars方法的符号名称
            if((symbolName.indexOf("CheckJNI") == -1) &&
                (symbolName.indexOf("JNI") >=0)) {
                   if(symbolName.indexOf("NewStringUTFChars") >=0) {
                       console.log("finally found NewStringUTFChars name :",symbolName);
                       NewStringUTFChars_addr = symbols[i].address;
                       console.log("finally found NewStringUTFChars address :",GetStringUTFChars_addr);
                   }
                }
        }
        // 定义一个函数指针 入参和返回值都是 指针类型
        var NewStringUTF = new NativeFunction(NewStringUTFChars_addr,"pointer",["pointer","pointer"])
        Interceptor.replace(GetStringUTFChars_addr, new NativeCallback(function(p1,p2){
            console.log("p1 , p2 => ", p1,p2.readCString());
            // 修改参数
            var newP2 = Memory.allocUtf8String("newPara2");
            var r = NewStringUTF(p1,newP2);
            return r;
        },"pointer",["pointer","pointer"]))
}

setImmediate(replace_JNI)