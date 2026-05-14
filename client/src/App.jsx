import React, { useState, useEffect } from 'react';
import { Layout, Ticket, BookOpen, CheckCircle, User, Search, AlertTriangle, Activity } from 'lucide-react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [resolutionSteps, setResolutionSteps] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. DATA ACQUISITION: Fetch from our Node.js Backend
  useEffect(() => {
    fetch('http://localhost:3001/api/tickets')
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Backend not running? Run 'node index.js' in the root folder.", err);
        setLoading(false);
      });
  }, []);

  // 2. LOGIC: Resolve Ticket Protocol
  const handleResolve = () => {
    if (resolutionSteps.length < 20) {
      alert("⚠️ DOCUMENTATION ERROR: Resolution notes are too brief. Minimum 20 characters required to maintain Knowledge Base quality.");
      return;
    }

    fetch('http://localhost:3001/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activeTicket.id,
        category: activeTicket.category,
        steps: resolutionSteps
      })
    })
    .then(res => res.json())
    .then(() => {
      alert("✅ Ticket #" + activeTicket.id + " successfully logged and resolved.");
      // Refresh local list
      setTickets(tickets.filter(t => t.id !== activeTicket.id));
      setActiveTicket(null);
      setResolutionSteps("");
    });
  };

  const filteredTickets = tickets.filter(t => 
    t.issue.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* ENTERPRISE HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            VersaTECH <span className="text-slate-400 font-normal ml-1">Service Desk</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right border-r pr-6 border-slate-200">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">System Administrator</p>
            <p className="text-sm font-semibold">Miguel Corachea</p>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            MC
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* TICKET QUEUE SIDEBAR */}
        <aside className="w-85 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Active Queue ({filteredTickets.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-8 text-center text-slate-400 text-sm italic">Loading tickets...</p>
            ) : filteredTickets.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm italic">Queue clear. No tickets found.</p>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => { setActiveTicket(ticket); setResolutionSteps(""); }}
                  className={`p-5 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${activeTicket?.id === ticket.id ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">ID #{ticket.id}</span>
                    {ticket.priority === 'Critical' && (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase">
                        <AlertTriangle size={10} /> Critical
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-800 leading-tight mb-2">{ticket.issue}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold uppercase">
                      {ticket.user.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-500">{ticket.user}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* TROUBLESHOOTING WORKSPACE */}
        <section className="flex-1 p-8 bg-slate-50 overflow-y-auto">
          {activeTicket ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Main Ticket Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <User size={28} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{activeTicket.user}</h2>
                        <p className="text-sm text-slate-500 italic">" {activeTicket.issue} "</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-tighter">Department</span>
                      <span className="text-sm font-medium text-slate-700">{activeTicket.category || 'General IT'}</span>
                    </div>
                  </div>
                </div>

                {/* KB SUGGESTION SECTION */}
                <div className="p-6 bg-blue-50/40 border-b border-blue-50">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen size={16} /> Automated KB Suggestion
                  </h3>
                  <div className="bg-white border border-blue-100 p-5 rounded-lg shadow-sm border-l-4 border-l-blue-400">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Based on historical logs, this issue typically involves <span className="font-bold text-blue-800">system re-authentication</span> or 
                      checking <span className="font-bold text-blue-800">{activeTicket.category}</span> hardware protocols.
                    </p>
                  </div>
                </div>

                {/* RESOLUTION AREA */}
                <div className="p-6 bg-white">
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between">
                    <span>Technical Resolution Steps</span>
                    <span className={`text-[10px] ${resolutionSteps.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                      {resolutionSteps.length} / 20 chars min
                    </span>
                  </label>
                  <textarea 
                    value={resolutionSteps}
                    onChange={(e) => setResolutionSteps(e.target.value)}
                    className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all shadow-inner bg-slate-50/30"
                    placeholder="Provide a detailed summary of the fix. E.g., 'Reset the CMOS battery and verified voltage levels in BIOS...'"
                  ></textarea>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={handleResolve}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-2 transform active:scale-95"
                    >
                      <CheckCircle size={18} /> Finalize & Resolve Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center">
                <Search size={64} className="mb-4 opacity-20" />
                <h3 className="text-slate-400 font-bold italic">Awaiting Selection</h3>
                <p className="text-sm">Select a ticket from the left queue to begin diagnostics.</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* SYSTEM STATUS BAR */}
      <footer className="bg-slate-800 text-slate-400 px-6 py-2.5 text-[10px] font-medium flex justify-between items-center uppercase tracking-widest border-t border-slate-700">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> API Connected</span>
          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div> Port 3001 Active</span>
        </div>
        <div>
          VersaTECH v1.0.4 <span className="mx-2">|</span> 2026 Stable Build
        </div>
      </footer>
    </div>
  );
}

export default App;