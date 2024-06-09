import { logger } from './utils/log.js';
import { nowait } from './utils/utils.js';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { cloneChannel } from './cloner.js';

// .envファイルを読み込む
dotenv.config();

// 引数を取得
const [srcChannelId, dstChannelId, continueMessageId] = process.argv.slice(2);

/**
 * Discord Client
 */
export const client: Client = new Client({
  // Botで使うGetwayIntents、partials
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// -----------------------------------------------------------------------------------------------------------
// イベントハンドラーを登録する
// -----------------------------------------------------------------------------------------------------------
client.on(
  Events.ClientReady,
  nowait(async () => {
    logger.info(`${client.user?.username ?? 'Unknown'} として起動しました!`);

    try {
      // チャンネル取得
      const srcChannel = srcChannelId
        ? await client.channels.fetch(srcChannelId)
        : undefined;
      if (!srcChannel?.isTextBased()) {
        console.info('使用方法: npm run start <srcChannelId> <dstChannelId>');
        throw 'srcChannelが見つらないか、テキストチャンネルではありません';
      }
      const dstChannel = dstChannelId
        ? await client.channels.fetch(dstChannelId)
        : undefined;
      if (!dstChannel?.isTextBased() || dstChannel.isDMBased()) {
        console.info('使用方法: npm run start <srcChannelId> <dstChannelId>');
        throw 'dstChannelが見つらないか、テキストチャンネルではありません';
      }

      // 処理を開始
      await cloneChannel(srcChannel, dstChannel, continueMessageId);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info('処理が完了しました');
    process.exit(0);
  }),
);

// Discordにログインする
await client.login(process.env.DISCORD_TOKEN);
