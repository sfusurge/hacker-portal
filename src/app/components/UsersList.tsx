'use client';
import { ChangeEvent, useState } from 'react';
import { trpc } from '@/trpc/client';
import { EmailUser } from '@/db/schema/emails';

type UsersListProps = {
  selectedUsers: EmailUser[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<EmailUser[]>>;
};

export default function UsersList({
  selectedUsers,
  setSelectedUsers,
}: UsersListProps) {
  const users = trpc.users.getUsers.useQuery().data;
  const updateUser = trpc.users.updateUser.useMutation();
  const deleteUser = trpc.users.deleteUser.useMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    user: EmailUser
  ) => {
    if (event.target.checked) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers(
        selectedUsers.filter((selected: EmailUser) => selected.id !== user.id)
      );
    }
  };

  const handleUpdateUser = async (user: any) => {
    try {
      updateUser.mutate({
        id: user.id,
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          <strong>
            {user.lastName}, {user.firstName}
          </strong>
          <input
            type="checkbox"
            value={user.id}
            checked={selectedUsers.some((selected) => selected.id === user.id)}
            onChange={(event) => handleCheckboxChange(event, user)}
          />
          <ul className="text-blue-600">
            <a href={'/qr/displaycode/' + user.id}> User ID: {user.id}</a>
          </ul>
          <ul>
            <li>{user.email}</li>
          </ul>
          <button
            onClick={async () => {
              deleteUser.mutate({
                id: user.id,
              });
            }}
          >
            Delete user
          </button>
          <br></br>
          {/*<div>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    value={firstName}*/}
          {/*    onChange={(e) => setFirstName(e.target.value)}*/}
          {/*    placeholder="first name"*/}
          {/*  />*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    value={lastName}*/}
          {/*    onChange={(e) => setLastName(e.target.value)}*/}
          {/*    placeholder="last name"*/}
          {/*  />*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    value={email}*/}
          {/*    onChange={(e) => setEmail(e.target.value)}*/}
          {/*    placeholder="email"*/}
          {/*  />*/}
          {/*  <button onClick={() => handleUpdateUser(user)}>Update User</button>*/}
          {/*</div>*/}
          <hr />
        </div>
      ))}
    </div>
  );
}
