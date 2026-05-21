import type { Review } from "@/lib/types";
import { agencyBySlug } from "@/lib/mock";
import { formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function ReviewCard({ review }: { review: Review }) {
  const agency = agencyBySlug(review.agencyId);
  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg text-foreground">
            {review.clientName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {agency.name} · {formatDate(review.createdAt)} ·{" "}
            {review.source === "pickup" ? "Point relais" : "RDV"}
          </p>
        </div>
        <RatingStars rating={review.rating} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-foreground">{review.comment}</p>
        <Badge variant="outline" className="text-[10px]">
          {review.source === "pickup" ? "Suite à un retrait" : "Suite à un RDV"}
        </Badge>
      </CardContent>
    </Card>
  );
}

export function RatingStars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "shrink-0",
            i <= rating
              ? "fill-[var(--gold)] text-[var(--gold)]"
              : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}
