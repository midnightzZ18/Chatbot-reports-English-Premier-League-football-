function handleTextMessage(event) {
    var message = event.message.text.toLowerCase();
    if (message.includes("ผลการแข่ง") || message.includes("ผล")) {
        return getResultsForTeam(message);
    } else if (message.includes("โปรแกรมการแข่ง") || message.includes("โปรแกรม")) {
        return getFixturesForTeam(message);
    }
    return [];
}

function getResultsForTeam(message) {
    var result = getTeamIdFromMessage(message);
    if (result.error) {
        return [createErrorMessage(result.message)];
    }
    var teamId = result.id;
    var url = "https://api.football-data.org/v4/teams/" + teamId + "/matches?status=FINISHED&limit=5"; 
    var data = fetchAPI(url);

    if (!data) {
        return [createErrorMessage("ไม่พบข้อมูลผลการแข่งขันของทีม " + teamId)];
    }
    var premierLeagueMatches = data.matches.filter(function(match) {
        return match.competition.name === "Premier League";
    });

    if (premierLeagueMatches.length < 3) {
        return [createErrorMessage("ไม่พบข้อมูลการแข่งขันพรีเมียร์ลีกครบ 3 นัด")];
    }

    premierLeagueMatches = premierLeagueMatches.slice(0, 3);

    var results = parseResultsData({ matches: premierLeagueMatches });
    return createResultsFlexMessages(results);
}

function getFixturesForTeam(message) {
    var result = getTeamIdFromMessage(message);
    if (result.error) {
        return [createErrorMessage(result.message)];
    }
    var teamId = result.id;
    var url = "https://api.football-data.org/v4/teams/" + teamId + "/matches?status=SCHEDULED&limit=5"; 
    var data = fetchAPI(url);

    if (!data) {
        return [createErrorMessage("ไม่พบข้อมูลตารางการแข่งขันของทีม " + teamId)];
    }

    var premierLeagueFixtures = data.matches.filter(function(match) {
        return match.competition.name === "Premier League";
    });

    if (premierLeagueFixtures.length < 3) {
        return [createErrorMessage("ไม่พบข้อมูลโปรแกรมการแข่งขันพรีเมียร์ลีกครบ 3 นัด")];
    }
    premierLeagueFixtures = premierLeagueFixtures.slice(0, 3);

    var fixtures = parseFixturesData({ matches: premierLeagueFixtures });
    return createFixturesFlexMessages(fixtures);
}

function getTeamIdFromMessage(message) {
    var teams = {
        "ไบรท์ตัน แอนด์ โฮฟ อัลเบี้ยน": 397,
        "ไบรท์ตัน": 397,
        "brighton and hove albion": 397,
        "brighton": 397,
        "อาร์เซนอล": 57,
        "arsenal": 57,
        "ลิเวอร์พูล": 64,
        "liverpool": 64,
        "แมนเชสเตอร์ ซิตี้": 65,
        "แมนซิตี้": 65,
        "manchester city": 65,
        "แอสตัน วิลล่า": 58,
        "แอสตันวิลล่า": 58,
        "aston villa": 58,
        "เบรนท์ฟอร์ด": 402,
        "brentford": 402,
        "แมนเชสเตอร์ ยูไนเต็ด": 66,
        "แมนยู": 66,
        "manu": 66,
        "manchester united": 66,
        "นิวคาสเซิล ยูไนเต็ด": 67,
        "นิวคาสเซิล": 67,
        "newcastle united": 67,
        "newcastle": 67,
        "บอร์นมัธ": 1044,
        "bournemouth": 1044,
        "เลสเตอร์ ซิตี้": 338,
        "เลสเตอร์": 338,
        "leicester city": 338,
        "leicester": 338,
        "น็อตติ้งแฮม ฟอเรสต์": 351,
        "ฟอเรสต์": 351,
        "nottingham forest": 351,
        "forest": 351,
        "สเปอร์ส": 73,
        "ท็อตแน่ม ฮ็อทสเปอร์": 73,
        "tottenham hotspur": 73,
        "tottenham": 73,
        "คริสตัล พาเลซ": 354,
        "พาเลซ": 354,
        "crystal palace": 354,
        "palace": 354,
        "เวสต์แฮม ยูไนเต็ด": 563,
        "เวสต์แฮม": 563,
        "west ham united": 563,
        "west ham": 563,
        "ฟูแล่ม": 63,
        "fulham": 63,
        "เซาแธมป์ตัน": 340,
        "southampton": 340,
        "เชลซี": 61,
        "chelsea": 61,
        "อิปสวิช ทาวน์": 385,
        "อิปสวิช": 385,
        "ipswich town": 385,
        "ipswich": 385,
        "วูล์ฟแฮมป์ตัน วันเดอเรอร์ส": 76,
        "วูล์ฟส์": 76,
        "wolverhampton wanderers": 76,
        "wolves": 76,
        "เอฟเวอร์ตัน": 62,
        "everton": 62
    };

    for (var team in teams) {
        if (message.includes(team)) {
            return { id: teams[team] };
        }
    }

    var availableTeams = Object.keys(teams).join(', ');
    return {
        error: true,
        message: "ไม่พบชื่อทีมในข้อความ ชื่อทีมที่สามารถพิมพ์ได้มีดังนี้: " + availableTeams
    };
}

function createErrorMessage(message) {
    return {
        type: "text",
        text: message
    };
}
