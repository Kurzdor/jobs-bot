const debug = require('debug')('jobs-bot:publishVacancy');
const config = require('config');

const bot = require('../bot');
const {
  isVacancy, isChatAdmin, isKeyword, isReply,
} = require('../validators');

const keywords = new Set(['канал', 'в канал']);

const formatAnnonce = (messageId, channel, { userId, userFirstName, username }) => {
  const channelName = channel.replace('@', '');
  const escapedChannelName = channelName.replace(/_/g, '\\_');
  const vacancyLink = `[вакансия](https://t.me/${channelName}/${messageId})`;
  const user = username ? `@${username}` : `[${userFirstName}](tg://user?id=${userId})`;

  return ` 🏌️ В канал @${escapedChannelName} опубликована ${vacancyLink} от ${user}`;
};

const formatVacancy = (txt, channel) => `
${txt}

—

👉 Обсуждение вакансии в чате ${channel}
`;

async function publish(msg) {
  const { channel } = config.get(msg.chat.username);

  debug('publish', msg, channel);

  const commandMessageId = msg.message_id;
  const vacancyMessageId = msg.reply_to_message.message_id;

  // send to channel
  const channelMessage = formatVacancy(msg.reply_to_message.text, channel);
  const { message_id: channelMessageId } = await bot.sendMessage(channel, channelMessage);
  debug('publish:channelMessage', channelMessage);
  debug('publish:channelMessageId', channelMessageId);

  // send link from channel to chat
  const { id: userId, first_name: userFirstName, username } = msg.reply_to_message.from;
  const replyMessage = formatAnnonce(channelMessageId, channel, {
    userId,
    userFirstName,
    username,
  });

  const { message_id: chatMessageId } = await bot.sendMessage(msg.chat.id, replyMessage, {
    parse_mode: 'Markdown',
  });

  debug('publish:replyMessage', replyMessage);
  debug('publish:chatMessageId', chatMessageId);

  // delete messages
  await bot.deleteMessage(msg.chat.id, commandMessageId);
  await bot.deleteMessage(msg.chat.id, vacancyMessageId);
}

async function handler(msg) {
  try {
    if (isReply(msg) && isVacancy(msg) && isKeyword(msg, keywords) && isChatAdmin(msg)) {
      await publish(msg);
    }
  } catch (err) {
    debug('handler:error', err, msg);
  }
}

module.exports = handler;
