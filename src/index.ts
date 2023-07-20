import express from "express";
import { Bot, Context, SessionFlavor, session, webhookCallback } from "grammy";
import dotenv from "dotenv";
import { baixarCommand } from "./commands/baixarCommand";
import axios from "axios";
import qs from "qs";
import { uploadDirectory } from "./uploadFiles";

const {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode,
} = require("simple-oauth2");

//dotenv.config();

interface SessionData {
  started?: boolean;
  command?: string;
  pizzaCount?: number;
}

export type MyContext = SessionFlavor<SessionData> & Context;

// BOT INITIALIZATION
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN || "");

// SESSION INITIALIZATION
function initial(): SessionData {
  return { started: false };
}

bot.use(session({ initial }));

// BOT COMMANDS
const botCommands = [
  { command: "ola", description: "Be greeted by the bot" },
  { command: "baixar", description: "Baixar uma ou várias músicas" },
];

bot.api.setMyCommands(botCommands);

// COMMAND HANDLERS
bot.command("start", (ctx) => ctx.reply(introductionMessage));
bot.command("ola", (ctx) => ctx.reply(`Olá ${ctx.from?.username}`));
bot.command("baixar", handleBaixarCommand);
bot.on("message", handleMessages);
bot.catch(async (err) => console.error(`Ocorreu um erro: ${err}`));

// HANDLERS FUNCTIONS
function handleBaixarCommand(ctx: MyContext) {
  console.log('Received command "baixar"');
  ctx.reply("Mande um ou vários links do YouTube.");
  ctx.session.command = "baixar";
}

async function handleMessages(ctx: MyContext) {
  console.log("Received a message");
  console.log(ctx.session);

  if (ctx.session.command === "baixar") {
    await baixarCommand(ctx);
  } else if (ctx.session.command !== "baixar") {
    replyWithIntro(ctx);
  }
}

function replyWithIntro(ctx: MyContext) {
  ctx.reply(introductionMessage);
}

// BOT STARTUP
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}

// MESSAGE DEFINITIONS
const introductionMessage = `Aqui estão todos os comandos disponíveis:
- /baixar: Baixar músicas a partir de URLs do YouTube`;

export let tokenResponseToken: any;

// function getCredentials() {
//   return new Promise<string>((resolve, reject) => {
//     const clientId = "48f36d66-7f4e-4c57-9468-d9a2f7aa2766";
//     const redirectUri = "http://localhost:3000/auth/redirect";

//     // Route to start the auth process and redirect user to Microsoft's OAuth URL
//     app.get("/auth", (req, res) => {
//       const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&scope=files.readwrite%20offline_access&response_type=code&redirect_uri=${redirectUri}`;
//       res.redirect(authUrl);
//     });

//     // Route to handle redirect from Microsoft and to exchange the received code for an access token
//     app.get("/auth/redirect", async (req, res) => {
//       const code = req.query.code as string;

//       if (code) {
//         const body = qs.stringify({
//           client_id: clientId,
//           redirect_uri: redirectUri,
//           code: code,
//           grant_type: "authorization_code",
//           client_secret: "6l38Q~9d8_dyXICm5UJSXY~4jh92_Ce09tKB3bW8",
//         });

//         try {
//           const tokenResponse: any = await axios.post(
//             "https://login.microsoftonline.com/common/oauth2/v2.0/token",
//             body,
//             {
//               headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//               },
//             }
//           );

//           console.log("Refresh token: ", tokenResponse.data.refresh_token);
//           res.status(200).send("Token received, check console");
//           resolve(tokenResponse.data.access_token);
//         } catch (error) {
//           console.error(error);
//           res.status(500).send("Error during token fetching");
//           reject(error);
//         }
//       } else {
//         res.status(400).send("No code provided");
//       }
//     });
//   });
// }

// // async function uploadFiles() {
// //   try {
// //     const creds = await getCredentials();
// //     console.log(creds);
// //     await uploadDirectory(creds);
// //     console.log("Upload completed");
// //   } catch (error) {
// //     console.error("Error uploading files", error);
// //   }
// // }

// // uploadFiles();
