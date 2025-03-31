function handleMessage(replyToken, messageText) {
    var messages = [];
    if (messageText === "ตารางคะแนน") {
        messages = getPremierLeagueStandings();
    } else if (messageText === "ผลการแข่งขัน") {
        messages = getPremierLeagueResults();
    } else if (messageText === "โปรแกรมการแข่งขัน") {
        messages = getPremierLeagueFixtures();
    } else if (messageText === "ข่าวสาร") {
        messages = getPremierLeagueNews();
    } else {
        messages = [createErrorMessage("ไม่พบคำสั่งที่คุณส่งมา")];
    }
    if (messages.length > 0) {
        apiPushMessageLine(replyToken, messages);
    } else {
        Logger.log('Message is empty');
    }
}

function apiPushMessageLine(replyToken, messages) {
    var url = "https://api.line.me/v2/bot/message/reply";
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenLine()
    };

    var options = {
        "method": "post",
        "headers": headers,
        "muteHttpExceptions": true
    };

    var maxMessagesPerRequest = 5;
    for (var i = 0; i < messages.length; i += maxMessagesPerRequest) {
        var postData = {
            "replyToken": replyToken,
            "messages": messages.slice(i, i + maxMessagesPerRequest)
        };
        options.payload = JSON.stringify(postData);
        var response = UrlFetchApp.fetch(url, options);
        Logger.log(response.getContentText());
    }
}

function pushMessageToUser(userId, messages) {
    var url = "https://api.line.me/v2/bot/message/push";
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenLine()
    };

    var options = {
        "method": "post",
        "headers": headers,
        "muteHttpExceptions": true
    };

    var maxMessagesPerRequest = 5;
    for (var i = 0; i < messages.length; i += maxMessagesPerRequest) {
        var postData = {
            "to": userId,
            "messages": messages.slice(i, i + maxMessagesPerRequest)
        };
        options.payload = JSON.stringify(postData);
        var response = UrlFetchApp.fetch(url, options);
        Logger.log(response.getContentText());
    }
}

function dataUserLine() {
    var sheetId = sheetIdUserLine();
    var sheetName = sheetNameUserLine();

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);
    var range = sheet.getDataRange();
    var values = range.getValues();
    var selectedUserIds = ['U22df3076196b244e581ec7f2a94bce58'];

    for (var i = 1; i < values.length; i++) {
        var userId = values[i][0];
        if (selectedUserIds.includes(userId)) {
            var messages = [];     
            //messages = messages.concat(getPremierLeagueNews());
            messages = messages.concat(getPremierLeagueResults());
            //messages = messages.concat(getPremierLeagueStandings());
            //messages = messages.concat(getPremierLeagueFixtures());
            pushMessageToUser(userId, messages);
        }
    }
}

function testAllFunctions() {
    dataUserLine();
}
