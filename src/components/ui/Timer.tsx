'use client';

import React, { useEffect, useState } from 'react';

interface TimerProps {
    targetDate: string | null; // ISO string 
    onExpire?: () => void;
    className?: string;
}

export function Timer({ targetDate, onExpire, className = '' }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(null);
            return;
        }

        const target = new Date(targetDate).getTime();

        const calculateTimeLeft = () => {
            const now = Date.now();
            const diff = target - now;
            if (diff <= 0) {
                setTimeLeft(0);
                if (onExpire) setTimeout(() => onExpire(), 0); // avoid state update during render loop
                return 0;
            }
            return diff;
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const currentDiff = calculateTimeLeft();
            setTimeLeft(currentDiff);
            if (currentDiff <= 0) {
                clearInterval(interval);
            }
        }, 100); // 100ms for smooth UI updates

        return () => clearInterval(interval);
    }, [targetDate, onExpire]);

    if (targetDate === null) {
        return null; // hide timer if no target
    }

    if (timeLeft === null) return <span>--:--</span>;

    const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Highlight when less than 30 seconds
    const isUrgent = totalSeconds > 0 && totalSeconds <= 30;

    return (
        <div className={`countdown ${isUrgent ? 'animate-pulse' : ''} ${className}`}
            style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-display)',
                color: isUrgent ? 'var(--error)' : 'var(--text-primary)',
                textShadow: isUrgent ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
            }}>
            {formattedTime}
        </div>
    );
}
