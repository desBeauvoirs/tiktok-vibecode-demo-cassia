import { useState, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Status bar / Dynamic Island clearance (matches Figma design)
const STATUS_BAR_H = 62
// SVG intrinsic aspect ratios — used to compute real px heights at runtime
const TOP_NAV_RATIO    = 65 / 402   // top-nav.svg is 402×65
const BOTTOM_NAV_RATIO = 84 / 402   // bottom-nav.svg is 402×84

// ── Figma assets (Feed 2 frame URLs for chrome; per-card URLs for content) ──
const A = {
  // Sidebar action icons
  like:      '/assets/like.svg',
  comment:   '/assets/comment.svg',
  bookmark:  '/assets/bookmark.svg',
  share:     '/assets/share.svg',
  follow:    '/assets/follow.svg',
  // Avatars
  avCassia:  '/assets/av-cassia.png',
  avDR:      '/assets/av-dr.png',
  avClaude:  '/assets/av-claude.png',
  // QuoteCard background
  bgGraphic: '/assets/bg-graphic.png',
  // Play icon
  play:      '/assets/play.svg',
  // Misc decorative
  verified:  '/assets/verified.svg',
  dot:       '/assets/dot.svg',
  // Comment panel
  heartSm:   '/assets/heart-sm.svg',
  avUser:    '/assets/av-user.png',
  sort:      '/assets/sort.svg',
  closeIcon: '/assets/close-icon.svg',
  inputIco:  '/assets/input-ico.svg',
  // Feed 5 top comment
  avClaudeComment: '/assets/av-claude-comment.png',
}

// ── Feed data (exact Figma values per card) ────────────────────────────
const FEEDS = [
  {
    id: 1, type: 'video', video: '/assets/feed1.mp4',
    avatar: A.avCassia, username: 'Cassia Tang Design', date: '4-16',
    verified: false, showFollow: false,
    caption: "Did you know that TikTok now shows comment in your feed? #newfeature #tiktok",
    likes: '11.5K', comments: '193', bookmarks: '312', shares: '647',
    music: 'Original Sound - Cassia Tang',
  },
  {
    id: 2, type: 'quote',
    targetFeedIdx: 2,           // tapping navigates to Feed 3 (Design Reality)
    quoter: '@itssarahkim',
    quote: 'As the a junior designer I need this song on 24 hr loop.',
    qLikes: '8.4K likes', qReplies: '224 replies',
    isAd: false,
    vFrom: '@design_reality', vViews: '201.8K views',
    vThumb: '/assets/vthumb-dr.png',
  },
  {
    id: 3, type: 'video', video: '/assets/feed3.mp4',
    avatar: A.avDR, username: 'Design Reality', date: '2-17 ',
    verified: false, showFollow: true,
    caption: 'This is your sign to start working on your portfolio.  #fyp #designer',
    likes: '25.2K', comments: '59', bookmarks: '3,149', shares: '2,273',
    music: 'TikTok Viral',
  },
  {
    id: 4, type: 'quote',
    targetFeedIdx: 4,           // tapping navigates to Feed 5 (Claude)
    quoter: '@claude',
    quote: 'Did Claude just created its own design in Figma?',
    qLikes: '3.9K likes', qReplies: '36 replies',
    isAd: true,
    vFrom: '@claude', vViews: '83.3K views',
    vThumb: '/assets/vthumb-claude.png',
  },
  {
    id: 5, type: 'video', video: '/assets/feed5.mp4',
    avatar: A.avClaude, username: 'Claude', date: '1d ago',
    verified: true, showFollow: true,
    caption: 'A new feature in the Figma MCP server it can capture any running UI state in your browser and paste those as editable Figma frames right on the canvas.',
    likes: '3,318', comments: '110', bookmarks: '878', shares: '97',
  },
]

// ── Per-feed comment data (from Figma Make export) ────────────────────
const FEED_COMMENTS = {
  0: {
    count: 193,
    comments: [
      { id: 'f1-1', initial: 'M', color: '#E91E63', username: 'techgirl_maya',
        text: "wait so tiktok is using comments as hooks now?? actually genius",
        date: '3-15', likes: 234 },
      { id: 'f1-2', initial: 'J', color: '#1976D2', username: 'jake.designs',
        text: "this explains why I've been seeing random comments pop up in my feed lately 🤯",
        date: '3-15', likes: 89 },
      { id: 'f1-3', initial: 'N', color: '#FF6F00', username: 'nomadnick',
        text: "clicked one of those comment cards yesterday and fell into a 2hr rabbit hole",
        date: '3-16', likes: 412, replies: 12 },
      { id: 'f1-4', initial: 'B', color: '#6B4C9A', username: 'brandstrategy',
        text: "for brands this is way more native than a regular ad fr",
        date: '4-1', likes: 67 },
      { id: 'f1-5', initial: 'Z', color: '#00897B', username: 'ux_zara',
        text: "the algorithm said 'let me manipulate you even harder' 💀",
        date: '4-2', likes: 1247 },
    ],
  },
  1: {
    count: 193,
    comments: [
      { id: 'f2-1', initial: 'A', color: '#E91E63', username: 'pixel_anna',
        text: "the accuracy of this hurts 😭",
        date: '3-9', likes: 156 },
      { id: 'f2-2', initial: 'C', color: '#4CAF50', username: 'craft.carl',
        text: "solo designer life is tough but you grow so fast",
        date: '3-9', likes: 89, replies: 3 },
      { id: 'f2-3', initial: 'K', color: '#FF5722', username: 'uidesigner_k',
        text: "felt this in my soul. been the only designer for 3 years now",
        date: '3-10', likes: 234 },
      { id: 'f2-4', initial: 'M', color: '#2196F3', username: 'devmike_',
        text: "wait you guys have designers on your team?? 😅",
        date: '3-10', likes: 567 },
      { id: 'f2-5', initial: 'L', color: '#9C27B0', username: 'freelance.lu',
        text: "this is why I started freelancing honestly",
        date: '3-11', likes: 45 },
    ],
  },
  2: {
    count: 59,
    comments: [
      { id: 'f3-1', initial: 'S', color: '#6B4C9A', username: 'itssarahkim',
        text: "As the a junior designer I need this song on 24 hr loop.",
        date: '3-9', likes: 8400, replies: 224 },
      { id: 'f3-2', initial: 'A', color: '#fa2d6c', username: 'AntRuval',
        text: "I swear. Making the portfolio is the most difficult and heartbreaking project I've ever done in my life. 😂😂😂",
        date: '3-8', likes: 32 },
      { id: 'f3-3', initial: 'S', color: '#4c634f', username: 'Sierra Grace',
        text: "is this version of the song on Spotify? cause damn that would work on me",
        date: '3-10', likes: 113 },
      { id: 'f3-4', initial: 'M', color: '#FF6F00', username: 'ui_marcus',
        text: "finally updated mine after 2 years of procrastinating 🙏",
        date: '3-12', likes: 78 },
      { id: 'f3-5', initial: 'L', color: '#795548', username: 'lazydesigner',
        text: "the irony of watching this instead of working on my portfolio rn",
        date: '3-14', likes: 523 },
    ],
  },
  3: {
    count: 48,
    comments: [
      { id: 'f4-1', initial: 'S', color: '#607D8B', username: 'saveforlater',
        text: "commenting so I can find this later",
        date: '3-8', likes: 34 },
      { id: 'f4-2', initial: 'K', color: '#E91E63', username: 'createwithkai',
        text: "this is the push I needed today 🔥",
        date: '3-9', likes: 198, replies: 5 },
      { id: 'f4-3', initial: 'P', color: '#FF9800', username: 'procrastinator',
        text: "been meaning to update mine since 2023...",
        date: '3-10', likes: 87 },
      { id: 'f4-4', initial: 'N', color: '#4CAF50', username: 'ux_newbie',
        text: "saving every portfolio tip video at this point 😭",
        date: '3-11', likes: 45 },
      { id: 'f4-5', initial: 'H', color: '#9C27B0', username: 'honestdesigner',
        text: "the way this video called me out personally",
        date: '3-12', likes: 312 },
    ],
  },
  4: {
    count: 110,
    comments: [
      // Top comment = matches Feed 4's card — highlighted when navigating from Feed 4
      { id: 'f5-1', avatarImg: '/assets/av-claude-comment.png',
        username: 'Claude', creator: true,
        text: "Did Claude just created its own design in Figma?",
        date: '3-9', likes: 3900, replies: 36 },
      { id: 'f5-2', initial: 'A', color: '#2196F3', username: 'ai_watcher',
        text: "Claude really out here making design content 🤖",
        date: '4-14', likes: 890 },
      { id: 'f5-3', initial: 'C', color: '#FF5722', username: 'corp_escape',
        text: "AI giving better career advice than my manager lol",
        date: '4-14', likes: 456, replies: 8 },
      { id: 'f5-4', initial: 'G', color: '#4CAF50', username: 'guilty_dev',
        text: "this popped up right when I was procrastinating on my portfolio 💀",
        date: '4-15', likes: 234 },
      { id: 'f5-5', initial: 'S', color: '#9C27B0', username: 'statuschaser',
        text: "the verified badge making this hit different",
        date: '4-15', likes: 123 },
    ],
  },
}

function fmtCount(n) {
  if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (n >= 1000)  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

// ── Components ────────────────────────────────────────────────────────

function TopNav() {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 pointer-events-none">
      <div style={{ height: STATUS_BAR_H }} />
      <img src="/top-nav.svg" alt="" className="w-full block" draggable={false} />
    </div>
  )
}

function BottomNav() {
  return (
    <img
      src="/bottom-nav.svg"
      alt=""
      className="fixed bottom-0 left-0 right-0 z-20 w-full block"
      draggable={false}
    />
  )
}

// Parse "11.5K" / "3,149" style strings into a raw number for arithmetic
function parseLikeCount(str) {
  if (typeof str === 'number') return str
  const s = String(str).replace(/,/g, '')
  if (s.endsWith('K')) return Math.round(parseFloat(s) * 1000)
  return parseInt(s, 10) || 0
}

// Right sidebar: avatar + like/comment/bookmark/share + music disc
function Sidebar({ feed, onComment, bottomNavH }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(() => parseLikeCount(feed.likes))

  const toggleLike = () => {
    setLiked(l => !l)
    setLikeCount(n => liked ? n - 1 : n + 1)
  }

  return (
    <div
      className="fixed flex flex-col items-center overflow-visible z-10"
      style={{ bottom: bottomNavH + 28, right: 12, gap: 18 }}
    >
      {/* Creator avatar (top) with optional follow badge */}
      <div className="relative flex flex-col items-center justify-center pb-2">
        <div
          className="rounded-full border-[0.5px] border-white/50 overflow-hidden bg-white"
          style={{ width: 44, height: 44 }}
        >
          <img src={feed.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        {feed.showFollow && (
          <div
            className="absolute -bottom-2 bg-[#fe2c55] rounded-full flex items-center justify-center"
            style={{ width: 18, height: 18 }}
          >
            <img src={A.follow} alt="+" style={{ width: 16, height: 16 }} />
          </div>
        )}
      </div>

      {/* Like — toggleable */}
      <button aria-label={liked ? 'Unlike' : 'Like'} className="flex flex-col items-center justify-center" onClick={toggleLike}>
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={{ transition: 'fill 0.15s, stroke 0.15s' }}>
          <path
            d="M18 30.5l-1.8-1.64C9.6 22.36 5 18.28 5 13.5 5 9.42 8.13 6.5 12 6.5c2.17 0 4.26 1.01 5.63 2.61A7.25 7.25 0 0 1 24 6.5c3.87 0 7 2.92 7 7 0 4.78-4.6 8.86-11.2 15.36L18 30.5z"
            fill={liked ? '#fe2c55' : 'none'}
            stroke={liked ? '#fe2c55' : 'white'}
            strokeWidth="1.5"
          />
        </svg>
        <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-[12px] font-bold leading-3 mt-0.5"
          style={{ color: liked ? '#fe2c55' : 'white', transition: 'color 0.15s' }}>
          {fmtCount(likeCount)}
        </span>
      </button>
      {/* Comment */}
      <button aria-label="Open comments" className="flex flex-col items-center justify-center" onClick={onComment}>
        <img src={A.comment} aria-hidden="true" style={{ width: 36, height: 36 }} />
        <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white text-[12px] font-bold leading-3 mt-0.5">{feed.comments}</span>
      </button>
      {/* Bookmark */}
      <button aria-label="Bookmark" className="flex flex-col items-center justify-center">
        <img src={A.bookmark} aria-hidden="true" style={{ width: 36, height: 36 }} />
        <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white text-[12px] font-bold leading-3 mt-0.5">{feed.bookmarks}</span>
      </button>
      {/* Share */}
      <button aria-label="Share" className="flex flex-col items-center justify-center">
        <img src={A.share} aria-hidden="true" style={{ width: 36, height: 36 }} />
        <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white text-[12px] font-bold leading-3 mt-0.5">{feed.shares}</span>
      </button>

      {/* Music disc avatar (bottom) */}
      <div
        className="rounded-full border-[0.5px] border-white/50 overflow-hidden bg-white"
        style={{ width: 44, height: 44 }}
      >
        <img src={feed.avatar} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}

// Bottom-left caption block
function VideoDescription({ feed, bottomNavH }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="fixed left-3 z-10"
      style={{ bottom: bottomNavH + 11, width: '68%' }}
    >
      <div className="flex flex-col gap-3">
        {/* Username + date row */}
        <div className="flex items-center gap-[6px]">
          <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white font-bold text-[16px] leading-3 whitespace-nowrap">
            {feed.username}
          </span>
          {feed.verified && (
            <img src={A.verified} alt="✓" style={{ width: 12.5, height: 12.5 }} />
          )}
          <div className="flex items-center gap-[5px]">
            <img src={A.dot} alt="·" style={{ width: 3, height: 3, opacity: 0.5, filter: 'brightness(0) invert(1)' }} />
            <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white/50 font-bold text-[16px] leading-3">{feed.date}</span>
          </div>
        </div>
        {/* Caption + more/less toggle */}
        <div className="flex items-end gap-[3px]">
          <p
            className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] text-white/80 font-semibold text-[16px] overflow-hidden flex-1"
            style={{
              lineHeight: '16px',
              paddingBottom: 4,
              ...(expanded
                ? {}
                : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }
              ),
            }}
          >
            {feed.caption}
          </p>
          <button
            className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white/80 font-bold text-[16px] whitespace-nowrap shrink-0 leading-4"
            style={{ lineHeight: '16px' }}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'less' : 'more'}
          </button>
        </div>
        {/* Music row */}
        {feed.music && (
          <div className="flex items-center gap-[5px]" style={{ paddingBottom: 2 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white" fillOpacity="0.7" aria-hidden="true">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
            </svg>
            <span
              className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] font-semibold text-white/70 whitespace-nowrap"
              style={{ fontSize: 13 }}
            >
              {feed.music}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── VideoCard ─────────────────────────────────────────────────────────
const VideoCard = memo(function VideoCard({ feed, onComment, isActive }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showMuteHint, setShowMuteHint] = useState(false)
  // Start muted so browser allows autoplay; first tap unmutes
  const mutedRef = useRef(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.muted = mutedRef.current
      v.volume = 1.0
      v.play().catch(() => {})
      setPaused(false)
      if (mutedRef.current) {
        setShowMuteHint(true)
        const t = setTimeout(() => setShowMuteHint(false), 1000)
        return () => clearTimeout(t)
      }
    } else {
      v.pause()
      v.currentTime = 0
      setPaused(false)
      setShowMuteHint(false)
    }
  }, [isActive])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => {
      if (v.duration) setProgress(v.currentTime / v.duration)
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [])

  const handleTap = () => {
    const v = videoRef.current
    if (!v) return
    // First tap: unmute, keep playing
    if (mutedRef.current) {
      mutedRef.current = false
      v.muted = false
      setShowMuteHint(false)
      return
    }
    if (v.paused) {
      v.play()
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" onClick={handleTap}>
      {feed.video && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop playsInline muted
        >
          <source src={feed.video} type="video/mp4" />
          <source src={feed.video} type="video/quicktime" />
        </video>
      )}
      {/* dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

      {/* Pause icon — shown when paused */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: 'rgba(0,0,0,0.45)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Tap to unmute hint — shown for 1s on first appearance */}
      <AnimatePresence>
        {showMuteHint && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-[6px] rounded-full" style={{ background: 'rgba(0,0,0,0.5)', padding: '8px 16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V9.76l2.48 2.48c.01-.08.02-.16.02-.24zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l1.98 2L21 18.73 4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
              </svg>
              <span className="text-white font-semibold" style={{ fontSize: 13 }}>Tap to unmute</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — 2px, bottom of video area */}
      {feed.video && (
        <div className="absolute left-0 right-0" style={{ bottom: 0, height: 2, background: 'rgba(255,255,255,0.25)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: 'white', transition: 'width 0.25s linear' }} />
        </div>
      )}

    </div>
  )
})

function QuoteCardBg() {
  return (
    <div className="absolute inset-0">
      <img src={A.bgGraphic} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(201.84deg,rgba(30,30,30,.1) 14.1%,rgba(30,30,30,.292) 42.7%,rgb(30,30,30) 107.9%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(125.91deg,rgba(30,30,30,.1) 29.2%,rgba(30,30,30,.292) 50.4%,rgb(30,30,30) 67.5%)' }} />
    </div>
  )
}

// ── QuoteCard ─────────────────────────────────────────────────────────
function QuoteCard({ feed, onCardClick, topAreaH, bottomNavH }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#1e1e1e] cursor-pointer"
      onClick={onCardClick}
    >
      <QuoteCardBg />

      {/*
        Content centered between top nav and bottom nav.
        topAreaH = status bar (62) + top nav height (scales with vw).
        bottomNavH = bottom nav height (scales with vw).
      */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-center"
        style={{ top: topAreaH, bottom: bottomNavH, gap: 14 }}
      >
        <div className="flex flex-col" style={{ width: 320, gap: 14, transform: 'translateY(20px)' }}>

          {/* ── Comment Card: w=320 (fills wrapper), hug height, p=24, r=16 ── */}
          <div
            className="bg-white flex flex-col"
            style={{ borderRadius: 16, padding: 24, gap: 24 }}
          >
            {/* Row 1 — header: quoter left, Ad badge right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 4 }}>
                <span
                  className="font-['TikTok_Sans_24pt:Bold',sans-serif] font-bold text-black whitespace-nowrap"
                  style={{ fontSize: 16, lineHeight: '12px' }}
                >
                  {feed.quoter}
                </span>
                <span
                  className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] font-semibold"
                  style={{ fontSize: 16, lineHeight: '16px', color: 'rgba(0,0,0,0.75)' }}
                >
                  commented:
                </span>
              </div>
              {feed.isAd && (
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(30,30,30,.1)', padding: '2px 3px', borderRadius: 4 }}
                >
                  <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] font-bold text-[12px]" style={{ color: 'rgba(30,30,30,.5)', lineHeight: '12px' }}>Ad</span>
                </div>
              )}
            </div>

            {/* Row 2 — quote body: SemiBold 40/40 */}
            <p
              className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] font-semibold text-black"
              style={{ fontSize: 40, lineHeight: '40px' }}
            >
              {feed.quote}
            </p>

            {/* Row 3 — likes + replies (hidden for ads) */}
            {!feed.isAd && <div className="flex items-center justify-between">
              <span
                className="font-['TikTok_Sans_24pt:Medium',sans-serif]"
                style={{ fontSize: 14, lineHeight: '14px', color: 'rgba(0,0,0,0.75)' }}
              >
                {feed.qLikes}
              </span>
              <span
                className="font-['TikTok_Sans_24pt:Medium',sans-serif]"
                style={{ fontSize: 14, lineHeight: '14px', color: 'rgba(0,0,0,0.75)' }}
              >
                {feed.qReplies}
              </span>
            </div>}
          </div>

          {/* ── From Video Row: left-aligned within the 320px wrapper ──
               [6px pill] [14px gap] [hug-content card]
               Pill left = comment card left ✓                          */}
          <div className="flex items-stretch self-start" style={{ gap: 14 }}>

            {/* Vertical connector pill — 6px wide, full card height, r=99 */}
            <div className="bg-white shrink-0" style={{ width: 6, borderRadius: 99 }} />

            {/* From Video Card: hug content, p=24, r=16 */}
            <div
              className="bg-white flex items-center"
              style={{ borderRadius: 16, padding: 24, gap: 24 }}
            >
              {/* Text column: justify-between over 72px (= thumbnail height) */}
              <div className="flex flex-col justify-between" style={{ height: 72 }}>
                {/* "From video:" — SemiBold 14/14 black 100% */}
                <span
                  className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] font-semibold text-black whitespace-nowrap"
                  style={{ fontSize: 14, lineHeight: '14px' }}
                >
                  From video:
                </span>
                {/* Username + views — Medium 14/14 black 75% */}
                <div className="flex flex-col" style={{ gap: 4 }}>
                  <span
                    className="font-['TikTok_Sans_24pt:Medium',sans-serif] whitespace-nowrap"
                    style={{ fontSize: 14, lineHeight: '14px', color: 'rgba(0,0,0,0.75)' }}
                  >
                    {feed.vFrom}
                  </span>
                  <span
                    className="font-['TikTok_Sans_24pt:Medium',sans-serif] whitespace-nowrap"
                    style={{ fontSize: 14, lineHeight: '14px', color: 'rgba(0,0,0,0.75)' }}
                  >
                    {feed.vViews}
                  </span>
                </div>
              </div>

              {/* Thumbnail 56×72, r=8, with play overlay */}
              <div
                className="relative overflow-hidden shrink-0"
                style={{ width: 56, height: 72, borderRadius: 8 }}
              >
                <img src={feed.vThumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                >
                  <img src={A.play} alt="" style={{ width: 20, height: 20 }} />
                </div>
              </div>
            </div>{/* end from-video card */}
          </div>{/* end from-video row */}

        </div>{/* end 320px wrapper */}
      </div>{/* end centered stack */}
    </div>
  )
}

// ── Comment item (own like state) ─────────────────────────────────────
function CommentItem({ c, highlighted }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(c.likes)

  const toggleLike = () => {
    setLiked(l => !l)
    setLikeCount(n => liked ? n - 1 : n + 1)
  }

  return (
    <div
      className="flex items-start rounded-[8px]"
      style={{
        gap: 10,
        backgroundColor: highlighted ? 'rgba(135,206,250,0.35)' : 'transparent',
        transition: 'background-color 0.8s ease-out',
      }}
    >
      {/* Avatar — image or colored initial */}
      <div className="rounded-full shrink-0 overflow-hidden flex items-center justify-center"
        style={{ width: 36, height: 36, background: c.avatarImg ? 'transparent' : c.color }}>
        {c.avatarImg
          ? <img src={c.avatarImg} alt="" className="w-full h-full object-cover" />
          : <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-white text-[14px] font-bold">{c.initial}</span>
        }
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 6 }}>
        {/* Username row — with optional Creator badge */}
        <div className="flex items-center" style={{ gap: 4 }}>
          <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-[13px] font-bold text-black/50 whitespace-nowrap">{c.username}</span>
          {c.creator && <>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', flexShrink: 0 }} />
            <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-[13px] font-bold whitespace-nowrap" style={{ color: '#2cced1' }}>Creator</span>
          </>}
        </div>
        <p className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] text-[14px] font-semibold text-black leading-[20px]">{c.text}</p>
        <div className="flex items-center justify-between" style={{ height: 14, paddingRight: 2 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            <span className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] text-[12px] font-semibold text-black/35">{c.date}</span>
            <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-[12px] font-bold text-black/50">Reply</span>
          </div>
          {/* Heart like button — stop propagation so panel drag doesn't eat the tap */}
          <button
            className="flex items-center shrink-0"
            style={{ gap: 2 }}
            onPointerDown={e => e.stopPropagation()}
            onClick={toggleLike}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ transition: 'fill 0.15s, stroke 0.15s', flexShrink: 0 }}
              fill={liked ? '#fe2c55' : 'none'}
              stroke={liked ? '#fe2c55' : 'rgba(0,0,0,0.5)'}
              strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span
              className="font-['Inter:Medium',sans-serif] text-[11px] font-medium"
              style={{ color: liked ? '#fe2c55' : 'rgba(0,0,0,0.5)', transition: 'color 0.15s' }}
            >{fmtCount(likeCount)}</span>
          </button>
        </div>
        {c.replies && (
          <div className="flex items-center" style={{ gap: 8, height: 18 }}>
            <div className="bg-black/35" style={{ width: 20, height: 1 }} />
            <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-[12px] font-bold text-black/50">
              View {c.replies} {c.replies > 1 ? 'replies' : 'reply'} ↓
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Comment panel ─────────────────────────────────────────────────────
function CommentPanel({ onClose, feedIndex, highlightFirst }) {
  const feedData = FEED_COMMENTS[feedIndex] ?? FEED_COMMENTS[0]
  const [highlightId, setHighlightId] = useState(null)

  // Flash top comment when opened via QuoteCard tap
  useEffect(() => {
    if (highlightFirst && feedData.comments.length > 0) {
      setHighlightId(feedData.comments[0].id)
      const t = setTimeout(() => setHighlightId(null), 1400)
      return () => clearTimeout(t)
    }
  }, [highlightFirst, feedIndex])

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white z-30 overflow-hidden"
      style={{ height: 640, borderRadius: '12px 12px 0 0' }}
      initial={{ y: 640 }}
      animate={{ y: 0 }}
      exit={{ y: 640 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.05}
      onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center px-3 py-[7px] h-[43px]">
        <div className="flex items-center gap-1">
          <span className="font-['TikTok_Sans_24pt:Bold',sans-serif] text-black text-[14px] font-bold leading-[18px]">{feedData.count} comments</span>
          <img src={A.sort} alt="" style={{ width: 14, height: 14 }} />
        </div>
        {/* Close button — 12px from right edge */}
        <button
          className="absolute flex items-center justify-center"
          aria-label="Close comments"
          style={{ right: 8, top: 4, width: 40, height: 40 }}
          onClick={onClose}
        >
          <div className="relative w-full" style={{ height: 30 }}>
            <div className="absolute inset-1/4">
              <div className="absolute" style={{ inset: '-9%' }}>
                <img src={A.closeIcon} alt="Close" className="block max-w-none w-full h-full" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Comment list — 12px padding on all sides per Figma */}
      <div
        className="absolute left-0 right-0 overflow-y-auto flex flex-col"
        style={{ top: 43, bottom: 80, padding: 12, gap: 10 }}
      >
        {feedData.comments.map(c => (
          <CommentItem key={c.id} c={c} highlighted={highlightId === c.id} />
        ))}
      </div>

      {/* Bottom input bar — px-[12px] pt-[10.653px] pb-[30px] per Figma 74:8940 */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-[10px]"
        style={{
          paddingLeft: 12, paddingRight: 12,
          paddingTop: 10.653, paddingBottom: 30,
          borderTop: '0.653px solid rgba(0,0,0,.05)',
        }}
      >
        {/* User avatar — 36×36 rounded-[99px] */}
        <div
          className="overflow-hidden shrink-0"
          style={{ width: 36, height: 36, borderRadius: 99, background: 'rgba(0,0,0,0.06)' }}
        >
          <img src={A.avUser} alt="" className="w-full h-full object-cover" />
        </div>
        {/* Input pill — flex-[236_0_0] min-w-px rounded-[20px] */}
        <div
          className="min-w-0 flex items-start rounded-[20px]"
          style={{ flex: '236 0 0', background: 'rgba(0,0,0,0.04)', padding: '8px 14px' }}
        >
          <span
            className="font-['TikTok_Sans_24pt:SemiBold',sans-serif] font-semibold text-[14px] flex-1"
            style={{ color: 'rgba(0,0,0,0.35)' }}
          >Add comment...</span>
          {/* Icons container: 89.744×20px, contains emoji/gif/sticker icons */}
          <img
            src={A.inputIco}
            alt=""
            style={{ width: 89.744, height: 20, flexShrink: 0 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [current, setCurrent]           = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [highlightFirst, setHighlightFirst] = useState(false)
  const isDragging = useRef(false)

  // Track real viewport dimensions — drives carousel snap and nav heights
  const [vp, setVp] = useState({ vw: window.innerWidth, vh: window.innerHeight })
  useEffect(() => {
    const update = () => setVp({ vw: window.innerWidth, vh: window.innerHeight })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const { vw, vh } = vp

  // Nav heights: scale SVG aspect ratios to actual screen width
  const topNavH   = Math.round(vw * TOP_NAV_RATIO)
  const bottomNavH = Math.round(vw * BOTTOM_NAV_RATIO)
  const topAreaH  = STATUS_BAR_H + topNavH   // total top clearance

  const openComments = (feedIdx, highlight = false) => {
    setCurrent(feedIdx)
    setHighlightFirst(highlight)
    setShowComments(true)
  }

  const handleDragEnd = (_, info) => {
    if (showComments) return
    const THRESHOLD = 50
    if (info.offset.y < -THRESHOLD)
      setCurrent(c => (c + 1) % FEEDS.length)
    else if (info.offset.y > THRESHOLD && current > 0)
      setCurrent(c => c - 1)
    setTimeout(() => { isDragging.current = false }, 50)
  }

  const currentFeed = FEEDS[current]

  return (
    <div className="w-screen overflow-hidden bg-black" style={{ height: '100dvh' }}>

      {/* ── Fixed nav overlays ── */}
      <TopNav />
      <BottomNav />

      {/* ── Feed-specific overlays (video feeds only) ── */}
      {currentFeed.type === 'video' && (
        <>
          <Sidebar
            key={currentFeed.id}
            feed={currentFeed}
            onComment={() => openComments(current)}
            bottomNavH={bottomNavH}
          />
          <VideoDescription
            key={`desc-${currentFeed.id}`}
            feed={currentFeed}
            bottomNavH={bottomNavH}
          />
        </>
      )}

      {/* ── Full-screen carousel ── */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          style={{ height: FEEDS.length * vh, touchAction: 'none' }}
          drag={showComments ? false : 'y'}
          dragConstraints={{ top: -(FEEDS.length - 1) * vh, bottom: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragStart={() => { isDragging.current = true }}
          onDragEnd={handleDragEnd}
          animate={{ y: -current * vh }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {FEEDS.map((feed, i) => (
            <div
              key={feed.id}
              className="absolute left-0 right-0"
              style={{ top: i * vh, height: vh }}
            >
              {feed.type === 'video'
                ? <VideoCard feed={feed} isActive={i === current} />
                : <QuoteCard
                    feed={feed}
                    topAreaH={topAreaH}
                    bottomNavH={bottomNavH}
                    onCardClick={() => { if (!isDragging.current) openComments(feed.targetFeedIdx, true) }}
                  />
              }
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Comment panel ── */}
      <AnimatePresence>
        {showComments && (
          <CommentPanel
            onClose={() => { setShowComments(false); setHighlightFirst(false) }}
            feedIndex={current}
            highlightFirst={highlightFirst}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
