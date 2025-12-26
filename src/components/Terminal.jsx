import React, { useState, useEffect, useRef } from 'react';

// Terminal Commands
const terminalCommands = {
  help: () => `AVAILABLE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━

ABOUT ME
  whoami      who am i?
  about       learn about me
  story       my journey from rural to tech
  mission     my vision and goals

WORK
  skills      view my technical skills
  projects    see my ventures
  ls          list directories

CONNECT
  contact     get in touch
  social      find me on social media

SYSTEM
  theme       toggle dark/light mode
  clear       clear terminal
  time        current time
  quote       random startup quote`,

  whoami: () => `零 ZERO [ KARTHIK NAGAPURI ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  AI Engineer • Founder • Ecosystem Builder

  From a rural farming family to building
  founder-first ecosystems across Bharat.

  ▸ Founded 4 startups
  ▸ Mentored 1000+ founders
  ▸ Hosted 100+ events

  "Zero isn't emptiness — it's infinite possibility."`,

  about: () => terminalCommands.whoami(),

  skills: () => `SKILLS & EXPERTISE
━━━━━━━━━━━━━━━━━━━━

TECHNICAL
  ├── Web Development & Design
  ├── AI Engineering & Integration
  ├── Full-Stack Development
  └── Cybersecurity Fundamentals

STRATEGIC
  ├── Ecosystem Building
  ├── Startup Mentorship
  ├── Content Strategy
  └── Event Organization

TOOLS
  ├── React, Node.js, Python
  ├── PostgreSQL, Supabase
  ├── AWS, Docker
  └── Git, CI/CD`,

  projects: () => `CURRENT VENTURES
━━━━━━━━━━━━━━━━━━

  evolvex/       Startup ecosystem builder
                 → connecting communities across india

  nexteen/       Tech solutions
                 → chief technology officer

  jagriti/       Yatra Alumni
                 → selections & alumni manager`,

  contact: () => `LET'S CONNECT
━━━━━━━━━━━━━━━━━

  📧  nanikarthik98@gmail.com
  💬  wa.me/916305458955
  📅  calendly.com/karthiknagapuri
  📍  hyderabad, india

  ─────────────────────────────────
  always happy to chat about startups,
  tech, or ecosystem building!`,

  social: () => `FIND ME ONLINE
━━━━━━━━━━━━━━━━━

  github     github.com/karthiknagapuri
  twitter    @karthiknagpuri
  linkedin   linkedin.com/in/karthiknagpuri

  ─────────────────────────────────
  dm me anywhere, i respond fast ⚡`,

  clear: () => '__CLEAR__',

  time: () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),

  quote: () => {
    const quotes = [
      '"Build something people want" - Paul Graham',
      '"Stay hungry, stay foolish" - Steve Jobs',
      '"Ideas are worthless, execution is everything"',
      '"Fail fast, learn faster"',
      '"Don\'t wait for opportunity. Create it"',
      '"Zero isn\'t emptiness — it\'s infinite possibility"',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  },

  ls: () => `📁 Directories:
━━━━━━━━━━━━━━━
• projects/
• blog/
• skills/
• contact/`,

  story: () => `🌱 MY JOURNEY
━━━━━━━━━━━━━━━━━━━

FROM RURAL ROOTS TO TECH INNOVATION

Growing up in a farming community in Telangana
taught me the value of building sustainable systems.

Today, I apply those same principles to startup
ecosystems - nurturing growth, creating connections,
and ensuring every founder has the resources to thrive.

▸ Self-taught programming at 16
▸ First website at 17
▸ Founded first startup at 19
▸ Joined Jagriti Yatra movement
▸ Emergent Ventures Fellow 2022
▸ Building EvolveX to democratize innovation`,

  mission: () => `🎯 MY MISSION
━━━━━━━━━━━━━━━━

Democratize AI and entrepreneurship across India,
especially in tier-2/3 cities and rural areas.

VISION 2030:
• Connect 1 million founders
• Enable 10,000 startups
• Create 100,000 jobs
• Bridge urban-rural divide

CORE VALUES:
• Accessibility over exclusivity
• Community over competition
• Impact over income
• Innovation over imitation`,

  theme: () => '__TOGGLE_THEME__',
};

// Auto-typing sequence on load
const autoSequence = [
  { type: 'command', text: 'whoami', delay: 800 },
  { type: 'response', text: `零 zero [ karthik nagapuri ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ai engineer • founder • ecosystem builder
location: hyderabad, india`, delay: 1200 },
  { type: 'command', text: 'cat mission.txt', delay: 800 },
  { type: 'response', text: `from rural farming roots to tech innovation.
building founder-first ecosystems across bharat.

▸ founded 4 startups
▸ mentored 1000+ founders
▸ hosted 100+ startup events
▸ jagriti yatra alumni

"zero isn't emptiness — it's infinite possibility."`, delay: 1500 },
];

export const Terminal = ({ theme, onToggleTheme }) => {
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoTyping, setIsAutoTyping] = useState(true);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, currentTypingText]);

  // Auto-typing effect
  useEffect(() => {
    if (!isAutoTyping || currentSequenceIndex >= autoSequence.length) {
      if (currentSequenceIndex >= autoSequence.length) {
        setIsAutoTyping(false);
        // Add final hint
        setTimeout(() => {
          setOutput(prev => [...prev, { type: 'hint', text: "type 'help' for available commands" }]);
        }, 500);
      }
      return;
    }

    const item = autoSequence[currentSequenceIndex];
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < item.text.length) {
        setCurrentTypingText(item.text.slice(0, charIndex + 1));
        charIndex++;
        setTimeout(typeChar, item.type === 'command' ? 50 : 15);
      } else {
        // Typing complete, add to output
        setOutput(prev => [...prev, { type: item.type, text: item.text }]);
        setCurrentTypingText('');
        setTimeout(() => {
          setCurrentSequenceIndex(prev => prev + 1);
        }, item.delay);
      }
    };

    const startTimeout = setTimeout(typeChar, 500);
    return () => clearTimeout(startTimeout);
  }, [isAutoTyping, currentSequenceIndex]);

  const processCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    // Add to history
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: trimmed }]);

    // Process command
    const [command, ...args] = trimmed.split(' ');
    const cmdFunc = terminalCommands[command];

    if (cmdFunc) {
      const result = typeof cmdFunc === 'function' ? cmdFunc(args) : cmdFunc;

      if (result === '__CLEAR__') {
        setOutput([]);
      } else if (result === '__TOGGLE_THEME__') {
        onToggleTheme?.();
        setOutput(prev => [...prev, { type: 'response', text: '✓ theme toggled' }]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: result }]);
      }
    } else {
      setOutput(prev => [...prev, {
        type: 'error',
        text: `command not found: ${command}. type 'help' for available commands.`
      }]);
    }

    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: "'SF Mono', 'Monaco', 'Menlo', monospace",
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      {/* Terminal Header */}
      <div style={{
        background: theme.surfaceAlt || 'rgba(255,255,255,0.03)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27CA40' }} />
        </div>
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '12px',
          color: theme.textMuted,
        }}>
          zero@karthik ~ zsh
        </span>
      </div>

      {/* Terminal Body */}
      <div
        ref={outputRef}
        style={{
          padding: '16px',
          height: '320px',
          overflowY: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* ASCII Banner */}
        <pre style={{
          color: theme.accent,
          fontSize: '10px',
          lineHeight: '1.1',
          marginBottom: '16px',
          opacity: 0.9,
        }}>
{`┌─────────────────────────────────────────────────────┐
│                                                     │
│   ███████╗███████╗██████╗  ██████╗                  │
│   ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗                 │
│     ███╔╝ █████╗  ██████╔╝██║   ██║                 │
│    ███╔╝  ██╔══╝  ██╔══██╗██║   ██║                 │
│   ███████╗███████╗██║  ██║╚██████╔╝                 │
│   ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝                  │
│                                                     │
│   karthik nagapuri // ecosystem builder             │
│                                                     │
└─────────────────────────────────────────────────────┘`}
        </pre>

        {/* Output lines */}
        {output.map((line, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            {line.type === 'command' && (
              <div>
                <span style={{ color: theme.accent }}>❯ </span>
                <span style={{ color: theme.text }}>{line.text}</span>
              </div>
            )}
            {line.type === 'response' && (
              <pre style={{
                color: theme.textSecondary,
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'inherit',
              }}>{line.text}</pre>
            )}
            {line.type === 'error' && (
              <div style={{ color: '#FF6B6B' }}>{line.text}</div>
            )}
            {line.type === 'hint' && (
              <div style={{ color: theme.textMuted, fontSize: '12px' }}>
                type <span style={{ color: theme.accent }}>help</span> for available commands
              </div>
            )}
          </div>
        ))}

        {/* Currently typing */}
        {currentTypingText && (
          <div style={{ marginBottom: '8px' }}>
            {autoSequence[currentSequenceIndex]?.type === 'command' ? (
              <div>
                <span style={{ color: theme.accent }}>❯ </span>
                <span style={{ color: theme.text }}>{currentTypingText}</span>
                <span style={{ animation: 'blink 1s infinite' }}>▋</span>
              </div>
            ) : (
              <pre style={{
                color: theme.textSecondary,
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'inherit',
              }}>{currentTypingText}<span style={{ animation: 'blink 1s infinite' }}>▋</span></pre>
            )}
          </div>
        )}

        {/* Input line */}
        {!isAutoTyping && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: theme.accent }}>❯ </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type a command..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: theme.text,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                caretColor: theme.accent,
              }}
              autoFocus
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Terminal;
