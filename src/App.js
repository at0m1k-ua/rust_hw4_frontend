import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [socket, setSocket] = useState(null);

    const register = async () => {
        const response = await fetch('http://127.0.0.1:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            alert('User registered successfully!');
        } else {
            alert('Registration failed.');
        }
    };

    const login = async () => {
        const response = await fetch('http://127.0.0.1:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            setLoggedIn(true);
            connectWebSocket();
        } else {
            alert('Login failed.');
        }
    };

    const connectWebSocket = () => {
        const ws = new WebSocket('ws://127.0.0.1:8080/ws/');
        setSocket(ws);

        ws.onmessage = (event) => {
            setChat((prevChat) => [...prevChat, event.data]);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };
    };

    const sendMessage = () => {
        if (socket) {
            socket.send(message);
            setMessage('');
        }
    };

    return (
        <div className="App">
            {!loggedIn ? (
                <div>
                    <h2>Register / Login</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={register}>Register</button>
                    <button onClick={login}>Login</button>
                </div>
            ) : (
                <div>
                    <h2>Chat</h2>
                    <div className="chat-box">
                        {chat.map((msg, index) => (
                            <div key={index}>{msg}</div>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
}

export default App;
