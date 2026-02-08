import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  score: number; // 0 to 100
  size?: "sm" | "md" | "lg";
}

export function StarRating({ score, size = "md" }: StarRatingProps) {
  // Logic:
  // 5 stars: 80-100%
  // 4 stars: 60-79%
  // 3 stars: 40-59%
  // 2 stars: 20-39%
  // 1 stars: 0-19%

  let stars = 0;
  if (score >= 80) stars = 5;
  else if (score >= 60) stars = 4;
  else if (score >= 40) stars = 3;
  else if (score >= 20) stars = 2;
  else stars = 1;

  const iconSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex gap-0.5" title={`Score: ${score}% - ${stars} Stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i <= stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}
