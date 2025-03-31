function doPost(e) {
    var replyToken;
    var messageText;
    var userIdLine;
    var nameLine;
    var imageLine;
    var eventType;

    try {
        var postData = JSON.parse(e.postData.contents);
        eventType = postData.events[0].type;
        userIdLine = postData.events[0].source.userId;

        if (eventType === "follow") {
            var userProfile = getUserProfile(userIdLine);
            nameLine = userProfile.displayName;
            imageLine = userProfile.pictureUrl;
            if (!isUserExists(userIdLine)) {
                insertNewUserLine(userIdLine, nameLine, imageLine);
            }
            var messageResponse = manualButton();
            replyMessageLineText(tokenLine(), postData.events[0].replyToken, messageResponse, 1, "ยินดีตอนรับค่ะ");
        } else if (eventType === "unfollow") {
            deleteUserLine(userIdLine);
            return;
        }

        if (eventType === "message") {
            replyToken = postData.events[0].replyToken;
            messageText = postData.events[0].message.text;
            var userProfile = getUserProfile(userIdLine); 
            handleUserMessage(replyToken, messageText, userProfile);
        }
    } catch (error) {
        Logger.log("Error parsing request: " + error.message);
        return;
    }
}

function handleUserMessage(replyToken, messageText, userProfile) {
    if (messageText === "ผลการแข่งขัน"|| messageText === "ผลการแข่ง"|| messageText === "ผล") {
        mainFunction(replyToken, "results");
    } else if (messageText === "ตารางคะแนน") {
        mainFunction(replyToken, "standings");
    } else if (messageText === "โปรแกรมการแข่งขัน" || messageText === "โปรแกรมการแข่ง") {
        mainFunction(replyToken, "fixtures");
    } else if (messageText === "โปรแกรมการแข่งขันสัปดาห์หน้า" || messageText === "โปรแกรมการแข่งขันสัปดาห์ถัดไป"
    || messageText === "โปรแกรมสัปดาห์ถัดไป"|| messageText === "โปรแกรมถัดไป"|| messageText === "โปรแกรมการแข่งสัปดาห์หน้า" 
    || messageText === "โปรแกรมสัปดาห์หน้า"){ mainFunction(replyToken, "fixturesNext");
    } else if (messageText === "ข่าวสาร") {
        mainFunction(replyToken, "news");
    } else if (messageText.startsWith("ผลการแข่ง") || messageText.startsWith("ผล")) {
    var teamName = messageText.replace("ผลการแข่ง", "").replace("ผล", "").trim();
        mainFunction(replyToken, "teamResults", teamName);
    } else if (messageText.startsWith("โปรแกรมการแข่ง") || messageText.startsWith("โปรแกรม")) {
    var teamName = messageText.replace("โปรแกรมการแข่ง", "").replace("โปรแกรม", "").trim();
        mainFunction(replyToken, "teamFixtures", teamName);
    } else if (messageText === "สวัสดี" || messageText === "สวัสดีครับ" || messageText === "สวัสดีค่ะ") {
        var messageResponse = 'สวัสดีครับคุณ ' + userProfile.displayName + ' มีอะไรให้เราช่วยหรือป่าวครับ';
        replyMessageLineText(tokenLine(), replyToken, messageResponse, 0, "");
    }else if (messageText === "คู่มือการใช้งาน" || messageText === "คู่มือ") {
        var messageResponse = manualMessage();
        replyMessageLineText(tokenLine(), replyToken, messageResponse, 1, "คู่มือการใช้งาน");
    } else if (messageText === 'mn') {
        var messageResponse = flexManU();
        replyMessageLineText(tokenLine(), replyToken, messageResponse, 1, "Manchester United");
    } else if (messageText === 'manchester united') {
        var messageResponse = "เก่งที่สุดในโลกเลยค้าบ";
        replyMessageLineText(tokenLine(), replyToken, messageResponse, 0, "Manchester United");
    } else if (messageText === 'me') {
        var messageResponse = flexUserProfile(userProfile);
        replyMessageLineText(tokenLine(), replyToken, messageResponse, 1, "โปรไฟล์");
    } else {
        var apologyMessage = "ขออภัยค่ะ ระบบยังไม่รองรับคำขอนี้ กรุณาลองคำสั่งที่มีอยู่ในคู่มือการใช้งาน'คู่มือ'";
        replyMessageLineText(tokenLine(), replyToken, apologyMessage, 0, "");

    }
}

function getUserProfile(userId) {
    var token = tokenLine();
    var url = 'https://api.line.me/v2/bot/profile/' + userId;
    var options = {
        'headers': {
            'Authorization': 'Bearer ' + token
        },
        'method': 'GET',
        'muteHttpExceptions': true
    };
    var response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
}

function doGet(e) {
    var htmlOutput = HtmlService.createHtmlOutputFromFile('index');
    return htmlOutput;
}

function insertNewUserLine(userIdLine, nameLine, imageLine) {
    var sheetId = sheetIdUserLine();
    var sheetName = sheetNameUserLine();

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);

    var dataInsert = [userIdLine, checkNullData(nameLine), checkNullData(imageLine)];
    sheet.appendRow(dataInsert);

    return 'OK';
}

function isUserExists(userIdLine) {
    var sheetId = sheetIdUserLine();
    var sheetName = sheetNameUserLine();

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
        if (data[i][0] === userIdLine) {
            return true;
        }
    }
    return false;
}

function deleteUserLine(userIdLine) {
    var sheetId = sheetIdUserLine();
    var sheetName = sheetNameUserLine();

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
        if (data[i][0] === userIdLine) {
            sheet.deleteRow(i + 1);
            return 'OK';
        }
    }
    return 'User not found';
}

function checkNullData(value) {
    if (value == null || value == '' || value == []) {
        return '';
    } else {
        return value;
    }
}

function mainFunction(replyToken, type, teamName) {
    var messages = [];

    if (type === "results") {
        messages = getPremierLeagueResults();
    } else if (type === "standings") {
        messages = getPremierLeagueStandings();
    } else if (type === "fixtures") {
        messages = getPremierLeagueFixtures();
    } else if (type === "fixturesNext") {
        messages = getNextWeekPremierLeagueFixtures();
    } else if (type === "news") {
        messages = getPremierLeagueNews();
    } else if (type === "teamResults") {
        messages = getResultsForTeam(teamName);
    } else if (type === "teamFixtures") {
        messages = getFixturesForTeam(teamName);
    }

    if (messages.length > 0) {
        apiPushMessageLine(replyToken, messages);
    } else {
        replyMessageLineText(tokenLine(), replyToken, "", 0, "ขออภัยค่ะ ระบบยังไม่รองรับคำขอนี้ กรุณาลองคำสั่งที่มีอยู่ในคู่มือการใช้งาน 'คู่มือ'");
    }
}