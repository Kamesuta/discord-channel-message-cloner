import {
  DiscordAPIError,
  FetchMessagesOptions,
  GuildTextBasedChannel,
  TextBasedChannel,
} from 'discord.js';
import getWebhook from './getWebhook.js';

/**
 * チャンネルをコピーします
 * @param srcChannel 元のチャンネル
 * @param dstChannel コピー先のチャンネル
 * @param continueMessageId 続きのメッセージID
 */
export async function cloneChannel(
  srcChannel: TextBasedChannel,
  dstChannel: GuildTextBasedChannel,
  continueMessageId?: string,
) {
  // 書き込み先のWebhookを取得
  const webhook = await getWebhook(dstChannel);

  // メッセージをすべて舐める
  const LIMIT = 100;
  const options: FetchMessagesOptions = {
    limit: LIMIT,
    after: continueMessageId ?? '0',
  };
  while (true) {
    // 100件取得 新しい→古い 順に並んでいる
    const fetchedMessages = await srcChannel.messages.fetch(options);

    // 最後(新しい方の)のメッセージが取得できない場合、終了
    const lastMessage = fetchedMessages.first();
    if (!lastMessage) {
      break;
    }

    // Webhookでメッセージをクローン
    for (const message of fetchedMessages.reverse().values()) {
      // メッセージが空の場合、Embedも添付ファイルもない場合、コンポーネントもない場合はスキップ (ユーザー参加通知など)
      if (
        message.content === '' &&
        message.embeds.length === 0 &&
        message.attachments.size === 0 &&
        message.components.length === 0
      ) {
        continue;
      }

      // メンバーを取得
      const member =
        message.member ??
        (await message.guild?.members
          .fetch(message.author.id)
          .catch(() => undefined)) ??
        message.author;

      // メッセージを送信
      await webhook.webhook
        .send({
          content: message.content,
          embeds: message.embeds,
          files: message.attachments.map((attachment) => attachment.url),
          components: message.components,

          username: member.displayName,
          avatarURL: member.displayAvatarURL(),
          threadId: webhook.thread?.id,
          allowedMentions: { users: [] },
        })
        .catch(async (error) => {
          if (error instanceof DiscordAPIError) {
            // 添付ファイルが大きすぎる場合、添付ファイルへのリンクを送信
            if (error.code === 40005 /* Request entity too large */) {
              await webhook.webhook.send({
                content:
                  (message.content ? `${message.content}\n\n` : '') +
                  message.attachments
                    .map((attachment) => attachment.url)
                    .join('\n'),
                embeds: message.embeds,
                components: message.components,

                username: member.displayName,
                avatarURL: member.displayAvatarURL(),
                threadId: webhook.thread?.id,
                allowedMentions: { users: [] },
              });
              return;
            }
          }
          return Promise.reject(error);
        })
        .catch((error) => {
          throw new Error(
            `メッセージ[${message.id}]のコピーの送信に失敗しました:`,
            { cause: error },
          );
        });
    }

    // 次の100件を取得するための設定
    options.after = lastMessage.id;

    // もし100未満のメッセージが取得された場合、もう次のメッセージはない
    if (fetchedMessages.size < LIMIT) {
      break;
    }
  }
}
