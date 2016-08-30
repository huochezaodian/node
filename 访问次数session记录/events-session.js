/*
	localhost:8081/news 新闻列表
	localhost:8081/user 页面
*/
const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const urlLib = require('url');
const EventEmitter = require('events').EventEmitter;
var E = new EventEmitter();
var data = [
	{	
		title : 'title',
		href : 'baidu.com'
	},
	{	
		title : 'title1',
		href : 'baidu.com'
	},
	{	
		title : 'title2',
		href : 'baidu.com'
	}
];
http.createServer((req,res) => {
	var state = E.emit(req.url,req,res);
	if(state == false){
		E.emit('err',req,res);
	}
}).listen(8081);
E.on('/news',(req,res) => {
	res.end(JSON.stringify(data));
});
E.on('/user',(req,res) => {
	fs.readFile(req.url.substring(1),(err,data) => {
		if(err){
			E.emit('err',req,res);
		}else{
			res.write(data);
			res.end();
		}
	});
})
E.on('err',(req,res) => {
	res.writeHeader(404,null);
	res.write('404');
	res.end();
});