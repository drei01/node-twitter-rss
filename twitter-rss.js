var Feed = require('feed'),
	Twit = require('twit'),
	twitter;

module.exports = function(CONSUMER_KEY,CONSUMER_SECRET,ACCESS_TOKEN,ACCESS_TOKEN_SECRET) {
	var module = {};
	
	twitter = new Twit({
		consumer_key: CONSUMER_KEY,
		consumer_secret: CONSUMER_SECRET,
		access_token: ACCESS_TOKEN,
		access_token_secret: ACCESS_TOKEN_SECRET
	});
	
	module.feed = function(screen_name, callback){
		twitter.get('statuses/user_timeline', {
			screen_name: screen_name,
			include_rts: false,
			count: 25
		  }, function(err, tweets) {
			if(err) {
			  if(typeof callback === 'function'){
			  	callback(err);
			  }
			}
			else {
			  var feed = null;
			  for(var i=0; i<tweets.length; i++) {
				var tweet = tweets[i];
				// init new feed on first tweet
				if(feed == null) {
				  feed = new Feed({
					title:          tweet.user.screen_name + ' Twitter RSS',
					description:    'A generated feed of the tweets from ' + tweet.user.screen_name,
					link:           'https://twitter.com/' + tweet.user.screen_name,
					image:          tweet.user.profile_image_url,

					author: {
					  name:       tweet.user.name,
					  email:      '',
					  link:       'https://twitter.com/' + tweet.user.screen_name
					}
				  });
				}

				feed.addItem({
				  title:          tweet.text,
				  link:           'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
				  content:    parseTweetText(tweet.text),
				  date:           new Date(tweet.created_at)
				});
			  }
			  if(typeof callback === 'function'){
			  	callback(null, feed);
			  }
			}
		  });
	};
	
	return module;
};

var parseTweetText = function(text) {
  text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
    var username = u.replace("@","")
    return u.link("https://twitter.com/"+username);
  });
  text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
    return url.link(url);
  });
  return text;
};
