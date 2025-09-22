import { Heart, Zap, Shield, TrendingUp } from "lucide-react";

interface RingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const Ring = ({ percentage, color, size = 60, strokeWidth = 4 }: RingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};

export const HealthRings = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {/* Mood Ring */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Ring percentage={75} color="hsl(var(--primary))" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">Mood</p>
          <p className="text-xs text-muted-foreground">75%</p>
        </div>
      </div>

      {/* Energy Ring */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Ring percentage={60} color="hsl(var(--success))" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">Energy</p>
          <p className="text-xs text-muted-foreground">60%</p>
        </div>
      </div>

      {/* Wellness Ring */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Ring percentage={85} color="hsl(var(--accent))" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">Wellness</p>
          <p className="text-xs text-muted-foreground">85%</p>
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <Ring percentage={40} color="hsl(var(--warning))" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-warning-foreground" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">Progress</p>
          <p className="text-xs text-muted-foreground">40%</p>
        </div>
      </div>
    </div>
  );
};