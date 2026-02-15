import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  score: number; // 0 to 100
  size?: "sm" | "md" | "lg";
}

export function StarRating({ score, size = "md" }: StarRatingProps) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const exactStars = safeScore / 20; // 0..5
  const roundedStars = Math.round(exactStars * 2) / 2; // 0.5 increments
  const fullStars = Math.floor(roundedStars);
  const hasHalfStar = roundedStars - fullStars === 0.5;

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex gap-0.5" title={`Score: ${safeScore}% - ${roundedStars} Stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= fullStars) {
          return <Star key={i} className={`${iconSize} fill-yellow-400 text-yellow-400`} />;
        }

        if (hasHalfStar && i === fullStars + 1) {
          return <StarHalf key={i} className={`${iconSize} fill-yellow-400 text-yellow-400`} />;
        }

        return <Star key={i} className={`${iconSize} fill-muted text-muted-foreground/20`} />;
      })}
    </div>
  );
}
