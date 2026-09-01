"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate?: string | Date;
  expiryDays?: number;
  title?: string;
}

const CountdownTimer = ({ targetDate, expiryDays, title }: CountdownTimerProps) => {
  const [finalTargetDate] = useState(() => {
    if (expiryDays) {
      const date = new Date();
      date.setDate(date.getDate() + expiryDays);
      return date;
    }
    return targetDate || new Date();
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(finalTargetDate) - +new Date();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        });
      } else {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [finalTargetDate]);

  return (
    <div className="flex items-center gap-3">
      {title && (
        <span className="text-gray-500 text-sm font-medium">{title}:</span>
      )}
      <div className="flex gap-1.5 md:gap-2">
        {[
          { label: "DD", value: timeLeft.days },
          { label: "HH", value: timeLeft.hours },
          { label: "MM", value: timeLeft.minutes },
          { label: "SS", value: timeLeft.seconds },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="bg-secondary shadow-sm text-white w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm md:text-base font-bold">
              {item.value}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;