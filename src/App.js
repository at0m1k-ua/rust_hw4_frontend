import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [currentRoom, setCurrentRoom] = useState('');
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState('');
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
            fetchRooms();
        } else {
            alert('Login failed.');
        }
    };

    const fetchRooms = async () => {
        const response = await fetch('http://127.0.0.1:8080/list_rooms');
        if (response.ok) {
            const roomList = await response.json();
            setRooms(roomList);
        }
    };

    const createRoom = async () => {
        const response = await fetch('http://127.0.0.1:8080/create_room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newRoomName, creator: username }),
        });
        if (response.ok) {
            alert('Room created successfully!');
            setNewRoomName('');
            fetchRooms();
        } else {
            alert('Failed to create room.');
        }
    };

    const addUserToRoom = async (roomId) => {
        const response = await fetch('http://127.0.0.1:8080/add_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room_id: roomId, username }),
        });
        if (response.ok) {
            alert('User added to room successfully!');
        } else {
            alert('Failed to add user to room.');
        }
    };

    const joinRoom = (roomId) => {
        setCurrentRoom(roomId);
        connectWebSocket(roomId);
    };

    const connectWebSocket = (roomId) => {
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            socket.close();
        }

        const ws = new WebSocket(`ws://127.0.0.1:8080/ws/?roomId=${roomId}`);
        setSocket(ws);

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setChat((prevChat) => [...prevChat, data.message]);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error', error);
        };
    };

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ roomId: currentRoom, message }));
            setMessage('');
        } else {
            alert('Connection is not open. Please reconnect.');
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
                    <h2>Rooms</h2>
                    <div>
                        <input
                            type="text"
                            placeholder="New room name"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                        />
                        <button onClick={createRoom}>Create Room</button>
                    </div>
                    <ul>
                        {rooms.map((room) => (
                            <li key={room.id}>
                                {room.name}{' '}
                                <button onClick={() => joinRoom(room.id)}>Join</button>
                                <button onClick={() => addUserToRoom(room.id)}>Add Me</button>
                            </li>
                        ))}
                    </ul>
                    {currentRoom && (
                        <div>
                            <h2>Chat in {currentRoom}</h2>
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
            )}
        </div>
    );
}

export default App;
