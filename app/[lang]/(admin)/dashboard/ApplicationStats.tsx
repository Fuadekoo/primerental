"use client";
import { Briefcase } from "lucide-react";
import React from "react";

const ApplicationStat = ({ t }: { t: any }) => (
  <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/30 relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 uppercase">
        {t.jobApplications}
      </p>
      <h3 className="font-bold text-lg text-rose-800 dark:text-rose-200 mt-1">
        {t.jobApplications}
      </h3>
      <div className="mt-4 flex items-baseline gap-6">
        <div>
          <p className="text-3xl font-bold text-rose-900 dark:text-white">
            246
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-200">
            {t.interviews}
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold text-rose-900 dark:text-white">
            101
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-200">{t.hired}</p>
        </div>
      </div>
    </div>
    <Briefcase className="absolute -right-4 -bottom-4 h-24 w-24 text-rose-500/10 dark:text-rose-400/5" />
  </div>
);

function ApplicationStats() {
  // Example translation object; replace with your actual translation logic
  const t = {
    jobApplications: "Job Applications",
    interviews: "Interviews",
    hired: "Hired",
  };

  return (
    <div>
      <ApplicationStat t={t} />
    </div>
  );
}

export default ApplicationStats;
