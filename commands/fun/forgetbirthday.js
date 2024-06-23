const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../../setup-database'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forgetbirthday')
        .setDescription('Forgets your birthday'),
    async execute(interaction) {
        const userId = interaction.user.id;

        db.run('DELETE FROM birthdays WHERE userId = ?', [userId], function(err) {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'Failed to forget your birthday.', ephemeral: true });
            }
            interaction.reply({ content: 'Your birthday has been forgotten.', ephemeral: true });
        });
    },
};
