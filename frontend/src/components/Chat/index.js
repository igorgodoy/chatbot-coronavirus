import React, { useState, useEffect } from 'react';

import api from '../../services/api';
import './style.css';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  var chat = React.useRef();

  useEffect(() => {
    async function createSession() {
      const response = await api.get('/session');

      const { session_id } = response.data;

      localStorage.setItem('SESSION_ID', session_id);
    }

    if (!localStorage.getItem('SESSION_ID'))
      createSession();
  }, []);
  
  async function handleKeyPress(e) {
    if (e.key !== 'Enter' || message.length === 0) {
      return;
    }

    const sessionId = localStorage.getItem('SESSION_ID');

    const data = {
        message,
        conversation,
        sessionId
    };
    

    setMessage(''); // antes da call await na API para limpar o input do usuário mais rapidamente

    const response = await api.post("/message", data);

    setConversation(response.data);

    const shouldScroll = chat.current.scrollTop + chat.current.clientHeight === chat.current.scrollHeight;

    if(!shouldScroll)
      chat.current.scrollTop = chat.current.scrollHeight;
  }

  return (
      <div className="chat-container">
        <div className="chat-header">
          <div className="watson-avatar"><span>W</span></div>
          <div className="watson-informations">
            <span className="name">Watson Assistant</span>
            <span className="description">Peça-me informações sobre o coronavírus</span>
          </div>
        </div>        
        <div className="separator"></div>

        <div className="messages-container" ref={chat}>
          <ul className="watson-message">
            <li>
              Olá! Quais suas perguntas de hoje? Sou treinado para responder qualquer pergunta sobre o coronavírus.
            </li>
          </ul>
          { conversation.length > 0 ? conversation.map(output => (
            <ul key={output.id} className={output.author}>
              {output.messages.map(message => (
                <li key={message.id}>
                  {message.message}
                </li>
              ))}
            </ul>
            )) : (
              <div></div>
            ) }
        </div>

        <div className="chat-box">
          <input onKeyPress={handleKeyPress} onChange={e => setMessage(e.target.value)} value={message} placeholder="Escreva aqui sua mensagem para o Watson" />
        </div>        
      </div>
  )
}