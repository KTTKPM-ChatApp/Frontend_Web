/**
 * Presence Indicator - Online/Offline status dot
 * Giống Zalo: chấm xanh (online), xám (offline)
 */

import React, { useEffect, useState } from 'react';

export type PresenceStatus = 'online' | 'offline';

interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'small' | 'medium' | 'large';
  showBorder?: boolean;
  lastSeenAt?: number; // timestamp
}

export function PresenceIndicator({
  status,
  size = 'medium',
  showBorder = true,
  lastSeenAt,
}: PresenceIndicatorProps) {
  const sizeMap = {
    small: { dot: 8, border: 2 },
    medium: { dot: 12, border: 2 },
    large: { dot: 16, border: 3 },
  };

  const { dot, border } = sizeMap[size];
  const [statusText, setStatusText] = useState('Offline');

  useEffect(() => {
    const getStatusText = (): string => {
      if (status === 'online') return 'Đang hoạt động';
      if (!lastSeenAt) return 'Offline';

      const now = Date.now();
      const diff = now - lastSeenAt;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Vừa mới truy cập';
      if (minutes < 60) return `${minutes} phút trước`;
      if (hours < 24) return `${hours} giờ trước`;
      if (days < 7) return `${days} ngày trước`;
      return new Date(lastSeenAt).toLocaleDateString('vi-VN');
    };

    setStatusText(getStatusText());
  }, [status, lastSeenAt]);

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.dot,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: status === 'online' ? '#00C853' : '#C7CDD6',
          borderWidth: showBorder ? border : 0,
          borderColor: '#fff',
        }}
        title={statusText}
      />
    </div>
  );
}

export function PresenceText({
  status,
  lastSeenAt,
}: {
  status: PresenceStatus;
  lastSeenAt?: number;
}) {
  const [statusText, setStatusText] = useState('Offline');

  useEffect(() => {
    const getStatusText = (): string => {
      if (status === 'online') return 'Đang hoạt động';
      if (!lastSeenAt) return 'Offline';

      const now = Date.now();
      const diff = now - lastSeenAt;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Vừa truy cập';
      if (minutes < 60) return `${minutes} phút trước`;
      if (hours < 24) return `${hours} giờ trước`;
      if (days < 7) return `${days} ngày trước`;
      return `Truy cập ${new Date(lastSeenAt).toLocaleDateString('vi-VN')}`;
    };

    setStatusText(getStatusText());
  }, [status, lastSeenAt]);

  return (
    <span
      style={{
        ...styles.text,
        color: status === 'online' ? '#00C853' : '#9CA3AF',
        opacity: status === 'online' ? 1 : 0.8,
      }}
    >
      {statusText}
    </span>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  text: {
    fontSize: '12px',
    marginTop: '2px',
  },
};
