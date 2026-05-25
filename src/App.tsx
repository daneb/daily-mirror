import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ProjectView, HistoryView } from './views/ProjectView';
import { DailyFocus } from './views/DailyFocus';
import { Backlog } from './views/Backlog';
import { Icon } from './components/Icon';
import type { Project, HistoryEntry, Habit, Completion, BacklogItem, Tweaks, Priority } from './types';

const DAY_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PALETTES: Record<string, [string,string,string,string,string]> = {
  clay:   ['#f7f2eb','#fbf7f1','#e6d9c4','#a8654a','#6e7d5b'],
  almond: ['#f4ede2','#faf4ea','#e8dcc8','#8b6f47','#6e7d5b'],
  ash:    ['#f2efe9','#faf8f2','#d4c8b8','#5a6b54','#a8654a'],
  ivory:  ['#fbf7f2','#ffffff','#e9dfd1','#2c2926','#a8654a'],
  oat:    ['#eee8dd','#f8f3e9','#dcd0b8','#7c5e3b','#6e7d5b'],
};

function applyPalette(arr: [string,string,string,string,string]) {
  const [paper, paper2, oat, accent, sage] = arr;
  const r = document.documentElement.style;
  r.setProperty('--paper',   paper);
  r.setProperty('--paper-2', paper2);
  r.setProperty('--oat',     oat);
  r.setProperty('--accent',  accent);
  r.setProperty('--sage',    sage);
}

const TWEAK_DEFAULTS: Tweaks = { palette: PALETTES.clay, layout: 'grid', habitStyle: 'circle' };

const SEED_PROJECTS: Project[] = [
  { id:'p1', name:'Q3 product launch — Aurora',  priority:'critical',  weight:4, done:false, created:Date.now()-86400000*9,  touched:Date.now()-3600000*3 },
  { id:'p2', name:'Hiring: Senior designer',     priority:'important', weight:2, done:false, created:Date.now()-86400000*14, touched:Date.now()-86400000*1 },
  { id:'p3', name:'Family trip to Lisbon',        priority:'steady',    weight:1, done:false, created:Date.now()-86400000*5,  touched:Date.now()-86400000*2 },
  { id:'p4', name:'Re-write the homepage story',  priority:'important', weight:3, done:false, created:Date.now()-86400000*7,  touched:Date.now()-3600000*8 },
  { id:'p5', name:'Personal: financial review',   priority:'steady',    weight:1, done:false, created:Date.now()-86400000*20, touched:Date.now()-86400000*6 },
];
const SEED_HISTORY: HistoryEntry[] = [
  { id:'h1', name:'Migrate billing to Stripe',   completed:Date.now()-86400000*2,  priority:'critical' as Priority },
  { id:'h2', name:"Kids' school enrollment",     completed:Date.now()-86400000*4,  priority:'important' as Priority },
  { id:'h3', name:'Renew passport',              completed:Date.now()-86400000*9,  priority:'steady' as Priority },
  { id:'h4', name:'Q2 OKR review write-up',      completed:Date.now()-86400000*14, priority:'important' as Priority },
  { id:'h5', name:'Refactor the dashboard API',  completed:Date.now()-86400000*18, priority:'important' as Priority },
  { id:'h6', name:'Therapy: 6-month checkpoint', completed:Date.now()-86400000*33, priority:'steady' as Priority },
  { id:'h7', name:'Launch v2 marketing site',    completed:Date.now()-86400000*40, priority:'critical' as Priority },
  { id:'h8', name:"Mom's birthday weekend",      completed:Date.now()-86400000*48, priority:'steady' as Priority },
  { id:'h9', name:'Onboarding redesign',         completed:Date.now()-86400000*56, priority:'important' as Priority },
];
// Habits are per-day-of-week: "0" = Sun, "1" = Mon, …, "6" = Sat.
// Each day carries its own independent list; editing Monday never touches Tuesday.
// Seed with an empty record so first-time users set up each day themselves.
const SEED_HABITS: Record<string, Habit[]> = {};
const SEED_BACKLOG: BacklogItem[] = [
  { id:'b1',  text:'Buy milk and oat flour',                           status:'open',     added:Date.now()-3600000*4 },
  { id:'b2',  text:'Email Marco re: quarterly review feedback',        status:'open',     added:Date.now()-86400000*1 },
  { id:'b3',  text:'Fix the leaky tap in the kitchen',                 status:'done',     added:Date.now()-86400000*3 },
  { id:'b4',  text:'Look up that book about deep work, again',         status:'open',     added:Date.now()-86400000*2 },
  { id:'b5',  text:'Call Dad back about the cabin weekend',            status:'open',     added:Date.now()-86400000*1 },
  { id:'b6',  text:'Renew gym membership',                             status:'archived', added:Date.now()-86400000*12 },
  { id:'b7',  text:'Print boarding passes for Friday',                 status:'done',     added:Date.now()-86400000*5 },
  { id:'b8',  text:'Send thank-you note to the design review panel',   status:'open',     added:Date.now()-86400000*6 },
  { id:'b9',  text:'Take the car in for tires — before the trip',      status:'open',     added:Date.now()-86400000*2 },
  { id:'b10', text:'Find a new dentist (closer to the office)',        status:'archived', added:Date.now()-86400000*20 },
  { id:'b11', text:'Update LinkedIn — just the title',                 status:'open',     added:Date.now()-86400000*8 },
];

type View = 'projects' | 'history' | 'focus' | 'backlog';

const NAV = [
  { id: 'projects' as View, label: 'Projects',    icon: 'compass' },
  { id: 'focus'    as View, label: 'Daily Focus', icon: 'leaf' },
  { id: 'backlog'  as View, label: 'Backlog',     icon: 'book' },
];

export default function App() {
  const [tweaks] = useLocalStorage<Tweaks>('tweaks', TWEAK_DEFAULTS);
  const [view, setView] = useState<View>('projects');
  const [projects,   setProjects]   = useLocalStorage<Project[]>('projects', SEED_PROJECTS);
  const [history,    setHistory]    = useLocalStorage<HistoryEntry[]>('history', SEED_HISTORY);
  const [habits,     setHabits]     = useLocalStorage<Record<string, Habit[]>>('habits-v2', SEED_HABITS);
  const [completion, setCompletion] = useLocalStorage<Completion>('completion', {});
  const [backlog,    setBacklog]    = useLocalStorage<BacklogItem[]>('backlog', SEED_BACKLOG);

  useEffect(() => { applyPalette(tweaks.palette); }, [tweaks.palette]);

  const today = new Date();
  const todayStr = `${DAY_FULL[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

  return (
    <div className="app">
      {/* LEFT RAIL */}
      <aside className="rail">
        <div className="brand">
          <span className="mark"/>
          <span className="name">Daily <em>Mirror</em></span>
        </div>

        <div className="uc">Today</div>
        <div style={{fontFamily:'var(--serif)',fontSize:16,lineHeight:1.3,color:'var(--ink-2)',marginTop:-6}}>
          {todayStr}
        </div>

        <div className="uc">Move between</div>
        <nav className="nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={view === n.id || (n.id === 'projects' && view === 'history') ? 'on' : ''}
              onClick={() => setView(n.id)}
            >
              <span className="glyph"><Icon name={n.icon}/></span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="uc">Reflect</div>
        <nav className="nav">
          <button className={view === 'history' ? 'on' : ''} onClick={() => setView('history')}>
            <span className="glyph"><Icon name="clock"/></span>
            Project history
          </button>
        </nav>

        <div className="quote">
          "The shorter way to do many things<br/>is to do only one thing at a time."
          <div style={{fontFamily:'var(--mono)',fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',marginTop:8,color:'var(--muted)'}}>— Mozart</div>
        </div>

        <div className="foot">
          <div style={{fontFamily:'var(--mono)',fontSize:10.5,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--muted-2)'}}>v 0.1 · for Dane</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="topline">
          <div className="greet">
            {view === 'projects' && <>Welcome, <em>Dane.</em><span className="sub">A still room for the heavier things.</span></>}
            {view === 'history'  && <>A quiet record.<span className="sub">The things you carried, set down.</span></>}
            {view === 'focus'    && <>Today, with intention.<span className="sub">Strategic habits — closing the day.</span></>}
            {view === 'backlog'  && <>Out of your head.<span className="sub">Stored gently. Searchable.</span></>}
          </div>
          <div className="right">
            <span><span className="dot"/>auto-saving locally</span>
            <span>{todayStr}</span>
          </div>
        </div>

        {view === 'projects' && (
          <ProjectView
            projects={projects}
            setProjects={setProjects}
            history={history}
            setHistory={setHistory}
            layout={tweaks.layout}
            onGoHistory={() => setView('history')}
          />
        )}
        {view === 'history' && (
          <HistoryView history={history} onBack={() => setView('projects')} />
        )}
        {view === 'focus' && (
          <DailyFocus
            habits={habits}
            setHabits={setHabits}
            completion={completion}
            setCompletion={setCompletion}
            habitStyle={tweaks.habitStyle}
          />
        )}
        {view === 'backlog' && (
          <Backlog items={backlog} setItems={setBacklog} />
        )}
      </main>
    </div>
  );
}
