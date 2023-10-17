console.log("Script loaded successfully ");
Java.perform(function x() {
    console.log("Inside java perform function");
    //定位类
    var my_class = Java.use("com.beancurd.androidsamples.MainActivity");
    console.log("Java.Use.Successfully!");//定位类成功！

    //在这里更改类的方法的实现（implementation）
    my_class.xx.overload("int", "int").implementation = function(x, y){
        //打印替换前的参数
        console.log( "original call: fun("+ x + ", " + y + ")");
        //把参数替换成2和5，依旧调用原函数
        var ret_value = this.xx(2, 5);
        return ret_value;
    }

    var string_class = Java.use("java.lang.String"); //获取String类型

    my_class.xx.overload("java.lang.String").implementation = function(x){
        console.log("*************************************");
        var my_string = string_class.$new("My TeSt String#####"); //new一个新字符串
        console.log("Original arg: " + x );
        var ret =  this.xx(my_string); // 用新的参数替换旧的参数，然后调用原函数获取结果
        console.log("Return value: "+ ret);
        console.log("*************************************");
        return ret;
    };

    Java.choose("com.beancurd.androidsamples.MainActivity", {
        onMatch : function(instance){ //该类有多少个实例，该回调就会被触发多少次
          console.log("Found instance: " + instance);
          console.log("Result of secret func: " + instance.secret());
        },
        onComplete:function(){}
    });
});