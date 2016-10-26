/*
	localhost:8081
	reg 注册
		客户端params {username,password}
		服务器params {err:0/1,msg:}
	login 登陆
		{username,password}
		{err:0/1,msg:}
	speak 发言
		{text}
		{text,form}
*/
const http = require('http');
const io = require('socket.io');
const mysql = require('mysql');
const reg = require('./reg.js');

var db=mysql.createConnection({
    host:   'localhost',
    user:   'root',
    password:   '123456',
    database:   '2016-10-25'
});

var httpServer = http.createServer(function(req, res){}).listen(8081);

var wsServer = io.listen(httpServer);
var arr = [];
var users = [];
wsServer.on('connection',function(sock){
	arr.push(sock);

	sock.on('reg',function(username,password){
		var SQL = `SELECT * FROM users WHERE username="${username}"`;
		db.query(SQL,function(err,data){
			if(err){
				sock.emit('reg_result',{'err':1,'msg':'请求数据库失败！'});
			}else{
				if(data.length == 0){
					var I_SQL = `INSERT INTO users VALUES(null,"${username}","${password}")`;
                    db.query(I_SQL, function (err, data) {
                        if (err) {
                            sock.emit('reg_result',{'err':1,'msg':'请求数据库失败！'});
                        } else {
							sock.emit('reg_result',{'err':0,'msg':'注册成功！'});
                        }
                    });
				}else{
					sock.emit('reg_result',{'err':1,'msg':'此用户已被注册！'})
				}
			}
		});
	});

	sock.on('login',function(username,password){
		var SQL = `SELECT * FROM users WHERE username="${username}" AND password="${password}"`;
		db.query(SQL,function(err,data){
			if(err){
				sock.emit('login_result',{'err':1,'msg':'请求数据库失败！'});
			}else{
				if(data.length == 0){
                    sock.emit('login_result',{'err':1,'msg':'用户名或密码错误！'});
				}else{
					sock.emit('login_result',{'err':0,'msg':'登陆成功！'});
					users.push(username);
					sock.username = username;
					arr.map(function(elem) {
						elem.emit('total_users',users);
					});


					sock.on('speak',function(text){
						var time = new Date().getTime();
						arr.map(function(elem) {
							elem.emit('speak',{msg:text,time:time,from:username});
						});
					});
				}
			}
		});
	});

	sock.on('disconnect',function(){
		users.map(function(elem,index) {
			if(elem == sock.username){
				users.splice(index,1);
			}
		});

		arr.map(function(elem,index) {
			if(elem == sock){
				arr.splice(index,1);
			}else{
				elem.emit('total_users',users);
			}
		});
	});

	sock.on('delete',function(username){
		users.map(function(elem,index) {
			if(elem == username){
				users.splice(index,1);
			}
		})
	});
});