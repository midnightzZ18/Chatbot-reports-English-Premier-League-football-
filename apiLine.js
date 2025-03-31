function getProfileLineByUserIdLine(tokenLine, userIdLine) {
    var apiReply = "https://api.line.me/v2/bot/profile/" + userIdLine;
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenLine
    };

    var options = {
        "method": "GET",
        "headers": headers
    };

    try {
        var responseData = UrlFetchApp.fetch(apiReply, options);
        return JSON.parse(responseData.getContentText());
    } catch (error) {
        Logger.log(error.name + "：" + error.message);
        return null;
    }
}

function replyMessageLineText(tokenLine, replyToken, message, typeFlex, alt) {
    var apiReply = "https://api.line.me/v2/bot/message/reply";
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenLine
    };

    var raw;
    if (typeFlex == 1) {
        raw = {
            "replyToken": replyToken,
            "messages": [{
                "type": "flex",
                "altText": alt,
                "contents": message
            }]
        };
    } else {
        raw = {
            "replyToken": replyToken,
            "messages": [{
                "type": "text",
                "text": message
            }]
        };
    }

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(raw)
    };

    try {
        UrlFetchApp.fetch(apiReply, options);
    } catch (error) {
        Logger.log(error.name + "：" + error.message);
    }
}

function pushMessageToUser(userId, message) {
    var url = "https://api.line.me/v2/bot/message/push";
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenLine()
    };

    var postData = {
        "to": userId,
        "messages": [message]
    };

    var options = {
        "method": "post",
        "headers": headers,
        "payload": JSON.stringify(postData),
        "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
    return response.getResponseCode();
}
