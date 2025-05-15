'use client';

interface SortControlProps {
  sort: 'newest' | 'oldest';
  setSort: (sort: 'newest' | 'oldest') => void;
}

export default function SortControl({ sort, setSort }: SortControlProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={`px-3 py-1 rounded border ${
          sort === 'newest' ? 'bg-gray-300' : 'bg-gray-800 text-white'
        }`}
        onClick={() => setSort('newest')}
      >
        Newest
      </button>
      <button
        className={`px-3 py-1 rounded border ${
          sort === 'oldest' ? 'bg-gray-300' : 'bg-gray-800 text-white'
        }`}
        onClick={() => setSort('oldest')}
      >
        Oldest
      </button>
    </div>
  );
}
