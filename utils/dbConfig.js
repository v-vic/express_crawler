const mysql = require('mysql')
module.exports = {
    // 数据库配置
    config:{
        host:'localhost',
        port:'3306',
        user:'root',
        password:'root',
        database:'book'
    },
    // 连接数据库，使用mysql得连接池连接方式
    // 连接池对象
    sql:function(sql,sqlArr,callback){
        var pool = mysql.createPool(this.config)
        pool.getConnection((err,conn)=>{
            if(err){
                console.log('连接失败',err)
                return;
            }
            console.log('连接成功')
            // 事件驱动回调
            conn.query(sql,sqlArr,callback);
            // 释放连接
            conn.release();
        })
    },
    // promise回调
    sqlSync:function(syncSql,syncSqlArr){
        return new Promise((res,rej)=>{
            var pool = mysql.createPool(this.config)
            pool.getConnection((err,conn)=>{
                if(err){
                    rej(err)
                }else{
                    // 事件驱动回调
                    conn.query(syncSql,syncSqlArr,(err,data)=>{
                        if(err){
                            rej(err)
                        }else{
                            res(data)
                        }
                    })
                    // 释放连接
                    conn.release()
                }
            })
        }).catch((err)=>{
            console.log('promise err:',err)
        })
    }
}