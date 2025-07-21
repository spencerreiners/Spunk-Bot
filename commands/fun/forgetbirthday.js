const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forgetbirthday')
        .setDescription('Deletes your saved birthday.'),
    async execute(interaction) {
        db.prepare('DELETE FROM birthdays WHERE userId = ?').run(interaction.user.id);
        interaction.reply({ content: 'Your birthday has been forgotten.', ephemeral: true });
    }
};
