import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Habit, Completion } from '../types';
import { Icon } from '../components/Icon';
import { Editable } from '../components/Editable';

const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

/** Returns the seven Date objects for the current week (Sun–Sat). */
function getWeekDates(): Date[] {
  const today = new Date();
  const todayDow = today.getDay();
  return DAY_LABELS.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - todayDow));
    return d;
  });
}

/** YYYY-MM-DD key — uniquely identifies a calendar day for completion tracking. */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Habits are keyed by day-of-week index string ("0"–"6") so Monday's
// habit list repeats every Monday, Tuesday's repeats every Tuesday, etc.
// Completions are keyed by calendar date so last Monday ≠ this Monday.
type HabitsByDow = Record<string, Habit[]>;

interface DailyFocusProps {
  habits: HabitsByDow;
  setHabits: Dispatch<SetStateAction<HabitsByDow>>;
  completion: Completion;
  setCompletion: Dispatch<SetStateAction<Completion>>;
  habitStyle: 'circle' | 'fill' | 'underline';
}

export function DailyFocus({ habits, setHabits, completion, setCompletion, habitStyle }: DailyFocusProps) {
  const today = new Date();
  const weekDates = getWeekDates();
  const [dayIdx, setDayIdx] = useState(today.getDay());

  // Two independent keys:
  //   dowKey  — which day-of-week's habit *list* to show (repeats weekly)
  //   dateKey — which calendar day's *completion* state to read/write
  const dowKey  = String(dayIdx);
  const dateKey = toDateKey(weekDates[dayIdx]);
  const todayKey = toDateKey(today);

  const dayHabits: Habit[] = habits[dowKey] ?? [];
  const dayCompletion = completion[dateKey] ?? {};
  const doneCount = dayHabits.filter(h => dayCompletion[h.id]).length;
  const isToday = dateKey === todayKey;

  function toggle(id: string) {
    setCompletion(c => {
      const day = { ...(c[dateKey] ?? {}) };
      day[id] = !day[id];
      return { ...c, [dateKey]: day };
    });
  }

  function rename(id: string, name: string) {
    setHabits(all => ({
      ...all,
      [dowKey]: (all[dowKey] ?? []).map(h => h.id === id ? { ...h, name } : h),
    }));
  }

  function add() {
    if (dayHabits.length >= 7) return;
    setHabits(all => ({
      ...all,
      [dowKey]: [...(all[dowKey] ?? []), { id: 'h' + Date.now(), name: 'A new strategic habit' }],
    }));
  }

  function remove(id: string) {
    setHabits(all => ({
      ...all,
      [dowKey]: (all[dowKey] ?? []).filter(h => h.id !== id),
    }));
    setCompletion(c => {
      const d = { ...(c[dateKey] ?? {}) };
      delete d[id];
      return { ...c, [dateKey]: d };
    });
  }

  return (
    <div className="fade-in stack">
      <div className="card">
        <div className="hd">
          <div>
            <h3>
              {isToday ? `Happy ${DAY_FULL[dayIdx]}, ` : `${DAY_FULL[dayIdx]} — `}
              {isToday && <em style={{fontStyle:'italic',color:'var(--accent)'}}>Dane</em>}
            </h3>
            <div className="uc" style={{marginTop:6}}>focus areas · {doneCount} of {dayHabits.length} marked</div>
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
            <button className="ibtn solid" onClick={add} disabled={dayHabits.length >= 7} style={dayHabits.length >= 7 ? {opacity:.4} : {}}>
              <span className="plus">+</span> habit
            </button>
          </div>
        </div>

        <div className="pad" style={{padding:'22px 24px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:680,margin:'0 auto'}}>
            {dayHabits.map(h => {
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
            {dayHabits.length === 0 && (
              <div style={{padding:'40px 0',textAlign:'center',color:'var(--muted)',fontFamily:'var(--serif)',fontStyle:'italic',fontSize:16}}>
                No habits yet. Add up to seven — the strategic things.
              </div>
            )}
            {dayHabits.length >= 7 && (
              <div className="uc" style={{textAlign:'center',marginTop:10,color:'var(--muted-2)'}}>seven is enough.</div>
            )}
          </div>
        </div>

        <div className="barbox">
          <div className="stat"><b>{doneCount}</b><span>nailed today</span></div>
          <div className="div"/>
          <div className="stat"><b style={{color:'var(--muted)'}}>{dayHabits.length - doneCount}</b><span>unanswered</span></div>
          <div className="div"/>
          <div className="stat" style={{flex:1,marginLeft:14}}>
            <div style={{height:6,background:'rgba(43,38,32,.06)',borderRadius:999,overflow:'hidden',maxWidth:280}}>
              <div style={{
                width: dayHabits.length ? `${(doneCount/dayHabits.length)*100}%` : 0,
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
