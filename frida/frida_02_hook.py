# 使用方式：python frida_02_hook.py
# 解决函数重载问题 "Error: xx(): has more than one overload, use .overload(<signature>) to choose from
print("frida ============= 1");

jscode = """
console.log("Script loaded successfully ");
Java.perform(function x() {
    console.log("Inside java perform function");
    //定位类
    var my_class = Java.use("com.beancurd.androidsamples.MainActivity");
    console.log("Java.Use.Successfully!");//定位类成功！
    //在这里更改类的方法的实现（implementation）
    my_class.xx.implementation = function(x,y){
        //打印替换前的参数
        console.log( "original call: xx("+ x + ", " + y + ")");
        //把参数替换成2和5，依旧调用原函数
        var ret_value = this.xx(2, 5);
        return ret_value;
    }
});
"""

import time
import frida

def my_message_handler(message, payload):  # 定义错误处理
    print(message)
    print(payload)

# 连接安卓机上的frida-server
device = frida.get_usb_device()

# 启动`demo02`这个app
pid = device.spawn(["com.beancurd.androidsamples"])

print(f"[*] PID: {pid}")

device.resume(pid)

time.sleep(1)
session = device.attach(pid)

# 加载s1.js脚本
script = session.create_script(jscode)

script.on("message", my_message_handler)  # 调用错误处理
script.load()

# 脚本会持续运行等待输入
input()