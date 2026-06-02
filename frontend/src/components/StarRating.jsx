import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, count = 0, size = 'sm' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const countSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((s) => {
          const fill = Math.min(1, Math.max(0, rating - (s - 1)));
          return (
            <div key={s} className={`relative ${starSize}`}>
              <Star className={starSize} fill="#e5e7eb" strokeWidth={0} />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={starSize} fill="#fbbf24" strokeWidth={0} />
              </div>
            </div>
          );
        })}
      </div>
      <span className={`${textSize} font-bold text-gray-700`}>
        {rating > 0 ? Number(rating).toFixed(1) : '0.0'}
      </span>
      <span className={`${countSize} text-gray-400`}>({count})</span>
    </div>
  );
}
