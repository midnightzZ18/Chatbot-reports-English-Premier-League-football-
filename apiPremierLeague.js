function fetchAPI(url) {
    if (!url) {
        Logger.log('URL is undefined');
        return null;
    }

    var apiKey = footballDataApiKey();
    var headers = {
        "Content-Type": "application/json",
        "X-Auth-Token": apiKey
    };
    var options = {
        "method": "GET",
        "headers": headers,
        "muteHttpExceptions": true
    };
    try {
        var response = UrlFetchApp.fetch(url, options);
        if (response.getResponseCode() === 200) {
            return JSON.parse(response.getContentText());
        } else {
            Logger.log('Error response code: ' + response.getResponseCode());
            Logger.log('Error response text: ' + response.getContentText());
            return null;
        }
    } catch (error) {
        Logger.log('Error fetching data: ' + error.message);
        return null;
    }
}

function getPremierLeagueStandings() {
    var url = "https://api.football-data.org/v4/competitions/PL/standings";
    Logger.log('Fetching standings from URL: ' + url); 
    var data = fetchAPI(url);
    
    if (!data) {
        Logger.log('No data received for standings');
        return [createErrorMessage("ตารางคะแนน")];
    }
    
    Logger.log('Standings data: ' + JSON.stringify(data));
    var standings = parseStandingsData(data);
    return createStandingsFlexMessages(standings);
}

function parseStandingsData(data) {
    if (!data || !data.standings || data.standings.length === 0) {
        Logger.log('No standings data available');
        return [];
    }

    var standings = data.standings[0].table.map(function(team) {
        return {
            position: team.position,
            team: {
                name: team.team.shortName || team.team.name,
                crest: team.team.crest
            },
            playedGames: team.playedGames,
            won: team.won,
            draw: team.draw,
            lost: team.lost,
            points: team.points,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalDifference 
        };
    });

    standings.sort(function(a, b) {
        if (a.points === b.points) {
            if (a.goalDifference === b.goalDifference) {
                return b.goalsFor - a.goalsFor; 
            }
            return b.goalDifference - a.goalDifference;
        }
        return b.points - a.points;
    });

    return standings;
}

function createStandingsFlexMessages(standings) {
    var flexMessages = [];
    var bubbles = [];

    for (var i = 0; i < standings.length; i += 10) {
        var slice = standings.slice(i, i + 10);
        var bubble = {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: "ตารางคะแนนพรีเมียร์ลีก",
                    weight: "bold",
                    size: "xl",
                    color: "#FFFFFF"
                }],
                backgroundColor: "#241f21"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "box",
                    layout: "horizontal",
                    contents: [
                        { type: "text", text: "#", size: "sm", weight: "bold", flex: 1 },
                        { type: "text", text: "ทีม", size: "sm", weight: "bold", flex: 3 },
                        { type: "text", text: "P", size: "sm", weight: "bold", flex: 1, align: "center" },
                        { type: "text", text: "W", size: "sm", weight: "bold", flex: 1, align: "center" },
                        { type: "text", text: "D", size: "sm", weight: "bold", flex: 1, align: "center" },
                        { type: "text", text: "L", size: "sm", weight: "bold", flex: 1, align: "center" },
                        { type: "text", text: "Pts", size: "sm", weight: "bold", flex: 1, align: "center" }
                    ]
                }].concat(slice.map(function(team, index) {
                    return {
                        type: "box",
                        layout: "horizontal",
                        contents: [
                            { type: "text", text: (i + index + 1).toString(), size: "sm", flex: 1 },
                            { type: "text", text: team.team.name, size: "sm", flex: 3 },
                            { type: "text", text: team.playedGames.toString(), size: "sm", flex: 1, align: "center" },
                            { type: "text", text: team.won.toString(), size: "sm", flex: 1, align: "center" },
                            { type: "text", text: team.draw.toString(), size: "sm", flex: 1, align: "center" },
                            { type: "text", text: team.lost.toString(), size: "sm", flex: 1, align: "center" },
                            { type: "text", text: team.points.toString(), size: "sm", flex: 1, align: "center" }
                        ]
                    };
                }))
            }
        };
        bubbles.push(bubble);
    }

    flexMessages.push({
        type: "flex",
        altText: "ตารางคะแนนพรีเมียร์ลีก",
        contents: {
            type: "carousel",
            contents: bubbles
        }
    });
    
    return flexMessages;
}

function getPremierLeagueFixtures() {
    var now = new Date();
    var dateFrom = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var dateTo = Utilities.formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd'); 

    var fixtures = fetchFixturesForWeek(dateFrom, dateTo);

    if (fixtures.length === 0) {
        Logger.log('No fixtures found for this week, fetching fixtures from last week.');
        
        // ลดวันเพื่อหาสัปดาห์ก่อนหน้า
        var lastWeekDateFrom = Utilities.formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var lastWeekDateTo = dateFrom; // วันแรกของสัปดาห์ปัจจุบัน

        fixtures = fetchFixturesForWeek(lastWeekDateFrom, lastWeekDateTo);
    }

    if (fixtures.length === 0) {
        return [createErrorMessage("ไม่มีโปรแกรมการแข่งขันภายในสัปดาห์นี้ โปรดพิมพ์'โปรแกรมการแข่งขันสัปดาห์หน้า'")];
    }

    return createFixturesFlexMessages(fixtures);
}

function getNextWeekPremierLeagueFixtures() {
    var now = new Date();
    var nextWeekStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    var dateFrom = Utilities.formatDate(nextWeekStart, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var dateTo = Utilities.formatDate(new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd');

    var url = "https://api.football-data.org/v4/competitions/PL/matches?dateFrom=" + dateFrom + "&dateTo=" + dateTo + "&status=SCHEDULED";
    Logger.log('Fetching fixtures for next week from URL: ' + url);

    var data = fetchAPI(url);

    if (!data || !data.matches || data.matches.length === 0) {
        Logger.log('No fixtures found for next week.');
        return [createErrorMessage("ไม่มีโปรแกรมการแข่งขันภายในสัปดาห์หน้า")];
    }

    Logger.log('Next week fixtures data: ' + JSON.stringify(data));
    return createFixturesFlexMessages(parseFixturesData(data));
}

function fetchFixturesForWeek(dateFrom, dateTo) {
    var url = "https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED&dateFrom=" + dateFrom + "&dateTo=" + dateTo;
    Logger.log('Fetching fixtures from URL: ' + url);
    var data = fetchAPI(url);

    if (!data || !data.matches || data.matches.length === 0) {
        Logger.log('No data received for fixtures');
        return [];
    }

    Logger.log('Fixtures data: ' + JSON.stringify(data));
    return parseFixturesData(data);
}

function parseFixturesData(data) {
    if (!data || !data.matches) {
        Logger.log('No fixtures data available');
        return [];
    }

    var fixtures = data.matches.map(function(match) {
        var homeTeam = match.homeTeam.shortName || match.homeTeam.name || "ทีมเหย้า";
        var awayTeam = match.awayTeam.shortName || match.awayTeam.name || "ทีมเยือน";
        var date = new Date(match.utcDate);
        var time = Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm");
        var day = Utilities.formatDate(date, Session.getScriptTimeZone(), "EEE dd MMM yyyy");
        var matchDay = match.matchday;

        return {
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            date: day,
            time: time,
            matchDay: matchDay
        };
    });

    return fixtures;
}

function createFixturesFlexMessages(fixtures) {
    var flexMessages = [];

    var groupedFixtures = fixtures.reduce(function(acc, fixture) {
        var key = fixture.date;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(fixture);
        return acc;
    }, {});

    var bubbles = [];

    for (var date in groupedFixtures) {
        var bubble = {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: "พรีเมียร์ลีก #MatchDay " + groupedFixtures[date][0].matchDay,
                    weight: "bold",
                    size: "xl",
                    color: "#FFFFFF"
                }],
                backgroundColor: "#8A2BE2" // สีม่วง
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: date || "วันที่ไม่ทราบ",
                    weight: "bold",
                    size: "md",
                    margin: "sm"
                }]
            }
        };

        groupedFixtures[date].forEach(function(fixture) {
            bubble.body.contents.push({
                type: "box",
                layout: "horizontal",
                contents: [
                    { type: "text", text: fixture.homeTeam || "ทีมเหย้า", size: "sm", flex: 3 },
                    { type: "text", text: fixture.time || "เวลาไม่ทราบ", size: "sm", align: "center", flex: 2 },
                    { type: "text", text: fixture.awayTeam || "ทีมเยือน", size: "sm", flex: 3, align: "end" }
                ]
            });
        });

        bubbles.push(bubble);
    }

    flexMessages.push({
        type: "flex",
        altText: "โปรแกรมการแข่งขัน",
        contents: {
            type: "carousel",
            contents: bubbles
        }
    });

    return flexMessages;
}

function getPremierLeagueResults() {
    var now = new Date();
    
    // หาวันอังคารของสัปดาห์ปัจจุบัน
    var tuesdayOfWeek = new Date(now);
    tuesdayOfWeek.setDate(now.getDate() - ((now.getDay() + 5) % 7));  

    // หาวันจันทร์ของสัปดาห์ถัดไป
    var mondayOfNextWeek = new Date(tuesdayOfWeek);
    mondayOfNextWeek.setDate(tuesdayOfWeek.getDate() + 6);

    var dateFrom = Utilities.formatDate(tuesdayOfWeek, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var dateTo = Utilities.formatDate(mondayOfNextWeek, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    var results = fetchResultsForWeek(dateFrom, dateTo);

    if (results.length === 0) {
        Logger.log('No results found for this week, fetching results from last week.');
        
        // หาวันอังคารของสัปดาห์ก่อนหน้า
        var tuesdayOfLastWeek = new Date(tuesdayOfWeek);
        tuesdayOfLastWeek.setDate(tuesdayOfWeek.getDate() - 7);

        // หาวันจันทร์ของสัปดาห์ก่อนหน้า
        var mondayOfLastWeek = new Date(tuesdayOfLastWeek);
        mondayOfLastWeek.setDate(tuesdayOfLastWeek.getDate() + 6);

        var lastWeekDateFrom = Utilities.formatDate(tuesdayOfLastWeek, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var lastWeekDateTo = Utilities.formatDate(mondayOfLastWeek, Session.getScriptTimeZone(), 'yyyy-MM-dd');

        results = fetchResultsForWeek(lastWeekDateFrom, lastWeekDateTo);
    }

  
    if (results.length === 0) {
        Logger.log('No results found for last week, fetching results from two weeks ago.');
        
        // หาวันอังคารของสัปดาห์ก่อนหน้าสองสัปดาห์
        var tuesdayOfTwoWeeksAgo = new Date(tuesdayOfWeek);
        tuesdayOfTwoWeeksAgo.setDate(tuesdayOfWeek.getDate() - 14);

        // หาวันจันทร์ของสัปดาห์ก่อนหน้าสองสัปดาห์
        var mondayOfTwoWeeksAgo = new Date(tuesdayOfTwoWeeksAgo);
        mondayOfTwoWeeksAgo.setDate(tuesdayOfTwoWeeksAgo.getDate() + 6);

        var twoWeeksAgoDateFrom = Utilities.formatDate(tuesdayOfTwoWeeksAgo, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var twoWeeksAgoDateTo = Utilities.formatDate(mondayOfTwoWeeksAgo, Session.getScriptTimeZone(), 'yyyy-MM-dd');

        results = fetchResultsForWeek(twoWeeksAgoDateFrom, twoWeeksAgoDateTo);
    }

    if (results.length === 0) {
        return [createErrorMessage("ไม่มีผลการแข่งขันในช่วงนี้")];
    }

    return createResultsFlexMessages(results);
}

function fetchResultsForWeek(dateFrom, dateTo) {
    var url = "https://api.football-data.org/v4/competitions/PL/matches?status=FINISHED&dateFrom=" + dateFrom + "&dateTo=" + dateTo;
    Logger.log('Fetching results from URL: ' + url);
    var data = fetchAPI(url);

    if (!data || !data.matches || data.matches.length === 0) {
        Logger.log('No data received for results');
        return [];
    }

    Logger.log('Results data: ' + JSON.stringify(data));
    return parseResultsData(data);
}

function parseResultsData(data) {
    if (!data || !data.matches) {
        Logger.log('No results data available');
        return [];
    }

    var results = data.matches.map(function(match) {
        var homeTeam = match.homeTeam.shortName || match.homeTeam.name || "ทีมเหย้า";
        var awayTeam = match.awayTeam.shortName || match.awayTeam.name || "ทีมเยือน";
        var homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : "-";
        var awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : "-";
        var date = new Date(match.utcDate);
        var day = Utilities.formatDate(date, Session.getScriptTimeZone(), "EEE dd MMM yyyy");

        return {
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            homeScore: homeScore,
            awayScore: awayScore,
            date: day
        };
    });

    return results;
}

function createResultsFlexMessages(results) {
    var flexMessages = [];
    var groupedResults = results.reduce(function(acc, result) {
        var key = result.date;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(result);
        return acc;
    }, {});

    var bubbles = [];

    for (var date in groupedResults) {
        var bubble = {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: "ผลการแข่งขันพรีเมียร์ลีกล่าสุด",
                    weight: "bold",
                    size: "lg",
                    color: "#FFFFFF"
                }],
                backgroundColor: "#8A2BE2" // สีม่วง
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: date || "วันที่ไม่ทราบ",
                    weight: "bold",
                    size: "md",
                    margin: "sm"
                }]
            }
        };

        groupedResults[date].forEach(function(result) {
            bubble.body.contents.push({
                type: "box",
                layout: "horizontal",
                contents: [
                    { type: "text", text: result.homeTeam || "ทีมเหย้า", size: "sm", flex: 4 },
                    { type: "text", text: result.homeScore + " - " + result.awayScore || "- -", size: "sm", align: "center", flex: 2 },
                    { type: "text", text: result.awayTeam || "ทีมเยือน", size: "sm", flex: 4, align: "end" }
                ],
                spacing: "sm", 
                margin: "md"
            });
        });

        bubbles.push(bubble);
    }

    flexMessages.push({
        type: "flex",
        altText: "ผลการแข่งขัน",
        contents: {
            type: "carousel",
            contents: bubbles
        }
    });

    return flexMessages;
}

function getPremierLeagueNews() {
    var url = "https://www.thairath.co.th/rss/sport";
    Logger.log('Fetching news from URL: ' + url);
    try {
        var response = UrlFetchApp.fetch(url);
        var content = response.getContentText();
        var news = parseThaiRSSData(content);
        var filteredNews = news.filter(article => isPremierLeagueRelated(article.title, article.description));
        
        if (filteredNews.length === 0) {
            return [createErrorMessage("ขออภัยขณะนี้ยังไม่มีข่าวเกี่ยวกับพรีเมียร์ลีกจากไทยรัฐสปอร์ตที่เราสามารถดึงมาได้")];
        }

        return createThaiNewsFlexMessages(filteredNews.slice(0, 5)); 
    } catch (error) {
        Logger.log('Error fetching news: ' + error.message);
        return [createErrorMessage("ข่าวสารพรีเมียร์ลีก")];
    }
}

function isPremierLeagueRelated(title, description) {
    var keywords = ["พรีเมียร์ลีก","แมนยู","เทนฮาก", "แมนเชสเตอร์ ยูไนเต็ด", "ลิเวอร์พูล", "เชลซี", "อาร์เซนอล", "แมนเชสเตอร์ ซิตี้", "สเปอร์ส", "ท็อตแน่ม", "เลสเตอร์ ซิตี้", "เอฟเวอร์ตัน", "เวสต์แฮม", "เซาแธมป์ตัน", "นิวคาสเซิล", "นิวคาสเซิล ยูไนเต็ด", "คริสตัล พาเลซ", "วัตฟอร์ด", "ไบรท์ตัน", "ลีดส์ ยูไนเต็ด", "เบิร์นลีย์", "ฟูแล่ม", "วิลล่า", "แอสตัน วิลล่า"];
    return keywords.some(keyword => title.includes(keyword) || description.includes(keyword));
}

function parseThaiRSSData(content) {
    var document = XmlService.parse(content);
    var root = document.getRootElement();
    var channel = root.getChild("channel");
    var items = channel.getChildren("item");
    
    var news = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var title = item.getChild("title").getText();
        var link = item.getChild("link").getText();
        var description = item.getChild("description").getText();
        var imageUrl = item.getChild("enclosure") ? item.getChild("enclosure").getAttribute("url").getValue() : "";

        news.push({ title: title, link: link, description: description, imageUrl: imageUrl });
    }
    Logger.log('Parsed news: ' + JSON.stringify(news));
    return news;
}

function createThaiNewsFlexMessages(news) {
    var flexMessages = [];

    var bubbles = news.map(function(article) {
        return {
            type: "bubble",
            header: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: "Thairath ข่าวสารพรีเมียร์ลีก",
                    weight: "bold",
                    size: "lg",
                    wrap: true,
                    color: "#FFFFFF",
                    align: "center"
                }],
                backgroundColor: "#00511c"
            },
            hero: {
                type: "image",
                url: article.imageUrl,
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover"
            },
            body: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "text",
                    text: article.title,
                    weight: "bold",
                    size: "md",
                    wrap: true,
                    action: {
                        type: "uri",
                        label: "ดูเพิ่มเติม",
                        uri: article.link
                    }
                }, {
                    type: "text",
                    text: article.description,
                    size: "sm",
                    wrap: true,
                    color: "#666666"
                }]
            },
            footer: {
                type: "box",
                layout: "vertical",
                contents: [{
                    type: "button",
                    style: "link",
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "อ่านต่อ",
                        uri: article.link
                    }
                }]
            }
        };
    });

    if (bubbles.length > 0) {
        flexMessages.push({ type: "flex", altText: "Thairath ข่าวสารพรีเมียร์ลีก", contents: { type: "carousel", contents: bubbles.slice(0, 5) } });
    }
    return flexMessages;
}

function createErrorMessage(message) {
  return {
    type: "text",
    text: message
  };
}
