function manualMessage(){
  return{
  "type": "bubble",
  "hero": {
    "type": "image",
    "url": "https://cdn.punchng.com/wp-content/uploads/2023/10/18201131/Premier-League.png",
    "size": "full",
    "aspectRatio": "50:10",
    "aspectMode": "cover",
    "action": {
      "type": "uri",
      "uri": "https://line.me/"
    }
  },
  "body": {
    "type": "box",
    "layout": "vertical",
    "spacing": "md",
    "action": {
      "type": "uri",
      "uri": "https://line.me/"
    },
    "contents": [
      {
        "type": "text",
        "text": "คู่มือการใช้งาน",
        "size": "xl",
        "weight": "bold"
      },
      {
        "type": "text",
        "text": "นี่เป็นแชทบอทรายงานผลฟุตบอลพรีเมียร์ลีก",
        "size": "xs",
        "weight": "regular"
      },
      {
        "type": "text",
        "text": "เบื้องต้นแชทบอทจะรายงานผลฟุตบอลสดอัตโนมัติ",
        "size": "xs",
        "weight": "regular"
      },
      {
        "type": "text",
        "text": "เป็นผลการแข่งขันพรีเมียร์ลีกสดทุกคู่",
        "size": "xs",
        "weight": "regular"
      },
      {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "box",
            "layout": "baseline",
            "contents": [
              {
                "type": "text",
                "text": "การพิมพ์ข้อความ",
                "weight": "bold",
                "margin": "sm",
                "flex": 0
              }
            ]
          },
          {
            "type": "box",
            "layout": "baseline",
            "contents": [
              {
                "type": "text",
                "text": "-สามารถพิมพ์ทักทาย สวัสดี ,สวัสดีครับ,สวัสดีค่ะ",
                "weight": "regular",
                "margin": "none",
                "flex": 0,
                "size": "xs"
              }
            ]
          },
          {
            "type": "text",
            "text": " 'คู่มือ'หรือ'คู่มือการใช้งาน'จะแสดงหน้านี้ขึ้นมา ",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": "-สมารถดูผลการแข่งขันและโปรแกรมการแข่งขัน",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " ของทีมที่ต้องการทราบ โดยการพิมพ์",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " 'ผล'หรือ'ผลการแข่ง'ตามด้วยชื่อทีมจะแสดง",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " ผลการแข่งขัน3นัดล่าสุด",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " 'โปรแกรม'หรือ'โปรแกรมการแข่ง'ตามด้วยชื่อทีม",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " จะแสดงโปรแกรมการแข่งขัน3นัดถัดไป",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " -และสามารถดูโปรแกรมการแข่งสัปดาห์ถัดไป",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": " พิมพ์'โปรแกรมถัดไป'หรือ'โปรแกรมสัปดาห์หน้า'",
            "margin": "none",
            "size": "xs"
          },
          {
            "type": "text",
            "text": "ริชเมนู",
            "weight": "bold"
          },
          {
            "type": "text",
            "text": "ผลการแข่งขัน"
          },
          {
            "type": "text",
            "text": " -จะแสดงผลการแข่งขันสัปดาห์ล่าสุด",
            "size": "sm",
            "color": "#757575"
          },
          {
            "type": "text",
            "text": "โปรแกรมการแข่งขัน"
          },
          {
            "type": "text",
            "text": " -จะแสดงโปรแกรมการแข่งขันสัปดาห์ปัจจุบัน",
            "size": "sm",
            "color": "#757575"
          },
          {
            "type": "text",
            "text": "ตารางคะแนน"
          },
          {
            "type": "text",
            "text": " -จะแสดงตารางคะแนนปัจจุบัน",
            "color": "#757575",
            "size": "sm"
          },
          {
            "type": "text",
            "text": "ข่าวสาร"
          },
          {
            "type": "text",
            "text": " -จะแสดงข่าวจากไทยรัฐสปอร์ตล่าสุด",
            "color": "#757575",
            "size": "sm"
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "contents": []
  }
}
}

function manualButton(){
  return{
  "type": "bubble",
  "footer": {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "button",
        "style": "primary",
        "color": "#00b900",
        "margin": "none",
        "action": {
          "type": "message",
          "label": "คู่มือการใช้งาน",
          "text": "คู่มือการใช้งาน"
        }
      }
    ]
  }
}
}

function flexManU() {
    return {
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": "https://www.thesun.co.uk/wp-content/uploads/2023/05/manchester-united-badge-232356065.jpg?w=620",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover",
            "action": {
                "type": "uri",
                "uri": "https://line.me/"
            }
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "action": {
                "type": "uri",
                "uri": "https://line.me/"
            },
            "contents": [
                {
                    "type": "text",
                    "text": "Manchester United",
                    "size": "xl",
                    "weight": "bold"
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "color": "#CC0000",
                    "margin": "xxl",
                    "action": {
                        "type": "message",
                        "label": "manU",
                        "text": "manchester united"
                    }
                }
            ]
        }
    };
}


function flexUserProfile(data) {
    var set = {
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": (data.pictureUrl).toString(),
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": (data.displayName).toString(),
                    "size": "xxl",
                    "color": "#3A3A3A",
                    "weight": "bold"
                }
            ]
        }
    };
    return set;
}