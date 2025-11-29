// src/components/StatusBadge.tsx

type Status = "Voting" | "Executed" | "Rejected" | string;

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "Executed":
        return {
          bgColor: "bg-emerald-500/20",
          textColor: "text-emerald-400",
          icon: "✓",
        };
      case "Rejected":
        return {
          bgColor: "bg-red-500/20",
          textColor: "text-red-400",
          icon: "✗",
        };
      case "Voting":
        return {
          bgColor: "bg-amber-500/20",
          textColor: "text-amber-400",
          icon: "?",
        };
      default:
        return {
          bgColor: "bg-slate-500/20",
          textColor: "text-slate-400",
          icon: "-",
        };
    }
  };

  const { bgColor, textColor, icon } = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}
    >
      <span className="text-sm">{icon}</span>
      {status}
    </span>
  );
}

// Helper function to parse status from API response
export function parseStatus(statusRaw: unknown): Status {
  if (!statusRaw) return "-";
  const asString = JSON.stringify(statusRaw);
  if (asString.includes("Voting")) return "Voting";
  if (asString.includes("Executed")) return "Executed";
  if (asString.includes("Rejected")) return "Rejected";
  return asString;
}
