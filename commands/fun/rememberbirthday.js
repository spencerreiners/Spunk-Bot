const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rememberbirthday')
        .setDescription('Stores your birthday.')
        .addStringOption(option =>
            option.setName('date').setDescription('MM-DD or YYYY-MM-DD').setRequired(true)),
    async execute(interaction) {
        const birthday = interaction.options.getString('date');
        if (!/^(\d{4}-)?\d{2}-\d{2}$/.test(birthday)) {
            return interaction.reply({ content: 'Invalid format. Use MM-DD or YYYY-MM-DD.', ephemeral: true });
        }

        db.prepare('INSERT OR REPLACE INTO birthdays (userId, birthday) VALUES (?, ?)').run(interaction.user.id, birthday);
        interaction.reply({ content: 'Your birthday has been saved!', ephemeral: true });
    }
};
