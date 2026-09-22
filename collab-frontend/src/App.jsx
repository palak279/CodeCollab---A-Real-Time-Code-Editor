import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const CURSOR_COLORS = ['#e06c75', '#98c379', '#61afef', '#e5c07b', '#c678dd', '#56b6c2'];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function App() {
  const [roomCode, setRoomCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [content, setContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const usernameRef = useRef('User' + Math.floor(Math.random() * 1000));
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const remoteCursors = useRef({});
  const stompClientRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const lastSentContent = useRef('');

  const joinRoom = async () => {
    const response = await fetch(`http://localhost:8080/rooms/code/${roomCode}`);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    setContent(data ? (data.content || '') : '');
    setJoined(true);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('STOMP CONNECTED SUCCESSFULLY');

        client.subscribe(`/topic/room/${roomCode}/cursor`, (message) => {
          const cursor = JSON.parse(message.body);
          console.log('CURSOR RECEIVED', cursor);
          renderRemoteCursor(cursor);
        });

        client.subscribe(`/topic/room/${roomCode}`, (message) => {
          const body = JSON.parse(message.body);
          if (body.content === lastSentContent.current) {
            return;
          }
          isRemoteUpdate.current = true;
          setContent(body.content);
        });

        client.subscribe(`/topic/room/${roomCode}/presence`, (message) => {
          const users = JSON.parse(message.body);
          setOnlineUsers(users);
        });

        client.publish({
          destination: '/app/join',
          body: JSON.stringify({ roomCode: roomCode, username: usernameRef.current }),
        });
      },
      onStompError: (frame) => {
        console.log('STOMP ERROR', frame);
      },
      onWebSocketError: (event) => {
        console.log('WEBSOCKET ERROR', event);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const handleEditorChange = async (value) => {
    setContent(value);

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      lastSentContent.current = value;
      stompClientRef.current.publish({
        destination: '/app/edit',
        body: JSON.stringify({ roomCode: roomCode, content: value }),
      });
    }

    await fetch(`http://localhost:8080/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: roomCode, content: value }),
    });
  };

  const renderRemoteCursor = (cursor) => {
    console.log('RENDER CURSOR CALLED', cursor, editorRef.current, monacoRef.current);
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance || cursor.username === usernameRef.current) return;

    const { username, lineNumber, column } = cursor;
    const colorIndex = hashCode(username) % CURSOR_COLORS.length;
    const existing = remoteCursors.current[username];

    const range = new monacoInstance.Range(lineNumber, column, lineNumber, column);
    const decorationIds = editor.deltaDecorations(existing ? existing.decorationIds : [], [
      {
        range,
        options: { className: `remote-cursor-${colorIndex}` },
      },
    ]);

    let widget = existing ? existing.widget : null;
    let domNode = existing ? existing.domNode : null;

    if (!widget) {
      domNode = document.createElement('div');
      domNode.className = 'remote-cursor-label';
      domNode.style.backgroundColor = CURSOR_COLORS[colorIndex];
      domNode.textContent = username;

      widget = {
        position: { lineNumber, column },
        getId: () => `cursor-widget-${username}`,
        getDomNode: () => domNode,
        getPosition: function () {
          return {
            position: this.position,
            preference: [monacoInstance.editor.ContentWidgetPositionPreference.ABOVE],
          };
        },
      };
      editor.addContentWidget(widget);
    } else {
      widget.position = { lineNumber, column };
      editor.layoutContentWidget(widget);
    }

    remoteCursors.current[username] = { decorationIds, widget, domNode };
  };

  if (!joined) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2>Enter a room code</h2>
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="e.g. ABC123"
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button onClick={joinRoom} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ padding: '0.5rem 1rem', background: '#282a3a', color: '#fff', fontSize: '0.85rem' }}>
        Online: {onlineUsers.join(', ')}
      </div>
      <Editor
        height="calc(100% - 40px)"
        defaultLanguage="javascript"
        value={content}
        onChange={handleEditorChange}
        onMount={(editor, monacoInstance) => {
          editorRef.current = editor;
          monacoRef.current = monacoInstance;
          editor.onDidChangeCursorPosition((e) => {
            console.log('CURSOR MOVED', e.position);
            if (stompClientRef.current && stompClientRef.current.connected) {
              stompClientRef.current.publish({
                destination: '/app/cursor',
                body: JSON.stringify({
                  roomCode: roomCode,
                  username: usernameRef.current,
                  lineNumber: e.position.lineNumber,
                  column: e.position.column,
                }),
              });
            }
          });
        }}
        theme="vs-dark"
      />
    </div>
  );
}

export default App;