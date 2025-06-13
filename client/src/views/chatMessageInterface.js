const readline = require('readline');
const io = require('socket.io-client');
const exitApp = require('../menu/exitApp');
const getMenuOption = require('./getMenuOption');
const render = require('./renderInterface');
const getToken = require('../auth/getToken');
const attachEvents = require('../../attachEvents');
require('dotenv').config();

function chatMessageInterface(client, chatRoom) {
  console.info('----------------------------------------------');
  console.info('Press -h to go Home.');
  console.info('Press -e to Exit.');
  console.info('----------------------------------------------');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let clientUsername;

  
  client.on('username', (username) => {
    clientUsername = username;
  });

  rl.on('line', async (input) => {
    const message = input.trim();
    if (message === '-e') {
      rl.close(); 
      exitApp();
    } else if (message === '-h') {
      
      if (!clientUsername) {
        console.log('Waiting for username...');
        return;
      }

      const token = await getToken(clientUsername);
      client.disconnect();

      
      const newClient = io(process.env.BACKEND_URL, {
        auth: {
          token
        }
      });

      
      attachEvents(newClient);

      
      const homeOption = await getMenuOption();

      
      const chatRoom = await render[homeOption](newClient);

      
      chatMessageInterface(newClient, chatRoom);
    }
    client.emit('chat message', chatRoom, message);
  });
}


module.exports = chatMessageInterface;