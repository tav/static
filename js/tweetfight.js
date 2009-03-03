// Placed into the Public Domain by tav@espians.com

var timezoneoffset = (new Date()).getTimezoneOffset() * 60;

var get_relative_time = function (date, now) {

  var delta = parseInt((now - date)/1000);

  delta += timezoneoffset;

  if (delta < 60)
	return "less than a minute ago";

  if (delta < 120)
	return "about a minute ago";

  if (delta < (60*60))
	return (parseInt(delta/60)).toString()+" minutes ago";

  if (delta < (120*60))
	return "about an hour ago";

  if (delta < (24*60*60))
	return "about " + (parseInt(delta/3600)).toString() + " hours ago";

  if (delta < (48*60*60))
	return "1 day ago";

  return (parseInt(delta/86400)).toString() + " days ago";

};

var tweetfight_setup = function (tweetfight_hashtag, tweetfight_title, tweetfight_duration) {

  var hashtag = '#' + tweetfight_hashtag;
  var hashtag_length = hashtag.length;

  var tweetfight_placeholder = $('<div>Loading data from twitter...</div>');
  var tweetfight_placeholder2 = $('<div>Loading data from twitter...</div>');
  var tweetfight_header = $('<div><strong>'+tweetfight_title+':</strong></div>');
  var tweetfight_load_url = "http://search.twitter.com/search.json?rpp=100&callback=?&q=%23"+tweetfight_hashtag+"+";
  var tweetfight_recent = $('<ul />');

  var tweetfight = $(hashtag);
  var tweetfight_ring = $(hashtag+'-ring');
  var tweetfight_block = $('<blockquote />');

  tweetfight.append(tweetfight_placeholder);
  tweetfight.append(tweetfight_recent);

  if (window.location.hash) {
    var tweetfight_hash = window.location.hash.substr(1).split(',');
    if (tweetfight_hash[0] && tweetfight_hash[1])
	  tweetfight_load(tweetfight_hash[0], tweetfight_hash[1], tweetfight_hash[2]);
  }

function tweetfight_load(from_user, to_user, max_id) {

  tweetfight_block.empty();
  tweetfight_ring.append(tweetfight_header);
  tweetfight_ring.append(tweetfight_block);
  tweetfight_block.append(tweetfight_placeholder2);

  var results = {};
  var seen = [];
  var now = (new Date()).getTime();
  var initial_seen = false;
  var tweettime, new_seen, seen_item, recent_seen, tweet;

  var gather_results = function (data) {

	$.each(data.results, function(idx, item) {

	  if (item.text.substr(item.text.length - hashtag_length).toLowerCase() != hashtag)
		return;

	  if ((item.from_user == from_user) && (item.to_user != to_user))
		return;

	  if ((item.from_user == to_user) && (item.to_user != from_user))
		return;

	  tweettime = Date.parse(item.created_at);
	  item.time = tweettime;
	  seen.push([item.id, tweettime]);
	  results[item.id] = item;

	});

	seen = seen.sort(function (a, b) {return b[1] - a[1];});
	recent_seen = seen[0];
	new_seen = [];

	if (!recent_seen)
	  return;

	recent_seen = recent_seen[1];

	for (var i=0; i < seen.length; i++) {
	  seen_item = seen[i];
	  tweettime = seen_item[1];
	  if ((recent_seen - tweettime) > (tweetfight_duration * 60 * 60 * 1000)) {
		initial_seen = true;
		break;
	  }
	  recent_seen = tweettime;
	  new_seen.push(seen_item);
	}

	if ((data.next_page) && (!initial_seen)) {
	  $.getJSON(data.next_page, gather_results);
	  return;
	}

	tweetfight_show();

  };

  var tweetfight_show = function () {

	max_id = parseInt(new_seen[0][0]) + 1;
	new_seen = new_seen.reverse();

	$(tweetfight_placeholder2).remove();
	tweetfight_block.hide();

	var permalink = '#' + from_user + ',' + to_user + ',' + max_id;
	var permalink_full = 'http://tav.espians.com/' + tweetfight_hashtag + '.html' + permalink;

    tweetfight_block.append('<div>Permalink: <a href="'+permalink_full+'">'+permalink_full+'</a></div>');
	window.location.hash = permalink;

	tweetfight_block.append('<div style="font-size: 2em; margin-top: 1em; margin-bottom: 1em;"><strong>'+from_user+'</strong> vs. <strong>'+to_user+'</strong></div>');

	var tweet_table = $('<table></table>');

	for (var i=0; i < new_seen.length; i++) {
	  tweet = results[new_seen[i][0]];
	  if (tweet.from_user == recent_seen)
		continue;
	  recent_seen = tweet.from_user;
	  var tweet_link = 'http://twitter.com/'+tweet.from_user+'/'+tweet.id;
	  $('<tr class="tweetfight-item"><td valign="top"><a href="'+tweet_link+'"><img src="'+tweet.profile_image_url+'" /></a></td><td valign="top"><a href="'+tweet_link+'">'+tweet.from_user+'</a>: '+tweet.text+'<td></td></tr>').appendTo(tweet_table);
	}

	// <tr><td colspan="2"><span class="tweetfight-time">'+get_relative_time(tweet.time, now)+'</span></td></tr>

	tweet_table.appendTo(tweetfight_block);
	tweetfight_block.slideDown(1000);

  };

  var load_url = tweetfight_load_url + 'from%3A' + from_user + '+OR+from%3A' + to_user;

  if (max_id) {
	max_id = parseInt(max_id) - 1;
	load_url += '&max_id=' + max_id;
  }

  $.getJSON(load_url, function(data) { gather_results(data); });

}



  function tweetfight_init(data) {

	var contestants = {};
	var from_user, to_user, tweetfight_link, tweet_text;

	$(tweetfight_placeholder).remove();

	$.each(data.results, function(idx, item) {

	  to_user = item.to_user;
	  from_user = item.from_user;

	  if (to_user) {

		if (contestants[from_user] && (contestants[from_user] == to_user))
		  return;

		if (contestants[to_user] && (contestants[to_user] == from_user))
		  return;

		tweet_text = item.text;

		if (!(tweet_text.substr(tweet_text.length - hashtag_length).toLowerCase() == hashtag))
		  return;

		contestants[from_user] = to_user;

  		tweetfight_link = $('<a />').attr('href', '#load...').append(
		  from_user+" vs. "+to_user).append('<br />').click(
		  (function (from_dude, to_dude) { return function () { tweetfight_load(from_dude, to_dude); return false; }; })(from_user, to_user));

		$('<li />').append(tweetfight_link).appendTo(tweetfight_recent);

	  }

    });

  }

  $.getJSON("http://search.twitter.com/search.json?rpp=100&q=%23" + tweetfight_hashtag + "&callback=?", function(data) { tweetfight_init(data); });

}
