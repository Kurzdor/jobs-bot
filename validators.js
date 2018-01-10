const admins = require("./admins").admins;
const channelId = require("./init").channelId;

const isReply = msg => msg.reply_to_message != null;

const isKeyword = (msg, keywords) =>
  !!msg.text && keywords.has(msg.text.toLowerCase());

const isChatAdmin = (msg, chatId) =>
  admins.has(chatId) && admins.get(chatId).has(msg.from.id);

const isChannelAdmin = msg =>
  admins.has(channelId()) && admins.get(channelId()).has(msg.from.id);

const hasHashtag = (msg, hashtag) =>
  !!msg.reply_to_message.text && msg.reply_to_message.text.includes(hashtag);

const isVacancy = msg => hasHashtag(msg, "#вакансия");
const isCV = msg => hasHashtag(msg, "#резюме");

module.exports.isReply = isReply;
module.exports.isKeyword = isKeyword;
module.exports.isChatAdmin = isChatAdmin;
module.exports.isChannelAdmin = isChannelAdmin;
module.exports.hasHashtag = hasHashtag;
module.exports.isVacancy = isVacancy;
module.exports.isCV = isCV;
