const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily reward of 100 Spunkcoins, available every 24 hours.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const row = db.prepare(`SELECT lastClaimed FROM balances WHERE userId = ?`).get(userId);
        const timePassed = Date.now() - (row ? row.lastClaimed : 0);

        if (timePassed >= 24 * 60 * 60 * 1000) {
            const currentBalance = db.prepare(`SELECT balance FROM balances WHERE userId = ?`).get(userId)?.balance ?? 0;
            db.prepare(`INSERT OR REPLACE INTO balances (userId, balance, lastClaimed) VALUES (?, ?, ?)`)
              .run(userId, currentBalance + 100, Date.now());

            return interaction.reply('You have collected your daily reward of 100 Spunkcoins!');
        } else {
            return interaction.reply('You need to wait 24 hours between collections.');
        }
    }
};
