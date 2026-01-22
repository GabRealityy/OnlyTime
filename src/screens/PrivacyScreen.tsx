

export function PrivacyScreen(props: { onBack: () => void }) {
    return (
        <div className="space-y-6">
            <div className="ot-card">
                <button
                    onClick={props.onBack}
                    className="mb-4 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Zurück
                </button>

                <h1 className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap text-emerald-600 dark:text-emerald-400">Datenschutz</h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Informationen darüber, wie wir deine Daten schützen.
                </p>

                <div className="mt-8 space-y-10">
                    {/* CRITICAL: Local Storage Only */}
                    <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 p-6 shadow-xl shadow-emerald-500/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="text-emerald-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="text-sm font-black uppercase tracking-widest text-emerald-600">100% Lokal</div>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100 italic">
                            "OnlyTime wurde so entwickelt, dass keine deiner persönlichen Daten oder Finanzen unser Gerät verlassen.
                            Sämtliche Eingaben werden ausschließlich in deinem Browser-Speicher (localStorage) gesichert."
                        </p>
                    </div>

                    {/* Verantwortlicher */}
                    <div className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">1. Verantwortlicher</div>
                        <div className="space-y-1 text-sm font-medium">
                            <p className="font-bold text-zinc-950 dark:text-white">Swiss Innovation Studios</p>
                            <p>Meierenaustrasse 18</p>
                            <p>9443 Widnau, Schweiz</p>
                            <a href="mailto:swissinnovationstudios@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline inline-block mt-1">
                                swissinnovationstudios@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Art der Daten */}
                    <div className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">2. Verarbeitete Daten</div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Die App verarbeitet Ausgabendaten (Titel, Betrag, Kategorie, Datum) und Einstellungen (Einkommen, Arbeitszeit).
                            Diese Daten dienen ausschließlich der lokalen Berechnung deiner Zeit-Finanz-Bilanz.
                        </p>
                    </div>

                    {/* Analyse */}
                    <div className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">3. Tracking & Analyse</div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Wir verwenden keine Tracking-Tools (wie Google Analytics) oder Cookies von Drittanbietern.
                            Es gibt keine Benutzerkonten und keine Synchronisation mit Cloud-Servern.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-8">
                Stand: Januar 2026
            </div>
        </div>
    )
}
