// SO 加载的时候，会主动调用 JNI_OnLoad


function hoos_RegisterNatives() {
    var RegisterNative_Address = null;
    // 枚举libart.so中的所有符号
    var symbols = Process.findModuleByName("libart.so").enumerateSymbols();
    console.log(JSON.stringify(symbols));
    // 此时可以打印，并且定位到 GetStringUTFChars方法的符号名称
    for (var i = 0; i < symbols.length; i++) {
        var symbolName = symbols[i].name;
        // 定位到GetStringUTFChars方法的符号名称
        if ((symbolName.indexOf("CheckJNI") == -1) &&
            (symbolName.indexOf("JNI") >= 0)) {
            if (symbolName.indexOf("RegisterNatives") >= 0) {
                console.log("finally found RegisterNatives name :", symbolName);
                RegisterNative_Address = symbols[i].address;
                console.log("finally found RegisterNatives address :", RegisterNative_Address);
            }
        }


        if (RegisterNative != null) {
            // hook
            Interceptor.attach(RegisterNative_Address, {
                    onEnter: function(args) {
                        console.log("[RegisterNatives] method counts : ", args[3]);
                        var env = args[0];
                        var jclass = args[1];
                        var class_name = Java.vm.tryGetEnv().getClassName(jclass);
                        // 指针数组
                        var methods_ptr = ptr(args[2]);
                        // 
                        for (var i = 0; i < parseInt(args[3]); i++) {
                            var method = methods_ptr[i];
                            var name_ptr = Memory.readPointer(i * Process.pointerSize * 3);
                            var sig_ptr = Memory.readPointer(i * Process.pointerSize * 3 + Process.pointerSize);
                            var fnPtr_ptr = Memory.readPointer(i * Process.pointerSize * 3 + Process.pointerSize * 2);
                            var name = Memory.readCString(name_ptr);
                            var sin = Memory.readCString(sig_ptr);
                            var find_module = Process.findModuleByAddress(fnPtr_ptr);

                            console.log("[RegisterNaives] java class:", class_name,
                                "name", name, "sig:", sin, "fnPtr_ptr", fnPtr_ptr, "module_name",
                                find_module, ""
                            }
                        },

                        onLeave: function(retval) {

                        }
                    })
            }
        }
    }

    setImmediate(replace_JNI)

    // frida -U -f <package name> -l xxx.js --no-pause

    // API DOC 参考地址： https://github.com/frida/frida-java-bridge/blob/master/lib/env.js
    // 源码参考  https://github.com/sensepost/objection/blob/master/agent/android/root.ts