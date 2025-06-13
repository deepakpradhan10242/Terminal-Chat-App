
const { Command } = require('commander');
const io = require('socket.io-client');
require ('dotenv').config();

const getAuthOption = require('./src/views/getAuthOption');
const getMenuOption = require('./src/views/getMenuOption');
const chatMessageInterface = require('./src/views/chatMessageInterface');
const render = require('./src/views/renderInterface');
const attachEvents = require('./attachEvents');

const program = new Command();

program.version('1.0.0').description('Terminal Chat App');


program
  .description('Starts the Terminal chat app')
  .command('start').action(async () => {
    
    const authOption = await getAuthOption();

    
    const token = await render[authOption]();

    if (!token) {
      console.info('Authentication Error!');
      process.exit(1);
    }

    
    const client = io(process.env.BACKEND_URL, {
      auth: {
        token
      }
    });

    
    attachEvents(client);

    
    const homeOption = await getMenuOption();

    
    const chatRoom = await render[homeOption](client);

    
    chatMessageInterface(client, chatRoom);
  }
  );

program.parse(process.argv);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});