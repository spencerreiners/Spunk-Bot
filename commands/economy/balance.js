const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays your current balance and time until next daily reward.'),
    async execute(interaction) {
        db.get(`SELECT balance, lastClaimed FROM balances WHERE userId = ?`, [interaction.user.id], (err, row) => {
            if (err) {
                console.error('Database error:', err.message); // Log the error message to your console
                return interaction.reply('Error retrieving your balance.');
            }
            if (row) {
                const lastClaimed = row.lastClaimed;
                const timePassed = Date.now() - lastClaimed;
                const timeLeft = 24 * 60 * 60 * 1000 - timePassed; // 24 hours in milliseconds
                const readableTime = timeLeft > 0 ? `${Math.round(timeLeft / (60 * 60 * 1000))} hours` : 'now!';
                interaction.reply(`Your balance is ${row.balance} Spunkcoins. You can collect your daily reward in ${readableTime}.`);
            } else {
                interaction.reply("You don't have an account yet. Use /collect to start your account.");
            }
        });
    }
};
