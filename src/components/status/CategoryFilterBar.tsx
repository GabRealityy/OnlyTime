export function CategoryFilterBar(props: {
  available: string[]
  selected: string
  getCategoryInfo: (catId: string) => { name: string; emoji?: string }
  onSelect: (cat: string) => void
}) {
  const { available, selected, getCategoryInfo, onSelect } = props

  if (available.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
          selected === 'all' ? 'ot-btn-active' : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
        }`}
      >
        Alle
      </button>
      {available.map((cat) => {
        const info = getCategoryInfo(cat)
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
              selected === cat ? 'ot-btn-active' : 'bg-card hover:bg-card-hover text-secondary hover:text-primary'
            }`}
          >
            {info.emoji ? `${info.emoji} ${info.name}` : info.name}
          </button>
        )
      })}
    </div>
  )
}
