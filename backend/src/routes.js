const express = require('express');
const { uuid } = require('uuidv4')
const routes = express.Router();
require('dotenv').config();

const assistant = require('../watson/client');

routes.post('/message', (req, res) => {
  const { message, conversation, sessionId } = req.body;

  conversation.push(
    {
      author: 'user-message',
      id: uuid(),
      messages: [{
        id: uuid(),
        message
      }]
    }
  );

  const payload = {
    assistantId: process.env.ASSISTANT_ID,
    sessionId: sessionId,
    input: {
      message_type: 'text',
      text: message,
    },
  };

  assistant.message(payload, function(err, data) {
    if (err) {
      const status = err.code !== undefined && err.code > 0 ? err.code : 500;
      return res.status(status).json(err);
    }

    conversation.push(
      {
        author: 'watson-message',
        id: uuid(),
        messages: [{
          id: uuid(),
          message: data.result.output.generic[0].text
        }]
      }
    );

    return res.json(conversation);
  });
});

routes.get('/session', (req, res) => {
    assistant.createSession({
      assistantId: process.env.ASSISTANT_ID
    })
    .then(response => {
      return res.json(response.result);
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = routes;