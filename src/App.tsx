import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  MessageCircle,
  Settings,
} from "lucide-react";
import { cn } from "./lib/utils";

function App() {
  const retryUrl = (() => {
    const params = new URLSearchParams(window.location.search);
    const retry = params.get("retry");
    return retry ? decodeURIComponent(retry) : "https://geto.pk";
  })();

  const [isChecking, setIsChecking] = useState(false);
  const [isBackOnline, setIsBackOnline] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // 1. Optimized Status Checker (Favicon Probe)
  const checkStatus = useCallback(async () => {
    if (isChecking || isBackOnline) return;

    setIsChecking(true);
    const probe = new Image();
    const timestamp = Date.now();
    const probeUrl = `https://geto.pk/favicon.ico?v=${timestamp}`;

    probe.onload = () => {
      setIsBackOnline(true);
      setIsChecking(false);
      if (!isDev) {
        setTimeout(() => {
          window.location.href = retryUrl;
        }, 1500);
      }
    };

    probe.onerror = () => {
      setIsChecking(false);
      setCountdown(10);
    };

    probe.src = probeUrl;
  }, [isChecking, isBackOnline, retryUrl, isDev]);

  // 2. Auto-polling Countdown Logic
  useEffect(() => {
    if (isBackOnline) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkStatus();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkStatus, isBackOnline]);

  // 3. Handle Tab Focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isBackOnline) {
        checkStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkStatus, isBackOnline]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/30 font-sans overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden text-primary/20 dark:text-primary/10">
        <div
          className={cn(
            "absolute -top-[10%] -left-[10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 opacity-40 dark:opacity-30",
            isBackOnline ? "bg-success" : "bg-warning",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors duration-1000 opacity-40 dark:opacity-30",
            isBackOnline ? "bg-primary" : "bg-destructive",
          )}
        />

        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fade-in animate-duration-700">
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest backdrop-blur-md transition-all duration-500 animate-slide-in-down",
              isBackOnline
                ? "bg-success/10 border-success/20 text-success"
                : "bg-warning/10 border-warning/20 text-warning",
            )}
          >
            {isBackOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                <ShieldAlert className="relative inline-flex h-3 w-3 text-warning" />
              </div>
            )}
            {isBackOnline ? "Systems Validated" : "Performing Upgrades"}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card/80 border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/5 backdrop-blur-xl group hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
          {/* Progress Bar (at top of card) */}
          {!isBackOnline && (
            <div className="absolute top-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                style={{ width: `${(10 - countdown) * 10}%` }}
              />
            </div>
          )}

          <div className="text-center relative">
            <div
              className={cn(
                "mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-all duration-700 shadow-xl",
                isBackOnline
                  ? "bg-success/10 text-success shadow-success/10"
                  : "bg-warning/10 text-warning shadow-warning/10",
              )}
            >
              {isBackOnline ? (
                <CheckCircle2 className="w-12 h-12 animate-zoom-in" />
              ) : (
                <Cpu className="w-12 h-12 animate-spin-slow" />
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-display bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
              {isBackOnline ? "We're Back Online!" : "We'll Be Right Back"}
            </h1>

            <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-[340px] mx-auto">
              {isBackOnline
                ? isDev
                  ? "Validation successful. Localhost development mode is active."
                  : "Thanks for your patience! Returns you to the platform..."
                : "We apologize for the inconvenience. We're performing some necessary upgrades to improve your experience."}
            </p>
          </div>

          {!isBackOnline && (
            <div className="mt-10 grid grid-cols-2 gap-4 animate-fade-in animate-delay-300">
              <a
                href="https://wa.me/923006789617"
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 p-4 rounded-2xl bg-success/10 border border-success/20 text-center hover:bg-success/20 transition-colors cursor-pointer group/btn"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageCircle className="w-5 h-5 text-success" />
                  <p className="text-sm font-bold text-success uppercase tracking-wider">
                    Need Help?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground group-hover/btn:text-foreground transition-colors">
                  Chat with us on WhatsApp
                </p>
              </a>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => {
                if (isBackOnline) {
                  window.location.href = retryUrl;
                } else {
                  checkStatus();
                }
              }}
              disabled={isChecking}
              className={cn(
                "w-full group/btn relative px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-300 active:scale-[0.97] overflow-hidden border shadow-lg cursor-pointer",
                isBackOnline
                  ? "bg-success border-success text-success-foreground hover:shadow-success/25"
                  : "bg-primary border-primary text-primary-foreground hover:shadow-primary/25",
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isChecking ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : isBackOnline ? (
                  <>
                    <span>Proceed to Site</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <span>Check again</span>
                    <RefreshCw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                  </>
                )}
              </div>
            </button>

            {/* {true && ( */}
            {!isBackOnline && (
              <>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Auto-probing in {countdown}s
                </div>
                <Settings
                  style={{
                    animationDuration: "5s",
                    animationDirection: "reverse",
                  }}
                  className="absolute size-full translate-y-1/2 translate-x-1/2 right-4 bottom-4 -z-1 opacity-10 animate-spin text-muted-foreground"
                />
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center animate-fade-in animate-delay-700">
          <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Global Infrastructure &bull; All
            Systems Monitored
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
