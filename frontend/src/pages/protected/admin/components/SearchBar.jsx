import React from 'react'

const SearchBar = ({ value, onChange, placeholder, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className='flex md:items-center gap-2'>
      <input
        type="text"
        placeholder={placeholder || 'Search...'}
        onChange={(e) => onChange(e.target.value)}
        value={value}
        className='flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400'
      />
      <button
        type="submit"
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
      >
        Search
      </button>
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); if (onSearch) onSearch(); }}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Clear
        </button>
      )}
    </form>
  )
}

export default SearchBar
