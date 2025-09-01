import React, { useState, useEffect } from 'react';
import './AdminComponents.css';

const ContactMessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching messages with token:', token ? 'Token exists' : 'No token'); // Debug log
      
      const response = await fetch('http://localhost:3001/api/content/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data); // Debug log
        setMessages(data);
      } else {
        console.error('Failed to fetch messages, status:', response.status);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/content/admin/contact-messages/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, is_read: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/content/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading messages...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Contact Messages</h2>
        <p>Manage contact form submissions from visitors</p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No contact messages yet.</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${!message.is_read ? 'unread' : ''}`}
                onClick={() => openMessage(message)}
              >
                <div className="message-header">
                  <div className="message-info">
                    <h4>{message.name}</h4>
                    <span className="message-email">{message.email}</span>
                  </div>
                  <div className="message-meta">
                    <span className="message-date">{formatDate(message.created_at)}</span>
                    {!message.is_read && <span className="unread-badge">New</span>}
                  </div>
                </div>
                <div className="message-preview">
                  <p><strong>Subject:</strong> {message.subject || 'No subject'}</p>
                  <p>{message.message.substring(0, 100)}...</p>
                </div>
                <div className="message-actions">
                  <button 
                    className="btn-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMessage(message);
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message from {selectedMessage.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="message-detail">
                <div className="detail-row">
                  <strong>Name:</strong> {selectedMessage.name}
                </div>
                <div className="detail-row">
                  <strong>Email:</strong> {selectedMessage.email}
                </div>
                {selectedMessage.phone && (
                  <div className="detail-row">
                    <strong>Phone:</strong> {selectedMessage.phone}
                  </div>
                )}
                {selectedMessage.company && (
                  <div className="detail-row">
                    <strong>Company:</strong> {selectedMessage.company}
                  </div>
                )}
                {selectedMessage.subject && (
                  <div className="detail-row">
                    <strong>Subject:</strong> {selectedMessage.subject}
                  </div>
                )}
                <div className="detail-row">
                  <strong>Date:</strong> {formatDate(selectedMessage.created_at)}
                </div>
                <div className="detail-row">
                  <strong>Message:</strong>
                  <div className="message-content">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="btn-danger"
                onClick={() => {
                  deleteMessage(selectedMessage.id);
                  setShowModal(false);
                }}
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManager;
