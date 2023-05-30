//router/index.js
var express = require('express');
var router = express.Router();
var superagent = require('superagent');
var cheerio = require('cheerio');
var request = require('request')

const baseUrl = 'https://www.bxwx.live'//<修改为你要爬数据的网站>
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
            res.send({
                data: items,
                msg: '成功',
                count: items.length,
                code: 200
            });
        })
}
getMore = async (req, res) => {
    const { url } = req.query
    const moreUrl = `${baseUrl}${url}/more`
    superagent.get(moreUrl)
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
            let items = [];
            $('.section-box .section-list li').each((idx, element) => {
                let $element = $(element);
                let title = $element.find('a').text()//.split('\n')[1].replaceAll(' ', '')
                let contentUrl = $element.find('a').attr('href')
                obj = {
                    title: title,
                    url: `${baseUrl}${url}/${contentUrl}`,
                    contentUrl: contentUrl,
                }
                if (obj.title != "") {
                    //判断如果有内容，则推送到data中
                    items.push(obj)
                }
            })
            res.send({
                msg: '成功',
                code: 200,
                data: items
            })
        })
}

getContent = async (req, res) => {
    const { url } = req.query// || 'https://www.bxwx.live/b/392094/2289723.html'
    const page = await getPage(url)

    let title = page.title
    let pageSize = Number(page.pageSize)
    let txt = ""

    if (page.pageSize > 1) {
        for (let i = 2; i <= pageSize; i++) {
            const forUrl = url.split('.html')[0] + '_' + i + '.html'
            let content = await contentConcat(forUrl)
            txt += content
            if (i == pageSize) {
                res.send({
                    title,
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
                    res.send({ msg: err, code: 400 })
                    return
                }
                let $ = cheerio.load(sres.text);
                $('.container .row .layout .reader-main .title').each((idx, element) => {
                    let $element = $(element);
                    obj['title'] = $element.text().split('/')[0].substring(0, $element.text().split('/')[0].length - 1)
                    obj['pageSize'] = $element.text().slice(-1)
                })
                console.log('obj', obj);
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

                $('.container .row .layout .reader-main .content').each((idx, element) => {
                    let $element = $(element);
                    const content = $element.text().split('ttxx')[0]
                    resolve(content)
                })
            })
    })
}

module.exports = {
    getBook,
    getMore,
    getContent
}

