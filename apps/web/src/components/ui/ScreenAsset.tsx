export function ScreenAsset({
  src,
  alt,
  gifSrc,
  videoSrc,
  aspectClass = "aspect-video",
}: {
  src?: string
  alt: string
  gifSrc?: string
  videoSrc?: string
  aspectClass?: string
}) {
  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        poster={src}
        className={`w-full bg-stone-50 ${aspectClass}`}
      />
    )
  }
  if (gifSrc) {
    return <img src={gifSrc} alt={alt} className={`w-full bg-stone-50 ${aspectClass} object-cover img-outline-light`} />
  }
  if (src) {
    return <img src={src} alt={alt} className={`w-full bg-stone-50 ${aspectClass} object-cover img-outline-light`} />
  }
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-1.5 bg-stone-50 ${aspectClass}`}>
      <span className="font-mono text-xs text-stone-300">{alt}</span>
      <span className="text-[10px] text-stone-200">Drop file in public/screens/</span>
    </div>
  )
}
