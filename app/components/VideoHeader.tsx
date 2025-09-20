export default function VideoHeader({ className = "" }: { className?: string }) {
  return (
    <header className={`w-full max-w-3xl mx-auto relative min-h-[200px] ${className}`}>
      <div className="relative w-full h-[200px] overflow-hidden rounded-lg shadow-lg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/video.webm"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <h1 className="text-[1.6rem] font-extrabold text-center mt-8 bg-gradient-to-r from-red-900 to-red-950 bg-clip-text text-transparent">
  STATS PAR MINUTES
</h1>

    </header>
  );
}
