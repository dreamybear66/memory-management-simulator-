import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Virtual Memory Logic for Visualization
const MEMORY_SIZE = 1024;
const PAGE_SIZE = 256;

const AddressTranslationHUD = () => {
    const [logicalAddr, setLogicalAddr] = useState('');
    const [logs, setLogs] = useState([]);
    const [packetState, setPacketState] = useState('idle'); // idle, tlb, pt, disk, ram
    const [stats, setStats] = useState({ hits: 0, faults: 0, accesses: 0 });

    const log = (msg) => setLogs(prev => [`> ${msg}`, ...prev].slice(0, 5));

    const handleAccess = async () => {
        if (!logicalAddr) return;
        const addr = parseInt(logicalAddr, 16);
        if (isNaN(addr)) return;

        setPacketState('idle');
        setStats(s => ({ ...s, accesses: s.accesses + 1 }));
        log(`Accessing 0x${addr.toString(16).toUpperCase()}...`);

        // Animation Sequence
        setPacketState('cpu');
        await wait(500);

        setPacketState('tlb');
        log("Checking TLB...");
        await wait(1000);

        // Simulate Hit/Miss (Random for demo)
        const isHit = Math.random() > 0.5;

        if (isHit) {
            log("TLB HIT! Direct mapping.");
            setStats(s => ({ ...s, hits: s.hits + 1 }));
            setPacketState('ram');
        } else {
            log("TLB MISS. Checking Page Table...");
            setPacketState('pt');
            await wait(1000);

            const isFault = Math.random() > 0.7; // 30% fault chance on miss

            if (isFault) {
                log("PAGE FAULT! Retrieving from Disk...");
                setStats(s => ({ ...s, faults: s.stats + 1 }));
                setPacketState('disk');
                await wait(1000);
                log("Loading Frame into RAM...");
                setPacketState('ram');
            } else {
                log("Page Table Entry Valid.");
                setPacketState('ram');
            }
        }

        await wait(500);
        log("Access Complete.");
        setTimeout(() => setPacketState('idle'), 1000);
    };

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className="p-6 bg-gray-900 text-cyan-400 font-mono rounded-xl border border-cyan-800 shadow-2xl relative overflow-hidden min-h-[500px]">

            {/* HUD Header */}
            <div className="flex justify-between items-center mb-8 border-b border-cyan-700 pb-4">
                <h2 className="text-2xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                    VIRTUAL MEMORY UNIT
                </h2>
                <div className="flex gap-6 text-sm">
                    <div>
                        <div className="text-gray-500">HIT RATE</div>
                        <div className="text-xl">{stats.accesses === 0 ? 0 : ((stats.hits / stats.accesses) * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                        <div className="text-gray-500">FAULTS</div>
                        <div className="text-xl text-red-500">{stats.faults}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-10">
                <input
                    type="text"
                    value={logicalAddr}
                    onChange={(e) => setLogicalAddr(e.target.value)}
                    placeholder="Addr (Hex)"
                    className="bg-black border border-cyan-700 p-2 rounded text-center w-32 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    onClick={handleAccess}
                    className="bg-cyan-900 hover:bg-cyan-700 text-white px-6 py-2 rounded transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                    EXECUTE
                </button>
            </div>

            {/* Visualization Grid */}
            <div className="grid grid-cols-3 gap-8 relative h-64">

                {/* Components */}
                <VisNode id="cpu" label="CPU" active={packetState === 'cpu'} />

                <div className="flex flex-col gap-4">
                    <VisNode id="tlb" label="TLB CACHE" active={packetState === 'tlb'} />
                    <VisNode id="pt" label="PAGE TABLE" active={packetState === 'pt'} />
                </div>

                <div className="flex flex-col gap-4">
                    <VisNode id="ram" label="PHYSICAL RAM" active={packetState === 'ram'} />
                    <VisNode id="disk" label="DISK STORAGE" active={packetState === 'disk'} isDanger />
                </div>

                {/* The Data Beam (Animated Packet) */}
                <AnimatePresence>
                    {packetState !== 'idle' && (
                        <Packet targetState={packetState} />
                    )}
                </AnimatePresence>

            </div>

            {/* Logs */}
            <div className="mt-8 bg-black/50 p-4 rounded h-32 overflow-hidden border-t border-cyan-900">
                {logs.map((L, i) => (
                    <div key={i} className="text-sm opacity-80">{L}</div>
                ))}
            </div>

        </div>
    );
};

// Sub-components

const VisNode = ({ label, active, isDanger }) => (
    <motion.div
        animate={{
            borderColor: active ? (isDanger ? '#ef4444' : '#22d3ee') : '#374151',
            boxShadow: active ? `0 0 20px ${isDanger ? '#ef4444' : '#22d3ee'}` : 'none'
        }}
        className={`border-2 border-gray-700 bg-gray-800/50 p-4 rounded-lg flex items-center justify-center h-24 text-center transition-colors`}
    >
        {label}
    </motion.div>
);

const Packet = ({ targetState }) => {
    // Simplified positioning logic for demo
    // In a real app, calculate absolute positions based on refs

    const positions = {
        cpu: { left: '10%', top: '20%' },
        tlb: { left: '45%', top: '20%' },
        pt: { left: '45%', top: '60%' },
        ram: { left: '80%', top: '20%' },
        disk: { left: '80%', top: '60%' }
    };

    return (
        <motion.div
            initial={{ left: '10%', top: '20%', opacity: 0 }}
            animate={{
                ...positions[targetState],
                opacity: 1,
                transition: { type: "spring", stiffness: 50 }
            }}
            exit={{ opacity: 0 }}
            className="absolute w-6 h-6 bg-cyan-400 rounded-full shadow-[0_0_20px_#22d3ee] z-50"
        />
    );
};

export default AddressTranslationHUD;
