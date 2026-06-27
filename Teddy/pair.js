const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        const contextInfo = {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363421104812135@newsletter',
                newsletterName: '∆ryan',
                serverMessageId: -1
            }
        };

        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❌ Please provide a valid WhatsApp number.\n\nExample:\n.pair 254712345678",
                contextInfo
            });
        }

        const numbers = q.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number! Please use the correct format.",
                contextInfo
            });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, {
                    text: "❌ That number is not registered on WhatsApp.",
                    contextInfo
                });
            }

            await sock.sendMessage(chatId, {
                text: "⏳ Generating your pairing code, please wait...",
                contextInfo
            });

            try {
                const response = await axios.get(
                    `https://session-id-fc1f69d1fcb5.herokuapp.com/code?number=${number}`
                );

                if (response.data && response.data.code) {
                    const code = response.data.code;

                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }

                    await sleep(5000);

                    await sock.sendMessage(chatId, {
                        text:
`╭━━━〔 *∆RYAN-X PAIRING* 〕━━━⊷
┃
┃ 🔐 Your Pairing Code:
┃ ➜ *${code}*
┃
┃ 📌 Enter this code on
┃ WhatsApp linked devices.
┃
╰━━━━━━━━━━━━━━━━⊷`,
                        contextInfo
                    });

                } else {
                    throw new Error('Invalid response from server');
                }

            } catch (apiError) {
                console.error('API Error:', apiError);

                const errorMessage =
                    apiError.message === 'Service Unavailable'
                        ? "❌ Service is currently unavailable. Please try again later."
                        : "❌ Failed to generate pairing code. Please try again later.";

                await sock.sendMessage(chatId, {
                    text: errorMessage,
                    contextInfo
                });
            }
        }

    } catch (error) {
        console.error(error);

        await sock.sendMessage(chatId, {
            text: "❌ An error occurred while processing your request. Please try again later.",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421104812135@newsletter',
                    newsletterName: 'ARYAN-✓',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = pairCommand;