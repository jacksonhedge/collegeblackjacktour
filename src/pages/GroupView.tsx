import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnhancedGroupView from '../components/groups/EnhancedGroupView';

const GroupView: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/groups');
  };

  if (!groupId) {
    return null;
  }

  return <EnhancedGroupView groupId={groupId} onClose={handleClose} />;
};

export default GroupView;
