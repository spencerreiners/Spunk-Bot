const { EmbedBuilder } = require('discord.js');
const { db } = require('../setup-database');

const checkBirthdaysDaily = (client) => {
    setInterval(() => {
        const today = new Date().toISOString().slice(5, 10);
        const rows = db.prepare("SELECT userId, birthday FROM birthdays WHERE substr(birthday, 6) = ?").all(today);

        rows.forEach(row => {
            const user = client.users.cache.get(row.userId);
            if (!user) return;
            const year = row.birthday.split('-')[0];
            const age = year.length === 4 ? new Date().getFullYear() - parseInt(year) : "unknown";

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('🎉 Happy Birthday! 🎉')
                .setDescription(`Happy Birthday, ${user.username}! You are ${age} years old today!`);
            user.send({ embeds: [embed] }).catch(console.error);
        });
    }, 86400000);
};

module.exports = { checkBirthdaysDaily };
