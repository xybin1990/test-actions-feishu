const axios = require('axios')
const crypto = require("crypto")
const timestamp = ~~((new Date().getTime()) / 1000)
console.log('>> time:', timestamp)

const secretKey = process.env.FEISHU_SIGN
const webhookUrl = process.env.FEISHU_WEBHOOK

const hmac = crypto.createHmac('sha256', timestamp + '\n' + secretKey)
const up = hmac.update("")

function sendText () {
  axios.post(webhookUrl, {
    "timestamp": timestamp,
    "sign": up.digest('base64'),
    "msg_type": "text",
    "content": {
      "text": `<at user_id="all"></at> \n 全体人员注意: 5分钟后向美国白宫发射东风!`
    }
  }
  ).then(data => {
    console.log(">> data:", data.data);
  }).catch(err => {
    console.log(">> error:", err);
  })
}
// sendText()

// 卡片消息结构
const card = {
  // 用于描述卡片的功能属性
  config: {
    enable_forward: false, // 是否允许卡片被转发 默认 true
    update_multi: true, // 是否为共享卡片 是/更新卡片的内容对所有收到这张卡片的人员可见 否/仅操作用户可见卡片的更新内容
  },
  // 用于配置卡片标题内容
  header: {
    // 配置卡片标题内容
    title: {
      tag: 'plain_text', // 固定的 plain_text
      content: '标题2' // 卡片标题文案内容
    },
    template: 'blue' // 控制标题背景颜色 blue/wathet/turquoise/green/yellow/orange/red/carmine/violet/purple/indigo/grey
  },
  // 用于定义卡片正文内容 i18n_elements 用于国际化
  elements: [
    {
      "tag": "at"
    },
    {
      "tag": "div",
      "text": {
        "tag": "plain_text",
        "content": "通知：下午两点，向美国白宫发射东风快递！"
      }
    }
  ]
}
function sendCard () {
  const ins = axios.post(webhookUrl, {
    "timestamp": timestamp,
    "sign": up.digest('base64'),
    "msg_type": "interactive",
    "card": card
  })
}
// sendCard()
sendText()