const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const TOKEN = "MTQ2OTc4OTYxNTYzNTMwMDM1Mg.GeVphA.FHEdYwYilgroPRHpZdjyU9OFKRbJVng4fc9pLU";
const OWNER_ID = "1468409531326402651";

let invitesCache = new Map();

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Cache invites for each guild
  client.guilds.cache.forEach(async guild => {
    const invites = await guild.invites.fetch();
    invitesCache.set(guild.id, invites);
  });
});

// When someone joins
client.on("guildMemberAdd", async member => {
  const oldInvites = invitesCache.get(member.guild.id);
  const newInvites = await member.guild.invites.fetch();

  invitesCache.set(member.guild.id, newInvites);

  let usedInvite = null;

  newInvites.forEach(invite => {
    const old = oldInvites.get(invite.code);
    if (old && invite.uses > old.uses) {
      usedInvite = invite;
    }
  });

  const owner = await client.users.fetch(OWNER_ID);

  if (usedInvite) {
    owner.send(
      `👤 **New Member Joined**\n` +
      `User: ${member.user.tag}\n` +
      `Invited by: ${usedInvite.inviter.tag}\n` +
      `Invite Code: ${usedInvite.code}`
    );
  } else {
    owner.send(
      `👤 **New Member Joined**\n` +
      `User: ${member.user.tag}\n` +
      `Invite: Unknown (maybe vanity or expired)`
    );
  }
});

client.login(TOKEN);

