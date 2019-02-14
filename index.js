// Extract the required classes from the discord.js module
const { Client, RichEmbed } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');
const _ = require('lodash');
const config = require('./config.json');

// Create an instance of a Discord client
const client = new Client();
var j;

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */

const gfycatContructor = (thumbUrl) => {
  const gfycatGiant = "https://giant.gfycat.com/";
  var preGenUrl = thumbUrl.replace('https://thumbs.gfycat.com/', '');
  var generatedUrl = preGenUrl.replace('-size_restricted', '');
  const finalUrl = gfycatGiant + generatedUrl
  return finalUrl
};

const replyTopGifFromSubreddit = (subreddit, message) => {
  var url = "https://www.reddit.com/r/" + subreddit + "/top/.json?t=day&limit=10";
      axios.get(url,{
        headers: { 'Client-ID': config.redditClientId}
      }).then(response => {
        const dataArray = response.data.data.children;
        for (const item of dataArray) {
          if (item.data.secure_media) {
            const imgUri = gfycatContructor(item.data.secure_media.oembed.thumbnail_url);
            console.log("fetch img : " + imgUri);
            message.channel.send(imgUri);
            console.log("image posted");
            break;
          } else if (item.data.media){
            const imgUri = gfycatContructor(item.data.media.oembed.thumbnail_url);
            console.log("fetch img : " + imgUri);
            message.channel.send(imgUri);
            console.log("image posted");
            break;
          }
        }
      })
      .catch(error => {
        console.log(error);
      });

}

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.author.username != config.username) return;
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).split(/!+/);
  const command = args.shift().toLowerCase();
  
  if (command === 'k') {
    if (message.channel.name === config.channelToPost) {
      console.log("schedule started");
      j = schedule.scheduleJob('spamDiscord', config.timeRule, () => {
        replyTopGifFromSubreddit(config.subreddit, message);
      });
    }
  } else if (command === 's') {
    if (message.channel.name === config.channelToPost) {
      const jobNames = _.keys(schedule.scheduledJobs);
      for(let name of jobNames) schedule.cancelJob(name);
      console.log("schedule stopped");
    }
	}
});

client.login(config.token);

//TODO embed message, clean codebase, make it more robust (support x-post etc)
