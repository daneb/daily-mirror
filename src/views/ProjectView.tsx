import { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { Project, HistoryEntry, Priority } from '../types';
import { Icon } from '../components/Icon';
import { Editable } from '../components/Editable';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtRel(d: number) {
  const ms = Date.now() - d;
  const days = Math.floor(ms / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface ProjectCardProps {
  p: Project;
  concern: boolean;
  onName: (name: string) => void;
  onWeight: () => void;
  onPriority: () => void;
  onComplete: () => void;
  onRemove: () => void;
}

function ProjectCard({ p, concern, onName, onWeight, onPriority, onComplete, onRemove }: ProjectCardProps) {
  const priorityLabel = { critical: 'Critical', important: 'Important', steady: 'Steady' }[p.priority] ?? p.priority;
  const cls = `pcard${concern ? ' concern' : ''}${p.done ? ' done' : ''}`;
  return (
    <div className={cls}>
      <button className="x" onClick={onRemove} title="Remove"><Icon name="x" size={12}/></button>
      <div className="row1">
        <Editable as="h4" value={p.name} onChange={onName} />
        <button className={`chip ${p.priority}`} onClick={onPriority}>
          <span style={{width:5,height:5,borderRadius:50,background:'currentColor',display:'inline-block'}}/>
          {priorityLabel}
        </button>
      </div>
      <div className="weight" title="Click dots to mark mental weight">
        <span className="label">weight</span>
        <span className="dots">
          {[1,2,3,4].map(n => (
            <i key={n} className={n <= (p.weight ?? 0) ? 'on' : ''} onClick={onWeight} />
          ))}
        </span>
      </div>
      <div className="meta">
        {!concern && <span>touched {fmtRel(p.touched)}</span>}
        {concern && <span className="gentle">— one too many. quietly noticed.</span>}
        <button className="ibtn ghost" style={{padding:'4px 9px',fontSize:11.5}} onClick={onComplete}>mark done</button>
      </div>
    </div>
  );
}

interface ProjectViewProps {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  history: HistoryEntry[];
  setHistory: Dispatch<SetStateAction<HistoryEntry[]>>;
  layout: 'grid' | 'soft' | 'list';
  onGoHistory: () => void;
}

export function ProjectView({ projects, setProjects, history, setHistory, layout, onGoHistory }: ProjectViewProps) {
  const active = projects.filter(p => !p.done);
  const overload = active.length >= 7;

  function update(id: string, patch: Partial<Project>) {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch, touched: Date.now() } : p));
  }
  function add() {
    const id = 'p' + Date.now();
    setProjects(ps => [...ps, { id, name: 'Untitled project', priority: 'important' as Priority, weight: 2, done: false, created: Date.now(), touched: Date.now() }]);
  }
  function remove(id: string) { setProjects(ps => ps.filter(p => p.id !== id)); }
  function complete(id: string) {
    setProjects(ps => {
      const p = ps.find(x => x.id === id);
      if (p) setHistory(h => [{ id, name: p.name, completed: Date.now(), priority: p.priority }, ...h]);
      return ps.filter(x => x.id !== id);
    });
  }

  const stats = useMemo(() => {
    const now = Date.now(), wk = 7*86400000, mo = 30*86400000;
    return {
      thisWeek:  history.filter(h => now - h.completed < wk).length,
      lastWeek:  history.filter(h => { const d = now - h.completed; return d >= wk && d < 2*wk; }).length,
      thisMonth: history.filter(h => now - h.completed < mo).length,
      lastMonth: history.filter(h => { const d = now - h.completed; return d >= mo && d < 2*mo; }).length,
    };
  }, [history]);

  const cycleWeight = (p: Project) => update(p.id, { weight: (((p.weight ?? 1) % 4) + 1) as 1|2|3|4 });
  const cyclePriority = (p: Project) => {
    const order: Priority[] = ['critical','important','steady'];
    update(p.id, { priority: order[(order.indexOf(p.priority) + 1) % order.length] });
  };

  return (
    <div className="fade-in stack">
      <div className="card">
        <div className="hd">
          <div>
            <h3>The big picture</h3>
            <div className="uc" style={{marginTop:6}}>{active.length} of 6 · in flight</div>
          </div>
          <div className="row">
            <button className="ibtn ghost" onClick={onGoHistory}><Icon name="archive" size={13}/> History</button>
            <button className="ibtn solid" onClick={add}><span className="plus">+</span> New project</button>
          </div>
        </div>

        <div className="pad">
          <div className={`pgrid v-${layout}`}>
            {active.map((p, i) => (
              <ProjectCard
                key={p.id}
                p={p}
                concern={i === 6}
                onName={(name) => update(p.id, { name })}
                onWeight={() => cycleWeight(p)}
                onPriority={() => cyclePriority(p)}
                onComplete={() => complete(p.id)}
                onRemove={() => remove(p.id)}
              />
            ))}
            {active.length < 6 && (
              <button className="pcard add" onClick={add}>
                <div className="plus">+</div>
                <div style={{fontSize:13}}>Hold a new project</div>
                <div className="uc" style={{marginTop:8}}>up to 6</div>
              </button>
            )}
          </div>
          {overload && (
            <div className="overload">
              <span className="leaf"><Icon name="leaf" size={16}/></span>
              <span>You are holding more than six things. Notice the weight — perhaps one can rest.</span>
            </div>
          )}
        </div>

        <div className="barbox">
          <div className="stat"><b>{stats.thisWeek}</b><span>completed this week</span></div>
          <div className="div"/>
          <div className="stat"><b style={{color:'var(--muted)'}}>{stats.lastWeek}</b><span>last week</span></div>
          <div className="div"/>
          <div className="stat"><b>{stats.thisMonth}</b><span>this month</span></div>
          <div className="div"/>
          <div className="stat"><b style={{color:'var(--muted)'}}>{stats.lastMonth}</b><span>last month</span></div>
          <div style={{marginLeft:'auto'}} className="uc">since you began</div>
        </div>
      </div>
    </div>
  );
}

interface HistoryViewProps {
  history: HistoryEntry[];
  onBack: () => void;
}

export function HistoryView({ history, onBack }: HistoryViewProps) {
  const grouped = useMemo(() => {
    const out: Record<string, HistoryEntry[]> = {};
    history.forEach(h => {
      const d = new Date(h.completed);
      const k = `${d.getFullYear()} · ${MONTHS[d.getMonth()].toUpperCase()}`;
      (out[k] = out[k] ?? []).push(h);
    });
    return out;
  }, [history]);

  return (
    <div className="fade-in stack">
      <div className="card">
        <div className="hd">
          <div>
            <h3>Completed projects</h3>
            <div className="uc" style={{marginTop:6}}>a quiet record · {history.length} total</div>
          </div>
          <div className="row">
            <button className="ibtn ghost" onClick={onBack}>← back to projects</button>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="pad" style={{padding:'40px 28px',color:'var(--muted)',textAlign:'center',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:16}}>
            Nothing finished yet. That's okay.
          </div>
        ) : (
          <div className="hlist">
            {Object.entries(grouped).map(([k, items]) => (
              <div key={k}>
                <div className="uc" style={{padding:'14px 22px 6px',background:'rgba(255,255,255,.3)'}}>{k}</div>
                {items.map(h => {
                  const d = new Date(h.completed);
                  return (
                    <div className="hrow" key={h.id + h.completed}>
                      <div className="name">{h.name}</div>
                      <div><span className={`chip ${h.priority ?? 'steady'}`}>{h.priority ?? 'done'}</span></div>
                      <div className="when">{MONTHS[d.getMonth()]} {d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
