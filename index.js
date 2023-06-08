var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs')
var createError = require('http-errors')
var app = express();

const listRouter = require('./router/crawler')
const bookRouter = require('./router/bxwx')

// const cors = require('cors');
// app.use(cors());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
//   res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
//   res.header("X-Powered-By", ' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });


app.all('*', function (req, res, next) {//做跨域请求
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
  res.header('Content-Type', 'application/json;charset=utf-8');
  res.header('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36')
  next();
});

app.use('/list', listRouter)
app.use('/', bookRouter)

app.get('/', function (req, res, next) {
  res.send("Hello World");
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------------start  华丽的分割线------------------------------------
//配置ejs视图的目录
app.set("views", __dirname + "/views");    //    '/views代表存放视图的目录'
//启动视图引擎，并指定模板文件文件类型：ejs
app.set('view engine', 'ejs')
//模板类型指定为html
app.engine('html', ejs.__express)
//启动视图引擎
app.set('view engine', 'html')
// ------------------------------------end   华丽的分割线------------------------------------


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log('Web服务已经启动，端口3000监听中...');
})
