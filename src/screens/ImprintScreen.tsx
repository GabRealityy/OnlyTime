

export function ImprintScreen(props: { onBack: () => void }) {
    return (
        <div className="space-y-6">
            <div className="ot-card">
                <button
                    onClick={props.onBack}
                    className="mb-4 flex items-center gap-2 text-xs font-bold text-tertiary hover:text-primary transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Zurück
                </button>

                <h1 className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">Impressum</h1>
                <p className="mt-1 text-sm text-secondary">
                    Gesetzliche Angaben zum Anbieter der App.
                </p>

                <div className="mt-8 space-y-10">
                    {/* Anbieter */}
                    <div className="border-l-2 border-border pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2">Anbieter</div>
                        <div className="space-y-1 text-sm font-medium">
                            <p className="font-bold text-primary">Swiss Innovation Studios</p>
                            <p>Meierenaustrasse 18</p>
                            <p>9443 Widnau</p>
                            <p>Schweiz</p>
                        </div>
                    </div>

                    {/* Kontakt */}
                    <div className="border-l-2 border-border pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2">Kontakt</div>
                        <div className="space-y-1 text-sm font-medium">
                            <a
                                href="mailto:swissinnovationstudios@gmail.com"
                                className="flex items-center gap-2 text-success hover:underline"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                swissinnovationstudios@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Haftungsausschluss */}
                    <div className="border-l-2 border-border pl-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-tertiary mb-2">Haftung für Links</div>
                        <p className="text-sm text-secondary leading-relaxed">
                            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
                            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center text-[10px] uppercase tracking-widest text-tertiary font-black">
                Swiss Innovation Studios · 2026
            </div>
        </div>
    )
}
