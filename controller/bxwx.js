//router/index.js
var express = require('express');
var router = express.Router();
var superagent = require('superagent');
var cheerio = require('cheerio');
var request = require('request')
const puppeteer = require('puppeteer')
var db = require('../utils/dbConfig')

const baseUrl = 'https://www.bxwx.live'//<修改为你要爬数据的网站>
// 首页
getBook = (req, res) => {
    /* GET users listing. */
    superagent.get(baseUrl)
        .end((err, sres) => {
            // 常规的错误处理
            if (err) {
                res.send({ msg: err, code: 400 })
                // return next(err);
                return
            }
            let $ = cheerio.load(sres.text);
            let items = [];
            $('.container .row .layout-col2 .item').each((idx, element) => {
                let $element = $(element);
                let author = $element.find('dl').find('dt').find('span').text().split('\n')[1].replaceAll(' ', '')
                let authorUrl = $element.find('dl').find('dt').find('span').find('a').attr('href')
                let title = $element.find('dl').find('dt').find('a').text().split('\n')[1].replaceAll(' ', '')
                let image = $element.find('img').attr('src')
                let url = $element.find('.image').find('a').attr('href')
                let introduce = $element.find('dl').find('dd').text().split('\n')[1].replaceAll(' ', '')
                obj = {
                    author: author,
                    authorUrl: `${baseUrl}${authorUrl}`,
                    title: title,
                    introduce: introduce,
                    image: `${baseUrl}${image}`,
                    url: `${baseUrl}${url}`,
                    moreUrl: url,
                }
                if (obj.title != "") {
                    //判断如果有内容，则推送到data中
                    items.push(obj)
                }
            });
            $('.container .row .layout .tp-box ul li').each((idx, element) => {
                let $element = $(element);
                let title = $element.find('a').text().split('\n')[1].replaceAll(' ', '')
                let url = $element.find('a').attr('href')
                let author = $element.children("a").last().text()//.split('\n')[1].replaceAll(' ','')
                obj = {
                    author: author,
                    title: title,
                    url: `${baseUrl}${url}`,
                    moreUrl: url,
                }
                if (obj.title != "") {
                    //判断如果有内容，则推送到data中
                    items.push(obj)
                }
            });
            $('.container .row .layout-col1 ul li').each((idx, element) => {
                let $element = $(element);
                let label = $element.find('.s1').text()
                let title = $element.find('.s2').find('a').text()//.split('\n')[1].replaceAll(' ','')
                let url = $element.find('.s2').find('a').attr('href')
                let author = $element.find('.s5').find('a').text()//.split('\n')[1].replaceAll(' ','')
                let authorUrl = $element.find('.s5').find('a').attr('href')
                obj = {
                    label,
                    author: author,
                    authorUrl: `${baseUrl}${authorUrl}`,
                    title: title,
                    url: `${baseUrl}${url}`,
                    moreUrl: url,
                }
                if (obj.title != "") {
                    //判断如果有内容，则推送到data中
                    items.push(obj)
                }
            });
            $('.container .row .fl ul li').each((idx, element) => {
                let $element = $(element);
                let label = $element.find('.s1').text()
                let title = $element.find('.s2').find('a').text()//.split('\n')[1].replaceAll(' ','')
                let url = $element.find('.s2').find('a').attr('href')
                let author = $element.find('.s4').find('a').text()//.split('\n')[1].replaceAll(' ','')
                let authorUrl = $element.find('.s4').find('a').attr('href')
                obj = {
                    label,
                    author: author,
                    authorUrl: `${baseUrl}${authorUrl}`,
                    title: title,
                    url: `${baseUrl}${url}`,
                    moreUrl: url,
                }
                if (obj.title != "") {
                    //判断如果有内容，则推送到data中
                    items.push(obj)
                }
            });
            // db.sql();
            res.send({
                data: items,
                msg: '成功',
                count: items.length,
                code: 200
            });
        })
}

// 获取所有章节
getMore = async (req, res) => {
    const { url } = req.query
    const moreUrl = `${baseUrl}${url}/more`
    let items = {}
    const intro = await getImageIntro(`${baseUrl}${url}`)
    items.intro = intro
    const articleList = await getArticle(url)
    items.list = articleList
    res.send({
        msg: '成功',
        code: 200,
        data: items
    })
}

const getArticle = (url) => {
    const moreUrl = `${baseUrl}${url}/more`
    return new Promise((resolve, reject) => {
        superagent.get(moreUrl)
            .set({
                'x-requested-with': 'XMLHttpRequest'
            })
            .end(async (err, sres) => {
                // 常规的错误处理
                if (err) {
                    res.send({ msg: err, code: 400 })
                    return
                }
                let $ = cheerio.load(sres.text);
                let items = [];
                $('.section-box .section-list li').each((idx, element) => {
                    let $element = $(element);
                    let title = $element.find('a').text()//.split('\n')[1].replaceAll(' ', '')
                    let contentUrl = $element.find('a').attr('href')
                    obj = {
                        title: title,
                        url: `${baseUrl}${url}${contentUrl}`,
                        contentUrl: contentUrl,
                    }
                    if (obj.title != "") {
                        //判断如果有内容，则推送到data中
                        items.push(obj)
                    }
                })
                resolve(items)
            })
    })
}

// 获取目录页图片，简介
const getImageIntro = (url) => {
    return new Promise((resolve, reject) => {
        superagent.get(url + '/')
            .set({
                'x-requested-with': 'XMLHttpRequest'
            })
            .end((err, sres) => {
                // 常规的错误处理
                if (err) {
                    res.send({ msg: err, code: 400 })
                    return
                }
                let $ = cheerio.load(sres.text);
                let arr = {}
                $('.container .row-detail .layout-col1 .detail-box').each((idx, element) => {
                    let $element = $(element);
                    arr.image = baseUrl + $element.find('.imgbox').find('img').attr('src')//.split('\n')[1].replaceAll(' ', '')
                    arr.imageTitle = $element.find('.imgbox').find('img').attr('alt')
                    arr.intro = $element.find('.info').find('.desc').text()
                })
                resolve(arr)
            })
    })
}
// 获取详情
getContent = async (req, res) => {
    let { url } = req.query// || 'https://www.bxwx.live/b/392094/2289723.html'
    if(url.indexOf('bxwx') == -1){
        url = `${baseUrl}${url}`
    }
    console.log('url==',url);
    
    const page = await getPage(url)

    let title = page.title
    let pageSize = Number(page.pageSize)
    let txt = ""

    // const lastNext = await getLastAndNext(url)

    if (page.pageSize > 1) {
        for (let i = 2; i <= pageSize; i++) {
            const forUrl = url.split('.html')[0] + '_' + i + '.html'
            let content = await contentConcat(forUrl)
            txt += content.content
            if (i == pageSize) {
                console.log('i==',i);
                console.log('pageSize==',pageSize);
                res.send({
                    title,
                    last: content.last,
                    msg: '成功',
                    code: 200,
                    data: txt,
                })
            }
        }
    }
}

const getPage = (url) => {
    let obj = {}
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, sres) => {
                // 常规的错误处理
                if (err) {
                    reject(err)
                    return
                }
                let $ = cheerio.load(sres.text);
                $('.container .row .layout .reader-main .title').each((idx, element) => {
                    let $element = $(element);
                    obj['title'] = $element.text().split('/')[0].substring(0, $element.text().split('/')[0].length - 1)
                    obj['pageSize'] = $element.text().slice(-1)
                })
                resolve(obj)
            })
    })
}

const contentConcat = (url) => {
    console.log('url', url);
    return new Promise((resolve, reject) => {
        superagent.get(url)
            .end((err, sres) => {
                // 常规的错误处理
                if (err) {
                    reject({ err: err, code: 500 })
                }
                let $ = cheerio.load(sres.text);
                $('.container .row .layout .reader-main ').each((idx, element) => {
                    let $element = $(element);
                    const content = $element.find('.content').text().split('ttxx')[0];
                    const links = $element.find('.section-opt a'); // 获取所有链接标签

                    const util = [];
                    links.each((i, linkElement) => {
                        const link = $(linkElement).attr('href'); // 获取链接地址
                        const text = $(linkElement).text()
                        util.push({
                            link,
                            text
                        }); // 加入数组
                    });
                    obj = {
                        content,
                        last:util.splice(3)
                    }
                    resolve(obj)
                })
            })
    })
}

// https://www.bxwx.live/search/?keyWord=天蚕土豆
// 搜索关键字
getSearch = async (req, res) => {
    const { word } = req.query
    const url = `${baseUrl}/search/?keyWord=${word}`
    console.log('请求接口', word, url);
    const html = await transitionHTML(url)
    const obj = { text: html.toString() }
    let $ = cheerio.load(obj.text);
    let items = []
    $('.container .row .layout .item').each((idx, element) => {
        let $element = $(element);
        let title = $element.find('.image').find('a').find('img').attr('alt').split('" width')[0]
        let image = $element.find('.image').find('a').find('img').attr('src')
        let contentUrl = $element.find('.image').find('a').attr('href')
        let introduce = $element.find('dl').find('dd').text()
        data = {
            title,
            image: `${baseUrl}${image}`,
            contentUrl: `${baseUrl}${contentUrl}`,
            moreUrl: contentUrl,
            introduce,
        }
        items.push(data)
    })
    res.send({
        count: items.length,
        msg: '成功',
        code: 200,
        items
    })
}

const transitionHTML = async (url) => {
    const browser = await puppeteer.launch(); // 启动浏览器
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' }); // 跳转到目标页面，等待页面加载完成
    const html = await page.content(); // 获取页面 HTML 内容
    await browser.close(); // 关闭浏览器
    // res.send(html); // 将HTML返回给客户端
    return html
}


// npm i -g chromium
module.exports = {
    getBook,
    getMore,
    getContent,
    getSearch
}

