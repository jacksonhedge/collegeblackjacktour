import React from 'react';
import UserAvatar from './UserAvatar';

const StackedAvatars = ({ users = [], limit = 3 }) => {
  // Filter out any null or undefined users and ensure we have valid user objects
  const validUsers = users.filter(user => user && (user.uid || user.identifier));
  const displayUsers = validUsers.slice(0, limit);
  const remainingCount = Math.max(0, validUsers.length - limit);

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.uid || user.identifier || index}
            className="relative ring-2 ring-gray-900 rounded-full"
            style={{
              zIndex: displayUsers.length - index
            }}
          >
            <UserAvatar user={user} size="sm" />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="ml-2 text-sm text-gray-400">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default StackedAvatars;
