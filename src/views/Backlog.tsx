import { useState, type Dispatch, type SetStateAction } from 'react';
import type { BacklogItem, Status } from '../types';
import { Icon } from '../components/Icon';
import { Editable } from '../components/Editable';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d: number) { const dt = new Date(d); return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`; }

type FilterKey = 'open' | 'done' | 'archived' | 'all';

interface BacklogProps {
  items: BacklogItem[];
  setItems: Dispatch<SetStateAction<BacklogItem[]>>;
}

export function Backlog({ items, setItems }: BacklogProps) {
  const [filter, setFilter] = useState<FilterKey>('open');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState('');

  function add(text: string) {
    const t = text.trim();
    if (!t) return;
    setItems(it => [{ id: 'b' + Date.now(), text: t, status: 'open', added: Date.now() }, ...it]);
    setDraft('');
  }
  function setStatus(id: string, status: Status) {
    setItems(it => it.map(x => x.id === id ? { ...x, status, statusChanged: Date.now() } : x));
  }
  function rename(id: string, text: string) { setItems(it => it.map(x => x.id === id ? { ...x, text } : x)); }

  const filtered = items
    .filter(x => filter === 'all' ? true : x.status === filter)
    .filter(x => q ? x.text.toLowerCase().includes(q.toLowerCase()) : true)
    .sort((a, b) => b.added - a.added);

  const count: Record<FilterKey, number> = {
    all:      items.length,
    open:     items.filter(x => x.status === 'open').length,
    done:     items.filter(x => x.status === 'done').length,
    archived: items.filter(x => x.status === 'archived').length,
  };

  const filters: [FilterKey, string][] = [['open','Open'],['done','Done'],['archived','Archived'],['all','All']];

  return (
    <div className="fade-in stack">
      <div className="card">
        <div className="hd">
          <div>
            <h3>Backlog</h3>
            <div className="uc" style={{marginTop:6}}>out of your head · {count.open} open</div>
          </div>
          <div className="row">
            <div className="field" style={{width:220}}>
              <Icon name="search" size={13}/>
              <input placeholder="Search the backlog…" value={q} onChange={e => setQ(e.target.value)}/>
            </div>
            <div className="seg">
              {filters.map(([k, l]) => (
                <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
                  {l} <span style={{opacity:.5,marginLeft:5}}>{count[k]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{padding:'14px 22px',borderBottom:'1px solid var(--line-soft)',background:'rgba(255,255,255,.35)'}}>
          <div className="field" style={{background:'#fff'}}>
            <span className="pre">+ add</span>
            <input
              placeholder="Something to remember… (press Enter)"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(draft); }}
            />
            <button className="ibtn ghost" style={{padding:'4px 10px',fontSize:11.5}} onClick={() => add(draft)} disabled={!draft.trim()}>save</button>
          </div>
        </div>

        <div className="bhd">
          <span/>
          <span>Item</span>
          <span className="date">Added</span>
          <span className="state">Status</span>
          <span/>
        </div>

        <div className="blist" style={{maxHeight:520,overflowY:'auto'}}>
          {filtered.map(x => (
            <div key={x.id} className={`brow ${x.status}`}>
              <button
                className="check"
                onClick={() => setStatus(x.id, x.status === 'done' ? 'open' : 'done')}
                title={x.status === 'done' ? 'Mark open' : 'Mark done'}
              >✓</button>
              <Editable className="txt" value={x.text} onChange={v => rename(x.id, v)} />
              <div className="date">{fmtDate(x.added)}</div>
              <div className="state">{x.status === 'open' ? '—' : x.status}</div>
              <button
                className="rx"
                onClick={() => setStatus(x.id, x.status === 'archived' ? 'open' : 'archived')}
                title={x.status === 'archived' ? 'Unarchive' : 'Archive'}
              ><Icon name="archive" size={13}/></button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{padding:'56px 22px',textAlign:'center',color:'var(--muted)',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:16}}>
              {filter === 'open' ? 'All clear. Breathe.' : `Nothing here under "${filter}".`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
