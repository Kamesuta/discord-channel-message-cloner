import {
  Webhook,
  NonThreadGuildBasedChannel,
  ThreadChannel,
  GuildTextBasedChannel,
} from 'discord.js';
import { client } from './index.js';

/**
 * Webhookを取得/作成します
 * @param targetChannel Webhookを取得/作成するチャンネル
 * @returns Webhookのチャンネルとスレッド
 */
export default async function getWebhook(
  targetChannel: GuildTextBasedChannel,
): Promise<{
  webhook: Webhook;
  channel: NonThreadGuildBasedChannel;
  thread: ThreadChannel | undefined;
}> {
  // Webhook送信系の処理
  let channel: NonThreadGuildBasedChannel;
  let thread: ThreadChannel | undefined;
  if (targetChannel.isThread()) {
    if (!targetChannel.parent) {
      throw '親チャンネルが見つかりませんでした';
    }
    channel = targetChannel.parent;
    thread = targetChannel;
  } else {
    channel = targetChannel;
  }

  // Webhookを取得
  const webhooks = await channel.fetchWebhooks().catch((error) => {
    throw new Error('Webhookの取得に失敗しました:', error);
  });
  if (!webhooks) {
    throw 'Webhookの取得に失敗しました。権限を確認してください';
  }
  // 自身のWebhookを取得
  let webhook = webhooks.find(
    (webhook) => webhook.owner?.id === client.user?.id,
  );
  // Webhookがない場合は作成
  if (!webhook) {
    webhook = await channel
      .createWebhook({
        name: 'イベント通知用',
        avatar: client.user?.displayAvatarURL(),
      })
      .catch((error) => {
        throw new Error('Webhookの作成に失敗しました:', error);
      });
    if (!webhook) {
      throw 'Webhookの作成に失敗しました';
    }
  }
  return { webhook, channel, thread };
}
