const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send Spunkcoins to another user.')
        .addUserOption(option => option.setName('user').setDescription('Recipient').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Amount').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const senderId = interaction.user.id;

        if (amount <= 0) {
            return interaction.reply({ content: 'Please enter a positive number of Spunkcoins.', ephemeral: true });
        }

        const sender = db.prepare('SELECT balance FROM balances WHERE userId = ?').get(senderId);
        if (!sender || sender.balance < amount) {
            return interaction.reply({ content: 'Insufficient balance.', ephemeral: true });
        }

        db.prepare('UPDATE balances SET balance = balance - ? WHERE userId = ?').run(amount, senderId);
        const recipient = db.prepare('SELECT balance FROM balances WHERE userId = ?').get(target.id);
        const newBalance = (recipient?.balance ?? 0) + amount;
        db.prepare('INSERT OR REPLACE INTO balances (userId, balance) VALUES (?, ?)').run(target.id, newBalance);

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Transaction Successful 🎉')
            .setDescription(`${interaction.user} has sent ${amount} Spunkcoins to <@${target.id}>!`)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
