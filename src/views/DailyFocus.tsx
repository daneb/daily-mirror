import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Habit, Completion } from '../types';
import { Icon } from '../components/Icon';
import { Editable } from '../components/Editable';

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

interface DailyFocusProps {
  habits: Habit[];
  setHabits: Dispatch<SetStateAction<Habit[]>>;
  completion: Completion;
  setCompletion: Dispatch<SetStateAction<Completion>>;
  habitStyle: 'circle' | 'fill' | 'underline';
}

export function DailyFocus({ habits, setHabits, completion, setCompletion, habitStyle }: DailyFocusProps) {
  const today = new Date();
  const [dayIdx, setDayIdx] = useState(today.getDay());
  const dayKey = `d${dayIdx}`;

  function toggle(id: string) {
    setCompletion(c => {
      const day = { ...(c[dayKey] ?? {}) };
      day[id] = !day[id];
      return { ...c, [dayKey]: day };
    });
  }
  function rename(id: string, name: string) { setHabits(hs => hs.map(h => h.id === id ? { ...h, name } : h)); }
  function add() {
    if (habits.length >= 7) return;
    setHabits(hs => [...hs, { id: 'h' + Date.now(), name: 'A new strategic habit' }]);
  }
  function remove(id: string) {
    setHabits(hs => hs.filter(h => h.id !== id));
    setCompletion(c => { const d = { ...(c[dayKey] ?? {}) }; delete d[id]; return { ...c, [dayKey]: d }; });
  }

  const dayCompletion = completion[dayKey] ?? {};
  const doneCount = habits.filter(h => dayCompletion[h.id]).length;
  const isToday = dayIdx === today.getDay();

  return (
    <div className="fade-in stack">
      <div className="card">
        <div className="hd">
          <div>
            <h3>
              {isToday ? `Happy ${DAY_FULL[dayIdx]}, ` : `${DAY_FULL[dayIdx]} — `}
              {isToday && <em style={{fontStyle:'italic',color:'var(--accent)'}}>Dane</em>}
            </h3>
            <div className="uc" style={{marginTop:6}}>focus areas · {doneCount} of {habits.length} marked</div>
          </div>
          <div className="row">
            <div className="dayswitch">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  className={`${dayIdx === i ? 'on' : ''} ${i === today.getDay() ? 'today' : ''}`}
                  onClick={() => setDayIdx(i)}
                >{d}</button>
              ))}
            </div>
            <button className="ibtn solid" onClick={add} disabled={habits.length >= 7} style={habits.length >= 7 ? {opacity:.4} : {}}>
              <span className="plus">+</span> habit
            </button>
          </div>
        </div>

        <div className="pad" style={{padding:'22px 24px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:680,margin:'0 auto'}}>
            {habits.map(h => {
              const done = !!dayCompletion[h.id];
              return (
                <div
                  key={h.id}
                  className={`habit v-${habitStyle}${done ? ' done' : ''}`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[contenteditable]') || target.closest('button')) return;
                    toggle(h.id);
                  }}
                >
                  <span className="mark">✓</span>
                  <Editable className="text" value={h.name} onChange={(v) => rename(h.id, v)} />
                  <span className="yes">— yes</span>
                  <button className="hx" onClick={(e) => { e.stopPropagation(); remove(h.id); }} title="Remove">
                    <Icon name="x" size={12}/>
                  </button>
                </div>
              );
            })}
            {habits.length === 0 && (
              <div style={{padding:'40px 0',textAlign:'center',color:'var(--muted)',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:16}}>
                No habits yet. Add up to seven — the strategic things.
              </div>
            )}
            {habits.length >= 7 && (
              <div className="uc" style={{textAlign:'center',marginTop:10,color:'var(--muted-2)'}}>seven is enough.</div>
            )}
          </div>
        </div>

        <div className="barbox">
          <div className="stat"><b>{doneCount}</b><span>nailed today</span></div>
          <div className="div"/>
          <div className="stat"><b style={{color:'var(--muted)'}}>{habits.length - doneCount}</b><span>unanswered</span></div>
          <div className="div"/>
          <div className="stat" style={{flex:1,marginLeft:14}}>
            <div style={{height:6,background:'rgba(43,38,32,.06)',borderRadius:999,overflow:'hidden',maxWidth:280}}>
              <div style={{
                width: habits.length ? `${(doneCount/habits.length)*100}%` : 0,
                height:'100%',
                background:'linear-gradient(90deg,var(--accent),var(--accent-soft))',
                transition:'width .4s ease',
              }}/>
            </div>
            <span style={{marginTop:6}}>day completion</span>
          </div>
          <div className="uc" style={{marginLeft:'auto'}}>close the day with intent</div>
        </div>
      </div>
    </div>
  );
}
