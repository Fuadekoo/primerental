"use client";
import React from "react";
import Image from "next/image";

type Meeting = {
  title: string;
  time: string;
  attendees: string[];
  color: string;
};

const Schedules = ({ t }: { t: Record<string, string> }) => {
  const meetings: Meeting[] = [
    {
      title: "Meeting with Herry",
      time: "12:00 - 01:00 PM",
      attendees: ["/avatars/01.png", "/avatars/02.png", "/avatars/03.png"],
      color: "border-green-500",
    },
    {
      title: "Meeting with Salah",
      time: "02:00 - 03:00 PM",
      attendees: ["/avatars/04.png", "/avatars/05.png", "/avatars/01.png"],
      color: "border-blue-500",
    },
  ];
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
        {t.upcomingAppointments}
      </h3>
      <div className="mt-4 space-y-4">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {t.today}
        </p>
        {meetings.map((meeting) => (
          <div
            key={meeting.title}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${meeting.color} bg-gray-50 dark:bg-gray-700/50`}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {meeting.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meeting.time}
              </p>
            </div>
            <div className="flex -space-x-2">
              {meeting.attendees.map((att, i) => (
                <Image
                  key={i}
                  src={att}
                  alt="attendee"
                  width={24}
                  height={24}
                  className="rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Schedule() {
  // Example translation object
  const t = {
    upcomingAppointments: "Upcoming Appointments",
    today: "Today",
  };

  return (
    <div>
      <Schedules t={t} />
    </div>
  );
}

// export default Schedule;
