const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily reward of 100 Spunkcoins, available every 24 hours.'),
    async execute(interaction) {
        db.get(`SELECT lastClaimed FROM balances WHERE userId = ?`, [interaction.user.id], (err, row) => {
            if (err) {
                return interaction.reply('Error checking your last collection time.');
            }
            const timePassed = Date.now() - (row ? row.lastClaimed : 0);
            if (timePassed >= 24 * 60 * 60 * 1000) { // 24 hours
                db.run(`INSERT OR REPLACE INTO balances (userId, balance, lastClaimed) VALUES (?, COALESCE((SELECT balance FROM balances WHERE userId = ?), 0) + 100, ?)`, [interaction.user.id, interaction.user.id, Date.now()], (err) => {
                    if (err) {
                        return interaction.reply('Error updating your balance.');
                    }
                    interaction.reply('You have collected your daily reward of 100 Spunkcoins!');
                });
            } else {
                interaction.reply('You need to wait 24 hours between collections.');
            }
        });
    }
};