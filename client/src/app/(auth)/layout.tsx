import { CheckCircle2, LayoutDashboard, Layers, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: CheckCircle2, text: "Submit your project in minutes" },
  { icon: LayoutDashboard, text: "Track review status in real time" },
  { icon: ShieldCheck, text: "Secure, role based access" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary to-indigo-900 p-10 text-primary-foreground lg:flex">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <Layers className="h-4 w-4" />
          </span>
          Submission Manager
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Submit, review and track projects in one place.
          </h1>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="w-full max-w-xs rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-primary-foreground/70">
              <span>Review summary</span>
              <span>Today</span>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <div>
                <div className="text-2xl font-semibold">24</div>
                <div className="text-xs text-primary-foreground/70">Approved</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">6</div>
                <div className="text-xs text-primary-foreground/70">Pending</div>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="flex-1">
                <div className="flex h-8 items-end gap-1">
                  {[40, 70, 55, 90, 65, 80, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-white/50"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/70">
          A simple, focused workflow for students and mentors.
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>
      </main>
    </div>
  );
}
