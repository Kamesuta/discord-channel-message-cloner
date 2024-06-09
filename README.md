[English](README.md) | [日本語](README_ja.md)

# Discord Channel Message Cloner

This is a tool to clone an entire Discord channel.
- It copies all the messages within the channel.
  - The channel itself is not copied. Please use Discord's features to duplicate it.
- The names and icons of the message senders are pseudo-copied. (Using webhooks)
- It is also possible to clone into forum threads.

![スクリーンショット](./assets/clone_channel_messages.png)

## Required Permissions

- Message Content Intent is required to retrieve messages.
- Webhook creation permission is required on the server to use webhooks.

## Usage

1. Copy `.env.sample` and save it as `.env`.
2. Replace the `DISCORD_TOKEN` in `.env` with your own bot token.
3. Install dependencies with `npm install`.
4. Start the cloning process with `npm run start <source channel ID> <destination channel ID>`.

## Limitations

- Information such as threads and reactions cannot be copied.
- Due to limitations of the Webhook API, reply information is not preserved.
- Special messages such as user join messages or boost messages cannot be copied.
- Message posting timestamps are not copied.

## License

This project is released under the MIT license. For more information, see [LICENSE](LICENSE).
