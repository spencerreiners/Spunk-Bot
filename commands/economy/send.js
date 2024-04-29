const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send Spunkcoins to another user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to send Spunkcoins to')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Amount of Spunkcoins to send')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (amount <= 0) {
            return interaction.reply({ content: 'Please enter a positive number of Spunkcoins.', ephemeral: true });
        }

        db.get(`SELECT balance FROM balances WHERE userId = ?`, [interaction.user.id], (err, row) => {
            if (err) {
                return interaction.reply({ content: 'Error retrieving your balance.', ephemeral: true });
            }
            if (!row) {
                return interaction.reply({ content: 'Your balance record is missing.', ephemeral: true });
            }
            if (row.balance >= amount) {
                db.run(`UPDATE balances SET balance = balance - ? WHERE userId = ?`, [amount, interaction.user.id], err => {
                    if (err) {
                        return interaction.reply({ content: 'Error sending Spunkcoins.', ephemeral: true });
                    }
                    db.run(`INSERT OR REPLACE INTO balances (userId, balance) VALUES (?, COALESCE((SELECT balance FROM balances WHERE userId = ?), 0) + ?)`, 
                        [target.id, target.id, amount], err => {
                            if (err) {
                                return interaction.reply({ content: 'Error updating recipient\'s balance.', ephemeral: true });
                            }
                            const responseEmbed = new EmbedBuilder()
                                .setColor(0x00AE86) // Set a greenish color for the embed
                                .setTitle('Transaction Successful 🎉')
                                .setDescription(`${interaction.user} has sent ${amount} Spunkcoins to <@${target.id}>!`)
                                .setTimestamp();

                            interaction.reply({ embeds: [responseEmbed] });
                        }
                    );
                });
            } else {
                interaction.reply({ content: 'Insufficient balance.', ephemeral: true });
            }
        });
    }
};
