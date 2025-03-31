function createTriggers() {
  ScriptApp.newTrigger('notifyLiveMatchUpdates')
           .timeBased()
           .everyMinutes(5)
           .create();

  ScriptApp.newTrigger('updateResults')
           .timeBased()
           .everyHours(1)
           .create();

  ScriptApp.newTrigger('updateFixtures')
           .timeBased()
           .everyHours(1)
           .create();

  ScriptApp.newTrigger('updateStandings')
           .timeBased()
           .everyHours(1)
           .create();
}

function updateResults() {
  var results = getAnyLeagueResults();
  saveToCache('results', results);
}

function updateFixtures() {
  var fixtures = getAnyLeagueFixtures();
  saveToCache('fixtures', fixtures);
}

function updateStandings() {
  var standings = getAnyLeagueStandings();
  saveToCache('standings', standings);
}

function saveToCache(key, data) {
  var cache = CacheService.getScriptCache();
  cache.put(key, JSON.stringify(data), 21600); 
}

function getFromCache(key) {
  var cache = CacheService.getScriptCache();
  var data = cache.get(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

function notifyUsers(messages) {
  var userIds = getUserIds();
  userIds.forEach(function(userId) {
    Logger.log('Sending message to user: ' + userId);
    pushMessageToUser(userId, messages);
  });
}

function fetchLiveMatches() {
  var now = new Date();
  var dateFrom = Utilities.formatDate(new Date(now.getTime() - 12 * 60 * 60 * 1000), 'Asia/Bangkok', 'yyyy-MM-dd');
  var dateTo = Utilities.formatDate(new Date(now.getTime() + 12 * 60 * 60 * 1000), 'Asia/Bangkok', 'yyyy-MM-dd'); 

  var url = 'https://api.football-data.org/v4/matches?dateFrom=' + dateFrom + '&dateTo=' + dateTo + '&status=FINISHED,IN_PLAY,PAUSED';
  var options = {
    'method': 'get',
    'headers': {
      'X-Auth-Token': footballDataApiKey()
    }
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      Logger.log('Data received: ' + JSON.stringify(data)); 
      var matches = data.matches;

      matches = matches.filter(function(match) {
        return match.competition.code === 'PL'; 
      });
      
      return matches;
    } else {
      Logger.log('Error: Non-200 response code ' + response.getResponseCode());
      return [];
    }
  } catch (e) {
    Logger.log('Error fetching matches: ' + e.message);
    return [];
  }
}

function notifyLiveMatchUpdates() {
  try {
    var matches = fetchLiveMatches();
    if (matches && matches.length > 0) {
      matches.forEach(function(match) {
        if (!isNotified(match.id) && match.status === 'FINISHED') {
          markAsNotified(match.id);

          var homeScoreReady = match.score && match.score.fullTime && match.score.fullTime.home !== null;
          var awayScoreReady = match.score && match.score.fullTime && match.score.fullTime.away !== null;

          if (homeScoreReady && awayScoreReady) {
            var message = formatMatchFinishedMessage(match);
            Logger.log('Notifying match: ' + match.id); 
            notifyUsers([message]);
          } else {
            Logger.log('Score not ready for match: ' + match.id + '. Retrying in 5 minutes.');
            scheduleRetry(match.id);  
          }
        } else {
          Logger.log('Match already notified or not finished: ' + match.id);
        }
      });
    }
  } catch (e) {
    Logger.log('Error in notifyLiveMatchUpdates: ' + e.message);
  }
}

function scheduleRetry(matchId) {
  ScriptApp.newTrigger('retryFetchScore')
           .timeBased()
           .after(5 * 60 * 1000) 
           .create()
           .setTriggerSource(matchId); 
}

function retryFetchScore(trigger) {
  try {
    var matchId = trigger.source;
    var match = fetchMatchById(matchId); 

    if (match && match.status === 'FINISHED') {
      var homeScoreReady = match.score && match.score.fullTime && match.score.fullTime.home !== null;
      var awayScoreReady = match.score && match.score.fullTime && match.score.fullTime.away !== null;

      if (homeScoreReady && awayScoreReady) {
        var message = formatMatchFinishedMessage(match);
        Logger.log('Notifying match after retry: ' + match.id); 
        notifyUsers([message]);
        markAsNotified(match.id);
      } else {
        var retryCount = getRetryCount(match.id);
        if (retryCount < 3) {
          incrementRetryCount(match.id);
          Logger.log('Score still not ready for match: ' + match.id + '. Retrying again.');
          scheduleRetry(match.id);
        } else {
          Logger.log('Max retries reached for match: ' + match.id + '. Skipping notification.');
        }
      }
    } else {
      Logger.log('Match not finished or not found for id: ' + matchId);
    }
  } catch (e) {
    Logger.log('Error in retryFetchScore: ' + e.message);
  }
}

function getRetryCount(matchId) {
  var cache = CacheService.getScriptCache();
  var retryCount = cache.get(matchId + '-retry');
  return retryCount ? parseInt(retryCount, 10) : 0;
}

function incrementRetryCount(matchId) {
  var cache = CacheService.getScriptCache();
  var retryCount = getRetryCount(matchId);
  cache.put(matchId + '-retry', retryCount + 1, 21600);
}

function formatMatchFinishedMessage(match) {
  var homeTeamName = removeFC(match.homeTeam.name);
  var awayTeamName = removeFC(match.awayTeam.name);

  var homeScore = match.score && match.score.fullTime && match.score.fullTime.home !== null
                  ? match.score.fullTime.home 
                  : "N/A";
  var awayScore = match.score && match.score.fullTime && match.score.fullTime.away !== null
                  ? match.score.fullTime.away 
                  : "N/A";

  var messageText = 'จบเกม! ' + homeTeamName + ' ' + homeScore + '-' + awayScore + ' ' + awayTeamName;
  Logger.log('Formatted message: ' + messageText);
  
  return {
    'type': 'text',
    'text': messageText
  };
}

function pushMessageToUser(userId, messages) {
  var url = 'https://api.line.me/v2/bot/message/push';
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + tokenLine()
  };

  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify({
      'to': userId,
      'messages': messages
    }),
    'muteHttpExceptions': true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log('Response from LINE: ' + response.getContentText());
    return response.getResponseCode();
  } catch (e) {
    Logger.log('Error pushing message to LINE: ' + e.message);
  }
}

function getUserIds() {
  var sheetId = sheetIdUserLine();
  var sheetName = sheetNameUserLine();
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(sheetName);
  var range = sheet.getDataRange();
  var values = range.getValues();
  var userIds = [];
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] != 'user_id_line') {
      userIds.push(values[i][0]);
    }
  }
  return userIds;
}

function markAsNotified(matchId) {
  var sheetId = '15KxxGR0cpg4xQHaPuBtyfXwKeKBUGk8iuwFAUuQP6Mw';  
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('NotifiedMatches');
  
  sheet.appendRow([matchId, new Date()]);  
}

function isNotified(matchId) {
  var sheetId = '15KxxGR0cpg4xQHaPuBtyfXwKeKBUGk8iuwFAUuQP6Mw';  
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('NotifiedMatches');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == matchId) {
      return true;  
    }
  }
  return false;
}

function removeFC(teamName) { 
  return teamName.replace(/ FC$/, '').replace(/ AFC$/, ''); }
