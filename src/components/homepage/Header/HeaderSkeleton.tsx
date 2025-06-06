import { satoshi } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeaderSkeleton() {
  return (
    <div className="w-full h-[600px] lg:h-[800px] relative">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-[600px]">
            <Skeleton className="h-16 w-full mb-5 lg:mb-8" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
} 