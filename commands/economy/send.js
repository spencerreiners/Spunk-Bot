const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send Spunkcoins to another user.')
        .addUserOption(option => option.setName('user').setDescription('The user to send Spunkcoins to').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of Spunkcoins to send').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        if (amount <= 0) {
            return interaction.reply('Please enter a positive number of Spunkcoins.');
        }

        db.get(`SELECT balance FROM balances WHERE userId = ?`, [interaction.user.id], (err, row) => {
            if (err) {
                return interaction.reply('Error retrieving your balance.');
            }
            if (row && row.balance >= amount) {
                db.run(`UPDATE balances SET balance = balance - ? WHERE userId = ?`, [amount, interaction.user.id], (err) => {
                    if (err) {
                        return interaction.reply('Error sending Spunkcoins.');
                    }
                    db.run(`INSERT OR REPLACE INTO balances (userId, balance) VALUES (?, COALESCE((SELECT balance FROM balances WHERE userId = ?), 0) + ?)`, [target.id, target.id, amount], (err) => {
                        if (err) {
                            return interaction.reply('Error updating recipient\'s balance.');
                        }
                        interaction.reply(`You have sent ${amount} Spunkcoins to ${target.id}.`);
                    });
                });
            } else {
                interaction.reply('Insufficient balance.');
            }
        });
    }
};