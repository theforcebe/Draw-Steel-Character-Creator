import { useState } from 'react';
import { usePlayStore } from '../../stores/play-store';
import type { InventoryItem } from '../../stores/play-store';
import treasuresData from '../../data/treasures.json';

interface TreasureEntry {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  echelon?: string;
  description: string;
  keywords?: string;
}

const allTreasures = (treasuresData as { treasures: TreasureEntry[] }).treasures;

const CATEGORY_LABELS: Record<string, string> = {
  artifact: 'Artifacts',
  leveled: 'Leveled Treasures',
  trinket: 'Trinkets',
  consumable: 'Consumables',
};

const CATEGORY_COLORS: Record<string, string> = {
  artifact: 'text-purple-400 bg-purple-900/20 border-purple-500/20',
  leveled: 'text-gold-light bg-gold/10 border-gold/20',
  trinket: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/20',
  consumable: 'text-sky-400 bg-sky-900/20 border-sky-500/20',
};

export function PlayInventory() {
  const playStore = usePlayStore();
  const playState = playStore.getActiveState();
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!playState) {
    return (
      <div className="text-center py-12 text-cream-dark/40 font-body text-sm">
        No active character
      </div>
    );
  }

  const inventory = playState.inventory ?? [];

  function handleAddTreasure(treasure: TreasureEntry) {
    const item: InventoryItem = {
      id: `${treasure.id}-${Date.now()}`,
      name: treasure.name,
      category: treasure.category,
      description: treasure.description,
      charges: treasure.category === 'consumable' ? 1 : undefined,
      maxCharges: treasure.category === 'consumable' ? 1 : undefined,
      isEquipped: false,
    };
    playStore.addInventoryItem(item);
  }

  function handleAddCustomItem() {
    const item: InventoryItem = {
      id: `custom-${Date.now()}`,
      name: 'New Item',
      category: 'other',
      description: 'A mysterious item...',
      isEquipped: false,
    };
    playStore.addInventoryItem(item);
  }

  const filteredCatalog = allTreasures.filter((t) => {
    if (catalogFilter !== 'all' && t.category !== catalogFilter) return false;
    if (catalogSearch && !t.name.toLowerCase().includes(catalogSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Inventory Header */}
      <div className="card px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-xs uppercase tracking-wider text-gold">
            Inventory ({inventory.length} items)
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted hover:text-gold transition-all px-2 py-1 rounded-lg border border-gold/10 hover:border-gold/30"
            >
              + Custom
            </button>
            <button
              type="button"
              onClick={() => setShowCatalog(!showCatalog)}
              className="font-heading text-[0.55rem] uppercase tracking-wider text-gold-muted hover:text-gold transition-all px-2 py-1 rounded-lg border border-gold/10 hover:border-gold/30"
            >
              {showCatalog ? 'Hide Catalog' : 'Add Treasure'}
            </button>
          </div>
        </div>

        {/* Treasure Catalog */}
        {showCatalog && (
          <div className="mb-4 p-3 rounded-xl bg-surface-light/10 border border-gold/10">
            <div className="flex flex-col gap-2 mb-3">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search treasures..."
                className="w-full px-3 py-1.5 rounded-lg bg-surface-light/20 border border-gold/10 text-cream-dark/80 font-body text-xs placeholder:text-cream-dark/30 focus:outline-none focus:border-gold/30"
              />
              <div className="flex gap-1 flex-wrap">
                {['all', 'artifact', 'leveled', 'trinket', 'consumable'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogFilter(cat)}
                    className={[
                      'px-2 py-0.5 rounded-full text-[0.5rem] font-heading uppercase tracking-wider transition-all',
                      catalogFilter === cat
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-cream-dark/40 border border-gold/5 hover:border-gold/15',
                    ].join(' ')}
                  >
                    {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {filteredCatalog.map((treasure) => (
                <button
                  key={treasure.id}
                  type="button"
                  onClick={() => handleAddTreasure(treasure)}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-gold/5 text-left transition-all group"
                >
                  <span className={[
                    'shrink-0 px-1.5 py-0.5 rounded text-[0.45rem] font-heading uppercase tracking-wider border',
                    CATEGORY_COLORS[treasure.category] ?? 'text-cream-dark/40 bg-surface-light/20 border-gold/10',
                  ].join(' ')}>
                    {treasure.category === 'consumable' ? (treasure.echelon ? `E${treasure.echelon.charAt(0)}` : 'C') :
                     treasure.category === 'trinket' ? (treasure.echelon ? `E${treasure.echelon.charAt(0)}` : 'T') :
                     treasure.category === 'leveled' ? (treasure.subcategory ? treasure.subcategory.charAt(0).toUpperCase() : 'L') :
                     'A'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-heading text-[0.6rem] text-cream-dark/70 group-hover:text-gold-light transition-all">
                      {treasure.name}
                    </span>
                    {treasure.keywords && (
                      <span className="font-body text-[0.45rem] text-cream-dark/30 ml-1">
                        {treasure.keywords}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-[0.5rem] text-gold/30 group-hover:text-gold/60 font-heading">+ADD</span>
                </button>
              ))}
              {filteredCatalog.length === 0 && (
                <p className="text-center py-4 text-cream-dark/30 font-body text-xs">
                  No treasures found
                </p>
              )}
            </div>
          </div>
        )}

        {/* Inventory Items */}
        {inventory.length === 0 ? (
          <p className="text-center py-6 text-cream-dark/30 font-body text-xs">
            No items yet. Use "Add Treasure" to browse the treasure catalog,
            or "Custom" to add an item manually.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={[
                  'px-3 py-2.5 rounded-xl border transition-all',
                  item.isEquipped
                    ? 'bg-gold/8 border-gold/20'
                    : 'bg-surface-light/20 border-gold/5',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={[
                      'shrink-0 px-1.5 py-0.5 rounded text-[0.45rem] font-heading uppercase tracking-wider border',
                      CATEGORY_COLORS[item.category] ?? 'text-cream-dark/40 bg-surface-light/20 border-gold/10',
                    ].join(' ')}>
                      {(CATEGORY_LABELS[item.category] ?? item.category).substring(0, 3)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="font-heading text-xs text-gold-light hover:text-gold transition-all text-left truncate"
                    >
                      {item.name}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.charges != null && (
                      <button
                        type="button"
                        onClick={() => playStore.useCharge(item.id)}
                        disabled={item.charges <= 0}
                        className={[
                          'px-2 py-0.5 rounded text-[0.5rem] font-heading uppercase tracking-wider border transition-all',
                          item.charges > 0
                            ? 'text-sky-400 border-sky-500/20 hover:bg-sky-900/20'
                            : 'text-cream-dark/20 border-gold/5 cursor-not-allowed',
                        ].join(' ')}
                      >
                        Use ({item.charges})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => playStore.toggleEquip(item.id)}
                      className={[
                        'px-2 py-0.5 rounded text-[0.5rem] font-heading uppercase tracking-wider border transition-all',
                        item.isEquipped
                          ? 'text-gold border-gold/30 bg-gold/10'
                          : 'text-cream-dark/40 border-gold/10 hover:border-gold/20',
                      ].join(' ')}
                    >
                      {item.isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                    <button
                      type="button"
                      onClick={() => playStore.removeInventoryItem(item.id)}
                      className="px-1.5 py-0.5 rounded text-[0.5rem] text-crimson/50 hover:text-crimson border border-crimson/10 hover:border-crimson/30 transition-all"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {expandedItem === item.id && (
                  <p className="font-body text-[0.6rem] text-cream-dark/50 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
