// const db = require('../utils/dbConfig')  //引入数据库，不存数据库可以注释掉

getList = (req, res) => {
  const xCrawl = require('x-crawl')
  // 创建爬虫实例
  const myXCrawl = xCrawl()
  myXCrawl.crawlPage('https://www.example.com').then((res) => {
    const { browser, page } = res.data

    // 关闭浏览器
    browser.close()
    res.json({
      data: res.data,
      page:page,
      browser
    })
  })
}

module.exports = {
  getList,
}