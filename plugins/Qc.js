const axios = require('axios')
const { writeFileSync } = require('fs-extra')
const { bot, sticker } = require('../lib/')

bot(
  {
    pattern: 'qc ?(.*)',
    fromMe: true,
    desc: 'Generate a sticker with a custom quote',
    type: 'sticker',
  },
  async (message, match) => {
    try {
      if (!match) return await message.send('Usage: .qc Hi! ; name')
      const [text, name] = match.split(';')
      if (text.length > 35) return await message.send(' Max 35 characters.')

      let pp =
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

      try {
        pp = await message.profilePictureUrl(
          (message.reply_message && message.reply_message.jid) || message.participant
        )
      } catch {}

      const obj = {
        type: 'quote',
        format: 'png',
        backgroundColor: '#FFFFFF',
        width: 512,
        height: 512,
        scale: 2,
        messages: [
          {
            avatar: true,
            from: {
              name: name || message.pushName,
              photo: { url: pp },
            },
            text,
            replyMessage: {},
          },
        ],
      }

      const response = await axios.post('https://bot.lyo.su/quote/generate', obj, {
        headers: { 'Content-Type': 'application/json' },
      })
      const img = Buffer.from(response.data.result.image, 'base64')
      writeFileSync('qc.png', img)
      const str = await sticker('qc', 'qc.png')
      await message.send(str, {}, 'sticker')
    } catch (e) {
      await message.send("Can't generate sticker.")
    }
  }
)
