import React, { useEffect, useState, useRef } from "react";
import { FiSend, FiEdit, FiTrash, FiX, FiUser, FiUserX } from "react-icons/fi";
import { HiOutlinePaperClip } from "react-icons/hi";
import plusBlue from "../../assets/pluscircle.png";
import searchbar from "../../assets/searchbar.png";
import dot from "../../assets/threedot.svg";
import pindown from "../../assets/pindown.svg";
import ad from "../../assets/arrowd.png";
import { useSelector } from "react-redux";

const Messenger = () => {
  // State declarations
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomParticipants, setNewRoomParticipants] = useState("");
  const [newRoomImageFile, setNewRoomImageFile] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantInput, setParticipantInput] = useState("");

  const inputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const organizerId = user?.employee?.id;

  // Fetch rooms on component mount
  useEffect(() => {
    if (!organizerId) return;
    
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms?userId=${organizerId}`
        );
        const data = await response.json();
        if (data.success) {
          setRooms(data.rooms || []);
        }
      } catch (err) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [organizerId]);

  // Fetch messages when active room changes
  useEffect(() => {
    if (!activeRoom?.id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms/${activeRoom.id}/messages?userId=${organizerId}`
        );
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || []);
          
          // Mark messages as read
          const unreadMessages = data.messages.filter(
            (msg) => msg.user_status !== "read"
          );
          
          await Promise.all(
            unreadMessages.map((msg) =>
              fetch(
                `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/messages/${msg.id}/read?userId=${organizerId}`,
                { method: "PUT" }
              )
            )
          );
        }
      } catch (err) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeRoom?.id, organizerId]);

  // Focus input when editing
  useEffect(() => {
    if (editId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editId]);

  // Message handling functions
  const handleSend = async () => {
    if (!input.trim() || !activeRoom?.id) return;

    try {
      if (editId) {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/messages/${editId}?userId=${organizerId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: input }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === editId ? { ...msg, content: input } : msg))
          );
          setInput("");
          setEditId(null);
        }
      } else {
        const response = await fetch(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms/${activeRoom.id}/messages?userId=${organizerId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: input }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setMessages((prev) => [...prev, data.message]);
          setInput("");
        }
      }
    } catch (err) {
      setError("Failed to send message");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const response = await fetch(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/messages/${id}?userId=${organizerId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    } catch (err) {
      setError("Failed to delete message");
    }
  };

  // Room management functions
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setError("Room name is required");
      return;
    }

    const participants = newRoomParticipants
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id && !isNaN(id));

    try {
      let imageUrl = activeRoom?.image_url || null;

      if (newRoomImageFile) {
        const formData = new FormData();
        formData.append("file", newRoomImageFile);
        const uploadResponse = await fetch("https://tableware-dweeb-estate.ngrok-free.dev/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const url = activeRoom
        ? `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms/${activeRoom.id}?userId=${organizerId}`
        : `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms?userId=${organizerId}`;

      const method = activeRoom ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          employeeIds: participants,
          isGroup: true,
          imageUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (activeRoom) {
          setRooms((prev) =>
            prev.map((room) => (room.id === activeRoom.id ? data.room : room))
          );
          setActiveRoom(data.room);
        } else {
          setRooms((prev) => [data.room, ...prev]);
          setActiveRoom(data.room);
        }
        setShowModal(false);
        setNewRoomName("");
        setNewRoomParticipants("");
        setNewRoomImageFile(null);
        setParticipantInput("");
      }
    } catch (err) {
      setError("Failed to create/update room");
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms/${id}?userId=${organizerId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (data.success) {
        setRooms((prev) => prev.filter((room) => room.id !== id));
        if (activeRoom?.id === id) {
          setActiveRoom(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError("Failed to delete room");
    }
  };

  const handleEditRoom = (id) => {
    const room = rooms.find((room) => room.id === id);
    if (room) {
      setNewRoomName(room.name);
      setNewRoomParticipants(
        room.members_preview?.map((m) => m.id).join(", ") || ""
      );
      setActiveRoom(room);
      setShowModal(true);
    }
  };

  const handleRoomDetails = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm(`Remove this member from ${selectedRoom.name}?`)) return;
    
    try {
      const response = await fetch(
        `https://tableware-dweeb-estate.ngrok-free.dev/api/chat/rooms/${selectedRoom.id}/participants/${memberId}?userId=${organizerId}`,
        { method: "DELETE" }
      );
      
      const data = await response.json();
      if (data.success) {
        // Update the selected room's members list
        setSelectedRoom(prev => ({
          ...prev,
          members_preview: prev.members_preview.filter(m => m.id !== memberId),
          member_count: prev.member_count - 1
        }));
        
        // If current user is removing themselves, leave the room
        if (memberId === organizerId) {
          setRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
          setActiveRoom(null);
          setShowRoomDetails(false);
        }
      }
    } catch (err) {
      setError("Failed to remove member");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-5 text-[36px]">Messenger</h2>
      <div className="flex h-screen bg-[#f6fafd] shadow rounded-xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-[300px] border-r bg-white flex flex-col">
          <div className="flex justify-between items-center mb-4 p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="flex gap-3 items-center">
              <img src={searchbar} alt="search" className="w-10 h-10" />
              <img
                src={plusBlue}
                alt="plus"
                className="w-8 h-8 cursor-pointer"
                onClick={() => {
                  setActiveRoom(null);
                  setShowModal(true);
                }}
              />
            </div>
          </div>
          <div className="overflow-auto p-4">
            <div className="text-xs font-semibold mb-2 text-[#3F8CFF] flex gap-2 items-center">
              <img src={ad} alt="arrow" />
              Chats
            </div>
            {loading ? (
              <div className="p-4 text-center">Loading rooms...</div>
            ) : error ? (
              <div className="p-4 text-red-500">{error}</div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-gray-500">No chat rooms available</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-2 rounded-xl cursor-pointer relative ${
                    activeRoom?.id === room.id ? "bg-[#F4F9FD]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {room.image_url ? (
                      <img
                        src={room.image_url}
                        alt="room"
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-gray-500">
                        {room.last_message?.slice(0, 40) || "No messages yet"}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {room.last_message_time?.slice(11, 16)}
                    </span>
                  </div>
                  {organizerId == room?.creator_id && (
                    <div className="absolute right-2 top-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoom(room.id);
                        }}
                        className="text-blue-500 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room.id);
                        }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeRoom ? (
            <>
              <div className="flex items-center justify-between bg-white p-4 border-b">
                <div className="flex items-center gap-3">
                  {activeRoom.image_url ? (
                    <img
                      src={activeRoom.image_url}
                      alt="room"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  )}
                  <div>
                    <h3 className="font-semibold">{activeRoom.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <img src={pindown} alt="pin" className="w-10 h-10" />
                  <img src={searchbar} alt="search" className="w-10 h-10" />
                  <button onClick={() => handleRoomDetails(activeRoom)}>
                    <img src={dot} alt="options" className="w-10 h-10" />
                  </button>
                </div>
              </div>

              {/* Message list */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center">Loading messages...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500 text-center">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="text-sm text-gray-600 flex gap-3 items-start"
                    >
                      {msg.sender_avatar ? (
                        <img
                          src={`https://tableware-dweeb-estate.ngrok-free.dev/uploads/${msg.sender_avatar}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-full"></div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <b>{msg.sender_name}</b>
                          <span className="text-xs text-gray-400">
                            {msg.created_at?.slice(11, 16)}
                          </span>
                        </div>
                        <p className="mt-1">
                          {msg.content}{" "}
                          {msg.sender_id === organizerId &&
                            msg.user_status === "read" && (
                              <span className="text-green-500 text-xs ml-2">
                                ✓✓
                              </span>
                            )}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {msg.sender_id === organizerId &&
                            msg.content !== "[message deleted]" && (
                              <>
                                <button
                                  onClick={() => {
                                    setInput(msg.content);
                                    setEditId(msg.id);
                                  }}
                                  className="text-blue-500 text-xs flex items-center gap-1"
                                >
                                  <FiEdit className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="text-red-500 text-xs flex items-center gap-1"
                                >
                                  <FiTrash className="w-4 h-4" /> Delete
                                </button>
                              </>
                            )}
                          {editId === msg.id && (
                            <button
                              onClick={() => {
                                setEditId(null);
                                setInput("");
                              }}
                              className="text-gray-500 text-xs ml-2"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input box */}
              <div className="flex items-center gap-3 border-t bg-white p-3">
                <HiOutlinePaperClip className="text-gray-500 w-5 h-5 cursor-pointer" />
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border-none focus:outline-none text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  ref={inputRef}
                />
                <FiSend
                  onClick={handleSend}
                  className="text-blue-500 w-5 h-5 cursor-pointer"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500">
                {rooms.length === 0
                  ? "Create a chat room to get started"
                  : "Select a chat to view messages"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {activeRoom ? "Edit Chat Room" : "Create Chat Room"}
            </h3>
            {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
            
            {/* Room Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
              <input
                type="text"
                placeholder="Enter room name"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            
            {/* Participants Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Participants
              </label>
              
              {/* Selected Participants */}
              <div className="flex flex-wrap gap-2 mb-2">
                {newRoomParticipants.split(',').filter(id => id.trim()).map((id, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                    {id.trim()}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newRoomParticipants.split(',')
                          .filter(i => i.trim() !== id.trim())
                          .join(',');
                        setNewRoomParticipants(updated);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add Participant Input */}
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter participant ID"
                  className="flex-1 border px-3 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && participantInput.trim()) {
                      const updated = newRoomParticipants 
                        ? `${newRoomParticipants},${participantInput.trim()}`
                        : participantInput.trim();
                      setNewRoomParticipants(updated);
                      setParticipantInput('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (participantInput.trim()) {
                      const updated = newRoomParticipants 
                        ? `${newRoomParticipants},${participantInput.trim()}`
                        : participantInput.trim();
                      setNewRoomParticipants(updated);
                      setParticipantInput('');
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              
              {/* Suggested Participants (if available) */}
              {activeRoom?.members_preview && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Current members:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeRoom.members_preview.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          if (!newRoomParticipants.includes(member.id.toString())) {
                            const updated = newRoomParticipants 
                              ? `${newRoomParticipants},${member.id}`
                              : member.id.toString();
                            setNewRoomParticipants(updated);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded-full ${
                          newRoomParticipants.includes(member.id.toString())
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {member.name} (ID: {member.id})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Room Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
              <div className="flex items-center gap-3">
                {newRoomImageFile ? (
                  <>
                    <img 
                      src={URL.createObjectURL(newRoomImageFile)} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewRoomImageFile(null)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <HiOutlinePaperClip className="text-gray-500" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setNewRoomImageFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setNewRoomName("");
                  setNewRoomParticipants("");
                  setNewRoomImageFile(null);
                  setActiveRoom(null);
                  setError(null);
                  setParticipantInput("");
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {activeRoom ? "Update Room" : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Room Details</h3>
              <button 
                onClick={() => setShowRoomDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              {selectedRoom.image_url ? (
                <img 
                  src={selectedRoom.image_url} 
                  alt="room" 
                  className="w-16 h-16 rounded-full object-cover" 
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser size={24} className="text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-semibold">{selectedRoom.name}</h4>
                <p className="text-sm text-gray-500">
                  {selectedRoom.member_count} member{selectedRoom.member_count !== 1 ? 's' : ''}
                </p>
                {selectedRoom.creator_id === organizerId && (
                  <p className="text-xs text-blue-500">You created this room</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Members</h4>
              <div className="space-y-3">
                {selectedRoom.members_preview?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {member.photo ? (
                        <img 
                          src={`https://tableware-dweeb-estate.ngrok-free.dev/uploads/${member.photo}`} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm">{member.name}</p>
                        {member.id === selectedRoom.creator_id && (
                          <p className="text-xs text-gray-500">Room admin</p>
                        )}
                      </div>
                    </div>
                    {(selectedRoom.creator_id === organizerId || member.id === organizerId) && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title={member.id === organizerId ? "Leave room" : "Remove member"}
                      >
                        <FiUserX size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRoomDetails(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Messenger;