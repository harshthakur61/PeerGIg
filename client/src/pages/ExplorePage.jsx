import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../api/axios"
import GigCard from "../components/GigCard"

export default function ExplorePage() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get("search") || "")
  const [subject, setSubject] = useState(params.get("subject") || "")
  const [difficulty, setDifficulty] = useState(params.get("difficulty") || "")
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || 500)
  const [minRating, setMinRating] = useState(params.get("minRating") || 0)
  const [sort, setSort] = useState(params.get("sort") || "newest")
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 9

  const clearFilters = () => {
    setSearch("")
    setSubject("")
    setDifficulty("")
    setMaxPrice(500)
    setMinRating(0)
    setSort("newest")
    setPage(1)
  }

  const activeFilters = [
    search ? { key: "search", label: `Search: ${search}` } : null,
    subject ? { key: "subject", label: `Subject: ${subject}` } : null,
    difficulty ? { key: "difficulty", label: `Difficulty: ${difficulty}` } : null,
    Number(maxPrice) < 500 ? { key: "maxPrice", label: `Max ₹${maxPrice}` } : null,
    Number(minRating) > 0 ? { key: "minRating", label: `Min ${minRating}★` } : null,
    sort !== "newest" ? { key: "sort", label: `Sort: ${sort.replace("_", " ")}` } : null
  ].filter(Boolean)

  const clearSingleFilter = (key) => {
    if (key === "search") setSearch("")
    if (key === "subject") setSubject("")
    if (key === "difficulty") setDifficulty("")
    if (key === "maxPrice") setMaxPrice(500)
    if (key === "minRating") setMinRating(0)
    if (key === "sort") setSort("newest")
    setPage(1)
  }

  const query = useMemo(
    () =>
      new URLSearchParams({
        search,
        subject,
        difficulty,
        maxPrice,
        minRating,
        sort
      }).toString(),
    [search, subject, difficulty, maxPrice, minRating, sort]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      api.get(`/gigs?${query}`).then((res) => setGigs(res.data)).catch(() => {}).finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [search, subject, difficulty, maxPrice, minRating, sort])

  const totalPages = Math.max(1, Math.ceil(gigs.length / pageSize))
  const paginatedGigs = gigs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="sticky top-16 z-20 rounded-2xl bg-surface pb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topic, subject, tags"
          className="w-full rounded-xl border bg-white p-3"
        />
        {activeFilters.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => clearSingleFilter(filter.key)}
                className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm"
              >
                {filter.label} ✕
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <button type="button" onClick={clearFilters} className="text-xs font-medium text-primary">
              Clear all
            </button>
          </div>
          <select className="mb-2 w-full rounded border p-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Programming</option>
            <option>Economics</option>
            <option>History</option>
            <option>English</option>
            <option>Chess</option>
          </select>
          <select className="mb-2 w-full rounded border p-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Any difficulty</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <label className="text-sm">Max Price: ₹{maxPrice}</label>
          <input type="range" min="0" max="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full" />
          <select className="mt-2 w-full rounded border p-2" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="0">Min Rating</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5</option>
          </select>
          <select className="mt-2 w-full rounded border p-2" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price Low→High</option>
            <option value="price_desc">Price High→Low</option>
          </select>
        </aside>
        <section>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                  <div className="mt-4 h-9 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="font-semibold">No results found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing filters or clearing them.</p>
              <button type="button" onClick={clearFilters} className="mt-3 rounded-lg bg-primary px-3 py-1 text-sm text-white">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-white px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
