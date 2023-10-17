package com.beancurd.androidsamples

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log

class MainActivity : AppCompatActivity() {

    var total = "@@@###@@@"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        Thread(Runnable {
            while (true){
                Thread.sleep(1000)
                xx(50,30)
            }
        }).start()
    }

    fun xx(x: Int, y: Int) {
        Log.d("XSum", (x + y).toString())
    }

    fun xx(x:String) :String {
        total += x
        return x.lowercase()
    }

    fun secret() = total
}