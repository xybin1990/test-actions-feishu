const axios = require('axios')
const crypto = require("crypto")
const timestamp = ~~((new Date().getTime()) / 1000)

const secretKey = process.env.FEISHU_SIGN
const webhookUrl = process.env.FEISHU_WEBHOOK

const hmac = crypto.createHmac('sha256', timestamp + '\n' + secretKey)
const up = hmac.update("")

// =============================================================================

if (!process.env.GITHUB) {
  return console.error('没有获取到 github 构建数据。')
}

if (JSON.parse(process.env.GITHUB).event_name !== 'release') {
  console.warn('此消息通知仅支持 release 事件。')
}

const { repository, actor, event, ref_name } = JSON.parse(process.env.GITHUB)

// 卡片消息结构
const card = {
  "config": {
    "wide_screen_mode": true
  },
  "elements": [
    {
      "tag": "markdown",
      "content": "<at id=all></at>"
    },
    {
      "tag": "hr"
    },
    {
      "tag": "div",
      "fields": [
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": `**分支：**\n${ref_name}`
          }
        }
      ]
    },
    {
      "tag": "div",
      "fields": [
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": `**提交人：**\n${actor}`
          }
        },
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": `**提交时间：**\n${event.commits[0].timestamp}`
          }
        }
      ]
    },
    {
      "tag": "div",
      "fields": [
        {
          "is_short": true,
          "text": {
            "tag": "lark_md",
            "content": `**描述信息：**\n${event.commits[0].message}`
          }
        }
      ]
    },
    {
      "tag": "hr"
    },
    {
      "tag": "action",
      "actions": [
        {
          "tag": "button",
          "text": {
            "tag": "plain_text",
            "content": "查看详情"
          },
          "type": "primary",
          "url": event.commits[0].url
        }
      ]
    }
  ],
  "header": {
    "template": "blue",
    "title": {
      "content": `${repository} 新版本发布`,
      "tag": "plain_text"
    }
  }
}

axios.post(webhookUrl, {
  "timestamp": timestamp,
  "sign": up.digest('base64'),
  "msg_type": "interactive",
  "card": card
}).then((data) => {
  console.info('>> send ok <<', data.data)
}).catch(err => {
  console.error(">> error:", err);
})