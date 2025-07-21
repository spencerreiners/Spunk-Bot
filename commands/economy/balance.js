const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays your current balance and time until next daily reward.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose balance you want to see')
                .setRequired(false)
        ),
    async execute(interaction) {
        const targetMember = interaction.options.getMember('user') || interaction.member;
        const row = db.prepare('SELECT balance, lastClaimed FROM balances WHERE userId = ?').get(targetMember.user.id);

        if (!row) {
            return interaction.reply({
                content: `${targetMember.id === interaction.user.id ? "You don't" : `${targetMember.displayName} doesn't`} have an account yet. Use /collect to start one.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('💰 Balance Information')
            .setDescription(`${targetMember.id === interaction.user.id ? 'Your' : `${targetMember.displayName}'s`} balance is ${row.balance} Spunkcoins.`)
            .setTimestamp();

        if (!interaction.options.getMember('user')) {
            const timePassed = Date.now() - row.lastClaimed;
            const timeLeft = 86400000 - timePassed;
            const readable = timeLeft > 0 ? `${Math.round(timeLeft / (60 * 60 * 1000))} hours` : 'now!';
            embed.addFields({ name: 'Next Daily Reward', value: `You can collect your daily reward in ${readable}.` });
        }

        interaction.reply({ embeds: [embed] });
    }
};
