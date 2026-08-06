import { useEffect, useMemo, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { getGetCurrentUserQueryKey, getGetDashboardSummaryQueryKey, getListAttendeesQueryKey, useCheckIn, useGetCurrentUser, useGetDashboardSummary, useImportAttendees, useListAttendees, useLogin, useLogout } from '@workspace/api-client-react';
import { AlertCircle, ArrowRight, BarChart3, Check, CheckCircle2, ChevronRight, ClipboardList, Download, FileUp, LogOut, Menu, QrCode, Search, Ticket, Users, X, XCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import QRCode from 'qrcode';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3" data-testid="brand-logo">
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
      <QrCode className="h-5 w-5" strokeWidth={2.5} />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-sidebar" />
    </div>
    {!compact && <div><div className="font-display text-lg font-bold tracking-tight">Gatepass</div><div className="font-mono text-[9px] uppercase tracking-[.2em] text-current/55">event ops</div></div>}
  </div>;
}

function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-transform duration-150 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-45 ${className}`} />;
}

function LoadingScreen() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6"><div className="w-full max-w-sm space-y-3" data-testid="loading-session"><div className="h-10 w-40 animate-pulse rounded-lg bg-muted" /><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-12 animate-pulse rounded-lg bg-muted" /></div></div>;
}

function Login() {
  const login = useLogin();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); login.mutate({ data: { username, password } }, { onSuccess: (result) => { queryClient.setQueryData(getGetCurrentUserQueryKey(), result.user); setLocation('/'); } }); };
  return <main className="venue-grid flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-10">
    <div className="pointer-events-none absolute -right-36 -top-36 h-96 w-96 rounded-full bg-secondary/50 blur-3xl" />
    <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl md:grid-cols-[1.05fr_.95fr]">
      <section className="hidden min-h-[620px] flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
        <Logo />
        <div><div className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[.18em] text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> venue mode / ready</div><h1 className="font-display text-6xl font-bold leading-[.95] tracking-[-.055em]">Move the<br /><span className="text-primary">line.</span><br />Keep the signal.</h1><p className="mt-7 max-w-sm text-sm leading-6 text-sidebar-foreground/65">The entrance companion built for the moments that matter: one scan, one clear answer, zero guesswork.</p></div>
        <div className="flex items-center justify-between border-t border-sidebar-border pt-5 font-mono text-[10px] uppercase tracking-[.16em] text-sidebar-foreground/45"><span>Gatepass / 01</span><span>Signal over noise</span></div>
      </section>
      <section className="flex min-h-[620px] flex-col justify-center p-7 sm:p-12">
        <div className="mb-10 md:hidden"><Logo /></div>
        <div className="mb-8"><p className="mb-3 font-mono text-[10px] uppercase tracking-[.2em] text-primary">Organizer access</p><h2 className="font-display text-4xl font-bold tracking-[-.04em]">Back at the gate?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to open your scanner and live attendance board.</p></div>
        <form onSubmit={submit} className="space-y-5" data-testid="form-login">
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-foreground/60">Username</span><input data-testid="input-username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="your organizer handle" required /></label>
          <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-foreground/60">Password</span><input data-testid="input-password" autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-lg border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="••••••••" required /></label>
          {login.isError && <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" data-testid="status-login-error"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> Couldn’t sign you in. Check your details and try again.</div>}
          <Button type="submit" disabled={login.isPending} className="mt-3 w-full bg-primary text-primary-foreground shadow-md shadow-primary/15" data-testid="button-login">{login.isPending ? 'Opening gate…' : <>Open Gatepass <ArrowRight className="h-4 w-4" /></>}</Button>
        </form>
        <p className="mt-10 font-mono text-[10px] uppercase leading-5 tracking-[.12em] text-muted-foreground">Authorized organizers only<br />Attendance data is shared with your event team.</p>
      </section>
    </div>
  </main>;
}

function Shell({ children, user }: { children: ReactNode; user: { displayName: string; username: string } }) {
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [{ href: '/', label: 'Scanner', icon: QrCode }, { href: '/dashboard', label: 'Live board', icon: BarChart3 }, { href: '/attendees', label: 'Attendees', icon: Users }];
  const signOut = () => logout.mutate(undefined, { onSuccess: () => { queryClient.setQueryData(getGetCurrentUserQueryKey(), undefined); setLocation('/'); } });
  return <div className="min-h-[100dvh] bg-background md:flex">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-sidebar p-5 text-sidebar-foreground shadow-xl transition-transform md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-14 flex items-center justify-between"><Logo /><button className="md:hidden" onClick={() => setMenuOpen(false)} data-testid="button-close-menu"><X className="h-5 w-5" /></button></div>
      <div className="mb-5 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/40">Entrance operations</div>
      <nav className="space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} data-testid={`link-${label.toLowerCase().replace(' ', '-')}`} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/65 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"><Icon className="h-[18px] w-[18px] group-hover:text-primary" />{label}{href === '/' && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}</Link>)}</nav>
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4"><div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.15em] text-sidebar-foreground/45"><span className="h-2 w-2 rounded-full bg-accent" /> System online</div><p className="text-xs leading-5 text-sidebar-foreground/70">Keep this tab open at the door. It’s tuned for quick decisions.</p></div>
      <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-bold text-sidebar-foreground">{user.displayName.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{user.displayName}</div><div className="truncate font-mono text-[10px] text-sidebar-foreground/45">@{user.username}</div></div><button onClick={signOut} title="Sign out" className="text-sidebar-foreground/50 hover:text-primary" data-testid="button-logout"><LogOut className="h-4 w-4" /></button></div>
    </aside>
    {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-sidebar/40 md:hidden" onClick={() => setMenuOpen(false)} data-testid="button-menu-overlay" />}
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur md:hidden"><button onClick={() => setMenuOpen(true)} data-testid="button-open-menu"><Menu className="h-5 w-5" /></button><Logo compact /><div className="h-5 w-5" /></header>{children}</div>
  </div>;
}

function Scanner() {
  const checkIn = useCheckIn();
  const [qrId, setQrId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [cameraState, setCameraState] = useState<'starting' | 'ready' | 'denied' | 'unsupported'>('starting');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanLockedRef = useRef(false);
  const checkInRef = useRef(checkIn);
  checkInRef.current = checkIn;
  const submitQr = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || scanLockedRef.current) return;
    scanLockedRef.current = true;
    checkInRef.current.mutate({ data: { qrId: trimmed } }, {
      onSuccess: (next) => {
        setResult(next);
        setQrId('');
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListAttendeesQueryKey() });
      },
      onSettled: () => window.setTimeout(() => { scanLockedRef.current = false; }, 1400),
    });
  };
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setCameraState('unsupported');
      return;
    }
    const reader = new BrowserMultiFormatReader();
    let controls: { stop: () => void } | undefined;
    let cancelled = false;
    reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      videoRef.current,
      (decoded) => {
        if (decoded) submitQr(decoded.getText());
      },
    ).then((nextControls) => {
      controls = nextControls;
      if (!cancelled) setCameraState('ready');
      else controls.stop();
    }).catch(() => {
      if (!cancelled) setCameraState('denied');
    });
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, []);
  const submit = (event?: FormEvent) => { event?.preventDefault(); submitQr(qrId); };
  const status = result?.status;
  return <main className="mx-auto max-w-6xl p-5 pb-12 sm:p-8 lg:p-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-primary">Entrance / Main gate</p><h1 className="font-display text-4xl font-bold tracking-[-.045em] sm:text-5xl">Scanner<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">Point at a guest’s code or enter their ID below.</p></div><div className="flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-accent"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Ready to scan</div></div>
    <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
      <section className="relative overflow-hidden rounded-3xl bg-sidebar p-5 text-sidebar-foreground shadow-xl sm:p-8"><div className="absolute inset-0 opacity-20 venue-grid" /><div className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-sidebar-border/80 bg-sidebar/30 p-6"><video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover opacity-70" data-testid="camera-video" /><div className="absolute inset-0 bg-sidebar/35" /><div className="relative mb-8 h-52 w-52 sm:h-64 sm:w-64"><div className={`absolute inset-0 rounded-3xl border-2 ${status === 'valid' ? 'border-accent' : status === 'invalid' ? 'border-destructive' : 'border-primary/80'} transition-colors`} /><span className="absolute -left-1 -top-1 h-8 w-8 border-l-2 border-t-2 border-primary" /><span className="absolute -right-1 -top-1 h-8 w-8 border-r-2 border-t-2 border-primary" /><span className="absolute -bottom-1 -left-1 h-8 w-8 border-b-2 border-l-2 border-primary" /><span className="absolute -bottom-1 -right-1 h-8 w-8 border-b-2 border-r-2 border-primary" /><div className="absolute left-3 right-3 top-1/2 h-px bg-primary animate-scan-pulse" /><QrCode className="absolute inset-0 m-auto h-24 w-24 text-sidebar-foreground/20" /></div><p className="relative font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/70">{checkIn.isPending ? 'Checking code…' : cameraState === 'ready' ? 'Camera active' : cameraState === 'denied' ? 'Camera access needed' : cameraState === 'unsupported' ? 'Camera unavailable' : 'Starting camera…'}</p><p className="relative mt-2 text-center text-sm text-sidebar-foreground/80">{cameraState === 'denied' ? 'Allow camera access in your browser, then reload this page.' : cameraState === 'unsupported' ? 'Use the manual QR ID field below on this device.' : 'Hold the code inside the frame'}</p></div><form className="relative mt-5 flex gap-2" onSubmit={submit}><input value={qrId} onChange={(e) => setQrId(e.target.value)} placeholder="or type QR ID…" className="h-12 min-w-0 flex-1 rounded-xl border border-sidebar-border bg-sidebar-accent px-4 font-mono text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/35 focus:border-primary" data-testid="input-qr-id" /><Button type="submit" disabled={checkIn.isPending || !qrId.trim()} className="bg-primary text-primary-foreground" data-testid="button-check-in">{checkIn.isPending ? 'Checking' : 'Check in'}</Button></form></section>
      <section className={`flex min-h-[380px] flex-col justify-between rounded-3xl border p-6 transition-colors sm:p-8 ${status === 'valid' ? 'border-accent/40 bg-accent/10' : status === 'duplicate' ? 'border-secondary/60 bg-secondary/20' : status === 'invalid' ? 'border-destructive/40 bg-destructive/10' : 'border-border bg-card'}`} data-testid="panel-scan-result">{result ? <div className="animate-check-pop"><div className={`mb-7 flex h-14 w-14 items-center justify-center rounded-2xl ${status === 'valid' ? 'bg-accent text-accent-foreground' : status === 'duplicate' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'}`}>{status === 'valid' ? <CheckCircle2 /> : status === 'duplicate' ? <AlertCircle /> : <XCircle />}</div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-foreground/50">{status === 'valid' ? 'Entry approved' : status === 'duplicate' ? 'Already inside' : 'No match found'}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">{result.attendee?.name || 'Unknown code'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{result.message}</p>{result.attendee && <div className="mt-6 border-t border-current/10 pt-4"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{result.attendee.ticketType}</div><div className="mt-2 text-xs text-muted-foreground">{result.attendee.email || 'No email on file'}</div></div>}</div> : <div><div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Ticket /></div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Awaiting next scan</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight">One guest<br />at a time.</h2><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">A clear result lands here. Green means welcome in. Amber means pause. Red means find a lead.</p></div>}<div className="mt-8 flex items-center gap-2 border-t border-current/10 pt-4 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-accent" /> Changes sync live</div></section>
    </div>
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground"><ClipboardList className="h-4 w-4 text-primary" /><span>Need a wider view?</span><Link href="/dashboard" className="font-bold text-foreground underline decoration-primary underline-offset-4" data-testid="link-open-live-board">Open live board <ChevronRight className="inline h-3 w-3" /></Link></div>
  </main>;
}

function Stat({ label, value, tone = 'default', detail }: { label: string; value: number; tone?: string; detail: string }) {
  return <div className={`rounded-2xl border p-5 ${tone === 'primary' ? 'border-primary/30 bg-primary/10' : tone === 'accent' ? 'border-accent/25 bg-accent/10' : 'border-border bg-card'}`}><div className="mb-6 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{label}</span><span className={`h-2 w-2 rounded-full ${tone === 'primary' ? 'bg-primary' : tone === 'accent' ? 'bg-accent' : 'bg-muted-foreground/30'}`} /></div><div className="font-display text-4xl font-bold tracking-[-.05em]">{value.toLocaleString()}</div><div className="mt-2 text-xs text-muted-foreground">{detail}</div></div>;
}

function Dashboard() {
  const { data: summary, isLoading, isError, refetch } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey(), refetchInterval: 15000 } });
  const [q, setQ] = useState('');
  const [manual, setManual] = useState('');
  const checkIn = useCheckIn();
  const params = useMemo(() => ({ q: q || undefined }), [q]);
  const attendeesQuery = useListAttendees(params, { query: { queryKey: getListAttendeesQueryKey(params) } });
  const attendees = attendeesQuery.data || [];
  const manualSubmit = (e: FormEvent) => { e.preventDefault(); if (!manual.trim()) return; checkIn.mutate({ data: { qrId: manual.trim() } }, { onSuccess: () => { setManual(''); queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); queryClient.invalidateQueries({ queryKey: getListAttendeesQueryKey() }); } }); };
  if (isLoading) return <main className="mx-auto max-w-6xl p-5 sm:p-8"><div className="space-y-4"><div className="h-10 w-64 animate-pulse rounded bg-muted" /><div className="grid gap-4 md:grid-cols-3"><div className="h-36 animate-pulse rounded-2xl bg-muted" /><div className="h-36 animate-pulse rounded-2xl bg-muted" /><div className="h-36 animate-pulse rounded-2xl bg-muted" /></div></div></main>;
  if (isError || !summary) return <main className="mx-auto max-w-6xl p-5 sm:p-8"><div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6" data-testid="status-dashboard-error"><AlertCircle className="mb-3 text-destructive" /><h2 className="font-display text-2xl font-bold">Live board is taking a breather.</h2><p className="mt-2 text-sm text-muted-foreground">We couldn’t load attendance right now.</p><Button onClick={() => refetch()} className="mt-5 bg-foreground text-background" data-testid="button-retry-dashboard">Try again</Button></div></main>;
  const percent = summary.total ? Math.round((summary.checkedIn / summary.total) * 100) : 0;
  return <main className="mx-auto max-w-6xl p-5 pb-12 sm:p-8 lg:p-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-primary">Live attendance / auto-refresh 15s</p><h1 className="font-display text-4xl font-bold tracking-[-.045em] sm:text-5xl">The room, <span className="text-primary">now.</span></h1></div><Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-bold text-background" data-testid="link-back-scanner"><QrCode className="h-4 w-4" /> Open scanner</Link></div>
    <div className="grid gap-4 md:grid-cols-3"><Stat label="Checked in" value={summary.checkedIn} tone="primary" detail={`${percent}% of the guest list`} /><Stat label="Still expected" value={summary.remaining} tone="accent" detail="Keep an eye on the queue" /><Stat label="Total guests" value={summary.total} detail="Registered for this event" /></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl border border-border bg-card p-6"><div className="mb-7 flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Attendance pulse</p><h2 className="mt-2 font-display text-2xl font-bold">Progress at the door</h2></div><span className="font-mono text-2xl font-medium text-primary">{percent}%</span></div><div className="h-4 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} /></div><div className="mt-4 flex justify-between text-xs text-muted-foreground"><span>{summary.checkedIn} welcomed in</span><span>{summary.remaining} on their way</span></div><form onSubmit={manualSubmit} className="mt-10 border-t border-border pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-[.12em]">Manual check-in backup</p><div className="flex gap-2"><input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Enter QR ID" className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary" data-testid="input-manual-qr-id" /><Button disabled={checkIn.isPending || !manual.trim()} className="bg-foreground text-background" data-testid="button-manual-check-in"><Check className="h-4 w-4" /> Admit</Button></div></form></section>
      <section className="rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Guest list</p><h2 className="mt-2 font-display text-2xl font-bold">Find a guest</h2></div><Link href="/attendees" className="text-xs font-bold text-primary" data-testid="link-manage-attendees">Manage list <ArrowRight className="ml-1 inline h-3 w-3" /></Link></div><div className="relative mb-4"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, or QR ID" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" data-testid="input-dashboard-search" /></div><div className="max-h-[330px] overflow-auto">{attendees.length ? attendees.slice(0, 10).map((attendee) => <div className="flex items-center gap-3 border-b border-border py-3 last:border-0" key={attendee.id} data-testid={`row-dashboard-attendee-${attendee.id}`}><div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${attendee.checkedInAt ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>{attendee.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{attendee.name}</div><div className="font-mono text-[10px] text-muted-foreground">{attendee.ticketType} · {attendee.qrId}</div></div>{attendee.checkedInAt ? <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-accent"><Check className="h-3 w-3" /> In</span> : <span className="text-[10px] font-bold uppercase text-muted-foreground">Pending</span>}</div>) : <div className="py-12 text-center text-sm text-muted-foreground" data-testid="empty-dashboard-attendees">No guests match that search.</div>}</div></section></div>
    <section className="mt-6 rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Latest movement</p><h2 className="mt-2 font-display text-2xl font-bold">Recent check-ins</h2></div><span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Live feed</span></div>{summary.recentCheckIns?.length ? <div className="grid gap-x-6 md:grid-cols-2">{summary.recentCheckIns.map((item, index) => <div className="flex items-center gap-3 border-b border-border py-3 last:border-0" key={`${item.name}-${index}`} data-testid={`row-recent-checkin-${index}`}><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold">{item.name.slice(0, 1)}</div><div className="flex-1"><div className="text-sm font-bold">{item.name}</div><div className="text-xs text-muted-foreground">{item.ticketType}</div></div><div className="font-mono text-[10px] text-muted-foreground">{new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></div>)}</div> : <div className="rounded-xl bg-muted/60 p-8 text-center text-sm text-muted-foreground" data-testid="empty-recent-checkins">No check-ins yet. Your first guest will appear here.</div>}</section>
  </main>;
}

function makeCsv(text: string) {
  const [header, ...lines] = text.trim().split(/\r?\n/); const keys = header.split(',').map((x) => x.trim().toLowerCase());
  return lines.filter(Boolean).map((line) => { const values = line.split(',').map((x) => x.trim().replace(/^"|"$/g, '')); const row = Object.fromEntries(keys.map((key, index) => [key, values[index] || ''])); return { name: row.name, email: row.email || undefined, ticketType: row.tickettype || row['ticket type'] || 'General' }; }).filter((row) => row.name);
}
async function downloadQr(id: string, name: string) {
  const dataUrl = await QRCode.toDataURL(id, { width: 720, margin: 2, errorCorrectionLevel: 'M' });
  const image = new Image();
  image.src = dataUrl;
  await new Promise<void>((resolve) => { image.onload = () => resolve(); });
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 40, 40, 720, 720);
  context.fillStyle = '#172033';
  context.font = '700 28px Manrope, sans-serif';
  context.textAlign = 'center';
  context.fillText(name, 400, 815);
  context.font = '18px DM Mono, monospace';
  context.fillText(id, 400, 850);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
  link.click();
}

function Attendees() {
  const [q, setQ] = useState(''); const [status, setStatus] = useState<'all' | 'checked-in' | 'pending'>('all'); const [importOpen, setImportOpen] = useState(false); const [importResult, setImportResult] = useState<any>(null); const fileRef = useRef<HTMLInputElement>(null);
  const params = useMemo(() => ({ q: q || undefined, status: status === 'all' ? undefined : status }), [q, status]);
  const attendeesQuery = useListAttendees(params, { query: { queryKey: getListAttendeesQueryKey(params) } }); const importAttendees = useImportAttendees();
  const attendees = attendeesQuery.data || [];
  const importFile = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { const attendeesToImport = makeCsv(String(reader.result)); if (attendeesToImport.length) importAttendees.mutate({ data: { attendees: attendeesToImport } }, { onSuccess: (result) => { setImportResult(result); setImportOpen(false); queryClient.invalidateQueries({ queryKey: getListAttendeesQueryKey() }); } }); }; reader.readAsText(file); };
  return <main className="mx-auto max-w-6xl p-5 pb-12 sm:p-8 lg:p-12"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-primary">Roster / all guests</p><h1 className="font-display text-4xl font-bold tracking-[-.045em] sm:text-5xl">Attendees<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">Import the list, print the codes, keep the door moving.</p></div><Button onClick={() => setImportOpen(true)} className="bg-foreground text-background" data-testid="button-open-import"><FileUp className="h-4 w-4" /> Import CSV</Button></div>
    {importResult && <div className="mb-5 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm" data-testid="status-import-success"><CheckCircle2 className="h-5 w-5 text-accent" /><div><b>{importResult.imported} attendees imported.</b><span className="ml-1 text-muted-foreground">{importResult.skipped ? `${importResult.skipped} skipped.` : 'Your roster is ready.'}</span></div><button className="ml-auto text-muted-foreground" onClick={() => setImportResult(null)} data-testid="button-dismiss-import"><X className="h-4 w-4" /></button></div>}
    <div className="mb-5 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, QR ID" className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary" data-testid="input-attendee-search" /></div><div className="flex rounded-lg border border-border bg-card p-1">{(['all', 'checked-in', 'pending'] as const).map((filter) => <button key={filter} onClick={() => setStatus(filter)} className={`rounded-md px-3 py-2 text-xs font-bold capitalize ${status === filter ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`} data-testid={`button-filter-${filter}`}>{filter === 'checked-in' ? 'Checked in' : filter}</button>)}</div></div>
    <section className="overflow-hidden rounded-2xl border border-border bg-card">{attendeesQuery.isLoading ? <div className="space-y-3 p-6"><div className="h-10 animate-pulse rounded bg-muted" /><div className="h-10 animate-pulse rounded bg-muted" /><div className="h-10 animate-pulse rounded bg-muted" /></div> : attendees.length ? <div className="divide-y divide-border">{attendees.map((attendee) => <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6" key={attendee.id} data-testid={`row-attendee-${attendee.id}`}><div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">{attendee.name.slice(0, 1)}</div><div className="min-w-[150px] flex-1"><div className="font-bold">{attendee.name}</div><div className="text-xs text-muted-foreground">{attendee.email || 'No email'} · <span className="font-mono">{attendee.qrId}</span></div></div><span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em]">{attendee.ticketType}</span><span className={`flex items-center gap-1 text-xs font-bold ${attendee.checkedInAt ? 'text-accent' : 'text-muted-foreground'}`}>{attendee.checkedInAt ? <><Check className="h-3 w-3" /> Checked in</> : 'Pending'}</span><button onClick={() => downloadQr(attendee.qrId, attendee.name)} className="rounded-lg border border-border p-2 text-muted-foreground transition hover:border-primary hover:text-primary" title="Download QR code" data-testid={`button-download-qr-${attendee.id}`}><Download className="h-4 w-4" /></button></div>)}</div> : <div className="p-14 text-center" data-testid="empty-attendees"><Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" /><h2 className="font-display text-2xl font-bold">No guests here yet.</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Import a CSV to build your roster. Use columns named name, email, and ticketType.</p><Button onClick={() => setImportOpen(true)} className="mt-5 bg-primary text-primary-foreground" data-testid="button-empty-import">Import your list</Button></div>}</section>
    {importOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-sidebar/50 p-5" role="dialog" data-testid="dialog-import"><div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">Roster import</p><h2 className="mt-2 font-display text-3xl font-bold">Bring the list in.</h2></div><button onClick={() => setImportOpen(false)} data-testid="button-close-import"><X className="h-5 w-5 text-muted-foreground" /></button></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Upload a CSV with <span className="font-mono text-foreground">name,email,ticketType</span> columns. Existing QR IDs are preserved when included.</p><button onClick={() => fileRef.current?.click()} className="mt-7 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-9 text-center transition hover:border-primary" data-testid="button-choose-csv"><FileUp className="mb-3 h-8 w-8 text-primary" /><span className="font-bold">{importAttendees.isPending ? 'Importing roster…' : 'Choose CSV file'}</span><span className="mt-1 text-xs text-muted-foreground">.csv files only</span></button><input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} data-testid="input-csv-file" /><div className="mt-6 flex justify-end"><Button onClick={() => setImportOpen(false)} className="border border-border bg-transparent" data-testid="button-cancel-import">Cancel</Button></div></div></div>}
  </main>;
}

function AuthenticatedApp({ user }: { user: { username: string; displayName: string } }) {
  return <Shell user={user}><Switch><Route path="/" component={Scanner} /><Route path="/dashboard" component={Dashboard} /><Route path="/attendees" component={Attendees} /><Route component={NotFound} /></Switch></Shell>;
}

function Router() {
  const { data: user, isLoading } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false, refetchOnWindowFocus: false } });
  if (isLoading) return <LoadingScreen />;
  return user ? <AuthenticatedApp user={user} /> : <Switch><Route path="/" component={Login} /><Route component={Login} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></QueryClientProvider>;
}

export default App;