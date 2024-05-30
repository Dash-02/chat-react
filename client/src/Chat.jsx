import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function Chat() {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState('');
    const [room, setRoom] = useState('');
    const [messages, setMessages] = useState([]);

    const messageInputRef = useRef(null);
    const roomInputRef = useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        
        newSocket.on('connect', () => {
            displayMessage(`You connected with id: ${newSocket.id}`);
        });

        newSocket.on('receive-message', (message) => {
            displayMessage(message);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const displayMessage = (message) => {
        setMessages(prevMessages => [...prevMessages, message]);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const message = messageInputRef.current.value;
        const room = roomInputRef.current.value;

        if (message === '') return;

        displayMessage(message);

        if (socket) {
            socket.emit('send-message', message, room);
        }

        setMessage('');
    };

    const handleJoinRoom = () => {
        const room = roomInputRef.current.value;

        if (room && socket) {
            socket.emit('join-room', room);
            displayMessage(`Joined room: ${room}`);
        }
    };

    return (
        <div>
            <div>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
            <form id="form" onSubmit={handleFormSubmit}>
                <div>
                    <span>Message</span>
                    <input 
                        type="text" 
                        id="message-input" 
                        ref={messageInputRef} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit">Send</button>
                </div>
            </form>
            <div>
                <span>Room</span>
                <input type="text" id="room-input" ref={roomInputRef} />
                <button onClick={handleJoinRoom}>Join</button>
            </div>
        </div>
    );
}

export default Chat;
