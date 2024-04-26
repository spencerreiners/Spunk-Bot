const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays your current balance and time until next daily reward.')
        .addUserOption(option => option.setName('user').setDescription('The user whose balance you want to see').setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        db.get(`SELECT balance, lastClaimed FROM balances WHERE userId = ?`, [targetUser.id], (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return interaction.reply('Error retrieving the balance.');
            }
            if (row) {
                const balanceInfo = `${targetUser.id === interaction.user.id ? 'Your' : `${targetUser.username}'s`} balance is ${row.balance} Spunkcoins.`;
                if (!interaction.options.getUser('user')) {
                    const lastClaimed = row.lastClaimed;
                    const timePassed = Date.now() - lastClaimed;
                    const timeLeft = 24 * 60 * 60 * 1000 - timePassed; // 24 hours in milliseconds
                    const readableTime = timeLeft > 0 ? `${Math.round(timeLeft / (60 * 60 * 1000))} hours` : 'now!';
                    interaction.reply(`${balanceInfo} You can collect the daily reward in ${readableTime}.`);
                } else {
                    interaction.reply(balanceInfo);
                }
            } else {
                interaction.reply(`${targetUser.id === interaction.user.id ? 'You don\'t' : `${targetUser.username} doesn't`} have an account yet. Use /collect to start an account.`);
            }
        });
    }
};