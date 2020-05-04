var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
const multer = require('multer');

let workStartTime = "08:30:00"

function myInclude(arr, time) {
  let _flag = false
  let _index = -1
  let aarr = arr.map((item, index) => {
    if (item.nowDate == time) {
      _flag = true
      _index = index
    }
  })
  return {
    flag: _flag,
    index: _index
  }
}

function formateTime(nowTime) {
  return nowTime.getFullYear() + '-' + String(nowTime.getMonth() + 1).padStart(2, '0') + '-' + String(nowTime.getDate()).padStart(2, '0') + ' ' + String(nowTime.getHours()).padStart(2, '0') + ':' + String(nowTime.getMinutes()).padStart(2, '0') + ':' + String(nowTime.getSeconds()).padStart(2, '0')
}

function cTime(date, startTime, endTime) {
  console.log('date startTime, endTime---->', date, startTime, endTime)
  let usedTime = ''
  // 开始时间如果早于8点30得从8.30开始计时
  if (new Date(startTime) - new Date(date + " " + workStartTime) > 0) {
    console.log('开始时间-->', startTime )
    console.log('班次开始时间-->', (date + " " + workStartTime) )
    console.log('相减所剩时间-->', new Date(startTime) - new Date(date + " " + workStartTime) )
    usedTime = (new Date(endTime) - new Date(startTime)) / 3600 / 1000 - 1.5
  } else {
    usedTime = (new Date(endTime) - new Date(date + " " + workStartTime)) / 3600 / 1000 - 1.5
  }
  console.log('usedTime--有用时间是--->', usedTime)
  return usedTime
}

// 计算有用的时间
function calcTime(nowTime) {
  // 111 获取所有的 数据
  // 222 判断 今天是否已经存在
  // 333 不存在就push
  // 444 否则进行更改

  let nowDate = nowTime.getFullYear() + '-' + String(nowTime.getMonth() + 1).padStart(2, '0') + '-' + String(nowTime.getDate()).padStart(2, '0')
  console.log('nowDate-->', nowDate)
  let p = path.resolve(__dirname, '../data/', 'allData.json')
  let allData = fs.readFileSync(p, 'utf-8')
  console.log('allData----33333---444-->', allData)
  let tempArrList = JSON.parse(allData).dataList
  console.log('tempArrList--->', tempArrList)
  let _json = myInclude(tempArrList, nowDate)
  console.log('_json', _json)
  console.log('nowTime-5555555-->', nowTime)
  if (_json.flag) {
    tempArrList[_json.index].endTime = formateTime(nowTime)
    tempArrList[_json.index].usedTime = cTime(tempArrList[_json.index].nowDate, tempArrList[_json.index].firstTime, formateTime(nowTime))
  } else {
    tempArrList.push({
      nowDate: nowDate, // 当前的日期
      firstTime: formateTime(nowTime), // 当天的开始时间点
      endTime: null, // 当天的结束时间点
      usedTime: 0, // 当天的有用时间
    })
  }
  fs.writeFileSync(p, JSON.stringify({ dataList: tempArrList }), 'utf-8')
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({
    success: true
  })
});

router.get('/putTime', (req, res) => {
  let nowTime = new Date() // 打卡时间 上班或者下班的时间
  let nowItem = calcTime(nowTime)
  console.log('nowItem-22-->', nowItem)
  res.send({
    success: true,
    nowItem
  })

})

router.get('/allData', (req, res) => {
  console.log('req-query-->', req.query)
  try {
    let p = path.resolve(__dirname, '../data/', 'allData.json')
    let allData = fs.readFileSync(p, 'utf-8')
    res.send({
      success: true,
      dataList: JSON.parse(allData).dataList
    })
  } catch (error) {
    res.send({
      success: false,
      dataList: []
    })
  }

})



module.exports = router;