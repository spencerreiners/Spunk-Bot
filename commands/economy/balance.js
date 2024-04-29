const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays your current balance and time until next daily reward.')
        .addUserOption(option => option.setName('user').setDescription('The user whose balance you want to see').setRequired(false)),
    async execute(interaction) {
        // Fetch the member from the interaction, not just the user
        const targetMember = interaction.options.getMember('user') || interaction.member;

        db.get(`SELECT balance, lastClaimed FROM balances WHERE userId = ?`, [targetMember.user.id], (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return interaction.reply({ content: 'Error retrieving the balance.', ephemeral: true });
            }
            if (row) {
                // Use display name from the GuildMember object
                const balanceDescription = `${targetMember.id === interaction.user.id ? 'Your' : `${targetMember.displayName}'s`} balance is ${row.balance} Spunkcoins.`;

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF) // You can change the color to match your theme
                    .setTitle('💰 Balance Information')
                    .setDescription(balanceDescription)
                    .setTimestamp();

                if (!interaction.options.getMember('user')) {
                    const lastClaimed = row.lastClaimed;
                    const timePassed = Date.now() - lastClaimed;
                    const timeLeft = 24 * 60 * 60 * 1000 - timePassed; // 24 hours in milliseconds
                    const readableTime = timeLeft > 0 ? `${Math.round(timeLeft / (60 * 60 * 1000))} hours` : 'now!';
                    embed.addFields({ name: 'Next Daily Reward', value: `You can collect your daily reward in ${readableTime}.`, inline: false });
                }

                interaction.reply({ embeds: [embed] });
            } else {
                interaction.reply({ content: `${targetMember.id === interaction.user.id ? 'You don\'t' : `${targetMember.displayName} doesn't`} have an account yet. Use /collect to start an account.`, ephemeral: true });
            }
        });
    }
};
