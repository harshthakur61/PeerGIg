export default function StarRating({ value = 0, onChange, interactive = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <span className={value >= star ? "text-yellow-400" : "text-slate-300"}>★</span>
        </button>
      ))}
      <span className="text-sm text-slate-500">{Number(value).toFixed(1)}</span>
    </div>
  )
}
