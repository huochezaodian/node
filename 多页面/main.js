'use strict';
/*
	需求：
	localhost:8081 主页面
	localhost:8081/a A页面
	localhost:8081/b B页面
*/
const http = require('http');
const fs = require('fs');
http.createServer((req,res) => {
	//console.log(req.url);
	var url = ( req.url == '/'?'/index':req.url ).replace(/^\//,'');
	//console.log(url);
	fs.readFile(url+'.html',(err,data) => {
		//console.log(err);
		if(err){
			res.write("404");
		}else{
			res.write(data);
		}
		res.end();
	});
}).listen(8081);