import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = (type, message) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, type, message }]);

        // Automatically remove the notification after a certain time
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000); // 5 seconds
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <NotificationList notifications={notifications} />
        </NotificationContext.Provider>
    );
};

const NotificationList = ({ notifications }) => {
    return (
        <div className="fixed top-4 right-4 z-50">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`mb-2 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success'
                            ? 'bg-green-500'
                            : notification.type === 'error'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                        }`}
                >
                    {notification.message}
                </div>
            ))}
        </div>
    );
};
