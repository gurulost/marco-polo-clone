import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Contacts() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div className="contacts-container">
      <h2>Contacts</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            <Link to={`/chat/${user._id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
