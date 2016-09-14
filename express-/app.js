const express = require('express');
const bodyParser =require('body-parser');
const multerlib =  require('multer');
const cookieParser =  require('cookie-parser');
const sessionParser =  require('cookie-session');
const consolidate =  require('consolidate');

var multer = multerlib({dest:'static/upload'});

//开服务
var app = express();
app.listen(8081);

//使用中间件解析数据
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer.any());
app.use(cookieParser());
app.use(sessionParser({
	name:'test',
	keys:['aaa','bbb','ccc'],
	maxAge:20*60*1000
}));

//配置模板和引擎
app.set('views','view');
app.set('view engine','html');
app.engine('html',consolidate.ejs);

//路由
app.use('/index',require('./router/index'));
app.use('/news',require('./router/news'));

//静态资源
app.use(express.static('static'));

//404
app.use(function(req,res){
	res.render('error',{});
});

//....